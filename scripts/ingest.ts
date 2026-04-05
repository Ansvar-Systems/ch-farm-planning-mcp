/**
 * Switzerland Farm Planning MCP — Data Ingestion Script
 *
 * Populates the database with Swiss farm business planning data from:
 * - Agroscope ZA-BH — Deckungsbeitraege, Referenzbetriebe
 * - BLW — SAK-Faktoren (DZV Anhang), Agrarbericht
 * - BGBB (SR 211.412.11) — Ertragswert, Zuweisungsanspruch, Betriebsuebergabe
 * - AGRIDEA — Betriebsplanung, Arbeitswirtschaft, Rechtsformen
 * - SBV — AHV/IV, Familienzulagen Landwirtschaft, Lohnrichtlinien
 *
 * Usage: npm run ingest
 */

import { createDatabase } from '../src/db.js';
import { mkdirSync } from 'fs';

mkdirSync('data', { recursive: true });
const db = createDatabase('data/database.db');

const now = new Date().toISOString().split('T')[0];

// ---------------------------------------------------------------------------
// 1. SAK-Faktoren (Standardarbeitskraft) — DZV Anhang
//    Schwellenwert: 1.0 SAK = landwirtschaftliches Gewerbe (BGBB Art. 5)
// ---------------------------------------------------------------------------

interface SakFactor {
  enterprise_type: string;
  factor_per_unit: number;
  unit: string;
  notes: string;
}

const sakFactors: SakFactor[] = [
  // Pflanzenbau
  { enterprise_type: 'Winterweizen', factor_per_unit: 0.022, unit: 'ha', notes: 'Talzone, konventionell' },
  { enterprise_type: 'Sommerweizen', factor_per_unit: 0.022, unit: 'ha', notes: 'Talzone, konventionell' },
  { enterprise_type: 'Wintergerste', factor_per_unit: 0.020, unit: 'ha', notes: 'Talzone' },
  { enterprise_type: 'Winterraps', factor_per_unit: 0.025, unit: 'ha', notes: 'Talzone' },
  { enterprise_type: 'Silomais', factor_per_unit: 0.024, unit: 'ha', notes: 'Talzone' },
  { enterprise_type: 'Koernermais', factor_per_unit: 0.025, unit: 'ha', notes: 'Talzone' },
  { enterprise_type: 'Kartoffeln', factor_per_unit: 0.060, unit: 'ha', notes: 'Talzone, erhoehter Arbeitsbedarf (Pflanzung, Pflege, Ernte)' },
  { enterprise_type: 'Zuckerrueben', factor_per_unit: 0.045, unit: 'ha', notes: 'Talzone' },
  { enterprise_type: 'Kunstwiese', factor_per_unit: 0.015, unit: 'ha', notes: '3-jaehrig, Talzone' },
  { enterprise_type: 'Naturwiese intensiv', factor_per_unit: 0.012, unit: 'ha', notes: 'Talzone, 3-4 Schnitte' },
  { enterprise_type: 'Naturwiese extensiv', factor_per_unit: 0.007, unit: 'ha', notes: 'Talzone, 1-2 Schnitte' },
  { enterprise_type: 'Dauergruenland', factor_per_unit: 0.010, unit: 'ha', notes: 'Durchschnitt Talzone' },
  { enterprise_type: 'Obst Hochstamm', factor_per_unit: 0.050, unit: 'ha', notes: 'Streuobst, extensiv' },
  { enterprise_type: 'Obst Niederstamm', factor_per_unit: 0.120, unit: 'ha', notes: 'Intensivobstanlage' },
  { enterprise_type: 'Reben', factor_per_unit: 0.200, unit: 'ha', notes: 'Rebbau, hoher Handarbeitsanteil' },
  { enterprise_type: 'Freilandgemuese', factor_per_unit: 0.150, unit: 'ha', notes: 'Durchschnitt verschiedene Kulturen' },
  { enterprise_type: 'Gewaechshausgemuese', factor_per_unit: 0.350, unit: 'ha', notes: 'Beheiztes Gewaechshaus' },
  // Tierhaltung
  { enterprise_type: 'Milchkuh', factor_per_unit: 0.040, unit: 'Kuh', notes: 'Laufstall, mit Aufzucht. Inkl. Futterbau anteilig' },
  { enterprise_type: 'Mutterkuh', factor_per_unit: 0.030, unit: 'Kuh', notes: 'Extensiv, mit Kalb' },
  { enterprise_type: 'Aufzuchtrind', factor_per_unit: 0.015, unit: 'Tier', notes: 'Jungtier 1-2 Jahre' },
  { enterprise_type: 'Mastrind', factor_per_unit: 0.018, unit: 'Tier', notes: 'Grossviehmast' },
  { enterprise_type: 'Mastschwein', factor_per_unit: 0.005, unit: 'Platz', notes: 'Pro Mastplatz, Durchschnitt ~3 Umtriebe/Jahr' },
  { enterprise_type: 'Zuchtsau', factor_per_unit: 0.025, unit: 'Platz', notes: 'Inkl. Ferkelaufzucht bis 25 kg' },
  { enterprise_type: 'Legehenne', factor_per_unit: 0.0015, unit: 'Platz', notes: 'Bodenhaltung, BTS-tauglich' },
  { enterprise_type: 'Mastpoulet', factor_per_unit: 0.0008, unit: 'Platz', notes: 'Konventionelle Mast' },
  { enterprise_type: 'Milchschaf', factor_per_unit: 0.012, unit: 'Tier', notes: 'Mit Lammaufzucht' },
  { enterprise_type: 'Mutterziege', factor_per_unit: 0.010, unit: 'Tier', notes: 'Milch- oder Fleischziege' },
  // Soemmerung / Diversifikation
  { enterprise_type: 'Soemmrung Alp', factor_per_unit: 0.008, unit: 'NST', notes: 'Normalstoss (1 GVE x 100 Tage), Alpbetrieb' },
  { enterprise_type: 'Agrotourismus', factor_per_unit: 0.005, unit: 'Bett', notes: 'Ferienwohnung, Schlaf im Stroh etc.' },
  { enterprise_type: 'Direktvermarktung', factor_per_unit: 0.040, unit: '10000 CHF Umsatz', notes: 'Hofladen, Marktfahren' },
];

const insertSak = db.instance.prepare(
  'INSERT INTO sak_factors (enterprise_type, factor_per_unit, unit, notes, jurisdiction) VALUES (?, ?, ?, ?, ?)'
);
for (const s of sakFactors) {
  insertSak.run(s.enterprise_type, s.factor_per_unit, s.unit, s.notes, 'CH');
}
console.log(`Inserted ${sakFactors.length} SAK factors`);

// ---------------------------------------------------------------------------
// 2. Business Structures (Rechtsformen) — AGRIDEA, Handelsregister
// ---------------------------------------------------------------------------

interface BusinessStructure {
  structure_type: string;
  description: string;
  tax_treatment: string;
  pros: string;
  cons: string;
}

const businessStructures: BusinessStructure[] = [
  {
    structure_type: 'Einzelunternehmen',
    description: 'Standardform fuer Schweizer Landwirtschaftsbetriebe. Der Betriebsleiter haftet mit dem gesamten Privatvermoegen. ' +
      'Kein Handelsregistereintrag erforderlich unter 100,000 CHF Umsatz. Einfachste Gruendung und Verwaltung.',
    tax_treatment: 'Landwirtschaftliches Einkommen wird als Einkommen aus selbstaendiger Erwerbstaetigkeit besteuert (Einkommenssteuer). ' +
      'Naturaleinkommen (Eigenverbrauch) ist steuerpflichtig. AHV/IV/EO-Beitraege als Selbstaendiger (10.6% ab 60,500 CHF Einkommen). ' +
      'Privilegierte Besteuerung bei Aufgabe der Selbstbewirtschaftung (aufgeschobene Grundstueckgewinnsteuer).',
    pros: 'Einfachste Rechtsform; keine Gruendungskosten; volle Entscheidungsfreiheit; privilegierte Besteuerung bei Hofuebergabe (BGBB); ' +
      'Ertragswert-Uebergabe innerhalb Familie moeglich; kein Mindestkapital',
    cons: 'Unbeschraenkte persoenliche Haftung; Betrieb und Privatvermoegen nicht getrennt; Nachfolge nur durch Einzelperson; ' +
      'keine Risikobegrenzung bei Investitionen; Betrieb endet bei Tod ohne Regelung',
  },
  {
    structure_type: 'Einfache Gesellschaft',
    description: 'Zusammenschluss von zwei oder mehr Personen (z.B. Vater und Sohn) ohne eigene Rechtspersoenlichkeit. ' +
      'Haeufig als Generationengemeinschaft oder Betriebsgemeinschaft genutzt. Vertraglich geregelt (OR Art. 530ff).',
    tax_treatment: 'Keine eigene Steuerpflicht — Einkommen wird anteilig den Gesellschaftern zugerechnet. ' +
      'Jeder Gesellschafter versteuert seinen Anteil als Einkommen aus selbstaendiger Taetigkeit. ' +
      'AHV-Beitraege pro Gesellschafter individuell.',
    pros: 'Einfache Gruendung (schriftlicher Vertrag genuegt); ideal fuer Generationenuebergang; mehrere Familienmitglieder ' +
      'koennen eingebunden werden; flexible Gewinnverteilung; BGBB-Privilegien bleiben erhalten',
    cons: 'Solidarische und unbeschraenkte Haftung aller Gesellschafter; kein Handelsregistereintrag moeglich; ' +
      'Aufloesung bei Tod/Austritt eines Gesellschafters (ohne abweichende Vereinbarung); potenzielle Konflikte bei Entscheidungen',
  },
  {
    structure_type: 'Generationengemeinschaft',
    description: 'Sonderform der einfachen Gesellschaft: Die uebergebende und die uebernehmende Generation bewirtschaften ' +
      'den Betrieb gemeinsam waehrend einer Uebergangsphase (typisch 3-10 Jahre). Haeufigste Form der schrittweisen Betriebsuebergabe ' +
      'in der Schweizer Landwirtschaft. Vertragliche Regelung von Arbeitsteilung, Entschaedigung und Zeitplan.',
    tax_treatment: 'Wie einfache Gesellschaft: anteilige Besteuerung. Uebergabender kann schrittweise AHV-Rente beziehen. ' +
      'Wichtig: Betrieb muss als landwirtschaftliches Gewerbe (>= 1.0 SAK) qualifizieren fuer BGBB-Privilegien.',
    pros: 'Sanfter Uebergang; Erfahrungsweitergabe; schrittweise Verantwortungsuebertragung; AHV-Uebergang moeglich; ' +
      'BGBB-Schutz bleibt bestehen; beide Generationen erhalten Einkommen',
    cons: 'Potenzial fuer Generationenkonflikte; klare vertragliche Regelung erforderlich; solidarische Haftung; ' +
      'Dauer muss begrenzt sein (Steuerverwaltung prueft Ernsthaftigkeit); Buchhaltung fuer beide Parteien',
  },
  {
    structure_type: 'GmbH',
    description: 'Gesellschaft mit beschraenkter Haftung (OR Art. 772ff). Selten in der Schweizer Landwirtschaft, ' +
      'da BGBB-Privilegien (Ertragswert, Zuweisungsanspruch) nur fuer natuerliche Personen gelten. ' +
      'Mindestkapital 20,000 CHF. Handelsregistereintrag und Revisionsstelle erforderlich.',
    tax_treatment: 'Juristische Person: Gewinnsteuer (Bund 8.5%, kantonal variabel 12-24%) plus Kapitalsteuer. ' +
      'Ausschuettungen an Gesellschafter als Dividendeneinkommen besteuert (Teilbesteuerung 50-70% bei qualifizierter Beteiligung). ' +
      'KEIN privilegierter Ertragswert bei Uebertragung — Verkehrswert massgebend.',
    pros: 'Beschraenkte Haftung (nur Stammkapital); Trennung Privat-/Geschaeftsvermoegen; professionelle Aussenwirkung; ' +
      'Beteiligung mehrerer Personen moeglich; Betrieb besteht unabhaengig von Personen',
    cons: 'Verlust der BGBB-Privilegien (kein Ertragswert, kein Zuweisungsanspruch); Doppelbesteuerung (Gewinn + Dividende); ' +
      'hoehere Verwaltungskosten (Buchhaltung, Revision); Grundstueckgewinnsteuer bei Einlage; 20,000 CHF Mindestkapital; ' +
      'komplexere Uebergabe',
  },
  {
    structure_type: 'Genossenschaft',
    description: 'Genossenschaft (OR Art. 828ff). Traditionell verbreitet als Alpgenossenschaft, Kaesereigenossenschaft, ' +
      'Maschinengenossenschaft oder Wasserversorgungsgenossenschaft. Mindestens 7 Mitglieder. Demokratisches Prinzip (1 Mitglied = 1 Stimme). ' +
      'Nicht geeignet fuer Einzelbetriebe, aber wichtig fuer gemeinschaftliche Infrastruktur.',
    tax_treatment: 'Juristische Person: Gewinnsteuer. Genossenschaftliche Rueckverguetungen (Patronatsverguetung) sind abzugsfaehig. ' +
      'Landwirtschaftliche Genossenschaften geniessen teilweise Steuerprivilegien (Art. 23 Abs. 1 lit. f StHG). ' +
      'Keine BGBB-Privilegien fuer die Genossenschaft selbst.',
    pros: 'Demokratische Mitbestimmung; Risikoteilung; gemeinsame Investitionen; Steuerprivilegien fuer landw. Genossenschaften; ' +
      'Tradition und Akzeptanz im laendlichen Raum; beschraenkte Haftung der Mitglieder',
    cons: 'Mindestens 7 Mitglieder erforderlich; langsame Entscheidungsprozesse; kein individueller Gewinn (Rueckverguetung); ' +
      'Handelsregistereintrag und Statuten erforderlich; nicht fuer Einzelbetriebe geeignet',
  },
];

const insertBs = db.instance.prepare(
  'INSERT INTO business_structures (structure_type, description, tax_treatment, pros, cons, jurisdiction) VALUES (?, ?, ?, ?, ?, ?)'
);
for (const bs of businessStructures) {
  insertBs.run(bs.structure_type, bs.description, bs.tax_treatment, bs.pros, bs.cons, 'CH');
}
console.log(`Inserted ${businessStructures.length} business structures`);

// ---------------------------------------------------------------------------
// 3. Tax Rules — Steuerliche Behandlung landwirtschaftlicher Betriebe
// ---------------------------------------------------------------------------

interface TaxRule {
  topic: string;
  rule: string;
  description: string;
  legal_basis: string;
}

const taxRules: TaxRule[] = [
  {
    topic: 'Einkommen aus Landwirtschaft',
    rule: 'Landwirtschaftliches Einkommen als selbstaendige Erwerbstaetigkeit',
    description: 'Landwirtschaftliches Einkommen wird als Einkommen aus selbstaendiger Erwerbstaetigkeit besteuert ' +
      '(DBG Art. 18). Dazu gehoeren: Einkuenfte aus Pflanzenbau und Tierhaltung, Naturaleinkommen (Eigenverbrauch ' +
      'von Lebensmitteln, Mietwert der Betriebsleiterwohnung), Nebeneinkuenfte aus landwirtschaftsnaher Taetigkeit ' +
      '(Lohnarbeit, Agrotourismus). Abzugsfaehig sind Betriebskosten, Abschreibungen und Schuldzinsen.',
    legal_basis: 'DBG Art. 18 (Einkommen aus selbstaendiger Erwerbstaetigkeit), StHG Art. 8',
  },
  {
    topic: 'Naturaleinkommen',
    rule: 'Eigenverbrauch und Wohnungsnutzung sind steuerpflichtig',
    description: 'Der Wert selbstverbrauchter landwirtschaftlicher Produkte (Fleisch, Milch, Gemuese, Eier) ist als ' +
      'Naturaleinkommen steuerbar. Die Eidgenoessische Steuerverwaltung (ESTV) veroeffentlicht jaehrlich Ansaetze ' +
      'fuer die Bewertung (ca. 4,800-7,200 CHF/Jahr fuer Ehepaar mit Kindern). Der Mietwert der Betriebsleiterwohnung ' +
      '(Eigenmietwert) wird zum Einkommen addiert.',
    legal_basis: 'DBG Art. 21 (Eigenmietwert), DBG Art. 18 (Naturaleinkommen), ESTV-Merkblatt',
  },
  {
    topic: 'Eigenmietwert',
    rule: 'Mietwert der Betriebsleiterwohnung ist steuerbar',
    description: 'Wie alle Eigentuemer muessen Landwirte den Eigenmietwert ihrer selbstbewohnten Liegenschaft als ' +
      'Einkommen versteuern. Bei landwirtschaftlichen Wohngebaeuden wird der Mietwert nach kantonalen Schaetzungsregeln ' +
      'bestimmt (typisch 60-70% des Marktmietwerts). Hypothekarzinsen und Unterhaltskosten sind abzugsfaehig. ' +
      'Politische Diskussion zur Abschaffung des Eigenmietwerts ist laufend (Stand 2025).',
    legal_basis: 'DBG Art. 21 Abs. 1 lit. b, kantonale Steuergesetze',
  },
  {
    topic: 'Grundstueckgewinnsteuer',
    rule: 'Besteuerung des Gewinns bei Veraeusserung landwirtschaftlicher Grundstuecke',
    description: 'Beim Verkauf landwirtschaftlicher Grundstuecke faellt Grundstueckgewinnsteuer an (kantonal geregelt). ' +
      'Massgebend ist die Differenz zwischen Erloes und Anlagekosten. Bei Betrieben im Geltungsbereich des BGBB gelten ' +
      'besondere Regeln: Veraeusserung zum Ertragswert innerhalb der Familie loest keine Grundstueckgewinnsteuer aus. ' +
      'Bei Aufgabe der Selbstbewirtschaftung und Verkauf zum Verkehrswert wird die Differenz zwischen Ertragswert und ' +
      'Verkehrswert als Einkommen besteuert (privilegiert, da aufgeschobene Besteuerung).',
    legal_basis: 'DBG Art. 18 Abs. 4, BGBB Art. 28ff, StHG Art. 12, kantonale Steuergesetze',
  },
  {
    topic: 'Privilegierte Besteuerung bei Hofuebergabe',
    rule: 'Aufgeschobene Besteuerung bei Uebergabe zum Ertragswert',
    description: 'Die Uebergabe eines landwirtschaftlichen Gewerbes innerhalb der Familie zum Ertragswert (BGBB) loest ' +
      'keine Einkommens- oder Grundstueckgewinnsteuer aus — die stillen Reserven werden aufgeschoben. Erst bei spaeterer ' +
      'Veraeusserung durch den Uebernehmer (oder dessen Erben) zum Verkehrswert wird die Differenz besteuert. ' +
      'Voraussetzungen: Betrieb qualifiziert als landwirtschaftliches Gewerbe (>= 1.0 SAK), Uebernehmer ist Selbstbewirtschafter, ' +
      'Uebergabe innerhalb der BGBB-berechtigten Verwandtschaft.',
    legal_basis: 'DBG Art. 18 Abs. 4, BGBB Art. 17-22, BGE 138 II 32',
  },
  {
    topic: 'AHV/IV/EO Beitraege Selbstaendige',
    rule: 'Beitragssatz 10.6% ab 60,500 CHF Einkommen',
    description: 'Selbstaendige Landwirte zahlen AHV/IV/EO-Beitraege auf ihrem Nettoeinkommen aus selbstaendiger ' +
      'Erwerbstaetigkeit. Der Beitragssatz betraegt 10.6% bei einem Einkommen ab 60,500 CHF (sinkende Skala ' +
      'darunter, Minimum 5.371% bei 10,100 CHF). Dazu kommen Beitraege an die Familienausgleichskasse (FAK) ' +
      'fuer Familienzulagen (kantonal 1.0-3.5%). Landwirtschaftliche Arbeitnehmer (z.B. Angestellte) sind ' +
      'obligatorisch AHV-versichert (je 5.3% Arbeitgeber/Arbeitnehmer).',
    legal_basis: 'AHVG Art. 8, AHVV Art. 23, AHVV Art. 25',
  },
  {
    topic: 'Familienzulagen Landwirtschaft (FLG)',
    rule: 'Kinderzulage 200 CHF/Monat, Haushaltungszulage Berggebiet',
    description: 'Das Bundesgesetz ueber die Familienzulagen in der Landwirtschaft (FLG) gewaehrt selbstaendigen ' +
      'Landwirten: Kinderzulage 200 CHF/Monat pro Kind (250 CHF ab 16 Jahre in Ausbildung), Haushaltungszulage ' +
      '100 CHF/Monat im Berggebiet (Bergzone I-IV und Soemmerungsgebiet). Finanziert durch Arbeitgeber- ' +
      'und Bundesmittel. Anspruch besteht, wenn das landwirtschaftliche Einkommen mindestens 50% des Gesamteinkommens ' +
      'ausmacht oder der Betrieb mindestens 0.5 SAK umfasst.',
    legal_basis: 'FLG Art. 5-10 (SR 836.1), FLV (SR 836.11)',
  },
  {
    topic: 'Abschreibungen landwirtschaftliche Gebaeude',
    rule: 'Steuerliche Abschreibungen auf Betriebsgebaeude und Maschinen',
    description: 'Landwirtschaftliche Betriebsgebaeude koennen steuerlich abgeschrieben werden: Oekonomiegebaeude ' +
      '(Stall, Scheune) bis 6% degressiv oder 3% linear, Wohnhaus des Betriebsleiters bis 3% degressiv oder 1.5% linear, ' +
      'Maschinen und Geraete bis 40% degressiv oder 20% linear. Der Buchwert darf nicht unter den Ertragswert sinken ' +
      '(bei landwirtschaftlichen Liegenschaften). Investitionen in Tierwohl (BTS/RAUS-Umbauten) koennen teilweise ' +
      'sofort abgeschrieben werden, sofern subventionsfinanziert.',
    legal_basis: 'DBG Art. 28, kantonale Praxis, KS ESTV 12/2022',
  },
  {
    topic: 'Mehrwertsteuer Landwirtschaft',
    rule: 'Pauschalsteuersatz 2.8% oder ordentliche Abrechnung',
    description: 'Landwirte mit einem Umsatz unter 100,000 CHF aus nicht-landwirtschaftlicher Taetigkeit und unter ' +
      '150,000 CHF Steuerbetrag sind von der MWST-Pflicht befreit. Wer MWST-pflichtig ist, kann zwischen ' +
      'effektiver Abrechnung und Pauschalsteuersatzmethode waehlen. Der landwirtschaftliche Pauschalsteuersatz ' +
      'betraegt 2.8% (Urproduktion) und erlaubt keine Vorsteuerabzuege. Direktvermarktung, Agrotourismus und ' +
      'Lohnarbeit werden zum Normalsatz (8.1%) besteuert.',
    legal_basis: 'MWSTG Art. 10, Art. 37 (SR 641.20)',
  },
  {
    topic: 'Vermoegenssteuer landwirtschaftliche Liegenschaften',
    rule: 'Bewertung zum Ertragswert fuer Vermoegenssteuer',
    description: 'Fuer die kantonale Vermoegenssteuer werden landwirtschaftliche Liegenschaften zum Ertragswert bewertet ' +
      '(deutlich unter Verkehrswert, typisch 30-50%). Dies fuehrt zu einer erheblichen Steuerersparnis gegenueber ' +
      'nichtlandwirtschaftlichen Liegenschaften. Die Bewertung gilt nur, solange der Eigentruemer Selbstbewirtschafter ist ' +
      'und das Grundstueck der landwirtschaftlichen Nutzung dient.',
    legal_basis: 'StHG Art. 14 Abs. 1, BGBB Art. 10, kantonale Steuergesetze',
  },
];

const insertTax = db.instance.prepare(
  'INSERT INTO tax_rules (topic, rule, description, legal_basis, jurisdiction) VALUES (?, ?, ?, ?, ?)'
);
for (const t of taxRules) {
  insertTax.run(t.topic, t.rule, t.description, t.legal_basis, 'CH');
}
console.log(`Inserted ${taxRules.length} tax rules`);

// ---------------------------------------------------------------------------
// 4. Succession Planning — Betriebsuebergabe (BGBB)
// ---------------------------------------------------------------------------

interface SuccessionScenario {
  scenario: string;
  description: string;
  ertragswert_rule: string;
  tax_implications: string;
}

const successionScenarios: SuccessionScenario[] = [
  {
    scenario: 'Ertragswertprinzip',
    description: 'Zentrales Prinzip des BGBB: Ein landwirtschaftliches Gewerbe (>= 1.0 SAK) kann innerhalb der Familie ' +
      'zum Ertragswert uebertragen werden. Der Ertragswert wird nach einer gesetzlich festgelegten Methode berechnet ' +
      '(Schaetzungsanleitung des Bundes) und liegt typischerweise bei 30-50% des Verkehrswerts. Die Differenz stellt ' +
      'eine gesetzlich gewollte Beguenstigung des uebernehmenden Selbstbewirtschafters dar.',
    ertragswert_rule: 'Berechnung nach Schaetzungsanleitung (Art. 10 BGBB): Kapitalisierung des nachhaltig erzielbaren ' +
      'Nettoertrags. Massgebend sind Bodenqualitaet, Gebaeudezustand, Ausstattung und Lage. Der Zinssatz zur Kapitalisierung ' +
      'wird vom Bundesrat festgelegt. Aktueller Faktor ergibt ca. 30-50% des Verkehrswerts.',
    tax_implications: 'Keine Einkommens- oder Grundstueckgewinnsteuer bei Uebergabe zum Ertragswert innerhalb der Familie. ' +
      'Stille Reserven werden aufgeschoben. Schenkungs- und Erbschaftssteuer: kantonal unterschiedlich, oft steuerfrei ' +
      'zwischen Eltern und Kindern.',
  },
  {
    scenario: 'Zuweisungsanspruch',
    description: 'Bei der Erbteilung kann jeder Erbe, der Selbstbewirtschafter ist, verlangen, dass ihm das landwirtschaftliche ' +
      'Gewerbe zum Ertragswert zugewiesen wird (BGBB Art. 11). Dies gilt auch gegen den Willen der Miterben. ' +
      'Voraussetzung: Der Erbe muss persoenlich geeignet sein und den Betrieb selber bewirtschaften wollen. ' +
      'Der Zuweisungsanspruch hat Vorrang vor dem freien Marktverkauf.',
    ertragswert_rule: 'Zuweisung zum Ertragswert (BGBB Art. 11, Art. 17). Die Miterben erhalten den Ertragswert als ' +
      'Erbanrechnungswert — nicht den Verkehrswert. Die Differenz zum Verkehrswert verbleibt beim Uebernehmer.',
    tax_implications: 'Keine unmittelbare Besteuerung der Differenz. Bei spaeterer Veraeusserung innerhalb von 25 Jahren ' +
      'greift der Gewinnanspruch der Miterben (BGBB Art. 28ff).',
  },
  {
    scenario: 'Gewinnanspruch',
    description: 'Wenn der Uebernehmer das landwirtschaftliche Gewerbe (oder Teile davon) innerhalb von 25 Jahren nach ' +
      'der Uebergabe zum Ertragswert veraeussert, haben die Miterben Anspruch auf einen Anteil des Gewinns ' +
      '(Differenz Ertragswert — Veraeusserungserloes). Der Anspruch sinkt jaehrlich und erloescht nach 25 Jahren vollstaendig.',
    ertragswert_rule: 'Gewinn = Veraeusserungserloes minus Ertragswert (angepasst). Anspruch der Miterben: in den ersten ' +
      '6 Jahren voller Anteil, dann linear abnehmend bis 25. Jahr. Berechnung gemaess BGBB Art. 28-30.',
    tax_implications: 'Der Veraeusserungsgewinn unterliegt der Grundstueckgewinnsteuer (kantonal). Bei nicht-landwirtschaftlicher ' +
      'Nutzung (z.B. Einzonung als Bauland) kann die Steuerbelastung erheblich sein. Die Beteiligungsdauer beeinflusst ' +
      'den Steuersatz (Besitzdauerabzug kantonal).',
  },
  {
    scenario: 'Integralberechnung',
    description: 'Bei der Erbteilung werden landwirtschaftliche Grundstuecke zum Ertragswert berechnet (Integralberechnung). ' +
      'Das bedeutet: Der gesamte Nachlass wird aufgeteilt, wobei das landwirtschaftliche Gewerbe nur zum Ertragswert — ' +
      'nicht zum Verkehrswert — eingerechnet wird. Die Miterben erhalten ihren Erbteil basierend auf diesem tieferen Wert. ' +
      'Dies kann zu einer erheblichen wirtschaftlichen Beguenstigung des Uebernehmers fuehren.',
    ertragswert_rule: 'Nachlasswert = Ertragswert (landw. Gewerbe) + Verkehrswert (uebrige Vermoegen). Erbteil der ' +
      'Miterben berechnet sich auf dieser Basis. Der Uebernehmer erhaelt das Gewerbe zum Ertragswert angerechnet.',
    tax_implications: 'Erbschafts- und Schenkungssteuern (kantonal): Oft keine Steuer zwischen Eltern und Kindern. ' +
      'Einige Kantone besteuern die Differenz zum Verkehrswert als geldwerten Vorteil.',
  },
  {
    scenario: 'Vorkaufsrecht der Familie',
    description: 'Das BGBB raeumt Verwandten (Nachkommen, Geschwister, Eltern) ein Vorkaufsrecht bei der Veraeusserung ' +
      'eines landwirtschaftlichen Gewerbes ein (BGBB Art. 42ff). Das Vorkaufsrecht besteht zum Ertragswert (nicht zum ' +
      'Verkehrswert). Es kann nicht vertraglich wegbedungen werden. Das Vorkaufsrecht gilt auch bei Zwangsversteigerung.',
    ertragswert_rule: 'Vorkaufsrecht zum Ertragswert (BGBB Art. 42-49). Der Kaeufer zahlt den Ertragswert, nicht den ' +
      'vom Verkaeufer allenfalls mit einem Dritten vereinbarten hoeheren Preis.',
    tax_implications: 'Gleich wie bei Zuweisungsanspruch: Gewinnanspruch der Miterben bei spaeterer Veraeusserung. ' +
      'Keine Grundstueckgewinnsteuer bei Ausuebung des Vorkaufsrechts zum Ertragswert.',
  },
  {
    scenario: 'Paechter als Uebernehmer',
    description: 'Paechter eines landwirtschaftlichen Gewerbes haben kein gesetzliches Uebernahmerecht. Sie koennen ' +
      'jedoch ein Kaufrecht vertraglich vereinbaren. Bei langjaehriger Pacht (> 6 Jahre) besteht Kuendigungsschutz ' +
      '(LPG Art. 15ff). Wenn der Verpaechter verkaufen will, hat der Paechter kein BGBB-Vorkaufsrecht, es sei denn, ' +
      'er gehoert zur berechtigten Verwandtschaft.',
    ertragswert_rule: 'Kein gesetzlicher Anspruch auf Ertragswert fuer Paechter. Marktpreis oder vertraglich vereinbarter ' +
      'Preis (aber immer innerhalb des BGBB-Rahmens, d.h. max. Verkehrswert). Bewilligungspflicht durch kantonale ' +
      'BGBB-Behoerde.',
    tax_implications: 'Kauf zum Verkehrswert: Grundstueckgewinnsteuer beim Verkaeufer. Keine privilegierte Besteuerung, ' +
      'da nicht innerhalb der Familie.',
  },
];

const insertSucc = db.instance.prepare(
  'INSERT INTO succession_planning (scenario, description, ertragswert_rule, tax_implications, jurisdiction) VALUES (?, ?, ?, ?, ?)'
);
for (const s of successionScenarios) {
  insertSucc.run(s.scenario, s.description, s.ertragswert_rule, s.tax_implications, 'CH');
}
console.log(`Inserted ${successionScenarios.length} succession scenarios`);

// ---------------------------------------------------------------------------
// 5. Gross Margins (Deckungsbeitraege) — Agroscope ZA-BH / AGRIDEA
//    All values in CHF, representative for Talzone unless noted
// ---------------------------------------------------------------------------

interface GrossMargin {
  enterprise_type: string;
  margin_chf: number;
  yield_unit: string;
  notes: string;
  source: string;
}

const grossMargins: GrossMargin[] = [
  // Pflanzenbau (CHF/ha, Talzone)
  { enterprise_type: 'Winterweizen', margin_chf: 2800, yield_unit: 'CHF/ha', notes: 'Futterweizen Klasse Top/I, Talzone, 6.5 t/ha Ertrag, inkl. Einzelkulturbeitrag', source: 'Agroscope ZA-BH / AGRIDEA Deckungsbeitraege' },
  { enterprise_type: 'Sommerweizen', margin_chf: 2400, yield_unit: 'CHF/ha', notes: 'Talzone, 5.5 t/ha', source: 'Agroscope ZA-BH / AGRIDEA' },
  { enterprise_type: 'Wintergerste', margin_chf: 2200, yield_unit: 'CHF/ha', notes: 'Futtergerste, Talzone, 6.5 t/ha', source: 'Agroscope ZA-BH / AGRIDEA' },
  { enterprise_type: 'Winterraps', margin_chf: 2600, yield_unit: 'CHF/ha', notes: 'HOLL-Raps, Talzone, 3.5 t/ha', source: 'Agroscope ZA-BH / AGRIDEA' },
  { enterprise_type: 'Silomais', margin_chf: 2500, yield_unit: 'CHF/ha', notes: 'Talzone, 17 t TS/ha, Eigenbedarf Milchvieh', source: 'Agroscope ZA-BH / AGRIDEA' },
  { enterprise_type: 'Koernermais', margin_chf: 2700, yield_unit: 'CHF/ha', notes: 'Talzone, 10 t/ha', source: 'Agroscope ZA-BH / AGRIDEA' },
  { enterprise_type: 'Kartoffeln', margin_chf: 7500, yield_unit: 'CHF/ha', notes: 'Speisekartoffeln, Talzone, 40 t/ha, hoher Aufwand', source: 'Agroscope ZA-BH / AGRIDEA' },
  { enterprise_type: 'Zuckerrueben', margin_chf: 4200, yield_unit: 'CHF/ha', notes: 'Talzone, 75 t/ha, Zuckergehalt 17%', source: 'Agroscope ZA-BH / AGRIDEA' },
  { enterprise_type: 'Sonnenblumen', margin_chf: 2100, yield_unit: 'CHF/ha', notes: 'HO-Sonnenblumen, Talzone, 3 t/ha', source: 'Agroscope ZA-BH / AGRIDEA' },
  { enterprise_type: 'Sojabohnen', margin_chf: 2300, yield_unit: 'CHF/ha', notes: 'Speisesoja, Talzone, 3 t/ha', source: 'Agroscope ZA-BH / AGRIDEA' },
  { enterprise_type: 'Kunstwiese', margin_chf: 1500, yield_unit: 'CHF/ha', notes: '3-jaehrig, Talzone, hauptsaechlich Eigenbedarf', source: 'Agroscope ZA-BH / AGRIDEA' },
  { enterprise_type: 'Naturwiese intensiv', margin_chf: 1200, yield_unit: 'CHF/ha', notes: 'Talzone, 3-4 Schnitte', source: 'Agroscope ZA-BH / AGRIDEA' },
  { enterprise_type: 'Extensiv genutzte Wiese', margin_chf: 800, yield_unit: 'CHF/ha', notes: 'BFF QI, 1-2 Schnitte, mit Biodiversitaetsbeitrag', source: 'Agroscope ZA-BH / AGRIDEA' },
  // Tierhaltung (CHF/Tier oder CHF/Platz)
  { enterprise_type: 'Milchkuh', margin_chf: 3000, yield_unit: 'CHF/Kuh', notes: 'Talzone, ~7,000 kg/Kuh, konventionell, inkl. Direktzahlungen (RAUS/BTS)', source: 'Agroscope ZA-BH / AGRIDEA' },
  { enterprise_type: 'Milchkuh Berggebiet', margin_chf: 2200, yield_unit: 'CHF/Kuh', notes: 'Bergzone I-II, ~5,500 kg/Kuh, inkl. Zuschlaege Berggebiet', source: 'Agroscope ZA-BH / AGRIDEA' },
  { enterprise_type: 'Mutterkuh', margin_chf: 1800, yield_unit: 'CHF/Kuh', notes: 'Mit Kalb, extensiv, Talzone/Huegelzone, inkl. GMF-Beitrag', source: 'Agroscope ZA-BH / AGRIDEA' },
  { enterprise_type: 'Mastrind', margin_chf: 600, yield_unit: 'CHF/Tier/Umtrieb', notes: 'Ausmast, ~200 Tage, Nature-Beef oder konventionell', source: 'Agroscope ZA-BH / AGRIDEA' },
  { enterprise_type: 'Mastschwein', margin_chf: 90, yield_unit: 'CHF/Platz', notes: 'Pro Mastplatz/Jahr, ~3 Umtriebe, QM-Schwein, stark marktabhaengig', source: 'Agroscope ZA-BH / AGRIDEA' },
  { enterprise_type: 'Zuchtsau', margin_chf: 700, yield_unit: 'CHF/Sau', notes: 'Inkl. Ferkelaufzucht bis 25 kg, ~24 Ferkel/Sau/Jahr', source: 'Agroscope ZA-BH / AGRIDEA' },
  { enterprise_type: 'Legehenne', margin_chf: 18, yield_unit: 'CHF/Platz', notes: 'Bodenhaltung, ~310 Eier/Jahr, QM-Programm', source: 'Agroscope ZA-BH / AGRIDEA' },
  { enterprise_type: 'Mastpoulet', margin_chf: 4, yield_unit: 'CHF/Platz/Umtrieb', notes: '~7 Umtriebe/Jahr, konventionell', source: 'Agroscope ZA-BH / AGRIDEA' },
  { enterprise_type: 'Milchschaf', margin_chf: 500, yield_unit: 'CHF/Tier', notes: 'Mit Lammaufzucht, Direktvermarktung Kaese', source: 'Agroscope ZA-BH / AGRIDEA' },
  { enterprise_type: 'Mutterziege', margin_chf: 350, yield_unit: 'CHF/Tier', notes: 'Milch- oder Fleischproduktion, Nischenprodukt', source: 'Agroscope ZA-BH / AGRIDEA' },
  // Spezialkulturen
  { enterprise_type: 'Reben', margin_chf: 15000, yield_unit: 'CHF/ha', notes: 'Durchschnitt CH, Keltertrauben, hohe regionale Schwankungen (VS, VD, GE, ZH)', source: 'Agroscope ZA-BH / AGRIDEA' },
  { enterprise_type: 'Obstbau Niederstamm', margin_chf: 12000, yield_unit: 'CHF/ha', notes: 'Aepfel, Tafelqualitaet, integrierte Produktion', source: 'Agroscope ZA-BH / AGRIDEA' },
  { enterprise_type: 'Freilandgemuese', margin_chf: 10000, yield_unit: 'CHF/ha', notes: 'Durchschnitt, stark kulturabhaengig (Salat, Karotten, Zwiebeln)', source: 'Agroscope ZA-BH / AGRIDEA' },
];

const insertGm = db.instance.prepare(
  'INSERT INTO gross_margins (enterprise_type, margin_chf, yield_unit, notes, source, jurisdiction) VALUES (?, ?, ?, ?, ?, ?)'
);
for (const gm of grossMargins) {
  insertGm.run(gm.enterprise_type, gm.margin_chf, gm.yield_unit, gm.notes, gm.source, 'CH');
}
console.log(`Inserted ${grossMargins.length} gross margins`);

// ---------------------------------------------------------------------------
// 6. Financial Guidance — Advisory content on farm economics
// ---------------------------------------------------------------------------

interface FinancialGuidanceEntry {
  topic: string;
  content: string;
  source: string;
}

const financialGuidance: FinancialGuidanceEntry[] = [
  {
    topic: 'AHV/IV/EO Beitraege Selbstaendige',
    content: 'Selbstaendige Landwirte zahlen AHV/IV/EO-Beitraege auf dem Nettoeinkommen aus selbstaendiger Erwerbstaetigkeit. ' +
      'Beitragssatz: 10.6% (AHV 8.7%, IV 1.4%, EO 0.5%) auf Einkommen ab 60,500 CHF. Sinkende Skala fuer tiefere ' +
      'Einkommen (Minimum 5.371% auf 10,100 CHF). Bei Einkommen unter 2,500 CHF: Mindestbeitrag 514 CHF/Jahr. ' +
      'Beitraege werden auf Basis der definitiven Steuerveranlagung berechnet (Nachbelastung moeglich). ' +
      'Fruehzeitige Schaetzung empfohlen, um Liquiditaetsengpaesse zu vermeiden.',
    source: 'AHVG, AHVV, AHV-Beitragsrechner BSV',
  },
  {
    topic: 'Familienzulagen Landwirtschaft (FLG)',
    content: 'Familienzulagen fuer selbstaendige Landwirte (Bundesgesetz ueber die Familienzulagen in der Landwirtschaft, FLG): ' +
      'Kinderzulage 200 CHF/Monat pro Kind (bis 16 Jahre, bis 25 in Ausbildung). Ausbildungszulage 250 CHF/Monat (ab 16 Jahre). ' +
      'Haushaltungszulage 100 CHF/Monat im Berggebiet (BZ I-IV + Soemmerungsgebiet). ' +
      'Anspruchsberechtigung: Selbstaendiger Landwirt mit mindestens 50% landw. Einkommen oder 0.5 SAK. ' +
      'Antrag bei der kantonalen AHV-Ausgleichskasse. Bei Erwerbsunfaehigkeit: Betriebshilfe (FLG Art. 10) — ' +
      'Beitraege an Ersatzarbeitskraft bei Krankheit, Unfall, Militaerdienst, Mutterschaft.',
    source: 'FLG (SR 836.1), FLV (SR 836.11)',
  },
  {
    topic: 'Maschinenkosten',
    content: 'Agroscope veroeffentlicht jaehrlich den Maschinenkostenbericht mit Richtwerten: ' +
      'Traktor 80 PS: ~42 CHF/h (bei 500 h/Jahr), Maehdrescher 250 PS: ~220 CHF/h, Ladewagen: ~18 CHF/h, ' +
      'Pflug 3-Schar: ~28 CHF/h, Kreiselegge 3m: ~32 CHF/h, Saetkombination: ~48 CHF/h. ' +
      'Kosten sinken bei hoeherer Auslastung. Ueberbetrieblicher Einsatz (Maschinenring, Nachbar): ' +
      'Entschaedigung gemaess Agroscope-Ansaetzen. Eigenmechanisierung lohnt sich ab ca. 200 ha offene Ackerflaeche ' +
      'fuer einen Maehdrescher, sonst Lohnunternehmer guenstiger.',
    source: 'Agroscope Maschinenkostenbericht (jaehrlich)',
  },
  {
    topic: 'Arbeitswirtschaft',
    content: 'Richtwerte fuer den Arbeitsbedarf pro Kultur und Tierart (Agroscope/AGRIDEA): ' +
      'Winterweizen: ~12 AKh/ha, Kartoffeln: ~90 AKh/ha, Milchkuh: ~55 AKh/Kuh/Jahr (Laufstall), ' +
      'Mastschwein: ~2.5 AKh/Platz/Jahr, Legehenne: ~0.3 AKh/Platz/Jahr, Reben: ~800 AKh/ha. ' +
      'Eine Standardarbeitskraft (SAK) entspricht ca. 2,800 AKh/Jahr (= 1.0 SAK). ' +
      'Wichtig fuer Betriebsplanung: SAK-Berechnung bestimmt BGBB-Status, DZ-Berechtigung und Arbeitskraeftebedarf.',
    source: 'Agroscope ART, AGRIDEA Betriebsplanung',
  },
  {
    topic: 'Versicherungen Landwirtschaft',
    content: 'Wichtige Versicherungen fuer Schweizer Landwirtschaftsbetriebe: ' +
      '1. Schweizer Hagel: Hagelversicherung (50-80% des Erntewerts), Elementarschaeden (Frost, Ueberschwemmung). ' +
      '2. Tierversicherung: Tod/Notschlachtung von Nutztieren (kantonal unterschiedlich, Tierseuchenkasse). ' +
      '3. Betriebsunterbrechung: Deckung entgangener Ertrag bei laengerer Arbeitsunfaehigkeit. ' +
      '4. Berufshaftpflicht: Schutz bei Schaden durch landwirtschaftliche Taetigkeit. ' +
      '5. Gebaeude: Kantonale Gebaeude- und Feuerversicherung (obligatorisch in den meisten Kantonen). ' +
      '6. Unfallversicherung: Obligatorisch fuer Angestellte (Suva/Privatversicherer), freiwillig fuer Betriebsleiter.',
    source: 'Schweizer Hagel, SBV, kantonale Gebaeudeversicherungen',
  },
  {
    topic: 'Buchhaltung und Kennzahlen',
    content: 'Landwirtschaftliche Buchhaltung (FAT/Agroscope-System): Das landwirtschaftliche Einkommen umfasst ' +
      'Rohleistung minus Sachaufwand minus Abschreibungen minus Schuldzinsen. Wichtige Kennzahlen aus der ZA-BH: ' +
      'Medianes landwirtschaftliches Einkommen (Talregion): ~65,000 CHF/Betrieb (2024). ' +
      'Gesamteinkommen (inkl. ausserlandwirtschaftlich): ~95,000 CHF. ' +
      'Eigenkapitalbildung: ~10,000-15,000 CHF/Jahr. Fremdkapitalanteil: ~40-50% des Aktivkapitals. ' +
      'Cash Flow: Einkommen + Abschreibungen - Privatverbrauch - Steuern. Sollte > 0 fuer Betriebsentwicklung sein.',
    source: 'Agroscope ZA-BH, Agrarbericht BLW',
  },
  {
    topic: 'Betriebsuebergabe Finanzierung',
    content: 'Finanzierung der Betriebsuebergabe: Ertragswert des Betriebs typischerweise 300,000-800,000 CHF ' +
      '(je nach Groesse, Lage, Gebaeude). Finanzierung durch: Eigenkapital (Ersparnisse, Erbvorbezug), ' +
      'Hypothek (landwirtschaftliche Kreditkassen, max. Belehnung ~80% des Ertragswerts), ' +
      'Investitionskredit (zinslos, BLW/Kanton, bis 20 Jahre Laufzeit, bedarfsgeprueft). ' +
      'Tragbarkeit: Jaehrliche Gesamtbelastung (Zinsen + Amortisation + Pachtzins) sollte max. 30-35% ' +
      'des Gesamteinkommens betragen. Starthilfe Junglandwirte: einmaliger Beitrag max. 100,000 CHF ' +
      '(Erstuebernahme, Ausbildung EFZ + hoeherer Abschluss, Alter < 35).',
    source: 'BLW SVV, AGRIDEA Betriebsuebergabe, kantonale Landwirtschaftsaemter',
  },
  {
    topic: 'Lohnrichtlinien Landwirtschaft',
    content: 'SBV-Lohnrichtlinien fuer landwirtschaftliche Arbeitnehmer (2025): ' +
      'Qualifizierter Landwirt (EFZ): 3,850-4,400 CHF/Monat brutto (13. Monatslohn). ' +
      'Betriebsleiter (Meisterabschluss): 4,500-5,500 CHF/Monat. ' +
      'Hilfskraft (ohne Ausbildung): 3,200-3,600 CHF/Monat. ' +
      'Saisonarbeitskraft: 3,000-3,400 CHF/Monat. ' +
      'Naturallohn: Kost und Logis werden angerechnet (ca. 990 CHF/Monat fuer Vollpension + Zimmer). ' +
      'Arbeitszeit: 55 h/Woche Maximum (ArG gilt nicht fuer Landwirtschaft, aber NAV/GAV regeln). ' +
      'Ferien: 4 Wochen (5 Wochen ab 50 Jahre, 5 Wochen bis 20 Jahre).',
    source: 'SBV Lohnrichtlinien, kantonale Normalarbeitsvertraege (NAV)',
  },
  {
    topic: 'Betriebstypologie Schweiz',
    content: 'Betriebstypen nach BLW-Klassifikation: ' +
      'Ackerbau: > 50% Rohleistung aus Pflanzenbau, Schwerpunkt Getreide/Hackfruechte. ' +
      'Milchwirtschaft: > 50% Rohleistung aus Milchproduktion. Groesster Betriebstyp der Schweiz (~20,000 Betriebe). ' +
      'Mutterkuhhaltung: Fleischproduktion ohne Milchlieferung. Wachsend, v.a. Huegelzone/Berggebiet. ' +
      'Kombinierter Rindviehbetrieb: Milch und Fleisch. ' +
      'Schweinehaltung: > 50% aus Schweinezucht/-mast. Konzentration in Talzone (Mittelland). ' +
      'Spezialkulturen: Rebbau, Obstbau, Gemuese. Hohe Wertschoepfung/ha, arbeitsintensiv. ' +
      'Diversifiziert: kein Zweig > 50%. Agrotourismus, Direktvermarktung, Lohnarbeit.',
    source: 'BLW Agrarbericht, Agroscope Betriebstypologie',
  },
  {
    topic: 'Investitionskredite und Starthilfe',
    content: 'Bundesfoerderung gemaess Strukturverbesserungsverordnung (SVV): ' +
      'Investitionskredite: Zinslose Darlehen fuer Bau/Umbau von Oekonomiegebaeuden, Wohnhaus, ' +
      'Alpgebaeuden, Diversifikationsmassnahmen. Laufzeit bis 20 Jahre. Rueckzahlung in gleichen ' +
      'jaehrlichen Raten. Bedingung: Tragbarkeit nachgewiesen, Betrieb viabel (>= 1.0 SAK). ' +
      'Starthilfe Junglandwirte: Einmaliger Beitrag max. 100,000 CHF bei Erstuebernahme eines ' +
      'landwirtschaftlichen Gewerbes. Bedingung: Alter < 35, EFZ Landwirt + hoeherer Abschluss ' +
      '(Betriebsleiter, Meisterlandwirt, FH/Uni). Kann mit Investitionskredit kombiniert werden.',
    source: 'BLW SVV (SR 913.1), kantonale Landwirtschaftsaemter',
  },
  {
    topic: 'Vorsorge und Altersicherung',
    content: 'Vorsorge fuer selbstaendige Landwirte: ' +
      '1. Saeule (AHV): Obligatorisch, Beitraege 10.6%. Altersrente ab 65 (Frauen 64): max. 2,450 CHF/Monat (2025). ' +
      '2. Saeule (BVG): Nicht obligatorisch fuer Selbstaendige. Freiwilliger Anschluss an Vorsorgestiftung moeglich ' +
      '(z.B. Stiftung Auffangeinrichtung, Agrisano). Empfohlen wegen Vorsorgeluecke. ' +
      '3. Saeule (3a): Max. 35,280 CHF/Jahr (2025) fuer Selbstaendige ohne 2. Saeule (7,056 CHF mit 2. Saeule). ' +
      'Steuerlich abzugsfaehig. Auszahlung bei Pensionierung, Selbstaendigkeit, Auswanderung, Eigenheim. ' +
      'Landwirtschaftsspezifisch: Betrieb als Altersvorsorge (Ertragswert vs. Verkehrswert). Bei Hofuebergabe ' +
      'zum Ertragswert entsteht eine Vorsorgeluecke — daher 2. und 3. Saeule wichtig.',
    source: 'AHVG, BVG, Agrisano, kantonale AHV-Ausgleichskassen',
  },
];

const insertFg = db.instance.prepare(
  'INSERT INTO financial_guidance (topic, content, source, jurisdiction) VALUES (?, ?, ?, ?)'
);
for (const fg of financialGuidance) {
  insertFg.run(fg.topic, fg.content, fg.source, 'CH');
}
console.log(`Inserted ${financialGuidance.length} financial guidance entries`);

// ---------------------------------------------------------------------------
// 7. FTS5 Search Index — All content across all tables
// ---------------------------------------------------------------------------

const insertFts = db.instance.prepare(
  'INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, ?)'
);

// SAK factors
for (const s of sakFactors) {
  insertFts.run(
    `SAK-Faktor: ${s.enterprise_type}`,
    `SAK-Faktor ${s.factor_per_unit} ${s.unit} fuer ${s.enterprise_type}. ${s.notes}. Schwellenwert 1.0 SAK fuer landwirtschaftliches Gewerbe (BGBB Art. 5).`,
    'sak',
    'CH'
  );
}

// Business structures
for (const bs of businessStructures) {
  insertFts.run(
    `Rechtsform: ${bs.structure_type}`,
    `${bs.description} Steuerliche Behandlung: ${bs.tax_treatment}`,
    'rechtsform',
    'CH'
  );
}

// Tax rules
for (const t of taxRules) {
  insertFts.run(
    `Steuern: ${t.topic}`,
    `${t.rule}. ${t.description} Rechtsgrundlage: ${t.legal_basis}.`,
    'steuern',
    'CH'
  );
}

// Succession scenarios
for (const s of successionScenarios) {
  insertFts.run(
    `Betriebsuebergabe: ${s.scenario}`,
    `${s.description} Ertragswert: ${s.ertragswert_rule} Steuerfolgen: ${s.tax_implications}`,
    'uebergabe',
    'CH'
  );
}

// Gross margins
for (const gm of grossMargins) {
  insertFts.run(
    `Deckungsbeitrag: ${gm.enterprise_type}`,
    `Deckungsbeitrag ${gm.margin_chf} ${gm.yield_unit} fuer ${gm.enterprise_type}. ${gm.notes}. Quelle: ${gm.source}.`,
    'deckungsbeitrag',
    'CH'
  );
}

// Financial guidance
for (const fg of financialGuidance) {
  insertFts.run(
    fg.topic,
    fg.content,
    'finanzberatung',
    'CH'
  );
}

console.log('Built FTS5 search index');

// ---------------------------------------------------------------------------
// 8. Metadata
// ---------------------------------------------------------------------------

db.run('INSERT OR REPLACE INTO db_metadata (key, value) VALUES (?, ?)', ['last_ingest', now]);
db.run('INSERT OR REPLACE INTO db_metadata (key, value) VALUES (?, ?)', ['build_date', now]);
db.run('INSERT OR REPLACE INTO db_metadata (key, value) VALUES (?, ?)', ['schema_version', '1.0']);
db.run('INSERT OR REPLACE INTO db_metadata (key, value) VALUES (?, ?)', ['mcp_name', 'Switzerland Farm Planning MCP']);
db.run('INSERT OR REPLACE INTO db_metadata (key, value) VALUES (?, ?)', ['jurisdiction', 'CH']);

db.close();

console.log(`\nIngestion complete (${now})`);
console.log(`  SAK factors:            ${sakFactors.length}`);
console.log(`  Business structures:    ${businessStructures.length}`);
console.log(`  Tax rules:              ${taxRules.length}`);
console.log(`  Succession scenarios:   ${successionScenarios.length}`);
console.log(`  Gross margins:          ${grossMargins.length}`);
console.log(`  Financial guidance:     ${financialGuidance.length}`);
console.log(`  FTS index entries:      ${sakFactors.length + businessStructures.length + taxRules.length + successionScenarios.length + grossMargins.length + financialGuidance.length}`);
