# Switzerland Farm Planning MCP

Swiss farm business planning data via the Model Context Protocol (MCP). Covers SAK calculation (Standardarbeitskraft), Betriebsuebergabe (farm succession), Deckungsbeitraege (gross margins from Agroscope), Rechtsformen (business structures), Steuern (farm taxation), and financial guidance including AHV/IV.

Data sourced from Agroscope ZA-BH, BLW SAK-Faktoren (DZV Anhang), BGBB (SR 211.412.11), AGRIDEA Deckungsbeitraege, and SBV statistical data.

## Quick Start

### npx (stdio — fastest)

```json
{
  "mcpServers": {
    "ch-farm-planning": {
      "command": "npx",
      "args": ["-y", "@ansvar/ch-farm-planning-mcp"]
    }
  }
}
```

### Docker (isolated)

```bash
docker build -t ch-farm-planning-mcp .
docker run -p 3000:3000 ch-farm-planning-mcp
```

### Streamable HTTP (remote)

```
https://mcp.ansvar.eu/ch-farm-planning/mcp
```

No authentication required. Compatible with any MCP client that supports Streamable HTTP transport.

## Tools

10 tools covering Swiss agricultural business planning. See [TOOLS.md](TOOLS.md) for full documentation.

| Tool | Description |
|------|-------------|
| `about` | Server metadata: name, version, coverage, data sources |
| `list_sources` | All data sources with authority, URL, license, freshness |
| `check_data_freshness` | Last ingestion date, staleness status, refresh command |
| `search_farm_planning` | Full-text search across all farm planning topics |
| `get_business_structures` | Legal business forms: Einzelunternehmen, GmbH, Genossenschaft |
| `get_tax_rules` | Farm taxation: income, Grundstueckgewinnsteuer, AHV/IV |
| `get_succession_planning` | Betriebsuebergabe: Ertragswert (BGBB), Zuweisungsanspruch |
| `get_gross_margins` | Agroscope benchmark gross margins (CHF) per enterprise |
| `get_sak_calculation` | SAK factors per enterprise type (DZV Anhang) |
| `search_financial_guidance` | Advisory content: AHV/IV/EO, Familienzulagen, Maschinenkosten |

## Data Sources

| Source | Authority | Update Frequency |
|--------|-----------|-----------------|
| Agroscope ZA-BH | Agroscope | Annual (Agrarbericht) |
| SAK-Faktoren (DZV Anhang) | BLW | Periodic (DZV revisions) |
| BGBB (SR 211.412.11) | Swiss Confederation | As amended |
| AGRIDEA Deckungsbeitraege | AGRIDEA | Annual |
| SBV Kennzahlen | Schweizer Bauernverband | Annual |

## Coverage

- **Jurisdiction:** Switzerland (CH)
- **SAK factors:** 30 enterprise types
- **Business structures:** 5 legal forms
- **Tax rules:** 10 topics
- **Succession scenarios:** 6 scenarios
- **Gross margins:** 26 enterprise types
- **Financial guidance:** 11 advisory topics

See [COVERAGE.md](COVERAGE.md) for detailed coverage data.

## Data Freshness

Data staleness threshold is 90 days. The `check_data_freshness` tool reports current status. Automated freshness checks run daily via GitHub Actions.

Trigger manual re-ingestion:

```bash
gh workflow run ingest.yml -R ansvar-systems/ch-farm-planning-mcp
```

## Development

```bash
npm install
npm run build
npm test
npm run lint
```

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting and scanning details.

## Legal

- [DISCLAIMER.md](DISCLAIMER.md) — not professional advice
- [PRIVACY.md](PRIVACY.md) — data flow and confidentiality
- [LICENSE](LICENSE) — Apache-2.0

## Links

- [Ansvar MCP Network](https://ansvar.ai/mcp)
- [Open Agriculture](https://ansvar.eu/open-agriculture)
- [GitHub Repository](https://github.com/ansvar-systems/ch-farm-planning-mcp)
