import { buildMeta } from '../metadata.js';
import { buildCitation } from '../citation.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface Args {
  enterprise_type: string;
  jurisdiction?: string;
}

export function handleGetGrossMargins(db: Database, args: Args) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  const rows = db.all<{
    id: number; enterprise_type: string; margin_chf: number;
    yield_unit: string; notes: string; source: string;
  }>(
    'SELECT * FROM gross_margins WHERE LOWER(enterprise_type) LIKE LOWER(?) AND jurisdiction = ?',
    [`%${args.enterprise_type}%`, jv.jurisdiction]
  );

  if (rows.length === 0) {
    return {
      error: 'not_found',
      message: `No gross margin data found for enterprise type '${args.enterprise_type}'.`,
    };
  }

  return {
    enterprise_type: args.enterprise_type,
    jurisdiction: jv.jurisdiction,
    results_count: rows.length,
    results: rows,
    _citation: buildCitation(
      `CH Gross Margins: ${args.enterprise_type}`,
      `Deckungsbeiträge ${args.enterprise_type}`,
      'get_gross_margins',
      { enterprise_type: args.enterprise_type },
    ),
    _meta: buildMeta({
      source_url: 'https://www.agroscope.admin.ch/agroscope/de/home/themen/wirtschaft-technik/betriebswirtschaft/deckungsbeitraege.html',
    }),
  };
}
