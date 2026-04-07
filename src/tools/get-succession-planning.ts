import { buildMeta } from '../metadata.js';
import { buildCitation } from '../citation.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface Args {
  scenario?: string;
  jurisdiction?: string;
}

export function handleGetSuccessionPlanning(db: Database, args: Args) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  if (args.scenario) {
    const rows = db.all<{
      id: number; scenario: string; description: string;
      ertragswert_rule: string; tax_implications: string;
    }>(
      'SELECT * FROM succession_planning WHERE LOWER(scenario) LIKE LOWER(?) AND jurisdiction = ?',
      [`%${args.scenario}%`, jv.jurisdiction]
    );

    if (rows.length === 0) {
      return {
        error: 'not_found',
        message: `No succession planning data found for scenario '${args.scenario}'.`,
      };
    }

    return {
      scenario: args.scenario,
      jurisdiction: jv.jurisdiction,
      results_count: rows.length,
      results: rows,
      _citation: buildCitation(
      `CH Succession: ${args.scenario}`,
      `Hofübergabe ${args.scenario}`,
      'get_succession_planning',
      { scenario: args.scenario ?? '' },
    ),
      _meta: buildMeta(),
    };
  }

  const all = db.all<{
    scenario: string; description: string;
    ertragswert_rule: string; tax_implications: string;
  }>(
    'SELECT scenario, description, ertragswert_rule, tax_implications FROM succession_planning WHERE jurisdiction = ? ORDER BY scenario',
    [jv.jurisdiction]
  );

  return {
    jurisdiction: jv.jurisdiction,
    results_count: all.length,
    results: all,
    _meta: buildMeta(),
  };
}
