/* Exam-case pack for Module 1 — the three STARRED cases in Case Study Booklet A, the
   ones her board says "will be in the exam": 2 The aftereffects of lymph node removal,
   3 Asthma, 4 Panic attacks. Scenario and questions are HERS, verbatim from the
   MODULE 1: TEST & EXAM CASES board / the asthma discussion. The answers are HERS too:
   her deck "2024 Case studies mod ans-Lym Panic Asth Diab-1.pptx" (slides 2–22) gives a
   model answer per question, and each `steps` list is that slide split one marking
   point per line (spelling tidied, nothing added). The one question her deck answers
   with an unlabelled diagram (the baroreflex, slide 22) is the tool's, from her CVS 4
   learning page, and its `src` says so. The full mock deals one of these questions per
   sitting, rotating through them in order. */
export const CASES = [
  {
    id: 'lymph', sys: 'lymph', name: 'Exam case 2 · The aftereffects of lymph node removal',
    scenario: 'Aleki and Vicky visit their friend, Mary who had undergone a right mastectomy for cancer a fortnight ago. Mary mentioned the cancer had spread to the lymph nodes and that some axillary lymph nodes were also removed. She complained of swelling in the right arm after the surgery. Her friend, who is good with mirimiri and massage offers to help massage her arm, which helps to bring down the swelling.',
    questions: [
      {
        q: 'What are the major functions of the lymphatic system, which the lymph is a part of?',
        marks: 3,
        steps: [
          'Digestive: lacteals in the gut, into which dietary fat is absorbed to be taken for processing.',
          'Immunological: the immune response — thymus (T cells mature), bone marrow (B cells mature, making antibodies), lymph nodes (where lymphocytes and other immune cells interact to create and coordinate an immune response; areas of high immune-cell activity).',
          'Fluid balance: the drainage points of interstitial fluid — draining away excess tissue fluid for monitoring (any antigens are easily found) and returning it to the venous system.',
        ],
        src: 'Her answer · 2024 case-study model-answers deck, slides 3–5',
      },
      {
        q: 'What is the role of the axillary lymph nodes in the spread of cancer? Explain.',
        marks: 2,
        steps: [
          'Spread of cancer is metastasis: if a cancerous cell detaches from its origin (a tumour) and gets into the lymphatic system it can potentially reach any part of the body.',
          'We check the axillary (armpit) nodes for cancer cells: the first node to be affected, closest to the breast, is the sentinel node — cancer cells there show the cancer has spread; none there gives some confidence it is limited to the breast.',
        ],
        src: 'Her answer · 2024 case-study model-answers deck, slide 6',
      },
      {
        q: 'Why did Mary develop swelling in the right arm after mastectomy? You will need to think about fluid dynamics, and what causes fluid to move into or still in the interstitial spaces (tissue space).',
        marks: 2,
        steps: [
          'When the lymph nodes are removed, the fluid that normally drains from the arm through those nodes is blocked.',
          'With nowhere for the remaining tissue fluid to go (normally it drains through the lymphatic vessels and returns to the venous system at the subclavian vein), the lymphatic vessels fill until they cannot drain the tissue fluid from the tissue — lymphoedema.',
        ],
        src: 'Her answer · 2024 case-study model-answers deck, slide 7',
      },
    ],
  },
  {
    id: 'asthma', sys: 'resp', name: 'Exam case 3 · Asthma',
    scenario: 'Ane has had severe asthma since they were young. During a particularly bad asthma attack, Ane is experiencing difficulty breathing, particularly on the out-breath. Ane’s asthma is often triggered by small particles of pollen that manage to make their way into their lungs despite the protective features designed to keep them out. Ane makes sure to have their Salbutamol inhaler, which helps to relieve the symptoms of their asthma attack.',
    questions: [
      {
        q: 'What term is used to describe difficulty breathing?',
        marks: 1,
        steps: ['Dyspnoea — dys (bad, not good) + pnoea (breathing). Compare eupnoea (normal), tachypnoea (fast), apnoea (none), hyperventilation (hard and fast, changing blood CO₂).'],
        src: 'Her answer · 2024 case-study model-answers deck, slide 17',
      },
      {
        q: 'What is happening in Ane’s lungs to make breathing difficult?',
        marks: 3,
        steps: [
          'Bronchoconstriction: the airway becomes constricted — the smooth muscle around it has contracted.',
          'Inflammation: the wall of the airway is thick with swelling.',
          'Increased mucus secretion as well — less room for air.',
        ],
        src: 'Her answer · 2024 case-study model-answers deck, slide 18',
      },
      {
        q: 'How is Ane’s ventilation and airway resistance impacted?',
        marks: 2,
        steps: [
          'Airway resistance is high → harder to breathe (a greater pressure difference is required) → dyspnoea.',
          'Accessory respiratory muscles are recruited — extra muscles for breathing, an "increase in the work of breathing".',
        ],
        src: 'Her answer · 2024 case-study model-answers deck, slide 18',
      },
      {
        q: 'How does an inhaler help when Ane is having an asthma attack?',
        marks: 1,
        steps: ['A reliever inhaler is a BRONCHODILATOR: it forces the airway smooth muscle to relax, which lets the airway widen and relieves the symptoms so you can breathe. (A preventer is a corticosteroid — anti-inflammatory.)'],
        src: 'Her answer · 2024 case-study model-answers deck, slide 18',
      },
      {
        q: 'How does the body usually keep dust and small particles out of the lungs? There are several mechanisms for this!',
        marks: 3,
        steps: [
          'Mucus and cilia — the muco-ciliary escalator.',
          'Nasal hairs — a filter that traps particles, which end up stuck in mucus.',
          'The carina at the bottom of the trachea stimulates the cough reflex; the epiglottis keeps large objects out of the trachea (not effective against small particles).',
        ],
        src: 'Her answer · 2024 case-study model-answers deck, slide 19',
      },
      {
        q: 'The muco-cillary escalator is one of the mechanism. How does the muco-cillary escalator work?',
        marks: 2,
        steps: [
          'Cilia — small hair-like structures lining the respiratory epithelium — beat to sweep mucus up and out of the airways.',
          'Mucus is sticky: particles and dust get stuck in it and are trapped, then carried up on the cilia.',
        ],
        src: 'Her answer · 2024 case-study model-answers deck, slide 20',
      },
      {
        q: 'Smoking damages this escalator – how would this impact a smoker?',
        marks: 2,
        steps: [
          'The cilia are damaged, so mucus cannot be moved up and out of the lungs.',
          'A smoker’s cough develops to replace the lost function of the cilia.',
        ],
        src: 'Her answer · 2024 case-study model-answers deck, slide 20',
      },
      {
        q: 'Ane’s blood pressure was high due to their fight or flight response. What process helps to return their blood pressure back to normal after their asthma attack? (Think the full process!)',
        marks: 4,
        steps: [
          'Baroreceptors in the aortic arch and carotid sinus are stretched more by the high pressure and fire faster.',
          'They signal the cardiac and vasomotor centres in the medulla oblongata.',
          'The cardiac inhibitory centre is stimulated: parasympathetic (vagus) impulses to the SA node release acetylcholine, so heart rate (and stroke volume) fall.',
          'The vasomotor centre is inhibited: less sympathetic tone, arterioles dilate, peripheral resistance falls — BP = HR × SV × PR comes back down to the set point.',
        ],
        src: 'Model answer is the tool’s · from her CVS 4 learning page and her neural-regulation comment (her deck answers this with a diagram)',
      },
    ],
  },
  {
    id: 'panic', sys: 'resp', name: 'Exam case 4 · Panic attacks',
    scenario: 'Manaia lives with an anxiety disorder, which sometimes manifests in panic attacks that impact on her breathing. Manaia describes her panic attack as a time when she breathes really really hard and fast and cannot control her breathing at all. You know that there is a link between breathing and the pH of your blood because the respiratory system is one of the buffer systems of the body. You know that during a prolonged panic attack, Manaia might be at risk of what is called respiratory alkalosis, but you’ll need to remember why this is.',
    questions: [
      {
        q: 'Breathing, or the process of pulmonary ventilation is how you move air in and out of your lungs and requires a specific series of steps. Bullet point the steps involved in Manaia’s inhalation.',
        marks: 4,
        steps: [
          'The diaphragm contracts (lowering its dome) and the external intercostal muscles contract (moving the ribs up and out).',
          'This enlarges the thoracic cavity and reduces the pressure in the intrapleural cavity (Boyle’s law).',
          'The intrapulmonary cavity enlarges — volume increases — lowering the intrapulmonary pressure.',
          'Air flows in from the atmosphere, from high pressure to low.',
        ],
        src: 'Her answer · 2024 case-study model-answers deck, slide 10',
      },
      {
        q: 'Bullet point the steps involved in Manaia’s exhalation.',
        marks: 4,
        steps: [
          'The diaphragm relaxes (its dome rises) and the external intercostals relax (ribs move down and in).',
          'The elastic lungs recoil passively, reducing the intrapulmonary volume.',
          'Intrapulmonary pressure rises (Boyle’s law).',
          'Air flows out of the lungs, from the higher intrapulmonary pressure to the lower atmospheric pressure.',
        ],
        src: 'Her answer · 2024 case-study model-answers deck, slide 11',
      },
      {
        q: 'Manaia feels tired after a panic attack because forced breathing requires more muscular effort. Which muscles are used in forced breathing? Be specific!',
        marks: 2,
        steps: [
          'Breathing in: diaphragm and external intercostals contract; when forced, also the neck muscles — sternocleidomastoid and scalenes.',
          'Breathing out: diaphragm and external intercostals relax; when forced, the abdominal muscles and the internal intercostals contract.',
        ],
        src: 'Her answer · 2024 case-study model-answers deck, slide 12',
      },
      {
        q: 'What are some of the factors that influence your pulmonary ventilation (make it easier or harder) and how do they do this?',
        marks: 3,
        steps: [
          'Airway obstruction by fluid, mucus and/or swelling (COPD, asthma) narrows the airways, raising resistance to airflow and the muscular effort needed to inhale and exhale.',
          'Lung compliance — the ease with which the lungs expand — which scar tissue reduces; thoracic-cage abnormalities (rib-cage flexibility, diaphragm problems); alveolar problems — lack of surfactant so alveoli do not expand, or fluid build-up.',
          'Interference with the negative intrapleural pressure that couples the lungs to the thoracic wall: air in the pleural cavity (pneumothorax) leads to collapse of the lung (atelectasis).',
        ],
        src: 'Her answer · 2024 case-study model-answers deck, slide 12',
      },
      {
        q: 'What is normal blood pH?',
        marks: 1,
        steps: ['7.35–7.45 (average 7.4). Below 7.35 = acidotic; above 7.45 = alkalotic.'],
        src: 'Her answer · 2024 case-study model-answers deck, slide 13',
      },
      {
        q: 'Draw the chemical equation (in words or chemical formula) for the bicarbonate buffer system in the blood',
        marks: 1,
        steps: ['CO₂ + H₂O ⇌ H₂CO₃ ⇌ H⁺ + HCO₃⁻ — carbon dioxide + water ⇌ carbonic acid ⇌ hydrogen ions + bicarbonate ions.'],
        src: 'Her answer · 2024 case-study model-answers deck, slide 13',
      },
      {
        q: 'How do changes in the respiratory rate and depth (like Manaia’s panic attack) affect the blood pH?',
        marks: 3,
        steps: [
          'Changing the rate and depth of breathing changes the CO₂ level in the alveoli, and so the CO₂ level in the blood.',
          'Blood CO₂ directly drives the bicarbonate buffer equation, so the same change happens to the H⁺ level — and a change in H⁺ is a change in pH.',
          'Manaia’s hyperventilation blows off CO₂ → the buffer uses up H⁺ and bicarbonate to replace it → H⁺ falls → pH rises: respiratory alkalosis. (Hypoventilation, e.g. head trauma, does the opposite: CO₂ up, H⁺ up, pH down — respiratory acidosis.)',
        ],
        src: 'Her answer · 2024 case-study model-answers deck, slides 14 and 16',
      },
      {
        q: 'How does the respiratory system respond when something causes the blood pH to change? (This is back to BN1 when you talked about ketoacidosis!)',
        marks: 2,
        steps: [
          'Metabolic acidosis (H⁺ up): the body responds with hyperventilation — H⁺ is converted into CO₂ and water and the extra CO₂ is breathed off, so the breathing rate increases.',
          'Metabolic alkalosis (H⁺ down): the body responds with hypoventilation — CO₂ is kept in the body and turned into H⁺ and bicarbonate to replace the lost H⁺, so the breathing rate decreases. The same buffer system works both ways: whatever happens to CO₂ happens to H⁺.',
        ],
        src: 'Her answer · 2024 case-study model-answers deck, slides 14–15',
      },
    ],
  },
];
