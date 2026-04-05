# Tools Reference

Complete documentation for all 10 tools in the Switzerland Farm Planning MCP.

---

## about

Get server metadata: name, version, coverage, data sources, and links.

**Parameters:** None

**Returns:**

```json
{
  "name": "Switzerland Farm Planning MCP",
  "description": "Swiss farm business planning...",
  "version": "0.1.0",
  "jurisdiction": ["CH"],
  "data_sources": ["Agroscope ZA-BH", "BLW SAK-Faktoren", "..."],
  "tools_count": 10,
  "links": {
    "homepage": "https://ansvar.eu/open-agriculture",
    "repository": "https://github.com/ansvar-systems/ch-farm-planning-mcp",
    "mcp_network": "https://ansvar.ai/mcp"
  },
  "_meta": { "disclaimer": "...", "data_age": "...", "source_url": "..." }
}
```

**Limitations:** Static metadata. Does not reflect runtime data changes until redeployment.

---

## list_sources

List all data sources with authority, URL, license, and freshness info.

**Parameters:** None

**Returns:** Array of 5 sources, each with `name`, `authority`, `official_url`, `retrieval_method`, `update_frequency`, `license`, `coverage`, and `last_retrieved`.

**Example response (truncated):**

```json
{
  "sources": [
    {
      "name": "Agroscope ZA-BH -- Zentrale Auswertung von Buchhaltungsdaten",
      "authority": "Agroscope",
      "official_url": "https://www.agroscope.admin.ch/...",
      "retrieval_method": "PDF_EXTRACT",
      "update_frequency": "annual (Agrarbericht)",
      "license": "Swiss Federal Administration -- free reuse",
      "coverage": "Deckungsbeitraege, Referenzbetriebe, betriebswirtschaftliche Kennzahlen"
    }
  ],
  "_meta": { "disclaimer": "..." }
}
```

**Limitations:** `last_retrieved` is null if no ingestion has been recorded in db_metadata.

---

## check_data_freshness

Check when data was last ingested, staleness status, and how to trigger a refresh.

**Parameters:** None

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| `status` | `"fresh" \| "stale" \| "unknown"` | Freshness assessment |
| `last_ingest` | `string \| null` | ISO date of last ingestion |
| `build_date` | `string \| null` | ISO date of database build |
| `schema_version` | `string \| null` | Database schema version |
| `days_since_ingest` | `number \| null` | Days elapsed since last ingest |
| `staleness_threshold_days` | `number` | Threshold (90 days) |
| `refresh_command` | `string` | GitHub CLI command to trigger refresh |

**Limitations:** Staleness threshold is fixed at 90 days. Does not detect partial data corruption.

---

## search_farm_planning

Search across all farm planning topics: SAK, Betriebsuebergabe, Deckungsbeitraege, Steuern, Rechtsformen, AHV/IV. Uses tiered FTS5 search with automatic fallback from exact phrase to prefix to stemmed to OR.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | `string` | Yes | Free-text search query (German, French, or English) |
| `topic` | `string` | No | Filter by topic (e.g. `sak`, `steuern`, `uebergabe`, `rechtsform`) |
| `jurisdiction` | `string` | No | ISO 3166-1 alpha-2 code (default: `CH`) |
| `limit` | `number` | No | Max results (default: 20, max: 50) |

**Returns:** `{ query, jurisdiction, results_count, results: [{ title, body, topic, relevance_rank }], _meta }`

**Example:**

```json
{ "query": "SAK Milchkuh", "jurisdiction": "CH", "results_count": 3, "results": [...] }
```

**Limitations:** FTS5 ranking is lexical, not semantic. German compound words may reduce recall. Topic filter is post-FTS and may reduce result counts below the limit.

---

## get_business_structures

Get legal business forms for Swiss farms: Einzelunternehmen, einfache Gesellschaft, Generationengemeinschaft, GmbH, Genossenschaft. Includes tax treatment, pros, and cons.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `structure_type` | `string` | No | Filter by type (e.g. `einzelunternehmen`, `gmbh`). Omit for all. |
| `jurisdiction` | `string` | No | ISO 3166-1 alpha-2 code (default: `CH`) |

**Returns:** Array of structures with `structure_type`, `description`, `tax_treatment`, `pros`, `cons`.

**Limitations:** Does not cover cantonal variations in registration requirements. AG (Aktiengesellschaft) is not included as it is rare for farms.

---

## get_tax_rules

Get Swiss farm taxation rules: farm income, Grundstueckgewinnsteuer, privilegierte Besteuerung bei Hofuebergabe, Eigenmietwert, AHV/IV Beitraege.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `topic` | `string` | No | Tax topic (e.g. `einkommen`, `grundstueckgewinn`, `ahv`). Omit for all. |
| `jurisdiction` | `string` | No | ISO 3166-1 alpha-2 code (default: `CH`) |

**Returns:** Array of rules with `topic`, `rule`, `description`, `legal_basis`.

**Limitations:** Federal rules only. Cantonal tax differences (e.g. Eigenmietwert rates, Grundstueckgewinnsteuer schedules) vary significantly and are not included. Always verify with the cantonal Steueramt.

---

## get_succession_planning

Get Swiss farm succession (Betriebsuebergabe) rules: Ertragswertprinzip (BGBB), Zuweisungsanspruch, Gewinnanspruch, Integralberechnung, tax implications.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `scenario` | `string` | No | Succession scenario (e.g. `uebergabe`, `ertragswert`, `zuweisung`). Omit for all. |
| `jurisdiction` | `string` | No | ISO 3166-1 alpha-2 code (default: `CH`) |

**Returns:** Array of scenarios with `scenario`, `description`, `ertragswert_rule`, `tax_implications`.

**Limitations:** Covers federal BGBB rules. Cantonal implementation differences exist. Does not replace legal advice for individual succession cases.

---

## get_gross_margins

Get Agroscope benchmark gross margins (Deckungsbeitraege) per crop or livestock type in CHF. Data from ZA-BH / AGRIDEA.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `enterprise_type` | `string` | Yes | Enterprise type (e.g. `winterweizen`, `milchkuh`, `mastschwein`, `kartoffeln`) |
| `jurisdiction` | `string` | No | ISO 3166-1 alpha-2 code (default: `CH`) |

**Returns:** Array of margins with `enterprise_type`, `margin_chf`, `yield_unit`, `notes`, `source`.

**Limitations:** Benchmark averages from Agroscope reference farms. Actual margins depend on location, management, soil quality, and market conditions. Uses LIKE matching so partial names work (e.g. `weizen` matches `winterweizen`).

---

## get_sak_calculation

Get SAK factors (Standardarbeitskraft) per enterprise type. SAK >= 1.0 required for landwirtschaftliches Gewerbe under BGBB Art. 5. Factors from DZV Anhang.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `enterprise_type` | `string` | No | Enterprise type (e.g. `winterweizen`, `milchkuh`). Omit for all. |
| `jurisdiction` | `string` | No | ISO 3166-1 alpha-2 code (default: `CH`) |

**Returns:** Array of factors with `enterprise_type`, `factor_per_unit`, `unit`, `notes`. Also includes `sak_threshold` (1.0) and `sak_threshold_note`.

**Limitations:** Factors are from the current DZV Anhang. SAK calculation for a specific farm requires summing factors across all enterprise types, which this tool does not do automatically.

---

## search_financial_guidance

Search advisory content on Swiss farm economics: AHV/IV/EO, Familienzulagen (FLG), Maschinenkosten, Versicherungen, Arbeitswirtschaft.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | `string` | Yes | Free-text search query (German, French, or English) |
| `jurisdiction` | `string` | No | ISO 3166-1 alpha-2 code (default: `CH`) |

**Returns:** Merged results from FTS5 search index and direct financial_guidance table search. Each result has `title`, `body`, `topic`, and optionally `source`. Duplicates are removed.

**Limitations:** Advisory content only. Does not replace professional farm business consulting from AGRIDEA, kantonale Landwirtschaftsaemter, or qualified fiduciary advisors.
