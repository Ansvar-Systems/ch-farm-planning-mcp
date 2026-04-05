#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { createDatabase } from './db.js';
import { handleAbout } from './tools/about.js';
import { handleListSources } from './tools/list-sources.js';
import { handleCheckFreshness } from './tools/check-freshness.js';
import { handleSearchFarmPlanning } from './tools/search-farm-planning.js';
import { handleGetBusinessStructures } from './tools/get-business-structures.js';
import { handleGetTaxRules } from './tools/get-tax-rules.js';
import { handleGetSuccessionPlanning } from './tools/get-succession-planning.js';
import { handleGetGrossMargins } from './tools/get-gross-margins.js';
import { handleGetSakCalculation } from './tools/get-sak-calculation.js';
import { handleSearchFinancialGuidance } from './tools/search-financial-guidance.js';

const SERVER_NAME = 'ch-farm-planning-mcp';
const SERVER_VERSION = '0.1.0';

const TOOLS = [
  {
    name: 'about',
    description: 'Get server metadata: name, version, coverage, data sources, and links.',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'list_sources',
    description: 'List all data sources with authority, URL, license, and freshness info.',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'check_data_freshness',
    description: 'Check when data was last ingested, staleness status, and how to trigger a refresh.',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'search_farm_planning',
    description: 'Search across all farm planning topics: SAK, Betriebsuebergabe, Deckungsbeitraege, Steuern, Rechtsformen, AHV/IV. Use for broad queries about Swiss farm economics.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Free-text search query (German, French, or English)' },
        topic: { type: 'string', description: 'Filter by topic (e.g. sak, steuern, uebergabe, rechtsform)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: CH)' },
        limit: { type: 'number', description: 'Max results (default: 20, max: 50)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_business_structures',
    description: 'Get legal business forms for Swiss farms: Einzelunternehmen, einfache Gesellschaft, Generationengemeinschaft, GmbH, Genossenschaft. Includes tax treatment, pros, and cons.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        structure_type: { type: 'string', description: 'Business structure type (e.g. einzelunternehmen, gmbh, genossenschaft)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: CH)' },
      },
    },
  },
  {
    name: 'get_tax_rules',
    description: 'Get Swiss farm taxation rules: farm income, Grundstueckgewinnsteuer, privilegierte Besteuerung bei Hofuebergabe, Eigenmietwert, AHV/IV Beitraege.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        topic: { type: 'string', description: 'Tax topic (e.g. einkommen, grundstueckgewinn, eigenmietwert, ahv)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: CH)' },
      },
    },
  },
  {
    name: 'get_succession_planning',
    description: 'Get Swiss farm succession (Betriebsuebergabe) rules: Ertragswertprinzip (BGBB), Zuweisungsanspruch, Gewinnanspruch, Integralberechnung, tax implications.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        scenario: { type: 'string', description: 'Succession scenario (e.g. uebergabe, ertragswert, zuweisung, gewinn)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: CH)' },
      },
    },
  },
  {
    name: 'get_gross_margins',
    description: 'Get Agroscope benchmark gross margins (Deckungsbeitraege) per crop or livestock type in CHF. Data from ZA-BH / AGRIDEA.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        enterprise_type: { type: 'string', description: 'Enterprise type (e.g. winterweizen, milchkuh, mastschwein, kartoffeln)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: CH)' },
      },
      required: ['enterprise_type'],
    },
  },
  {
    name: 'get_sak_calculation',
    description: 'Get SAK factors (Standardarbeitskraft) per enterprise type. SAK >= 1.0 required for landwirtschaftliches Gewerbe under BGBB. DZV Anhang.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        enterprise_type: { type: 'string', description: 'Enterprise type (e.g. winterweizen, milchkuh, mastschwein)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: CH)' },
      },
    },
  },
  {
    name: 'search_financial_guidance',
    description: 'Search advisory content on Swiss farm economics: AHV/IV/EO, Familienzulagen (FLG), Maschinenkosten, Versicherungen, Arbeitswirtschaft.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Free-text search query (German, French, or English)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: CH)' },
      },
      required: ['query'],
    },
  },
];

const SearchArgsSchema = z.object({
  query: z.string(),
  topic: z.string().optional(),
  jurisdiction: z.string().optional(),
  limit: z.number().optional(),
});

const BusinessStructureArgsSchema = z.object({
  structure_type: z.string().optional(),
  jurisdiction: z.string().optional(),
});

const TaxRulesArgsSchema = z.object({
  topic: z.string().optional(),
  jurisdiction: z.string().optional(),
});

const SuccessionArgsSchema = z.object({
  scenario: z.string().optional(),
  jurisdiction: z.string().optional(),
});

const GrossMarginsArgsSchema = z.object({
  enterprise_type: z.string(),
  jurisdiction: z.string().optional(),
});

const SakArgsSchema = z.object({
  enterprise_type: z.string().optional(),
  jurisdiction: z.string().optional(),
});

const FinancialGuidanceArgsSchema = z.object({
  query: z.string(),
  jurisdiction: z.string().optional(),
});

function textResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

function errorResult(message: string) {
  return { content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }], isError: true };
}

const db = createDatabase();

const server = new Server(
  { name: SERVER_NAME, version: SERVER_VERSION },
  { capabilities: { tools: {} } }
);

// eslint-disable-next-line @typescript-eslint/require-await
server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

// eslint-disable-next-line @typescript-eslint/require-await
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case 'about':
        return textResult(handleAbout());
      case 'list_sources':
        return textResult(handleListSources(db));
      case 'check_data_freshness':
        return textResult(handleCheckFreshness(db));
      case 'search_farm_planning':
        return textResult(handleSearchFarmPlanning(db, SearchArgsSchema.parse(args)));
      case 'get_business_structures':
        return textResult(handleGetBusinessStructures(db, BusinessStructureArgsSchema.parse(args)));
      case 'get_tax_rules':
        return textResult(handleGetTaxRules(db, TaxRulesArgsSchema.parse(args)));
      case 'get_succession_planning':
        return textResult(handleGetSuccessionPlanning(db, SuccessionArgsSchema.parse(args)));
      case 'get_gross_margins':
        return textResult(handleGetGrossMargins(db, GrossMarginsArgsSchema.parse(args)));
      case 'get_sak_calculation':
        return textResult(handleGetSakCalculation(db, SakArgsSchema.parse(args)));
      case 'search_financial_guidance':
        return textResult(handleSearchFinancialGuidance(db, FinancialGuidanceArgsSchema.parse(args)));
      default:
        return errorResult(`Unknown tool: ${name}`);
    }
  } catch (err) {
    return errorResult(err instanceof Error ? err.message : String(err));
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`Fatal error: ${message}\n`);
  process.exit(1);
});
