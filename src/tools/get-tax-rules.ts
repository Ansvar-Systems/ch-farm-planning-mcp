import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface Args {
  topic?: string;
  jurisdiction?: string;
}

export function handleGetTaxRules(db: Database, args: Args) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  if (args.topic) {
    const rows = db.all<{
      id: number; topic: string; rule: string;
      description: string; legal_basis: string;
    }>(
      'SELECT * FROM tax_rules WHERE LOWER(topic) LIKE LOWER(?) AND jurisdiction = ?',
      [`%${args.topic}%`, jv.jurisdiction]
    );

    if (rows.length === 0) {
      return {
        error: 'not_found',
        message: `No tax rules found for topic '${args.topic}'.`,
      };
    }

    return {
      topic: args.topic,
      jurisdiction: jv.jurisdiction,
      results_count: rows.length,
      results: rows,
      _meta: buildMeta(),
    };
  }

  const all = db.all<{
    topic: string; rule: string; description: string; legal_basis: string;
  }>(
    'SELECT topic, rule, description, legal_basis FROM tax_rules WHERE jurisdiction = ? ORDER BY topic',
    [jv.jurisdiction]
  );

  return {
    jurisdiction: jv.jurisdiction,
    results_count: all.length,
    results: all,
    _meta: buildMeta(),
  };
}
