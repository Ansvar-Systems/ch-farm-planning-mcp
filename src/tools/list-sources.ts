import { buildMeta } from '../metadata.js';
import type { Database } from '../db.js';

interface Source {
  name: string;
  authority: string;
  official_url: string;
  retrieval_method: string;
  update_frequency: string;
  license: string;
  coverage: string;
  last_retrieved?: string;
}

export function handleListSources(db: Database): { sources: Source[]; _meta: ReturnType<typeof buildMeta> } {
  const lastIngest = db.get<{ value: string }>('SELECT value FROM db_metadata WHERE key = ?', ['last_ingest']);

  const sources: Source[] = [
    {
      name: 'Agroscope ZA-BH — Zentrale Auswertung von Buchhaltungsdaten',
      authority: 'Agroscope',
      official_url: 'https://www.agroscope.admin.ch/agroscope/de/home/themen/wirtschaft-technik/betriebswirtschaft.html',
      retrieval_method: 'PDF_EXTRACT',
      update_frequency: 'annual (Agrarbericht)',
      license: 'Swiss Federal Administration — free reuse',
      coverage: 'Deckungsbeitraege, Referenzbetriebe, betriebswirtschaftliche Kennzahlen',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'BLW — SAK-Faktoren (DZV Anhang)',
      authority: 'Bundesamt fuer Landwirtschaft (BLW)',
      official_url: 'https://www.blw.admin.ch/blw/de/home/instrumente/direktzahlungen.html',
      retrieval_method: 'PDF_EXTRACT',
      update_frequency: 'periodic (with DZV revisions)',
      license: 'Swiss Federal Administration — free reuse',
      coverage: 'Standardarbeitskraft-Faktoren pro Kultur und Tierart',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'BGBB — Baeuerliches Bodenrecht (SR 211.412.11)',
      authority: 'Schweizerische Eidgenossenschaft',
      official_url: 'https://www.fedlex.admin.ch/eli/cc/1993/1410_1410_1410/de',
      retrieval_method: 'LEGAL_TEXT',
      update_frequency: 'as amended',
      license: 'Swiss Federal Administration — free reuse',
      coverage: 'Ertragswertprinzip, Zuweisungsanspruch, Gewinnanspruch, Selbstbewirtschafterprinzip',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'AGRIDEA — Deckungsbeitraege und Betriebsplanung',
      authority: 'AGRIDEA',
      official_url: 'https://www.agridea.ch/',
      retrieval_method: 'PDF_EXTRACT',
      update_frequency: 'annual',
      license: 'Public advisory information',
      coverage: 'Betriebsplanungshilfen, Arbeitswirtschaft, Rechtsformen',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'SBV — Betriebswirtschaftliche Kennzahlen',
      authority: 'Schweizer Bauernverband (SBV)',
      official_url: 'https://www.sbv-usp.ch/de/statistik',
      retrieval_method: 'HTML_SCRAPE',
      update_frequency: 'annual',
      license: 'Public statistical data',
      coverage: 'AHV/IV-Beitraege, Familienzulagen Landwirtschaft, Lohnrichtlinien',
      last_retrieved: lastIngest?.value,
    },
  ];

  return {
    sources,
    _meta: buildMeta(),
  };
}
