import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { handleSearchFarmPlanning } from '../../src/tools/search-farm-planning.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import type { Database } from '../../src/db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-search-farm.db';

describe('search_farm_planning tool', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  test('returns results for SAK query', () => {
    const result = handleSearchFarmPlanning(db, { query: 'SAK Milchkuh' });
    expect(result).toHaveProperty('results_count');
    expect((result as { results_count: number }).results_count).toBeGreaterThan(0);
  });

  test('returns results for Deckungsbeitrag query', () => {
    const result = handleSearchFarmPlanning(db, { query: 'Winterweizen Deckungsbeitrag' });
    expect((result as { results_count: number }).results_count).toBeGreaterThan(0);
  });

  test('returns results for succession query', () => {
    const result = handleSearchFarmPlanning(db, { query: 'Betriebsuebergabe Ertragswert' });
    expect((result as { results_count: number }).results_count).toBeGreaterThan(0);
  });

  test('respects topic filter', () => {
    const result = handleSearchFarmPlanning(db, { query: 'Milchkuh', topic: 'sak' });
    const results = (result as { results: { topic: string }[] }).results;
    for (const r of results) {
      expect(r.topic).toBe('sak');
    }
  });

  test('rejects unsupported jurisdiction', () => {
    const result = handleSearchFarmPlanning(db, { query: 'SAK', jurisdiction: 'DE' });
    expect(result).toHaveProperty('error', 'jurisdiction_not_supported');
  });

  test('includes _meta in results', () => {
    const result = handleSearchFarmPlanning(db, { query: 'SAK Milchkuh' });
    expect(result).toHaveProperty('_meta');
  });
});
