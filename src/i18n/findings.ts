import type { Locale } from './config';
import { NUMBER_LOCALE } from './config';
import type { Finding, FindingCode } from '@/lib/risk-engine';

/**
 * Risk-finding translations.
 *
 * The engine writes its findings in English, because the English text is what
 * goes into the audit record and must not depend on who was looking at the
 * screen. The UI translates each finding by its `code` at render time. English
 * is therefore absent here: it is already on the finding.
 *
 * `detail` may be a function of the finding's `params` for the one message
 * that carries a number.
 */
interface FindingText {
  title: string;
  detail: string | ((p: Record<string, string>) => string);
  remediation: string;
  authority?: string;
}

type Table = Record<FindingCode, FindingText>;

const ar: Table = {
  'gov-law-silent': {
    title: 'لم يُحدَّد القانون الواجب التطبيق',
    detail:
      'في غياب اختيار صريح للقانون، يُحدَّد القانون الواجب التطبيق وفق قواعد تنازع القوانين لدى جهة النظر في النزاع، ولا يستطيع أي من الطرفين تقدير هذه النتيجة عند التوقيع.',
    remediation:
      'أدرج بنداً صريحاً للقانون الواجب التطبيق. في التجارة العابرة للحدود، يُعدّ القانون الإنجليزي أو قانون مركز دبي المالي العالمي الخيارين المحايدين المعتادين.',
    authority:
      'لائحة روما الأولى (EC) رقم 593/2008، المادتان 3 و4؛ قانون المعاملات المدنية الإماراتي (القانون الاتحادي رقم 5 لسنة 1985)، المادة 19',
  },
  'forum-silent': {
    title: 'لا توجد آلية لتسوية النزاعات',
    detail:
      'في غياب جهة متفق عليها لتسوية النزاع، يمكن رفع الدعوى في أي دولة يتوافر فيها ضابط اختصاص، مما يفتح الباب لدعاوى متوازية وسباق نحو الحكم.',
    remediation:
      'اعتمد شرط تحكيم محدد المقر، مع النص صراحة على المقر واللغة والقواعد وعدد المحكّمين.',
  },
  'forum-adhoc': {
    title: 'تحكيم حرّ دون دعم مؤسسي',
    detail:
      'يترك التحكيم الحرّ آليات التعيين والردّ والأتعاب للطرفين، ويتعثّر بمجرد توقّف أحدهما عن التعاون.',
    remediation:
      'اعتمد قواعد الأونسيترال مع تسمية سلطة تعيين، أو انتقل إلى شرط تحكيم مؤسسي (LCIA أو ICC أو DIAC).',
  },
  'forum-foreign-courts': {
    title: 'طريق التنفيذ ضد الطرف المقابل غير مُتحقَّق منه',
    detail:
      'يجب الاعتراف بالحكم القضائي في الدولة التي توجد فيها أصول الطرف المقابل. ومع عدم تحديد دولة الطرف المقابل يتعذّر تقييم هذا الطريق، بينما يُنفَّذ حكم التحكيم في أكثر من 170 دولة منضمة إلى اتفاقية نيويورك.',
    remediation: 'حدّد دولة الطرف المقابل، أو انتقل إلى تحكيم يكون مقره في دولة منضمة إلى اتفاقية نيويورك.',
    authority: 'اتفاقية نيويورك لعام 1958، المادة الثالثة',
  },
  'liability-uncapped': {
    title: 'المسؤولية غير محدودة',
    detail:
      'التعرّض غير محدود، وعند هذه القيمة التعاقدية يتعذّر عملياً التأمين عليه ضمن الحدود التي يقبلها المؤمِّنون.',
    remediation:
      'حدّد سقف المسؤولية الإجمالية بما بين 100% و150% من قيمة العقد، مع الاستثناءات المعتادة: الوفاة أو الإصابة الشخصية، والغش، والتعدي على الملكية الفكرية.',
  },
  'liability-excessive': {
    title: 'سقف المسؤولية غير متناسب مع قيمة العقد',
    detail: (p) =>
      `سقف يعادل ${p.multiple} ضعف القيمة يتجاوز النطاق السائد في السوق، ولن يستوعبه غطاء تأمين المسؤولية المهنية المعتاد.`,
    remediation:
      'فاوض لخفض السقف إلى ما بين ضعف وضعفي القيمة، أو احصل على ملحق تأمين خاص للشريحة الزائدة.',
  },
  'payment-over-90': {
    title: 'مدة السداد تتجاوز 90 يوماً',
    detail:
      'تعرّض رأس المال العامل لهذه المدة يحوّل العقد التجاري إلى ائتمان غير مضمون، وقد يخالف تشريعات التأخر في السداد في دولة المشتري.',
    remediation:
      'خفّض المدة إلى 30–60 يوماً، أو سعّر الائتمان صراحة عبر فائدة التأخير مع ضمان.',
  },
  'payment-over-60': {
    title: 'مدة سداد ممتدة',
    detail:
      'المدد التي تتجاوز 60 يوماً تستوجب النص صراحة على سعر فائدة التأخير، حتى لا تُستوعب تكلفة التأخير بصمت.',
    remediation:
      'إذا كان القانون الواجب التطبيق يُجيز الفائدة الاتفاقية، فأضف فائدة بهامش محدد فوق السعر المرجعي المعني. أما في الأنظمة المستندة إلى أحكام الشريعة (كالمملكة العربية السعودية) فلا يُعتدّ بالفائدة، ويلزم اعتماد آلية أخرى للتأخر في السداد.',
  },
  'security-missing': {
    title: 'لا يوجد ضمان للسداد رغم أهمية قيمة العقد',
    detail:
      'تعتمد قيمة العقد بالكامل على الملاءة المالية للطرف المقابل، دون أي أداة يمكن تسييلها عند الإخلال.',
    remediation:
      'اشترط خطاب اعتماد مستندي معزَّزاً وغير قابل للإلغاء، أو خطاب ضمان من بنك ذي تصنيف استثماري.',
    authority: 'UCP 600',
  },
  'force-majeure-missing': {
    title: 'لا يوجد بند للقوة القاهرة',
    detail:
      'في غياب بند صريح، يتوقف الإعفاء على القواعد العامة في القانون الواجب التطبيق (نظرية استحالة التنفيذ (frustration) في القانون الإنجليزي، وأحكام القوة القاهرة والظروف الطارئة في القوانين المدنية كقانوني الكويت والإمارات)، وهي أضيق وأقل قابلية للتوقّع من بند مصاغ.',
    remediation:
      'أضف بند قوة قاهرة يتضمن آلية الإخطار، وواجب التخفيف من الأضرار، وحقاً نهائياً في الإنهاء.',
  },
  'sanctions-missing': {
    title: 'لا يوجد بند للعقوبات وضوابط التجارة',
    detail:
      'التجارة العابرة للحدود دون إقرار بشأن العقوبات أو تعهّد بالفحص أو حق في التعليق تعرّض الطرف لعقوبات قائمة على المسؤولية المطلقة ولتقليص البنوك المراسلة لتعاملاتها معه.',
    remediation:
      'أضف إقرارات وضمانات بشأن العقوبات، وتعهّداً بالفحص المستمر، وحقاً في التعليق أو الإنهاء دون مسؤولية.',
    authority:
      'عقوبات مجلس الأمن الدولي؛ لوائح مكتب مراقبة الأصول الأجنبية الأمريكي OFAC (31 CFR Chapter V)؛ التدابير التقييدية للاتحاد الأوروبي، ومنها اللائحة (EU) رقم 833/2014',
  },
  'termination-convenience': {
    title: 'لا يوجد حق في الإنهاء للملاءمة',
    detail:
      'يقتصر الخروج من العقد على حالات الإخلال والإعسار، مما يُفقد الطرف المرونة إذا تغيّرت الظروف التجارية في غير صالحه.',
    remediation: 'فكّر في حق إنهاء للملاءمة بعد فترة التزام أولية، مقابل رسم إنهاء محدد.',
  },
  'indemnity-missing': {
    title: 'لا يوجد تعويض صريح',
    detail:
      'يقتصر الاسترداد على التعويض عن الإخلال، رهناً بقواعد توقّع الضرر والسببية وواجب التخفيف منه.',
    remediation:
      'أضف تعويضات محددة عن مطالبات الغير المتعلقة بالملكية الفكرية، والجزاءات التنظيمية، والأضرار التي تلحق بالبضائع أو الممتلكات.',
  },
  'insurance-unallocated': {
    title: 'لم تُحدَّد مسؤولية التأمين',
    detail:
      'عند سكوت العقد، يتبع التأمين انتقال المخاطر وفق قاعدة الإنكوترمز المطبَّقة، وهو ما يُساء فهمه كثيراً، فتنشأ فجوة في التغطية أثناء النقل.',
    remediation:
      'حدّد من يتولى التأمين، وبأي قيمة (عادةً 110% من قيمة CIF)، وسمِّ الطرف الآخر مستفيداً من التعويض.',
    authority: 'قواعد إنكوترمز 2020، البندان A5/B5',
  },
  'laytime-undefined': {
    title: 'لم تُحدَّد مدة التحميل والتفريغ',
    detail:
      'في غياب هذه المدة، يصبح موعد بدء احتساب غرامة التأخير غير محدد. وهذا أكثر عيوب صياغة مشارطات الإيجار عرضاً على التحكيم.',
    remediation:
      'حدّد المدة بالساعات المتواصلة، وعرّف إشعار الجاهزية، وبيّن الفترات المستثناة.',
    authority: 'تعريفات مدد التحميل والتفريغ لمشارطات الإيجار 2013',
  },
  'demurrage-undefined': {
    title: 'لم يُحدَّد سعر غرامة التأخير',
    detail:
      'في غياب سعر متفق عليه، لا يُسترد التأخير إلا بوصفه تعويضاً عن الاحتجاز، وهو أصعب إثباتاً وأبطأ استرداداً.',
    remediation:
      'حدّد سعراً يومياً لغرامة التأخير يُستحق بنسبة جزء اليوم، مع مدة سقوط صريحة للمطالبات.',
  },
  'nda-term-short': {
    title: 'مدة السرية قصيرة',
    detail: (p) =>
      `تنتهي الحماية بعد ${p.years} سنة من الإفصاح. والمعلومات التي تحتفظ بقيمتها مدة أطول، كالأسعار وبيانات العملاء والمعرفة الفنية، تصبح خارج نطاق الحماية التعاقدية بانقضاء هذه المدة.`,
    remediation:
      'مدّد المدة إلى سنتين على الأقل وحتى خمس سنوات، وأبقِ الأسرار التجارية محمية ما دامت سرية.',
  },
  'agency-mandatory-law': {
    title: 'قانون الوكالات التجارية في الإقليم قانون آمر',
    detail:
      'تسري قوانين الوكالات التجارية في دول مجلس التعاون أياً كان القانون وجهة النزاع المختاران. وهي تشترط عادةً قيد الوكالة لدى وزارة التجارة، وقد تُرتّب للوكيل حقاً في التعويض إذا أنهى الموكّل الوكالة أو امتنع عن تجديدها دون مبرر.',
    remediation:
      'تحقّق قبل التوقيع من اشتراطات القيد وأحكام الإنهاء والتعويض في الإقليم، واحسب كلفة الخروج على أساسها.',
    authority:
      'القانون الكويتي رقم 13 لسنة 2016 بشأن تنظيم الوكالات التجارية؛ المرسوم بقانون اتحادي إماراتي رقم 3 لسنة 2022 بشأن تنظيم الوكالات التجارية',
  },
  'lease-law-not-situs': {
    title: 'القانون الواجب التطبيق يختلف عن موقع العقار',
    detail:
      'يخضع إيجار العقار لقانون الدولة التي يقع فيها العقار، وتسري تشريعات الإيجار فيها بصفة آمرة. ومن المستبعد إعمال قانون آخر في مسائل كالأجرة والتجديد والإخلاء.',
    remediation: 'اختر قانون الدولة التي يقع فيها العقار المؤجَّر.',
  },
  'lease-arbitration': {
    title: 'قد لا تقبل منازعات الإيجار التحكيم',
    detail:
      'في عدد من دول الخليج تختص المحاكم المحلية أو جهات متخصصة في منازعات الإيجار بنظر هذه المنازعات، فقد لا يُعتدّ بشرط التحكيم في عقد الإيجار بالنسبة للمطالبات الجوهرية بين المؤجر والمستأجر.',
    remediation:
      'أحِل المنازعات إلى المحاكم أو جهة فض منازعات الإيجار المختصة في مكان العقار.',
  },
  'employment-mandatory-law': {
    title: 'قانون العمل في مكان العمل قانون آمر',
    detail:
      'يحدد قانون العمل في مكان العمل حدوداً دنيا لفترة التجربة وساعات العمل والإجازات ومهلة الإخطار ومكافأة نهاية الخدمة. ويقع باطلاً كل شرط أقل فائدة للعامل، أياً كان القانون الذي يختاره العقد.',
    remediation:
      'املأ الملحق رقم (1) (الأجر وفترة التجربة ومهلة الإخطار والإجازات) بما لا يقل عن الحدود الدنيا القانونية في مكان العمل، وتحقّق من أي قيد أو اعتماد مطلوب للعقد.',
    authority:
      'القانون الكويتي رقم 6 لسنة 2010 في شأن العمل في القطاع الأهلي؛ المرسوم بقانون اتحادي إماراتي رقم 33 لسنة 2021 بشأن تنظيم علاقات العمل',
  },
  'employment-arbitration': {
    title: 'منازعات العمل لا تقبل التحكيم في الغالب',
    detail:
      'تسلك منازعات العمل في دول الخليج طريقاً قانونياً محدداً عبر جهة العمل المختصة ثم المحاكم العمالية، ومن المستبعد أن يُلزَم العامل بشرط التحكيم.',
    remediation: 'أحِل المنازعات إلى جهة العمل والمحاكم المختصة في مكان العمل.',
  },
  'mou-binding-risk': {
    title: 'قد تصبح مذكرة التفاهم ملزمة بمضمونها',
    detail:
      'في الأنظمة المدنية ينظر القاضي إلى المضمون لا إلى التسمية، فالمستند الذي يُثبت الاتفاق على المسائل الجوهرية قد يُعدّ عقداً ملزماً وإن سُمّي مذكرة تفاهم.',
    remediation:
      'اجعل الشروط التجارية استرشادية، وانصص صراحةً على خضوعها لاتفاقية نهائية، وتجنّب أي تصرف ينفّذ الصفقة قبل التوقيع.',
  },
  'settlement-enforcement': {
    title: 'اجعل التسوية قابلة للتنفيذ مباشرةً',
    detail:
      'التسوية الخاصة عقد، فإذا أخلّ الطرف الدافع وجب على الآخر رفع دعوى بها. أما إذا كانت هناك دعوى منظورة، فإن إثبات الصلح أمام المحكمة أو هيئة التحكيم قد يمنحه قوة السند التنفيذي.',
    remediation:
      'متى أجازت الإجراءات المحلية ذلك، أثبت الصلح أو صدّق عليه أمام المحكمة أو هيئة التحكيم التي تنظر النزاع، أو أفرغه في حكم تحكيم باتفاق الطرفين.',
  },
  'construction-decennial': {
    title: 'لا يجوز الإعفاء من الضمان العشري أو تحديده',
    detail:
      'يضمن المقاول والمهندس متضامنين مدة عشر سنوات ما يحدث من تهدّم كلي أو جزئي للبناء ومن عيوب تهدد متانته وسلامته، ويقع باطلاً كل اتفاق يُعفي من هذا الضمان أو يحدّ منه. ولا يشمله سقف المسؤولية الوارد في العقد.',
    remediation:
      'احسب كلفة التعرّض لمدة عشر سنوات، وتحقّق من تأمين المسؤولية المهنية للمقاول والمصمّم، وأبقِ الاستثناء قائماً في بند تحديد المسؤولية.',
    authority: 'قانون المعاملات المدنية الإماراتي (القانون الاتحادي رقم 5 لسنة 1985)، المواد 880–882',
  },
  'construction-delay-damages': {
    title: 'قد تعدّل المحكمة غرامة التأخير المتفق عليها',
    detail:
      'تُجيز القوانين المدنية في المنطقة للمحكمة، بناءً على طلب أحد الطرفين، تعديل التعويض المتفق عليه ليساوي الضرر الواقع فعلاً. فالنسبة التي تتجاوز كثيراً الضرر المحتمل قد لا تُنفَّذ كما كُتبت.',
    remediation:
      'حدّد النسبة اليومية والحد الأقصى بناءً على تقدير حقيقي لضرر التأخير، ووثّق أساس هذا التقدير.',
    authority: 'قانون المعاملات المدنية الإماراتي، المادة 390',
  },
  'construction-time-undefined': {
    title: 'لم تُحدَّد مدة الإنجاز',
    detail:
      'في غياب مدة محددة للإنجاز لا تستحق غرامة التأخير، ولا يكون لصاحب العمل تاريخ ثابت يقيس عليه التأخر في التنفيذ.',
    remediation: 'حدّد مدة الإنجاز محسوبةً من تاريخ البدء.',
  },
  'property-registration': {
    title: 'لا تنتقل الملكية إلا بالتسجيل',
    detail:
      'لا تنتقل ملكية العقار إلا بتسجيل البيع لدى إدارة التسجيل العقاري المختصة، وحتى ذلك الحين لا يُرتّب العقد إلا التزامات شخصية، وقد يتقدّم عليه مشترٍ لاحق سجّل قبله أو دائن.',
    remediation:
      'حدّد موعد التسجيل، واحتجز باقي الثمن حتى إتمامه، واستخرج شهادة بالحقوق العينية والحجوزات على العقار قبيل التوقيع مباشرةً.',
    authority: 'القانون الكويتي رقم 5 لسنة 1959 بشأن التسجيل العقاري',
  },
  'property-law-not-situs': {
    title: 'القانون الواجب التطبيق يختلف عن موقع العقار',
    detail:
      'يخضع نقل ملكية العقار لقانون الدولة التي يقع فيها، وهو الذي يحدد إجراءات التسجيل ومن يحق له التملّك.',
    remediation: 'اختر قانون الدولة التي يقع فيها العقار.',
  },
  'property-foreign-ownership': {
    title: 'تحقّق من أهلية المشتري لتملّك العقار',
    detail:
      'تقيّد عدة دول خليجية تملّك الأجانب والشركات ذات المساهمين الأجانب للعقارات، أو تقصره على مناطق محددة.',
    remediation:
      'تحقّق من أهلية المشتري واستخرج أي موافقة لازمة قبل دفع العربون، واجعل البيع معلّقاً على صدورها.',
    authority: 'القانون الكويتي رقم 74 لسنة 1979 بتنظيم تملّك غير الكويتيين للعقارات',
  },
};

const fr: Table = {
  'gov-law-silent': {
    title: 'Aucun droit applicable choisi',
    detail:
      "À défaut de choix exprès, la loi applicable est déterminée par les règles de conflit du for saisi. Aucune des parties ne peut évaluer cette issue au moment de la signature.",
    remediation:
      'Insérez une clause expresse de droit applicable. Pour le commerce international, le droit anglais ou le droit du DIFC sont les choix neutres usuels.',
    authority:
      'Règlement (CE) n° 593/2008 (Rome I), art. 3 et 4 ; Code des transactions civiles des Émirats (loi fédérale n° 5 de 1985), art. 19',
  },
  'forum-silent': {
    title: 'Aucun mode de règlement des différends',
    detail:
      "Faute de for convenu, une action peut être engagée dans toute juridiction présentant un lien de rattachement, ce qui favorise les procédures parallèles et la course au jugement.",
    remediation:
      "Adoptez une clause compromissoire précisant expressément le siège, la langue, le règlement et le nombre d'arbitres.",
  },
  'forum-adhoc': {
    title: 'Arbitrage ad hoc sans soutien institutionnel',
    detail:
      "L'arbitrage ad hoc laisse aux parties la nomination, la récusation et les honoraires. Il se bloque dès qu'une partie cesse de coopérer.",
    remediation:
      "Adoptez le Règlement de la CNUDCI avec une autorité de nomination désignée, ou optez pour une clause institutionnelle (LCIA, CCI, DIAC).",
  },
  'forum-foreign-courts': {
    title: "Voie d'exécution contre le cocontractant non vérifiée",
    detail:
      "Un jugement doit être reconnu dans l'État où se situent les actifs du cocontractant. La juridiction du cocontractant n'étant pas précisée, cette voie ne peut être évaluée, alors qu'une sentence arbitrale est exécutoire dans plus de 170 États parties à la Convention de New York.",
    remediation:
      "Précisez la juridiction du cocontractant, ou optez pour un arbitrage siégeant dans un État partie à la Convention de New York.",
    authority: 'Convention de New York de 1958, art. III',
  },
  'liability-uncapped': {
    title: 'Responsabilité illimitée',
    detail:
      "L'exposition est illimitée et, à cette valeur contractuelle, pratiquement inassurable aux plafonds que les assureurs acceptent de couvrir.",
    remediation:
      'Plafonnez la responsabilité globale entre 100 et 150 % de la valeur du contrat, avec les exclusions usuelles : décès ou dommage corporel, fraude et contrefaçon.',
  },
  'liability-excessive': {
    title: 'Plafond de responsabilité disproportionné',
    detail: (p) =>
      `Un plafond de ${p.multiple} fois la valeur dépasse la fourchette de marché et n'entre pas dans un programme standard d'assurance responsabilité civile professionnelle.`,
    remediation:
      "Négociez un plafond de 1 à 2 fois la valeur, ou obtenez un avenant d'assurance spécifique pour la tranche excédentaire.",
  },
  'payment-over-90': {
    title: 'Délai de paiement supérieur à 90 jours',
    detail:
      "Une exposition du fonds de roulement de cette durée transforme un contrat commercial en crédit non garanti et peut enfreindre la réglementation sur les retards de paiement dans le pays de l'acheteur.",
    remediation:
      'Ramenez le délai à 30–60 jours, ou valorisez explicitement le crédit par des intérêts de retard assortis d’une sûreté.',
  },
  'payment-over-60': {
    title: 'Délai de paiement étendu',
    detail:
      "Au-delà de 60 jours, un taux d'intérêt de retard exprès s'impose pour que le coût du retard ne soit pas absorbé silencieusement.",
    remediation:
      "Si le droit applicable admet l'intérêt conventionnel, prévoyez des intérêts à une marge déterminée au-dessus du taux de référence pertinent. Dans les systèmes fondés sur la charia (p. ex. l'Arabie saoudite), l'intérêt est inopposable ; prévoyez un autre mécanisme de retard de paiement.",
  },
  'security-missing': {
    title: 'Aucune garantie de paiement pour un contrat significatif',
    detail:
      "La totalité de la valeur du contrat repose sur le bilan du cocontractant, sans instrument mobilisable en cas de défaillance.",
    remediation:
      'Exigez un crédit documentaire irrévocable et confirmé, ou une garantie bancaire émise par une banque de catégorie investissement.',
    authority: 'RUU 600',
  },
  'force-majeure-missing': {
    title: 'Aucune clause de force majeure',
    detail:
      "À défaut de clause expresse, l'exonération dépend des règles supplétives du droit applicable (frustration en droit anglais ; force majeure et imprévision légales dans les systèmes civilistes tels que le Koweït et les Émirats), plus étroites et moins prévisibles qu'une clause rédigée.",
    remediation:
      "Ajoutez une clause de force majeure prévoyant les modalités de notification, une obligation d'atténuation et un droit de résiliation à terme.",
  },
  'sanctions-missing': {
    title: 'Aucune clause de sanctions ni de contrôle des échanges',
    detail:
      "Un commerce international sans déclaration relative aux sanctions, sans engagement de filtrage et sans droit de suspension expose la partie à des pénalités de responsabilité objective et au désengagement des banques correspondantes.",
    remediation:
      "Ajoutez des déclarations et garanties relatives aux sanctions, un engagement de filtrage continu et un droit de suspendre ou de résilier sans responsabilité.",
    authority:
      "Sanctions du Conseil de sécurité de l'ONU ; réglementation OFAC (31 CFR Chapter V) ; mesures restrictives de l'UE, p. ex. règlement (UE) n° 833/2014",
  },
  'termination-convenience': {
    title: 'Aucune résiliation pour convenance',
    detail:
      "La sortie est limitée aux cas de manquement et d'insolvabilité, ce qui prive la partie de souplesse si les conditions commerciales évoluent en sa défaveur.",
    remediation:
      "Envisagez un droit de résiliation pour convenance après une période d'engagement initiale, moyennant une indemnité de rupture définie.",
  },
  'indemnity-missing': {
    title: 'Aucune garantie d’indemnisation expresse',
    detail:
      "La réparation est limitée aux dommages-intérêts pour inexécution, sous réserve de la prévisibilité, du lien de causalité et de l'obligation de minimiser le dommage.",
    remediation:
      'Ajoutez des garanties ciblées pour les réclamations de tiers en propriété intellectuelle, les sanctions réglementaires et les dommages aux marchandises ou aux biens.',
  },
  'insurance-unallocated': {
    title: "Responsabilité d'assurance non répartie",
    detail:
      "Lorsque le contrat est muet, la couverture suit le transfert des risques selon l'Incoterm applicable, souvent mal interprété, laissant une lacune pendant le transport.",
    remediation:
      "Précisez qui assure, pour quelle valeur (usuellement 110 % de la valeur CIF), et désignez l'autre partie comme bénéficiaire.",
    authority: 'Incoterms 2020, A5/B5',
  },
  'laytime-undefined': {
    title: 'Staries non définies',
    detail:
      "Sans staries, le point de départ des surestaries est indéterminé. C'est le défaut de rédaction de charte-partie le plus fréquemment soumis à l'arbitrage.",
    remediation:
      "Fixez les staries en heures consécutives, définissez l'avis de disponibilité et précisez les périodes exceptées.",
    authority: 'Laytime Definitions for Charter Parties 2013',
  },
  'demurrage-undefined': {
    title: 'Taux de surestaries non précisé',
    detail:
      "Sans taux convenu, le retard n'est indemnisable qu'au titre de dommages-intérêts pour immobilisation, plus difficiles à prouver et plus lents à recouvrer.",
    remediation:
      'Fixez un taux journalier de surestaries, dû au prorata, assorti d’un délai de forclusion exprès pour les réclamations.',
  },
  'nda-term-short': {
    title: 'Durée de confidentialité courte',
    detail: (p) =>
      `La protection prend fin ${p.years} an(s) après la divulgation. Les informations qui conservent leur valeur plus longtemps, comme les prix, les données clients ou le savoir-faire, cessent d'être protégées contractuellement à l'expiration de ce délai.`,
    remediation:
      "Portez la durée à au moins 2 à 5 ans et maintenez la protection des secrets d'affaires tant qu'ils restent secrets.",
  },
  'agency-mandatory-law': {
    title: "Le droit des agences commerciales du territoire est impératif",
    detail:
      "Les lois des États du Golfe sur les agences commerciales s'appliquent quels que soient le droit et le for choisis. Elles imposent généralement l'enregistrement de l'agence auprès du ministère du Commerce et peuvent ouvrir droit à indemnité pour l'agent lorsque le mandant résilie ou refuse de renouveler sans motif légitime.",
    remediation:
      "Vérifiez avant signature les exigences d'enregistrement et les règles de résiliation et d'indemnisation du territoire, et chiffrez la sortie en conséquence.",
    authority:
      'Loi koweïtienne n° 13 de 2016 sur les agences commerciales ; décret-loi fédéral émirien n° 3 de 2022 sur les agences commerciales',
  },
  'lease-law-not-situs': {
    title: 'Droit applicable différent du lieu de situation des locaux',
    detail:
      "Le bail d'un immeuble est régi par la loi du lieu de situation de l'immeuble, dont la législation locative s'applique de manière impérative. Un autre droit a peu de chances d'être appliqué sur des questions comme le loyer, le renouvellement et l'expulsion.",
    remediation: 'Choisissez le droit du pays où se situent les locaux.',
  },
  'lease-arbitration': {
    title: "Les litiges locatifs peuvent ne pas être arbitrables",
    detail:
      "Dans plusieurs États du Golfe, les litiges locatifs relèvent des juridictions locales ou d'organes spécialisés en matière de baux ; une clause compromissoire dans un bail peut donc être inopposable pour les principales demandes entre bailleur et preneur.",
    remediation:
      'Soumettez les litiges aux juridictions ou à l’autorité locative compétentes du lieu de situation des locaux.',
  },
  'employment-mandatory-law': {
    title: 'Le droit du travail du lieu de travail est impératif',
    detail:
      "La période d'essai, la durée du travail, les congés, le préavis et l'indemnité de fin de service sont fixés à titre de minimums par le droit du travail du lieu de travail. Toute stipulation moins favorable au salarié est nulle, quel que soit le droit choisi par le contrat.",
    remediation:
      "Complétez l'Annexe 1 (salaire, période d'essai, préavis, congés) à un niveau au moins égal aux minimums légaux du lieu de travail et vérifiez toute formalité d'enregistrement ou d'approbation du contrat.",
    authority:
      'Loi koweïtienne n° 6 de 2010 sur le travail dans le secteur privé ; décret-loi fédéral émirien n° 33 de 2021 sur les relations de travail',
  },
  'employment-arbitration': {
    title: "Les litiges du travail ne sont généralement pas arbitrables",
    detail:
      "Dans les États du Golfe, les litiges du travail suivent une procédure légale devant l'autorité du travail puis les juridictions sociales. Une clause compromissoire a peu de chances d'être opposable au salarié.",
    remediation:
      "Soumettez les litiges à l'autorité du travail et aux juridictions compétentes du lieu de travail.",
  },
  'mou-binding-risk': {
    title: "Un protocole d'accord peut devenir obligatoire par son contenu",
    detail:
      "Dans les systèmes civilistes, le juge s'attache au contenu et non à l'intitulé : un document constatant l'accord sur les éléments essentiels peut être qualifié de contrat obligatoire, même intitulé protocole.",
    remediation:
      "Gardez les conditions commerciales indicatives, précisez expressément qu'elles sont subordonnées à un accord définitif et évitez tout acte d'exécution de l'opération avant la signature.",
  },
  'settlement-enforcement': {
    title: 'Rendez la transaction directement exécutoire',
    detail:
      "Une transaction privée est un contrat : si la partie débitrice fait défaut, l'autre doit agir en justice sur son fondement. Lorsqu'une procédure est pendante, faire constater la transaction par la juridiction ou le tribunal arbitral peut lui conférer force exécutoire.",
    remediation:
      "Lorsque la procédure locale le permet, faites constater ou homologuer la transaction par la juridiction ou le tribunal arbitral saisi, ou consignez-la dans une sentence d'accord parties.",
  },
  'construction-decennial': {
    title: 'La responsabilité décennale ne peut être exclue ni plafonnée',
    detail:
      "L'entrepreneur et le concepteur sont solidairement responsables pendant dix ans de l'effondrement de l'ouvrage et des vices menaçant sa solidité, et toute convention excluant ou limitant cette responsabilité est nulle. Le plafond de responsabilité du contrat ne s'y applique pas.",
    remediation:
      "Chiffrez l'exposition décennale, vérifiez l'assurance de responsabilité professionnelle de l'entrepreneur et du concepteur, et conservez l'exclusion dans la clause de limitation.",
    authority: 'Code des transactions civiles des Émirats (loi fédérale n° 5 de 1985), art. 880 à 882',
  },
  'construction-delay-damages': {
    title: 'Les pénalités de retard peuvent être ajustées par le juge',
    detail:
      "Les codes civils de la région permettent au juge, sur demande, d'ajuster l'indemnité convenue au préjudice réellement subi. Un taux très supérieur à la perte probable peut ne pas être appliqué tel quel.",
    remediation:
      'Fixez le taux journalier et le plafond sur la base d’une estimation sincère du préjudice de retard, et conservez la justification de cette estimation.',
    authority: 'Code des transactions civiles des Émirats, art. 390',
  },
  'construction-time-undefined': {
    title: "Délai d'exécution non précisé",
    detail:
      "Sans délai d'exécution, les pénalités de retard ne peuvent courir et le maître d'ouvrage ne dispose d'aucune date de référence pour mesurer le retard.",
    remediation: "Fixez le délai d'exécution à compter de la date de démarrage.",
  },
  'property-registration': {
    title: "La propriété n'est transférée qu'à l'inscription",
    detail:
      "La propriété d'un immeuble n'est transférée qu'à l'inscription de la vente auprès du service foncier compétent. Jusque-là, le contrat ne crée que des obligations personnelles, et un acquéreur ou créancier inscrit ultérieurement peut primer.",
    remediation:
      "Fixez la date d'inscription, conservez le solde du prix jusqu'à celle-ci et consultez le registre (hypothèques, saisies) immédiatement avant la signature.",
    authority: "Loi koweïtienne n° 5 de 1959 sur l'inscription foncière",
  },
  'property-law-not-situs': {
    title: "Droit applicable différent du lieu de situation de l'immeuble",
    detail:
      "Le transfert de propriété d'un immeuble est régi par la loi du lieu de sa situation, qui fixe également les formalités d'inscription et les conditions pour en être propriétaire.",
    remediation: "Choisissez le droit du pays où se situe l'immeuble.",
  },
  'property-foreign-ownership': {
    title: "Vérifiez que l'acquéreur peut être propriétaire",
    detail:
      "Plusieurs États du Golfe restreignent l'acquisition d'immeubles par des étrangers et par des sociétés à actionnariat étranger, ou la limitent à certaines zones.",
    remediation:
      "Vérifiez l'éligibilité de l'acquéreur et obtenez toute autorisation requise avant le versement de l'acompte, en faisant de celle-ci une condition de la vente.",
    authority: 'Loi koweïtienne n° 74 de 1979 sur la propriété immobilière des non-Koweïtiens',
  },
};

const TABLES: Partial<Record<Locale, Table>> = { ar, fr };

/** Returns the finding's user-facing text in `locale`; English passes through. */
export function localiseFinding(f: Finding, locale: Locale): Finding {
  const table = TABLES[locale];
  const entry = table?.[f.code];
  if (!entry) return f;

  const fmt = new Intl.NumberFormat(NUMBER_LOCALE[locale], { maximumFractionDigits: 2 });
  const params = Object.fromEntries(
    Object.entries(f.params ?? {}).map(([k, v]) => [k, fmt.format(v)]),
  );

  return {
    ...f,
    title: entry.title,
    detail: typeof entry.detail === 'function' ? entry.detail(params) : entry.detail,
    remediation: entry.remediation,
    authority: entry.authority ?? f.authority,
  };
}
