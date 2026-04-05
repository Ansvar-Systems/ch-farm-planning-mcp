import { buildMeta } from '../metadata.js';
import { SUPPORTED_JURISDICTIONS } from '../jurisdiction.js';

export function handleAbout() {
  return {
    name: 'Switzerland Farm Planning MCP',
    description:
      'Swiss farm business planning: SAK calculation (Standardarbeitskraft), Betriebsuebergabe (succession), ' +
      'Deckungsbeitraege (gross margins from Agroscope), Rechtsformen (business structures), Steuern (farm ' +
      'taxation), and financial guidance. Covers BGBB (Baeuerliches Bodenrecht), DZV SAK factors, and ' +
      'Agroscope ZA-BH reference data for agricultural decision-making in Switzerland.',
    version: '0.1.0',
    jurisdiction: [...SUPPORTED_JURISDICTIONS],
    data_sources: [
      'Agroscope ZA-BH (Zentrale Auswertung von Buchhaltungsdaten)',
      'BLW — SAK-Faktoren (DZV Anhang)',
      'BGBB (Baeuerliches Bodenrecht, SR 211.412.11)',
      'AGRIDEA — Deckungsbeitraege, Betriebsplanung',
      'SBV — Betriebswirtschaftliche Kennzahlen',
    ],
    tools_count: 10,
    links: {
      homepage: 'https://ansvar.eu/open-agriculture',
      repository: 'https://github.com/ansvar-systems/ch-farm-planning-mcp',
      mcp_network: 'https://ansvar.ai/mcp',
    },
    _meta: buildMeta(),
  };
}
