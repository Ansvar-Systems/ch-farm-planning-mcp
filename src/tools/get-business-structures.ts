import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface Args {
  structure_type?: string;
  jurisdiction?: string;
}

export function handleGetBusinessStructures(db: Database, args: Args) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  if (args.structure_type) {
    const rows = db.all<{
      id: number; structure_type: string; description: string;
      tax_treatment: string; pros: string; cons: string;
    }>(
      'SELECT * FROM business_structures WHERE LOWER(structure_type) = LOWER(?) AND jurisdiction = ?',
      [args.structure_type, jv.jurisdiction]
    );

    if (rows.length === 0) {
      return {
        error: 'not_found',
        message: `No business structure found for '${args.structure_type}'.`,
      };
    }

    return {
      structure_type: args.structure_type,
      jurisdiction: jv.jurisdiction,
      results_count: rows.length,
      results: rows,
      _meta: buildMeta(),
    };
  }

  const all = db.all<{
    structure_type: string; description: string;
    tax_treatment: string; pros: string; cons: string;
  }>(
    'SELECT structure_type, description, tax_treatment, pros, cons FROM business_structures WHERE jurisdiction = ? ORDER BY structure_type',
    [jv.jurisdiction]
  );

  return {
    jurisdiction: jv.jurisdiction,
    results_count: all.length,
    results: all,
    _meta: buildMeta(),
  };
}
