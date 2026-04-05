# Privacy and Data Processing

## Summary

This Tool processes publicly available Swiss agricultural reference data. It does not collect, store, or transmit personal data. However, when used through an LLM provider (e.g. Claude, ChatGPT), your queries transit that provider's infrastructure.

## Data Flows

### MCP Architecture

```
User Query -> MCP Client (Claude/other LLM) -> LLM Provider Cloud -> MCP Server (this Tool) -> SQLite Database
```

### What Gets Transmitted

When you use this Tool through an LLM client:

- **Query text:** Your search queries and tool parameters
- **Tool responses:** Agricultural data (SAK factors, gross margins, tax rules, etc.)
- **Metadata:** Timestamps, tool names

### What Does NOT Get Transmitted

- Files on your computer
- Personal financial data
- Farm-specific business information (unless you include it in queries)

## Data Storage

### Local Database

The SQLite database contains only publicly available Swiss agricultural reference data:
- Agroscope ZA-BH benchmark figures
- BLW SAK factors from the DZV Anhang
- BGBB statutory provisions
- AGRIDEA advisory information
- SBV statistical data

No personal data is stored in the database.

### No Server-Side Logging

The MCP server does not log queries, user identifiers, or usage patterns.

## Professional Use

### For Farm Advisors and Treuhandstellen

If you use this Tool in a professional advisory context:

- **Do not include** client names, AHV numbers, farm identification numbers, or other personal identifiers in queries
- **General queries** about SAK factors, gross margins, or tax rules are safe — they reference public data
- **Client-specific queries** (e.g. "farm succession for family X in canton Y") should be anonymized

### GDPR / DSG Considerations

- The Tool itself does not process personal data under the Swiss DSG or EU GDPR
- If queries contain personal data, the LLM provider becomes a data processor
- Check your LLM provider's data processing terms before including any personal information

## On-Premise Deployment

For environments requiring full data control:

1. Run via `npx @ansvar/ch-farm-planning-mcp` (stdio transport — data stays local to your machine)
2. Self-host with Docker and a local LLM (no external API calls)
3. Database is local SQLite — no network dependencies

## Questions

For privacy questions:
- **Tool-specific:** Open issue on [GitHub](https://github.com/ansvar-systems/ch-farm-planning-mcp/issues)
- **LLM provider:** Contact your LLM provider directly

---

**Last Updated:** 2026-04-05
