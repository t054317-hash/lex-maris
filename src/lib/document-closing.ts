/**
 * The end of every instrument: the schedules its clauses refer to, and the
 * signature blocks. Without them a draft is not a complete contract -- the
 * clauses say "as stated in Schedule 1", so Schedule 1 has to exist on the
 * page, with room to fill it in.
 */

import type { Locale } from '@/i18n/config';
import type { ContractType } from './risk-engine';

type Tri = readonly [en: string, ar: string, fr: string];

const IDX: Record<Locale, 0 | 1 | 2> = { en: 0, ar: 1, fr: 2 };

/** Schedule titles each category's clauses actually refer to, in order. */
const SCHEDULES: Record<ContractType, readonly Tri[]> = {
  supply: [
    ['Schedule 1 — Definitions and commercial particulars', 'الملحق رقم (1) — التعريفات والبيانات التجارية', 'Annexe 1 — Définitions et conditions particulières'],
    ['Schedule 2 — Description of the goods', 'الملحق رقم (2) — وصف البضائع', 'Annexe 2 — Description des marchandises'],
    ['Schedule 3 — Break fee (if termination for convenience applies)', 'الملحق رقم (3) — رسم الإنهاء (في حال الإنهاء للملاءمة)', 'Annexe 3 — Indemnité de résiliation (en cas de résiliation pour convenance)'],
  ],
  distribution: [
    ['Schedule 1 — Definitions, territory and commercial particulars', 'الملحق رقم (1) — التعريفات والإقليم والبيانات التجارية', 'Annexe 1 — Définitions, territoire et conditions particulières'],
    ['Schedule 2 — Products', 'الملحق رقم (2) — المنتجات', 'Annexe 2 — Produits'],
    ['Schedule 3 — Break fee (if termination for convenience applies)', 'الملحق رقم (3) — رسم الإنهاء (في حال الإنهاء للملاءمة)', 'Annexe 3 — Indemnité de résiliation (en cas de résiliation pour convenance)'],
  ],
  charterparty: [
    ['Schedule 1 — Definitions and commercial particulars', 'الملحق رقم (1) — التعريفات والبيانات التجارية', 'Annexe 1 — Définitions et conditions particulières'],
    ['Schedule 2 — Vessel, cargo, loading and discharge ports', 'الملحق رقم (2) — السفينة والبضاعة وميناءا التحميل والتفريغ', 'Annexe 2 — Navire, cargaison, ports de chargement et de déchargement'],
    ['Schedule 3 — Break fee (if termination for convenience applies)', 'الملحق رقم (3) — رسم الإنهاء (في حال الإنهاء للملاءمة)', 'Annexe 3 — Indemnité de résiliation (en cas de résiliation pour convenance)'],
  ],
  'bill-of-lading': [
    ['Schedule 1 — Definitions and particulars', 'الملحق رقم (1) — التعريفات والبيانات', 'Annexe 1 — Définitions et conditions particulières'],
    ['Schedule 2 — Cargo and voyage', 'الملحق رقم (2) — البضاعة والرحلة', 'Annexe 2 — Cargaison et voyage'],
  ],
  shareholders: [
    ['Schedule 1 — Definitions and particulars', 'الملحق رقم (1) — التعريفات والبيانات', 'Annexe 1 — Définitions et conditions particulières'],
  ],
  jv: [
    ['Schedule 1 — Definitions and particulars', 'الملحق رقم (1) — التعريفات والبيانات', 'Annexe 1 — Définitions et conditions particulières'],
  ],
  nda: [],
  services: [
    ['Schedule 1 — Definitions and particulars', 'الملحق رقم (1) — التعريفات والبيانات', 'Annexe 1 — Définitions et conditions particulières'],
    ['Schedule 2 — Services, deliverables and timetable', 'الملحق رقم (2) — الخدمات والمخرجات والجدول الزمني', 'Annexe 2 — Prestations, livrables et calendrier'],
    ['Schedule 3 — Break fee (if termination for convenience applies)', 'الملحق رقم (3) — رسم الإنهاء (في حال الإنهاء للملاءمة)', 'Annexe 3 — Indemnité de résiliation (en cas de résiliation pour convenance)'],
  ],
  agency: [
    ['Schedule 1 — Definitions, territory and basis of appointment', 'الملحق رقم (1) — التعريفات والإقليم وأساس التعيين', 'Annexe 1 — Définitions, territoire et nature de la désignation'],
    ['Schedule 2 — Products', 'الملحق رقم (2) — المنتجات', 'Annexe 2 — Produits'],
  ],
  lease: [
    ['Schedule 1 — Definitions, commencement date, rent instalments, deposit and permitted use', 'الملحق رقم (1) — التعريفات وتاريخ البدء وأقساط الأجرة ومبلغ التأمين والغرض المسموح به', "Annexe 1 — Définitions, date de prise d'effet, échéances du loyer, dépôt de garantie et destination"],
    ['Schedule 2 — Description of the premises', 'الملحق رقم (2) — وصف العين المؤجَّرة', 'Annexe 2 — Description des locaux'],
  ],
  licence: [
    ['Schedule 1 — Definitions, users, territory and payment', 'الملحق رقم (1) — التعريفات والمستخدمون والإقليم والدفع', 'Annexe 1 — Définitions, utilisateurs, territoire et paiement'],
    ['Schedule 2 — The software', 'الملحق رقم (2) — البرنامج', 'Annexe 2 — Le logiciel'],
    ['Schedule 3 — Maintenance and support', 'الملحق رقم (3) — الصيانة والدعم', 'Annexe 3 — Maintenance et assistance'],
  ],
  employment: [
    ['Schedule 1 — Position, place of work, commencement, salary and allowances, probation, working hours, leave and notice', 'الملحق رقم (1) — الوظيفة ومكان العمل وتاريخ المباشرة والأجر والبدلات وفترة التجربة وساعات العمل والإجازات ومهلة الإخطار', "Annexe 1 — Fonctions, lieu de travail, date d'entrée, salaire et indemnités, période d'essai, horaires, congés et préavis"],
  ],
  mou: [
    ['Schedule 1 — Expiry date', 'الملحق رقم (1) — تاريخ الانتهاء', "Annexe 1 — Date d'expiration"],
    ['Schedule 2 — The proposed transaction', 'الملحق رقم (2) — الصفقة المقترحة', "Annexe 2 — L'opération envisagée"],
  ],
  settlement: [
    ['Schedule 1 — Paying party, settlement sum, payment period and costs', 'الملحق رقم (1) — الطرف الدافع ومبلغ التسوية ومدة السداد والمصروفات', 'Annexe 1 — Partie débitrice, somme transactionnelle, délai de paiement et frais'],
    ['Schedule 2 — The dispute', 'الملحق رقم (2) — النزاع', 'Annexe 2 — Le différend'],
  ],
  construction: [
    ['Schedule 1 — Definitions, commencement, engineer, retention, delay damages, performance bond, permits and insurance', 'الملحق رقم (1) — التعريفات وتاريخ البدء والمهندس والمحتجزات وغرامة التأخير وكفالة حسن التنفيذ والتراخيص والتأمين', "Annexe 1 — Définitions, démarrage, ingénieur, retenue, pénalités, garantie de bonne exécution, autorisations et assurances"],
    ['Schedule 2 — Drawings, specifications and bills of quantities', 'الملحق رقم (2) — المخططات والمواصفات وجداول الكميات', 'Annexe 2 — Plans, spécifications et devis quantitatif'],
  ],
  'property-sale': [
    ['Schedule 1 — Definitions, deposit, transfer date, disclosed encumbrances and fees', 'الملحق رقم (1) — التعريفات والعربون وموعد نقل الملكية والحقوق المُفصح عنها والرسوم', "Annexe 1 — Définitions, acompte, date de transfert, charges déclarées et frais"],
    ['Schedule 2 — Description of the property (title deed, area, boundaries)', 'الملحق رقم (2) — وصف العقار (وثيقة الملكية والمساحة والحدود)', "Annexe 2 — Description de l'immeuble (titre, superficie, limites)"],
  ],
};

const SIGN = {
  heading: ['Signatures', 'التوقيعات', 'Signatures'] as Tri,
  intro: [
    'IN WITNESS WHEREOF the parties have signed this Agreement on the date stated at its head, in two originals, one for each party.',
    'وإثباتاً لما تقدّم، وقّع الطرفان هذه الاتفاقية في التاريخ المبيّن في صدرها، من نسختين أصليتين، بيد كل طرف نسخة.',
    'EN FOI DE QUOI les parties ont signé le présent Contrat à la date indiquée en tête, en deux exemplaires originaux, un pour chaque partie.',
  ] as Tri,
  firstParty: ['First Party', 'الطرف الأول', 'Premier Contractant'] as Tri,
  secondParty: ['Second Party', 'الطرف الثاني', 'Second Contractant'] as Tri,
  company: [
    ['Name of signatory', 'اسم المفوَّض بالتوقيع', 'Nom du signataire'],
    ['Title / capacity', 'الصفة', 'Qualité'],
    ['Signature', 'التوقيع', 'Signature'],
    ['Company stamp', 'ختم الشركة', 'Cachet de la société'],
  ] as readonly Tri[],
  person: [
    ['Name', 'الاسم', 'Nom'],
    ['Signature', 'التوقيع', 'Signature'],
  ] as readonly Tri[],
};

export interface Closing {
  schedules: string[];
  signatures: {
    heading: string;
    intro: string;
    blocks: Array<{ role: string; name: string; fields: string[] }>;
  };
}

export function closingFor(
  type: ContractType,
  locale: Locale,
  parties: { firstName: string; secondName: string; firstIndividual: boolean; secondIndividual: boolean },
): Closing {
  const i = IDX[locale];
  const fields = (individual: boolean) => (individual ? SIGN.person : SIGN.company).map((f) => f[i]);
  return {
    schedules: SCHEDULES[type].map((s) => s[i]),
    signatures: {
      heading: SIGN.heading[i],
      intro: SIGN.intro[i],
      blocks: [
        { role: SIGN.firstParty[i], name: parties.firstName, fields: fields(parties.firstIndividual) },
        { role: SIGN.secondParty[i], name: parties.secondName, fields: fields(parties.secondIndividual) },
      ],
    },
  };
}
