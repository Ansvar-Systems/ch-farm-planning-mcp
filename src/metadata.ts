export interface Meta {
  disclaimer: string;
  data_age: string;
  source_url: string;
  copyright: string;
  server: string;
  version: string;
}

const DISCLAIMER =
  'Diese Daten dienen ausschliesslich der Information und stellen keine professionelle betriebswirtschaftliche ' +
  'oder rechtliche Beratung dar. Vor Entscheidungen zur Betriebsuebergabe, Steuerfragen oder Rechtsformwahl ' +
  'ist stets eine qualifizierte Fachberatung (kantonales Landwirtschaftsamt, AGRIDEA, Treuhandstelle oder ' +
  'Rechtsanwalt) hinzuzuziehen. Die Daten basieren auf den SAK-Faktoren (DZV Anhang), dem Baeuerlichen ' +
  'Bodenrecht (BGBB), der Zentralen Auswertung von Buchhaltungsdaten (ZA-BH, Agroscope) und den AGRIDEA-' +
  'Deckungsbeitraegen. Kantonale Abweichungen bei Steuern und Bewilligungen sind eigenstaendig zu pruefen. / ' +
  'This data is provided for informational purposes only and does not constitute professional financial, tax, ' +
  'or legal advice. Always consult a qualified advisor (cantonal agricultural office, AGRIDEA, fiduciary, or ' +
  'lawyer) before making farm business decisions. Data sourced from SAK factors (DZV), BGBB, Agroscope ZA-BH, ' +
  'and AGRIDEA gross margins.';

export function buildMeta(overrides?: Partial<Meta>): Meta {
  return {
    disclaimer: DISCLAIMER,
    data_age: overrides?.data_age ?? 'unknown',
    source_url: overrides?.source_url ?? 'https://www.agroscope.admin.ch/agroscope/de/home/themen/wirtschaft-technik.html',
    copyright: 'Data: Agroscope, BLW, AGRIDEA, BGBB — used under public-sector information principles. Server: Apache-2.0 Ansvar Systems.',
    server: 'ch-farm-planning-mcp',
    version: '0.1.0',
    ...overrides,
  };
}
