/* topics.js — every shipped question sits on exactly ONE focus row, and every row is one of HER numbered criteria
 * ("Continuous Tests and Exam Focus Points", Science 2 Detailed Content.docx — Module 1: Cardiovascular 1-15 (5 split into 5.1-5.3),
 * Respiratory 1-17, Lymphatic 1-4). Where her quizzes ask something her criteria never name, the row says so ('fluid-balance').
 *
 * HOW. Ordered rules over the stem + the CORRECT answer + matching pairs + blank keys + her model answer (never the distractors:
 * they drag a question onto the wrong row). The FIRST rule that matches wins, so specific rows come before general ones.
 * Rules only PROPOSE; every group was read by eye (21 Sep 2026) and misfits moved with PIN, by question id.
 * The build applies this file, counts each row itself (n · all · pts · qz · saq) and FAILS if a shipped question has no row.
 */
const BREATH = '(respirat|breath|ventilat|inspirat|expirat|inhal|exhal|lungs?\\b|diaphragm)';
export const RULES = [
  /* ── Lymphatic: its words are unambiguous ── */
  ['lymph-terms',    /bubo|lymphoede?ma|lymphangitis|hodgkin|splenectomy|tonsillitis|sentine?al node|swollen glands|ruptured spleen|elephantiasis|lymphoma|mesenteric adenitis|conditions and their descriptions/i],
  ['lymph-cvs',      /lymph .{0,60}(drain|return|subclavian|venous|flows?)|thoracic duct|right lymphatic duct|cisterna chyli|lymphatic capillar|lacteal/i],
  ['lymph-anatomy',  /lymph node|spleen|thymus|tonsil|peyer|\bMALT\b|lymphoid|germinal cent|lymphatic (vessel|trunk|organ)/i],

  /* ── Cardiovascular rows whose words cannot be mistaken ── */
  ['cvs-shock',      /\bshock\b|hypovola?emi|anaphyla|septic|cardiogenic|neurogenic/i],
  ['cvs-bp-control', /baroreceptor|barorecept|vasomotor|cardio-?acceler|cardio-?inhib|renin|angiotensin|aldosterone|juxtaglomerul|\bACE inhibitor|renal control|(control|regulat|homeosta\w*) of (blood pressure|BP)|blood pressure .{0,30}(control|regulat)|supine .{0,80}blood pressure|drop in blood pressure/i],
  ['cvs-sounds',     /heart sound|\blub\b|\bdub\b|murmur|auscult|stethoscope|phono-?cardiogram/i],
  ['cvs-conduction', /\bSA node|sinoatrial|sino-atrial|\bAV node|atrioventricular node|bundle of his|purkinje|pacemaker of the heart|intrinsic conduction|conduction system|electrical impulses?|electrogen|autorhythm|\bECG\b|\bEKG\b|electrocardio|p wave|qrs|t wave|depolari|repolari|cardiac cycle|isovolum|ventricular (systole|diastole)|atrial (systole|diastole)|refractory|fibrillation|arrhythmi|asystole/i],
  ['cvs-co-factors', /(age|gender|sex|temperature|fitness|body size|athlete).{0,60}(heart rate|stroke volume|cardiac output)|(heart rate|stroke volume|cardiac output).{0,60}(age|gender|temperature|fitness|athlete)/i],
  ['cvs-cardiac-factors', /venous return|plasma electrolytes|potassium|calcium|hyperkala|hypokala|hypercalc|hypocalc|skeletal muscle pump|respiratory pump/i],
  ['cvs-co-control', /cardiac output|stroke volume|heart rate|starling|preload|afterload|contractility|inotrop|chronotrop|cardiac reserve|ejection fraction|end-?diastolic|end-?systolic/i],

  /* ── Respiratory: chemistry and control before anatomy ── */
  ['resp-co2-transport', /carbon di-?o?xi?de .{0,60}(transport|carried)|bicarbonate in the plasma|carbonic (acid|anhydrase)|chloride shift|carbamino/i],
  ['resp-o2-transport',  /oxy-?ha?emoglobin|ha?emoglobin|saturat|dissociation curve|bohr|2,3-?BPG|oxygen .{0,40}(transport|carried|bound|unload|upload)|carbon monoxide|heme groups/i],
  ['resp-chemical',  /chemorecept|carotid bod|aortic bod|pco ?2|po ?2|blood pH|\bpH\b|hypercapni|hypocapni|acidosis|alkalosis|acidotic|alkalotic|acid.base/i],
  ['resp-rhythm',    new RegExp(BREATH + '.{0,120}(medull|pons|pontine)|(medull|pons|pontine).{0,120}' + BREATH + '|dorsal respiratory|ventral respiratory|respiratory cent|pneumotaxic|apneustic|hering-?breuer|inflation reflex|phrenic|eupno', 'i')],
  ['resp-conscious', new RegExp('(emotion|hypothalam|cortical|cortex|voluntar|hold (your|his|her|one\'s)? ?breath).{0,80}' + BREATH + '|' + BREATH + '.{0,80}(emotion|hypothalam|cortical|voluntar)', 'i')],
  ['resp-exercise',  /cough|sneez|carina|trachealis|accessory muscles|forced breathing|irritat\w* .{0,30}(air|passage|airway)|(exercis|body temperature|\bpain\b).{0,80}(breath|ventilat|respirat)/i],
  ['resp-volumes',   /tidal volume|vital capacity|residual volume|reserve volume|total lung capacity|inspiratory capacity|functional residual|spirometr|lung volumes?|dead space|minute ventilation|alveolar ventilation/i],
  ['resp-air-composition', /atmospheric air|alveolar air|composition of (the )?air|humidif/i],
  ['resp-external',  /external respiration|pulmonary gas exchange|gas exchange .{0,40}(lung|alveol)|ventilation.?perfusion/i],
  ['resp-internal',  /internal respiration|(tissue|systemic) gas exchange|gas exchange .{0,40}(tissue|cells)/i],
  ['resp-ventilation', /boyle|henry'?s law|dalton|intrapleural|intrapulmonary|pleural pressure|negative pressure|positive pressure|inspiration|expiration|inhal|exhal|diaphragm|intercostal|compliance|airway resistance|surface tension|pneumothorax|atelectasis|atmospheric pressure|pulmonary ventilation/i],
  ['resp-alveoli',   /alveol|respiratory membrane|surfactant|pneumocyte|penumocyte|dust cell/i],
  ['resp-zones',     /conducting zone|conduction zone|respiratory zone|upper respiratory|lower respiratory|respiratory bronchiole|terminal bronchiole/i],
  ['resp-airpath',   /pathway of air|air passes|mucociliary|cilia|mucus|goblet|nasal hair|vocal (cord|fold)|sound production|speech|glottis|epiglottis|swallow|chok/i],
  ['resp-terms',     /asthma|bronchitis|emphysema|tuberculosis|\bTB\b|\bCOPD\b|dyspno|apno|tachypno|hyperventil|hypoventil|hypoxi|bronchodilat|cyanos|pneumonia|lung cancer|cystic fibrosis/i],
  ['resp-anatomy',   /nose|nasal|sinus|pharyn|laryn|trachea|bronch|lungs?\b|lobe|pleura|hilum|cartilage|conchae|turbinate/i],
  ['resp-function',  /respirat|breath|ventilat/i],

  /* ── fluid balance: her Module 1.3 quiz asks it; her numbered criteria never name it ── */
  ['fluid-balance',  /dehydrat|diuretic|isotonic|hypotonic|hypertonic|osmolality|intracellular fluid|extracellular fluid|fluid volume deficit|osmosis/i],

  /* ── the rest of the cardiovascular system ── */
  ['cvs-bp-stress',  /(stress|exercis).{0,80}(blood pressure|\bBP\b)|(blood pressure|\bBP\b).{0,80}(stress|exercis)/i],
  ['cvs-capillary-fluid', /hydrostatic|oncotic|osmotic pressure|colloid|filtration|reabsorption|capillary exchange|net filtration|oede?ma|\bedema|plasma proteins?|albumin|kwashiorkor/i],
  ['cvs-flow-physics', /peripheral resistance|\bSVR\b|resistance|velocity|viscosity|vessel (diameter|radius|length)|blood flow|flow rate|poiseuille|laminar|turbulen|pressure gradient|mean arterial|pulse pressure|cross-?sectional area|BP = CO/i],
  ['cvs-heart-coverings', /pericardi|epicardi|serous|fibrous pericard/i],
  ['cvs-heart-location', /mediastinum|apex|base of the heart|location of the heart|orientation|fifth intercostal|5th intercostal/i],
  ['cvs-circuits',   /pulmonary (circuit|circulation|artery|arteries|vein|veins|trunk)|systemic (circuit|circulation)|coronary|aorta|vena cava|venae cavae|blood flow through the heart|path of blood|hepatic portal|portal vein|renal arter|mesenteric|coeliac|celiac|circulation/i],
  ['cvs-vessels',    /arter|vein|venule|capillar|tunica|intima|adventitia|endotheli|valves? in veins|varicose|sinusoid|fenestrat|vasa vasorum|aneurysm|atheroscl|arterioscl|blood vessels?/i],
  ['cvs-heart-walls', /atri|ventric|valve|septum|myocard|endocard|chordae|papillary|tricuspid|bicuspid|mitral|semilunar|auricle|trabecul|cusps?|chamber/i],
  ['cvs-terms',      /pulse|pressure point|perfusion|vasoconstrict|vasodilat|hypertension|hypotension|angina|infarct|heart attack|ischa?emi|congestive|heart failure|bradycardi|tachycardi|myocarditis|endocarditis|pericarditis|blood pressure|angiogram/i],
  ['lymph-function', /lymph|immun|lymphocyte|antibod|antigen|macrophage|pathogen|defen[cs]e|lipid|chylomicron/i],
  ['cvs-function',   /heart|cardi|blood|cardiovascular|circulatory/i],
];
/* moved by hand after reading the groups: question id -> row */
export const PIN = {
  q4ff5e3df48:'cvs-shock',               // Jo, stab wound: the kind of shock
  q88b12ffc62:'cvs-circuits',            // four arteries off the descending aorta
  q53aabb598b:'cvs-circuits',            // same
  qf65610a72d:'cvs-circuits',            // hepatic portal vein
  qf6e57850d9:'lymph-anatomy',           // NOT associated with the lymphatic system: kidneys
  q20cd7ac282:'cvs-heart-coverings',     // cardiac tamponade, the pericardial space
  qffcb65a5f9:'cvs-bp-control',          // effect of general factors on BP (CVS 12 names them)
  qc19e91b969:'cvs-capillary-fluid',     // causes of oedema
  q32db9261f1:'cvs-bp-stress',           // Oliana: BP during exercise
  q19fa1168ab:'cvs-co-control',          // control of heart rate
  q9c6e456d85:'cvs-heart-walls',         // 15-pair heart structures match
  q7599c785b5:'cvs-conduction',          // Lagi: normal ECG
  qfbe2f24241:'cvs-heart-walls',         // aortic vs pulmonary semilunar
  q79a622f2bb:'cvs-heart-walls',         // semilunar vs AV valves
  q4749a6b111:'resp-air-composition',    // 99% of air: N2 and O2
  qcd0a3cbedf:'resp-anatomy',            // the trachea: white shiny tissue = collagen
  q5aae04c65b:'cvs-terms',               // CVS2 wordlist: ventricles, SV, murmur, systole, diastole
  qcf2b1b762b:'cvs-heart-walls',         // CVS2 wordlist: layers and septa
  q928533047f:'cvs-heart-walls',         // CVS2 wordlist: septum, valves, epicardium
  q44e580932a:'cvs-terms',               // chronotropic / inotropic (named in CVS 15)
  qd6199ba805:'cvs-circuits',            // MI from an LAD occlusion
  qe23369c6f9:'cvs-co-factors',          // lab ECG: heart rate sitting / resting / exercise
  q2672d1d3e3:'cvs-co-factors',          // same
  q51562a9cd6:'cvs-heart-walls',         // AV valve anchorage
  q99fc0ee03a:'cvs-vessels',             // Lagi: 4 of 10 blanks are the vessels
  q9ed20aa288:'cvs-circuits',            // myocardial venous return via the coronary sinus
  q366b2072f0:'cvs-co-control',          // mechanisms of stroke volume
  q531f3701b5:'cvs-terms',               // BP terms to definitions
  q570d8d5a52:'cvs-terms',               // define BP, CO, SV, PR
  qe56696ad0e:'cvs-heart-walls',         // mitral regurgitation
  q02029640e0:'cvs-terms',               // her CVS2 "fill in the correct terms" exercise (25 blanks)
  q9f430b3b75:'resp-terms',              // asthmatic bronchiole
  qa810a439f4:'resp-terms',              // dyspnoea, pneumothorax, atelectasis, eupnoea
  q514a96de87:'cvs-heart-coverings',     // pericardium essay
  qbf86729d54:'resp-anatomy',            // label: carina, alveolus
  q02eb8bf2ab:'resp-airpath',            // Kalama choking
  q698c3b839c:'resp-zones',              // COPD vs pneumonia by zone
  q4be7d1967b:'resp-ventilation',        // accessory muscles, forced breathing
  q4eaf5056dc:'resp-anatomy',            // histology slides
  q90deec5346:'resp-zones',              // gas-exchange function
  q7427da6e5c:'resp-zones',              // respiratory zone
  qbe972aad80:'resp-anatomy',            // cartilage in the walls
  q8d14db6a8a:'resp-anatomy',            // trachealis holds the C-rings
  q4b9d2c0109:'resp-anatomy',            // lung micrograph, four parts
  qf80d65d54d:'resp-zones',              // asthma medication and the conduction zone
  qcba59a0c25:'resp-alveoli',            // thin squamous alveolar cells
  qac000f1f2c:'resp-alveoli',            // type 2 cells, surfactant
  qe559a684ed:'resp-alveoli',            // IRDS, surfactant
  qc19409af45:'resp-air-composition',    // 99% of atmospheric pressure
  q1a7ccb04cb:'resp-air-composition',    // same
  q84719448cd:'resp-air-composition',    // Dalton
  q444e4c00db:'resp-air-composition',    // Dalton
  q5415868a3e:'resp-anatomy',            // label the airway
  qca33af1cee:'resp-anatomy',            // error in an AI labelled summary
  qa631f47be3:'resp-airpath',            // mucociliary escalator
  qfa33782628:'resp-anatomy',            // histology A-E
  qd4314a3473:'resp-airpath',            // smoking and self-cleaning
  q12f6d119cb:'resp-zones',              // respiratory zone parts
  q1c9d33d5f5:'resp-airpath',            // order of parts from the nose
  q830befefd6:'resp-terms',              // emphysema
  q64194f2d3a:'resp-airpath',            // mucociliary escalator tissue
  qabb3a6d9e3:'resp-terms',              // bronchiolitis
  qc48d3f7a5e:'cvs-circuits',            // pulmonary trunk
  qe23ef99592:'cvs-vessels',             // capillary types
  qa9b876a5fa:'cvs-heart-walls',         // heart A-D: what each does
  q88fcb237fc:'cvs-heart-walls',         // heart A-D: names
  qad52d39f34:'cvs-circuits',            // pulmonary vs systemic (cloze)
  qdb0eee30d4:'cvs-circuits',            // sequence of blood flow
  q285888e6a5:'cvs-circuits',            // pulmonary vs systemic (essay)
  qbd80478744:'cvs-circuits',            // blood flow sequence
  q3274184190:'cvs-circuits',            // order of blood flow
  qd168a26788:'cvs-circuits',            // vessels into the right atrium
  qec993a430c:'cvs-circuits',            // the widow maker
  q8d858145a7:'cvs-heart-walls',         // pulmonary valve
  q2661e7d6c5:'cvs-heart-walls',         // 14-pair heart match
  q5368fb38d0:'resp-volumes',            // what sets lung capacity
  q1895029722:'resp-alveoli',            // lung tissue floats
  q4ac70ce9a0:'resp-alveoli',            // still-born lung sinks
  qd576bd0933:'cvs-vessels',             // draw artery and vein
  q368b31b003:'cvs-vessels',             // same
  qb1c9f7e292:'cvs-vessels',             // pulse in an artery, not a vein
  q59a2713249:'cvs-vessels',             // same
  qb815458ee4:'resp-volumes',            // peak flow, FEV
  q3c179ca1e9:'resp-chemical',           // the urge to breathe: CO2
  q07e9cecaec:'cvs-capillary-fluid',     // fluid movement: hypertension, dehydration, hypoalbuminaemia
  q3c544ec4de:'cvs-flow-physics',        // resistance: how easily air or blood flows
  q1e7842553c:'cvs-circuits',            // coronary angiogram
  q780aa99ead:'resp-external',           // CO2 vs O2 exchange rate
  qbe81316f91:'resp-external',           // same
  q7f6b9f0f58:'resp-external',           // same
  q4f54c9b881:'cvs-terms',               // define BP, systolic, diastolic, pulse pressure
  qcaa78ffe65:'cvs-circuits',            // fetal circulation at birth (her criteria never name it)
  q7b72ff42d1:'cvs-circuits',            // same
  q830c03babe:'cvs-circuits',            // same
  q15a29cf825:'cvs-flow-physics',        // pressure falls from arteries to venae cavae
  q2a893cf428:'cvs-heart-walls',         // label the heart
  q5fb1eec3c1:'cvs-heart-walls',         // label the heart
  q7d9612bc35:'cvs-heart-walls',         // label the heart
  q3fb7ff6821:'cvs-heart-walls',         // label the heart
  qb1bc002a96:'cvs-heart-walls',         // heart internal view
  qfa265e2184:'cvs-heart-walls',         // aortic vs pulmonary valve
  qa7e317cc22:'cvs-co-control',          // adrenaline and bradycardia
  q8f8aa2ef09:'cvs-bp-control',          // sympathetic activation raises BP
  q8991ce12e6:'cvs-heart-coverings',     // white adipose on the heart
  q7427e74a19:'cvs-heart-walls',         // layers of the heart wall
  qb27faf3123:'cvs-heart-walls',         // foramen ovale / fossa ovalis
  q668ac7bdce:'cvs-terms',               // BP mix and match
  q7c36f41ee6:'cvs-circuits',            // named vessels: neck
  q67bd4e2ade:'cvs-circuits',            // named vessels: subclavian
  q3e84e2f2ec:'cvs-circuits',            // named vessels: subclavian
  q6a824d19a5:'cvs-circuits',            // named vessels: neck
  qad0ec9734e:'cvs-circuits',            // named vessels: limbs
  qdfe62ea8f2:'cvs-circuits',            // named vessels: jugular
  qbebb57e18c:'cvs-circuits',            // named vessels: neck
  q0024fdf511:'cvs-circuits',            // named vessels: limbs
  q07cd859f25:'cvs-circuits',            // aortic arch branches
  q9ceffd5ab8:'cvs-circuits',            // common carotid
  q3a5d9ac49e:'cvs-circuits',            // LAD
  q752f4ada20:'cvs-circuits',            // LAD, widow maker
  q6e3f7b1492:'cvs-bp-control',          // parasympathetic vasodilation
  q71bbcb4eee:'cvs-conduction',          // aortic pressure over the cardiac cycle
  qb94e544d5b:'cvs-conduction',          // automaticity
  q63ac7e3031:'cvs-conduction',          // refractoriness
};
export function rowOf(q) { if (PIN[q.id]) return PIN[q.id]; const r = RULES.find(([, re]) => re.test(q.t)); return r ? r[0] : null; }
