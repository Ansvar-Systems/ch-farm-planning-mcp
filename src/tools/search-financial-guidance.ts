import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import { ftsSearch, type Database } from '../db.js';

interface SearchArgs {
  query: string;
  jurisdiction?: string;
}

export function handleSearchFinancialGuidance(db: Database, args: SearchArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  const results = ftsSearch(db, args.query, 20);

  // Also search the financial_guidance table directly for broader matches
  const directResults = db.all<{
    topic: string; content: string; source: string;
  }>(
    'SELECT topic, content, source FROM financial_guidance WHERE LOWER(content) LIKE LOWER(?) AND jurisdiction = ? LIMIT 20',
    [`%${args.query}%`, jv.jurisdiction]
  );

  // Merge FTS results with direct results, avoiding duplicates
  const seen = new Set<string>();
  const merged: { title: string; body: string; topic: string; source?: string }[] = [];

  for (const r of results) {
    const key = `${r.title}::${r.body.substring(0, 50)}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push({ title: r.title, body: r.body, topic: r.topic });
    }
  }

  for (const r of directResults) {
    const key = `${r.topic}::${r.content.substring(0, 50)}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push({ title: r.topic, body: r.content, topic: r.topic, source: r.source });
    }
  }

  return {
    query: args.query,
    jurisdiction: jv.jurisdiction,
    results_count: merged.length,
    results: merged,
    _meta: buildMeta(),
  };
}
