/**
 * Image generation prompts — one per training card.
 *
 * Each prompt is engineered to produce a single human face displaying the
 * target emotion's specific FACS Action Units. Prompts are intentionally
 * descriptive about WHICH facial muscles should be visibly engaged, because
 * Nano Banana (gemini-2.5-flash-image) responds well to anatomically
 * grounded direction.
 *
 * Style baseline (applied to every prompt):
 *   - Photorealistic portrait
 *   - Neutral grey background, soft studio lighting
 *   - Tight head-and-shoulders crop
 *   - Direct camera angle (no profile / 3-quarter unless emotion requires it)
 *   - Natural skin, no heavy retouching, varied ages and ethnicities
 *
 * Variation across cards:
 *   - Cards ending in "-1" tend toward more pronounced/textbook expression
 *   - Cards ending in "-2" tend toward subtler/realistic expression
 *   - Pair cards use intentionally similar baseline faces to force the user
 *     to attend to mimic markers, not face identity.
 */

const STYLE_BASE =
  'Photorealistic close-up portrait, neutral grey background, soft natural studio lighting, head and shoulders crop, direct camera angle, natural skin texture, sharp focus on the face, shot on 85mm lens, shallow depth of field. Single person, no text, no logos.';

export interface ImagePrompt {
  cardId: string;
  prompt: string;
}

export const PROMPTS: ImagePrompt[] = [
  // ─── TIER 1 — basic 7 ────────────────────────────────────────────────────
  {
    cardId: 'joy-1',
    prompt: `${STYLE_BASE} A 30-year-old woman expressing genuine, unforced joy. Her eyes are crinkled with visible "crow's feet" wrinkles at the outer corners (zygomaticus major + orbicularis oculi engaged — Duchenne smile). Cheeks lifted high, exposing upper teeth in a natural laugh. Eyes slightly narrowed by the cheek lift. Symmetric expression. Caught mid-laugh, not posed.`,
  },
  {
    cardId: 'joy-2',
    prompt: `${STYLE_BASE} A 50-year-old man with a quiet, contemplative joyful expression. Subtle Duchenne smile — closed lips slightly upturned, but the joy is visible primarily in the eyes: relaxed crinkles, soft narrowing, warmth in the gaze. Not laughing, not grinning — contained but unmistakably happy.`,
  },
  {
    cardId: 'sadness-1',
    prompt: `${STYLE_BASE} A 40-year-old woman expressing sadness. CRITICAL: the inner corners of her eyebrows are pulled upward and toward each other (AU1 + AU4 combined — the classic "sad brow" that is hard to fake). Upper eyelids drooping. Corners of the mouth pulled down (AU15). Gaze directed slightly downward. Restrained, not crying.`,
  },
  {
    cardId: 'sadness-2',
    prompt: `${STYLE_BASE} A 25-year-old man, sadness on his face. Inner brow corners raised forming the inverted-V shape characteristic of true sadness. Lips closed, slightly downturned at the corners. Looking slightly off-camera into middle distance. Subtle expression — the kind seen when someone is trying not to show they're upset.`,
  },
  {
    cardId: 'anger-1',
    prompt: `${STYLE_BASE} A 35-year-old man expressing controlled anger. Eyebrows drawn down and together (AU4). Upper eyelids raised, exposing the upper iris (AU5). Lower eyelids tensed (AU7). Lips pressed firmly together and slightly thinned (AU23+24). Nostrils flared. Direct, unblinking stare into camera. Jaw muscles visibly engaged.`,
  },
  {
    cardId: 'anger-2',
    prompt: `${STYLE_BASE} A 45-year-old woman with intense anger — open-mouth variant. Brows fully knitted down and together. Eyes wide with the upper eyelid raised. Mouth open in a square shape with teeth visible (mid-shout configuration), lips tense not relaxed. Vertical wrinkles between the brows (AU4 deep).`,
  },
  {
    cardId: 'fear-1',
    prompt: `${STYLE_BASE} A 28-year-old woman in a state of acute fear, frozen the instant she saw something terrifying. Eyes WIDE OPEN with the WHITE OF THE EYES VISIBLE ABOVE the iris (this is critical — AU5 fully engaged, eyelids retracted). Eyebrows raised and pulled together creating BOTH horizontal forehead wrinkles AND vertical lines between brows simultaneously (AU1+2+4). Mouth slightly open with lips pulled HORIZONTALLY back toward the ears in a tense wide rectangle (AU20) — corners pulled to the sides, not up or down. Skin slightly pale. Caught at the moment of seeing real danger.`,
  },
  {
    cardId: 'fear-2',
    prompt: `${STYLE_BASE} A 35-year-old man in a moment of acute fear. Eyes WIDE — sclera (white) clearly visible above the iris from raised upper eyelids (AU5). Eyebrows pulled UP and TOGETHER simultaneously — horizontal forehead lines AND vertical creases between brows visible at the same time (the diagnostic AU1+2+4 combination). Mouth open about 1cm with lips stretched HORIZONTALLY in a tense rectangular shape — corners pulled outward toward the ears, NOT a frown, NOT a smile, but a tense horizontal stretch (AU20). Skin pale. The face of someone who just heard a gunshot from behind.`,
  },
  {
    cardId: 'surprise-1',
    prompt: `${STYLE_BASE} A 30-year-old man expressing pure surprise. Eyebrows raised HIGH and EVENLY, NOT drawn together (AU1+2 only, no AU4 — this is what separates surprise from fear). Horizontal forehead wrinkles, no vertical lines between brows. Eyes wide open. Mouth slightly open, jaw dropped (AU26), lips relaxed not stretched. Brief, momentary expression.`,
  },
  {
    cardId: 'surprise-2',
    prompt: `${STYLE_BASE} A 22-year-old woman in a moment of genuine shocked surprise. Eyes WIDE OPEN, eyebrows raised HIGH into clean smooth arcs (AU1+2 only — NO furrow, NO vertical lines between brows). Forehead shows long horizontal creases. Jaw fully dropped — mouth wide open in an unmistakable round "OH!" shape (AU26), about an inch of opening, lips relaxed and forming a clear circle. NO smile, NO teeth visible biting down — pure jaw-drop shock. Caught the instant after seeing something completely unexpected.`,
  },
  {
    cardId: 'disgust-1',
    prompt: `${STYLE_BASE} A 40-year-old man expressing disgust. Nose wrinkled upward (AU9 — the diagnostic feature). Upper lip raised, exposing upper teeth on one side (AU10). Lower eyelids slightly raised. Brow lowered. The expression of someone who just smelled something rotten. Asymmetry possible.`,
  },
  {
    cardId: 'disgust-2',
    prompt: `${STYLE_BASE} A 30-year-old woman with subtle moral disgust. Nose slightly wrinkled. Upper lip subtly raised. Brow lowered, eyes narrowed. A "this is beneath me" expression rather than a "this smells bad" expression — restrained but visible nasolabial furrow deepening.`,
  },
  {
    cardId: 'contempt-1',
    prompt: `${STYLE_BASE} A 35-year-old woman with an EXTREMELY OBVIOUS, EXAGGERATED ONE-SIDED SMIRK. THE LEFT SIDE OF HER MOUTH IS PULLED SHARPLY UP AND BACK creating a deep visible dimple in her left cheek. THE RIGHT SIDE OF HER MOUTH STAYS COMPLETELY FLAT AND DOWNWARD — no movement on the right side at all. The asymmetry must be IMMEDIATELY visible from across a room — one corner clearly elevated, the other corner clearly not. Chin lifted, looking down her nose, eyes half-lidded with cool dismissive judgment. The face of an aristocrat reacting to peasant nonsense — exaggerated, theatrical, unmistakable contempt. Strong AU14, unilateral.`,
  },
  {
    cardId: 'contempt-2',
    prompt: `${STYLE_BASE} A 40-year-old man with a STRONGLY ASYMMETRIC mouth — the RIGHT corner of his mouth is pulled UP into an obvious smirk creating a visible dimple in his right cheek, while the LEFT corner stays completely flat and slightly downturned. The two sides of his mouth must look obviously different — one corner clearly raised, the other clearly not. Slight upward chin tilt, half-lidded skeptical eyes, looking down his nose. The unmistakable smirk of dismissive disdain. Visible from a distance — not subtle. Strong unilateral AU14.`,
  },

  // ─── TIER 2 — distinguishing pairs ──────────────────────────────────────
  {
    cardId: 'duchenne-1',
    prompt: `${STYLE_BASE} A 45-year-old man with a deep Duchenne (genuine) smile. Both AU6 (cheek raise) and AU12 (lip corner pull) clearly engaged. Visible wrinkles fanning from outer eye corners ("crow's feet"). Cheeks pushed up under the eyes, narrowing them. Smile is symmetric. The emotion is genuinely felt — captured candidly while reacting to something funny.`,
  },
  {
    cardId: 'duchenne-2',
    prompt: `${STYLE_BASE} A 30-year-old woman in genuine warm laughter, mouth open showing teeth in unforced delight. CRITICAL: deep visible "crow's feet" wrinkles at the OUTER CORNERS OF BOTH EYES — multiple radiating creases proving the orbicularis oculi muscle is fully engaged (AU6). Cheeks pushed up high under the eyes, narrowing the eye openings. The eyes appear to "smile" along with the mouth. Caught candidly mid-laugh. The wrinkles at the eyes must be unmistakably present.`,
  },
  {
    cardId: 'social-1',
    prompt: `${STYLE_BASE} A 40-year-old businesswoman with a polite, professional social smile. Lips pulled back symmetrically (AU12 only) but absolutely NO eye involvement — smooth skin around eyes, no crow's feet, no cheek lift. Eyes remain calm and evaluative. The classic "polite handshake smile" — friendly façade, no felt joy.`,
  },
  {
    cardId: 'social-2',
    prompt: `${STYLE_BASE} A 28-year-old male LinkedIn corporate headshot. Closed-lip professional smile — corners of mouth turned up symmetrically but mouth stays closed (AU12 only). CRITICAL: ABSOLUTELY NO crinkles at the eye corners, NO crow's feet, NO cheek lift. The forehead and skin around the eyes is COMPLETELY SMOOTH. Eyes are calm, evaluating, slightly cold — they do NOT participate in the smile at all. The disconnection between mouth (smiling) and eyes (neutral/observing) must be unmistakable. The classic "professional polite smile" — practiced, deliberate, not felt.`,
  },
  {
    cardId: 'fearVs-1',
    prompt: `${STYLE_BASE} A 32-year-old woman expressing fear (designed to contrast with surprise). Brows raised AND pulled together — both horizontal forehead wrinkles AND vertical lines between brows are visible at the same time. Lips stretched horizontally and slightly back. Eyes wide. Held expression, not a flash.`,
  },
  {
    cardId: 'surpVs-1',
    prompt: `${STYLE_BASE} A 32-year-old woman expressing pure surprise (designed to contrast with fear). Brows raised in a clean, smooth arch — NO furrow between them, NO vertical lines. Mouth open in a relaxed "oh" shape, lips not stretched. The expression is fleeting and bright. Make this image visually similar to the fear contrast image except for the brow and lip differences.`,
  },
  {
    cardId: 'controlled-anger-1',
    prompt: `${STYLE_BASE} A 50-year-old man with controlled, suppressed anger. Lips pressed thin and tight together (AU23+24), no open-mouth shouting. Jaw muscles visibly tensed (masseter bulge). Slight downward pull of brows but kept in check. Direct, cold, unblinking stare. Nostrils slightly flared. The face of someone holding fury in check during a confrontation.`,
  },
  {
    cardId: 'controlled-anger-2',
    prompt: `${STYLE_BASE} A 35-year-old woman, controlled anger. Lips pressed together, slightly disappearing into a thin line. Subtle tension between the brows but no full furrow. Eyes hard and fixed. Chin slightly forward. The contained anger of a professional in a meeting that has gone wrong — visible, but suppressed.`,
  },
  {
    cardId: 'sadness-vs-1',
    prompt: `${STYLE_BASE} A 45-year-old man with the textbook AU1 sadness brow. CRITICAL FOCUS — the inner ends of his eyebrows are DRAMATICALLY PULLED UPWARD AND TOGETHER, forming a sharp inverted-V or "house roof" shape between the brows. The middle of the forehead has clear short vertical wrinkles in the center from this muscle action. The OUTER edges of the brows stay LOWER than the inner edges — opposite of the normal arch. This brow shape is the most diagnostic and hardest-to-fake feature of true sadness. Mouth corners pulled down (AU15). Visually similar to the man in fatigue-vs-1, except the brow shape is the inverted-V instead of flat.`,
  },
  {
    cardId: 'fatigue-vs-1',
    prompt: `${STYLE_BASE} A 45-year-old man who looks tired and disappointed but NOT sad. CRITICAL: inner brow corners are NOT raised — the brows are flat and relaxed. Heavy upper eyelids. Slack cheek muscles. Slight downturn of mouth corners but no true sadness configuration. The face of someone after a long, frustrating day. Visually similar to the sadness contrast face except the brows are flat.`,
  },
  {
    cardId: 'shame-1',
    prompt: `${STYLE_BASE} A 25-year-old woman expressing shame. Head bowed downward, gaze averted from camera, looking at the floor. One hand may partially cover the lower face or chin. Slight blush across cheeks if visible. Posture compressed inward, shoulders slightly hunched. The body language of wanting to disappear.`,
  },
  {
    cardId: 'guilt-1',
    prompt: `${STYLE_BASE} A 30-year-old man expressing guilt. Critically: eye contact with the camera IS maintained (unlike shame where gaze is averted). Lips pressed together or slightly bitten. Subtle furrow between the brows. Posture upright, not hunched. The face of someone who knows they did wrong and is taking responsibility, looking the viewer in the eye.`,
  },

  // ─── TIER 3 — mixed / suppressed ─────────────────────────────────────────
  {
    cardId: 'nostalgia-1',
    prompt: `${STYLE_BASE} A 55-year-old woman with a bittersweet nostalgic expression — sadness and gentle smile co-existing. Inner brow corners raised (AU1 — sadness signal) WHILE corners of the mouth are softly turned up (AU12 — slight smile). NO cheek lift (no AU6) — the smile doesn't reach the eyes. Gaze slightly defocused, looking at a memory. Both warmth and melancholy visible simultaneously.`,
  },
  {
    cardId: 'nostalgia-2',
    prompt: `${STYLE_BASE} A 60-year-old man, bittersweet remembrance. Inner ends of eyebrows raised; subtle closed-lip smile. Eyes slightly wet but not crying. Looking past the camera into middle distance. The expression of someone remembering a loved one who's gone — both grateful and grieving in the same moment.`,
  },
  {
    cardId: 'suppressed-anger-1',
    prompt: `${STYLE_BASE} A 40-year-old man whose face appears nearly neutral but with micro-markers of suppressed anger. Lips pressed flat (AU24), barely visible jaw clench. Slight tension between the brows without full AU4. Eyes cold and fixed, blinking rate reduced. The face must look "controlled" at first glance but reveal anger under closer inspection.`,
  },
  {
    cardId: 'suppressed-anger-2',
    prompt: `${STYLE_BASE} A 50-year-old woman, suppressed anger under apparent calm. Mouth in a tight closed line — not smiling, not frowning. Tiny vertical tension between brows. Holding the camera's gaze with cool intensity. No overt anger features but unmistakable underlying tension — the face of someone choosing not to react in a meeting where they're furious.`,
  },
  {
    cardId: 'anxiety-1',
    prompt: `${STYLE_BASE} A 28-year-old woman expressing anxiety — fear in the upper face combined with sadness in the lower face. Brows raised and slightly pulled together (fear marker, AU1+2+4). Mouth corners pulled DOWN (sadness marker, AU15). Lower lip slightly bitten or tense. Eyes scanning, not fixed. The combination produces the distinctive "worried" look.`,
  },
  {
    cardId: 'anxiety-2',
    prompt: `${STYLE_BASE} A 35-year-old man with chronic anxiety visible on his face. Brows held in slightly elevated, slightly furrowed position (held fear). Lower lip pulled in or tense, mouth corners turned down. Fine tension lines around eyes. Eyes alert but not focused on anything specific in the frame. The face of background-level worry, not acute panic.`,
  },
];
