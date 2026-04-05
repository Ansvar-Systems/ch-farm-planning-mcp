# Changelog

All notable changes to the Switzerland Farm Planning MCP will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-04-05 - Initial Release

### Added

#### Core MCP Tools (10)
1. **`about`** -- Server metadata: name, version, coverage, data sources, links
2. **`list_sources`** -- All data sources with authority, URL, license, freshness
3. **`check_data_freshness`** -- Staleness status, last ingest date, refresh command
4. **`search_farm_planning`** -- Full-text search across all farm planning topics (tiered FTS5)
5. **`get_business_structures`** -- Legal business forms: Einzelunternehmen, einfache Gesellschaft, Generationengemeinschaft, GmbH, Genossenschaft
6. **`get_tax_rules`** -- Farm taxation: income, Grundstueckgewinnsteuer, Eigenmietwert, AHV/IV
7. **`get_succession_planning`** -- Betriebsuebergabe: Ertragswertprinzip (BGBB), Zuweisungsanspruch, Gewinnanspruch
8. **`get_gross_margins`** -- Agroscope benchmark Deckungsbeitraege per enterprise type (CHF)
9. **`get_sak_calculation`** -- SAK factors per enterprise type from DZV Anhang
10. **`search_financial_guidance`** -- Advisory content: AHV/IV/EO, Familienzulagen, Maschinenkosten

#### Data Coverage
- 30 SAK factors (Standardarbeitskraft) per enterprise type
- 5 legal business structures with tax treatment
- 10 farm taxation rules (federal level)
- 6 succession planning scenarios under BGBB
- 26 gross margin benchmarks from Agroscope
- 11 financial guidance topics

#### Infrastructure
- Dual transport: stdio (npx) + Streamable HTTP (Docker)
- Tiered FTS5 search with 6-tier fallback (phrase, AND, prefix, stemmed, OR, LIKE)
- Jurisdiction validation (CH only)
- `_meta` disclaimer on all tool responses
- CI/CD: CodeQL, Gitleaks, freshness checks, GHCR build
- Test suite: db, jurisdiction, and tool-level tests
