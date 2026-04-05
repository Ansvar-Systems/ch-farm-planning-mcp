import { createDatabase, type Database } from '../../src/db.js';

export function createSeededDatabase(dbPath: string): Database {
  const db = createDatabase(dbPath);

  // --- SAK factors (DZV Anhang) ---
  const sakFactors: [string, number, string, string][] = [
    ['Winterweizen', 0.022, 'pro ha', 'Offenes Ackerland'],
    ['Winterraps', 0.022, 'pro ha', 'Offenes Ackerland'],
    ['Kartoffeln', 0.055, 'pro ha', 'Offenes Ackerland, arbeitsintensiv'],
    ['Zuckerrueben', 0.045, 'pro ha', 'Offenes Ackerland'],
    ['Silomais', 0.020, 'pro ha', 'Futterbau Ackerland'],
    ['Milchkuh', 0.043, 'pro GVE', 'Rindvieh, Milchproduktion'],
    ['Mutterkuh', 0.030, 'pro GVE', 'Rindvieh, Fleischproduktion'],
    ['Mastschwein', 0.008, 'pro Platz', 'Schweinehaltung, Mast'],
    ['Zuchtsau', 0.035, 'pro Platz', 'Schweinehaltung, Zucht'],
    ['Legehenne', 0.0015, 'pro Platz', 'Gefluegelproduktion'],
    ['Obstanlage Niederstamm', 0.120, 'pro ha', 'Spezialkulturen'],
    ['Rebland', 0.330, 'pro ha', 'Spezialkulturen, arbeitsintensiv'],
    ['Dauergruenland intensiv', 0.012, 'pro ha', 'Futterbau'],
    ['Dauergruenland extensiv', 0.005, 'pro ha', 'Futterbau, Biodiversitaet'],
    ['Schaf', 0.010, 'pro Tier', 'Kleinvieh'],
  ];

  for (const [ent, factor, unit, notes] of sakFactors) {
    db.run(
      `INSERT INTO sak_factors (enterprise_type, factor_per_unit, unit, notes, jurisdiction)
       VALUES (?, ?, ?, ?, 'CH')`,
      [ent, factor, unit, notes]
    );
  }

  // --- Business structures ---
  const structures: [string, string, string, string, string][] = [
    [
      'Einzelunternehmen',
      'Haeufigste Rechtsform in der Schweizer Landwirtschaft (~90%). Keine Gruendungsformalitaeten. Unbeschraenkte persoenliche Haftung.',
      'Einkommen wird als selbstaendige Erwerbstaetigkeit besteuert. AHV/IV/EO-Beitraege auf dem Reingewinn.',
      'Einfach, kostenguenstig, volle Entscheidungsbefugnis, steuerlich transparent.',
      'Unbeschraenkte Haftung mit Privatvermoegen. Sozialversicherungspflicht als Selbstaendiger.',
    ],
    [
      'Einfache Gesellschaft',
      'Zusammenschluss von 2+ Personen (z.B. Ehegatten, Generationen) ohne Handelsregistereintrag. OR Art. 530ff.',
      'Steuerlich transparent — jeder Gesellschafter versteuert seinen Anteil. AHV je nach Status.',
      'Flexibel, kein Mindestkapital, einfache Gruendung.',
      'Solidarhaftung aller Gesellschafter. Keine eigene Rechtspersoenlichkeit.',
    ],
    [
      'Generationengemeinschaft',
      'Uebergangsform bei Hofuebergabe: Eltern und Nachfolger bewirtschaften gemeinsam. Haeufig als einfache Gesellschaft organisiert.',
      'Gewinnaufteilung nach Vereinbarung. Beide Generationen versteuern ihren Anteil.',
      'Schrittweise Uebergabe, Risikoteilung, Wissenstransfer.',
      'Konflikte bei unterschiedlichen Betriebsvisionen. Klare Vereinbarung noetig.',
    ],
    [
      'GmbH',
      'Kapitalgesellschaft mit CHF 20.000 Stammkapital. Haftungsbeschraenkung auf Gesellschaftsvermoegen. Handelsregisterpflicht.',
      'Koerperschaftssteuer auf Gesellschaftsebene + Dividendenbesteuerung beim Gesellschafter (Teilbesteuerung).',
      'Haftungsbeschraenkung, geeignet fuer groessere Betriebe oder Nebenerwerb.',
      'Gruendungskosten (Notar, HR-Eintrag), doppelte Buchfuehrung, Doppelbesteuerung.',
    ],
    [
      'Genossenschaft',
      'Demokratische Struktur (1 Mitglied = 1 Stimme). Min. 7 Mitglieder. Haeufig fuer Alpgenossenschaften und Maschinenringe.',
      'Koerperschaftssteuer. Rueckverguetungen an Mitglieder steuerlich abzugsfaehig.',
      'Demokratisch, Haftungsbeschraenkung, geeignet fuer Gemeinschaftsbetriebe.',
      'Min. 7 Mitglieder, Verwaltungsaufwand, Revisionspflicht.',
    ],
  ];

  for (const [type, desc, tax, pros, cons] of structures) {
    db.run(
      `INSERT INTO business_structures (structure_type, description, tax_treatment, pros, cons, jurisdiction)
       VALUES (?, ?, ?, ?, ?, 'CH')`,
      [type, desc, tax, pros, cons]
    );
  }

  // --- Tax rules ---
  const taxRules: [string, string, string, string][] = [
    [
      'Einkommen aus Landwirtschaft',
      'Selbstaendige Erwerbstaetigkeit (DBG Art. 18). Reingewinn = steuerbare Einkuenfte.',
      'Landwirtschaftliches Einkommen wird zusammen mit uebrigem Einkommen besteuert.',
      'DBG Art. 18, StHG Art. 8',
    ],
    [
      'Grundstueckgewinnsteuer bei Hofuebergabe',
      'Privilegierte Besteuerung: Aufschub bei Uebertragung an Nachkommen zum Ertragswert (BGBB).',
      'Grundstueckgewinnsteuer wird aufgeschoben, nicht erlassen. Realisierung bei spaeteren Verkauf zum Verkehrswert.',
      'StHG Art. 12 Abs. 3, BGBB Art. 66',
    ],
    [
      'Eigenmietwert',
      'Selbstbewohnte Liegenschaft: Eigenmietwert als Einkommen steuerbar. Hypothekarzinsen und Unterhaltskosten abzugsfaehig.',
      'Eigenmietwert typisch 60-70% der Marktmiete (kantonal unterschiedlich).',
      'DBG Art. 21, StHG Art. 7',
    ],
    [
      'AHV/IV Beitraege',
      'Selbstaendige Landwirte: AHV/IV/EO 10.0% auf Reingewinn (abgestuft bei niedrigem Einkommen).',
      'Beitraege auf dem im Steuerbescheid festgestellten Reingewinn. Mindestbeitrag CHF 514/Jahr.',
      'AHVG Art. 8, AHVV Art. 22',
    ],
    [
      'Pauschalbesteuerung Naturalbezuege',
      'Privater Bezug landwirtschaftlicher Erzeugnisse wird pauschal als Einkommen aufgerechnet.',
      'Ansaetze jaehrlich durch ESTV festgelegt (z.B. Milch, Kartoffeln, Fleisch, Obst).',
      'Merkblatt ESTV N1/2007',
    ],
  ];

  for (const [topic, rule, desc, legal] of taxRules) {
    db.run(
      `INSERT INTO tax_rules (topic, rule, description, legal_basis, jurisdiction)
       VALUES (?, ?, ?, ?, 'CH')`,
      [topic, rule, desc, legal]
    );
  }

  // --- Succession planning ---
  const succession: [string, string, string, string][] = [
    [
      'Ertragswertprinzip',
      'Landwirtschaftliche Gewerbe werden zum Ertragswert (deutlich unter Verkehrswert) an Erben uebertragen. BGBB Art. 17.',
      'Ertragswert = kapitalisierter landwirtschaftlicher Ertrag. Typisch 20-40% des Verkehrswerts.',
      'Aufschub der Grundstueckgewinnsteuer bei familieninterner Uebergabe.',
    ],
    [
      'Zuweisungsanspruch',
      'Erbe mit Selbstbewirtschaftungsabsicht hat Anspruch auf Zuweisung zum Ertragswert. BGBB Art. 11.',
      'Voraussetzung: persoenliche Eignung, Ausbildung, Selbstbewirtschaftungswille.',
      'Abfindung der Miterben auf Basis des Ertragswerts, nicht des Verkehrswerts.',
    ],
    [
      'Gewinnanspruch',
      'Bei Veraeusserung innert 25 Jahren nach Erwerb zum Ertragswert: Miterben haben Anspruch auf Anteil am Gewinn. BGBB Art. 28-32.',
      'Gewinn = Verkaufspreis minus Ertragswert. Anteil der Miterben nimmt mit der Zeit ab.',
      'Gewinnanspruch ist steuerlich relevant: Auszahlung an Miterben kann Grundstueckgewinnsteuer ausloesen.',
    ],
    [
      'Integralberechnung',
      'Berechnung des Gesamtwerts aller landwirtschaftlichen Gueter eines Betriebs zum Ertragswert.',
      'Massgebend fuer die Erbteilung und die Hoehe der Abfindungen.',
      'Kann bei gleichzeitiger Hofuebergabe und Erbvorbezug steuerlich optimiert werden.',
    ],
  ];

  for (const [scenario, desc, rule, tax] of succession) {
    db.run(
      `INSERT INTO succession_planning (scenario, description, ertragswert_rule, tax_implications, jurisdiction)
       VALUES (?, ?, ?, ?, 'CH')`,
      [scenario, desc, rule, tax]
    );
  }

  // --- Gross margins (Agroscope ZA-BH / AGRIDEA) ---
  const margins: [string, number, string, string, string][] = [
    ['Winterweizen', 2800, 'CHF/ha', 'Talzone, konventionell', 'Agroscope ZA-BH'],
    ['Winterraps', 2600, 'CHF/ha', 'Talzone, konventionell', 'Agroscope ZA-BH'],
    ['Kartoffeln', 9500, 'CHF/ha', 'Talzone, Speisekartoffeln', 'Agroscope ZA-BH'],
    ['Zuckerrueben', 5200, 'CHF/ha', 'Talzone', 'Agroscope ZA-BH'],
    ['Silomais', 3100, 'CHF/ha', 'Talzone', 'Agroscope ZA-BH'],
    ['Milchkuh', 3200, 'CHF/GVE/Jahr', 'Talzone, konventionell', 'Agroscope ZA-BH'],
    ['Mutterkuh', 800, 'CHF/GVE/Jahr', 'Talzone', 'Agroscope ZA-BH'],
    ['Mastschwein', 120, 'CHF/Platz/Jahr', 'Konventionell', 'Agroscope ZA-BH'],
    ['Legehenne', 25, 'CHF/Platz/Jahr', 'Konventionell, Bodenhaltung', 'Agroscope ZA-BH'],
    ['Obstanlage Niederstamm', 15000, 'CHF/ha', 'Tafelobst, Talzone', 'AGRIDEA'],
  ];

  for (const [ent, margin, unit, notes, source] of margins) {
    db.run(
      `INSERT INTO gross_margins (enterprise_type, margin_chf, yield_unit, notes, source, jurisdiction)
       VALUES (?, ?, ?, ?, ?, 'CH')`,
      [ent, margin, unit, notes, source]
    );
  }

  // --- Financial guidance ---
  const guidance: [string, string, string][] = [
    [
      'AHV/IV/EO Beitraege',
      'Selbstaendige Landwirte zahlen 10.0% AHV/IV/EO auf den Reingewinn. Abgestufte Skala bei niedrigem Einkommen (ab CHF 10.100). Mindestbeitrag CHF 514/Jahr. Beitraege werden aufgrund der Steuermeldung erhoben.',
      'AHVG / ESTV',
    ],
    [
      'Familienzulagen Landwirtschaft (FLG)',
      'Haushaltungszulage CHF 100/Monat. Kinderzulage CHF 200/Monat (ab 3. Kind: CHF 210). Ausbildungszulage CHF 250/Monat. Zustaendig: kantonale FAK.',
      'FLG / FAK',
    ],
    [
      'Maschinenkosten',
      'ART/AGRIDEA Maschinenkosten-Ansaetze: Traktor 80 PS ca. CHF 42/Std., Maehdrescher ca. CHF 230/Std. Miete und Lohnarbeit oft guenstiger als Eigenbesitz fuer kleine Betriebe.',
      'ART/AGRIDEA Maschinenkostenbericht',
    ],
    [
      'Versicherungen',
      'Betriebshaftpflicht, Gebaeudeversicherung, Ernteversicherung (Hagel, Frost). Tierversicherung fuer Zuchtvieh. Betriebsunterbrechungsversicherung bei Spezialkulturen empfohlen.',
      'SBV / Agrisano',
    ],
    [
      'Arbeitswirtschaft',
      'AGRIDEA Arbeitswirtschaft: Arbeitsbedarf pro Kultur und Tierart in AKh/Jahr. Grundlage fuer Betriebsplanung und Personalplanung.',
      'AGRIDEA',
    ],
  ];

  for (const [topic, content, source] of guidance) {
    db.run(
      `INSERT INTO financial_guidance (topic, content, source, jurisdiction)
       VALUES (?, ?, ?, 'CH')`,
      [topic, content, source]
    );
  }

  // --- FTS5 search index ---
  const ftsEntries: [string, string, string][] = [
    ['SAK Milchkuh Faktor', 'Milchkuh: SAK-Faktor 0.043 pro GVE. Mindestens 1.0 SAK fuer landwirtschaftliches Gewerbe nach BGBB Art. 5.', 'sak'],
    ['SAK Berechnung Gewerbe', 'Ein Betrieb gilt als landwirtschaftliches Gewerbe wenn die SAK-Summe mindestens 1.0 betraegt. DZV Anhang.', 'sak'],
    ['Winterweizen Deckungsbeitrag Schweiz', 'Winterweizen DB Talzone: ca. CHF 2800/ha (konventionell). Agroscope ZA-BH Referenzbetriebe.', 'deckungsbeitrag'],
    ['Kartoffeln Deckungsbeitrag Speisekartoffeln', 'Kartoffeln DB Talzone: ca. CHF 9500/ha (Speisekartoffeln). Hoher Arbeitsbedarf, hohe variable Kosten.', 'deckungsbeitrag'],
    ['Betriebsuebergabe Ertragswert BGBB', 'Hofuebergabe zum Ertragswert nach BGBB. Ertragswert liegt typisch bei 20-40% des Verkehrswerts.', 'uebergabe'],
    ['Zuweisungsanspruch BGBB Art 11', 'Erbe mit Selbstbewirtschaftungsabsicht hat Zuweisungsanspruch zum Ertragswert. BGBB Art. 11.', 'uebergabe'],
    ['Grundstueckgewinnsteuer Aufschub Hofuebergabe', 'Grundstueckgewinnsteuer wird bei familieninterner Hofuebergabe aufgeschoben (StHG Art. 12 Abs. 3).', 'steuern'],
    ['AHV IV Beitraege Landwirt selbstaendig', 'AHV/IV/EO: 10.0% auf Reingewinn. Abgestufte Skala bei niedrigem Einkommen. Mindestbeitrag CHF 514/Jahr.', 'steuern'],
    ['Einzelunternehmen Rechtsform Landwirtschaft', 'Einzelunternehmen: haeufigste Rechtsform (~90%). Unbeschraenkte Haftung. Keine Gruendungsformalitaeten.', 'rechtsform'],
    ['GmbH Landwirtschaft Haftung Kapitalgesellschaft', 'GmbH: CHF 20.000 Stammkapital. Haftungsbeschraenkung. Koerperschaftssteuer auf Gesellschaftsebene.', 'rechtsform'],
    ['Familienzulagen FLG Kinderzulage Landwirtschaft', 'FLG: Haushaltungszulage CHF 100/Monat. Kinderzulage CHF 200/Monat. Ausbildungszulage CHF 250/Monat.', 'finanzen'],
    ['Maschinenkosten ART AGRIDEA Traktor', 'ART/AGRIDEA: Traktor 80 PS ca. CHF 42/Std. Maehdrescher ca. CHF 230/Std. Lohnarbeit pruefen.', 'finanzen'],
    ['Genossenschaft Alpgenossenschaft Rechtsform', 'Genossenschaft: min. 7 Mitglieder, demokratisch. Haeufig fuer Alpgenossenschaften und Maschinenringe.', 'rechtsform'],
    ['Gewinnanspruch Miterben BGBB 25 Jahre', 'Gewinnanspruch bei Veraeusserung innert 25 Jahren. Miterben erhalten Anteil am Gewinn (BGBB Art. 28-32).', 'uebergabe'],
    ['Versicherung Ernteversicherung Hagel', 'Betriebshaftpflicht, Gebaeudeversicherung, Ernteversicherung (Hagel, Frost). Tierversicherung Zuchtvieh.', 'finanzen'],
  ];

  for (const [title, body, topic] of ftsEntries) {
    db.run(
      `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, 'CH')`,
      [title, body, topic]
    );
  }

  // Metadata
  db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('last_ingest', '2026-04-05')", []);
  db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('build_date', '2026-04-05')", []);

  return db;
}
