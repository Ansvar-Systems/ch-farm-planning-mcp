# Coverage

Current data coverage for the Switzerland Farm Planning MCP.

**Jurisdiction:** Switzerland (CH)
**Last Ingest:** 2026-04-05
**Version:** 0.1.0

## Data Tables

| Table | Records | Description |
|-------|---------|-------------|
| `sak_factors` | 30 | SAK factors (Standardarbeitskraft) per enterprise type from DZV Anhang |
| `business_structures` | 5 | Legal business forms for Swiss farms |
| `tax_rules` | 10 | Federal farm taxation rules |
| `succession_planning` | 6 | Betriebsuebergabe scenarios under BGBB |
| `gross_margins` | 26 | Agroscope benchmark Deckungsbeitraege per enterprise type |
| `financial_guidance` | 11 | Advisory content on farm economics |

## Sources

| Source | Authority | Records Covered |
|--------|-----------|----------------|
| Agroscope ZA-BH | Agroscope | Gross margins, reference farm data |
| BLW SAK-Faktoren (DZV Anhang) | Bundesamt fuer Landwirtschaft | SAK factors for 30 enterprise types |
| BGBB (SR 211.412.11) | Swiss Confederation | Succession rules, Ertragswertprinzip |
| AGRIDEA | AGRIDEA | Betriebsplanung, Deckungsbeitraege |
| SBV Kennzahlen | Schweizer Bauernverband | AHV/IV, Familienzulagen, Lohnrichtlinien |

## What Is Covered

- **SAK calculation:** 30 enterprise types (crops, livestock, special cultures) with factor_per_unit and unit. Includes the 1.0 SAK threshold for landwirtschaftliches Gewerbe (BGBB Art. 5).
- **Business structures:** Einzelunternehmen, einfache Gesellschaft, Generationengemeinschaft, GmbH, Genossenschaft with tax treatment, pros, and cons.
- **Tax rules:** Farm income taxation, Grundstueckgewinnsteuer, privilegierte Besteuerung bei Hofuebergabe, Eigenmietwert, AHV/IV Beitraege, Pauschalbesteuerung.
- **Succession planning:** Ertragswertprinzip, Zuweisungsanspruch (BGBB Art. 11), Gewinnanspruch (BGBB Art. 28-32), Integralberechnung, tax implications of Hofuebergabe.
- **Gross margins:** 26 enterprise types including major crops (Winterweizen, Winterraps, Kartoffeln, Zuckerrueben) and livestock (Milchkuh, Mastschwein, Mutterkuh) with CHF values per unit.
- **Financial guidance:** AHV/IV/EO contributions, Familienzulagen Landwirtschaft (FLG), Maschinenkosten (ART/AGRIDEA), Versicherungen, Arbeitswirtschaft.

## What Is NOT Covered

- **Cantonal tax differences:** Tax rules are federal only. Cantonal Eigenmietwert rates, Grundstueckgewinnsteuer schedules, and agricultural permit requirements vary significantly.
- **Cantonal building and zoning rules:** Raumplanungsgesetz (RPG) Art. 16a implementation differs by canton.
- **Direktzahlungen (direct payments):** Detailed DZV payment calculations and Oekologischer Leistungsnachweis (OeLN) requirements are not included.
- **Organic farming (Bio Suisse):** Bio-specific premiums, conversion rules, and certification requirements are not covered.
- **Wine and special cultures:** Detailed regulations for Rebbau, Obstbau, Gemuesebau beyond basic SAK factors.
- **Pachtwesen (tenancy):** Landwirtschaftliches Pachtrecht (LPG) is not covered in detail.
- **Water rights, forest law:** Waldgesetz, Gewaesserschutzgesetz beyond basic farm planning context.
- **French and Italian language content:** Data is primarily in German. French (Suisse romande) and Italian (Ticino) terminology coverage is limited.
- **Historical data:** Only current-period Deckungsbeitraege and SAK factors. No time series.

## Known Limitations

1. Gross margins are Agroscope reference values (averages across reference farms). Actual margins depend on location, management, and market conditions.
2. SAK factors are from the current DZV Anhang. The tool does not calculate total farm SAK — users must sum factors across their enterprise mix.
3. BGBB succession rules are complex case law. The tool provides the statutory framework but not jurisprudence from cantonal courts.
4. FTS5 search works best with German keywords. Compound words (common in German) may reduce recall.
