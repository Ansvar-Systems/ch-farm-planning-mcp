import { buildMeta } from '../metadata.js';
import { buildCitation } from '../citation.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface Args {
  enterprise_type?: string;
  jurisdiction?: string;
}

export function handleGetSakCalculation(db: Database, args: Args) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  if (args.enterprise_type) {
    const rows = db.all<{
      id: number; enterprise_type: string; factor_per_unit: number;
      unit: string; notes: string;
    }>(
      'SELECT * FROM sak_factors WHERE LOWER(enterprise_type) LIKE LOWER(?) AND jurisdiction = ?',
      [`%${args.enterprise_type}%`, jv.jurisdiction]
    );

    if (rows.length === 0) {
      return {
        error: 'not_found',
        message: `No SAK factors found for enterprise type '${args.enterprise_type}'.`,
      };
    }

    return {
      enterprise_type: args.enterprise_type,
      jurisdiction: jv.jurisdiction,
      sak_threshold: 1.0,
      sak_threshold_note: 'Mindestens 1.0 SAK fuer landwirtschaftliches Gewerbe (BGBB Art. 5)',
      results_count: rows.length,
      results: rows,
      _citation: buildCitation(
      `CH SAK: ${args.enterprise_type}`,
      `SAK-Faktoren ${args.enterprise_type}`,
      'get_sak_calculation',
      { enterprise_type: args.enterprise_type ?? '' },
    ),
      _meta: buildMeta(),
    };
  }

  const all = db.all<{
    enterprise_type: string; factor_per_unit: number;
    unit: string; notes: string;
  }>(
    'SELECT enterprise_type, factor_per_unit, unit, notes FROM sak_factors WHERE jurisdiction = ? ORDER BY enterprise_type',
    [jv.jurisdiction]
  );

  return {
    jurisdiction: jv.jurisdiction,
    sak_threshold: 1.0,
    sak_threshold_note: 'Mindestens 1.0 SAK fuer landwirtschaftliches Gewerbe (BGBB Art. 5)',
    results_count: all.length,
    results: all,
    _meta: buildMeta(),
  };
}
