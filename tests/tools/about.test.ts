import { describe, test, expect } from 'vitest';
import { handleAbout } from '../../src/tools/about.js';

describe('about tool', () => {
  test('returns server metadata', () => {
    const result = handleAbout();
    expect(result.name).toBe('Switzerland Farm Planning MCP');
    expect(result.description).toContain('farm');
    expect(result.jurisdiction).toEqual(['CH']);
    expect(result.tools_count).toBe(10);
    expect(result.links).toHaveProperty('homepage');
    expect(result._meta).toHaveProperty('disclaimer');
  });

  test('includes data sources', () => {
    const result = handleAbout();
    expect(result.data_sources).toContain('Agroscope ZA-BH (Zentrale Auswertung von Buchhaltungsdaten)');
    expect(result.data_sources).toContain('BGBB (Baeuerliches Bodenrecht, SR 211.412.11)');
  });

  test('version matches package', () => {
    const result = handleAbout();
    expect(result.version).toBe('0.1.0');
  });
});
