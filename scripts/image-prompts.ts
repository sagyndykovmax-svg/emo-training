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

  // ─── BATCH 2 — variations with different subjects (added v0.2) ───────────

  // Tier 1 additions
  { cardId: 'joy-3', prompt: `${STYLE_BASE} A 24-year-old man of South Asian descent, mid-laugh genuine joy. AU6 + AU12 fully engaged: deep crow's feet at outer eye corners, cheeks lifted high, mouth open showing teeth. Symmetric expression. Caught candidly.` },
  { cardId: 'joy-4', prompt: `${STYLE_BASE} A 65-year-old woman with deep wrinkles, warm soft Duchenne smile. Closed-lip smile with strong AU6: deep visible crow's feet, raised cheeks narrowing the eyes. Decades of laughter etched in her face.` },
  { cardId: 'sadness-3', prompt: `${STYLE_BASE} A 22-year-old woman with subdued sadness. AU1 visible — inner brow corners pulled up forming the inverted-V "house roof" shape. Lower lip slightly pushed up by AU17. Mouth corners pulled down (AU15). Eyes downcast, lashes wet but not crying.` },
  { cardId: 'sadness-4', prompt: `${STYLE_BASE} A 55-year-old man with quiet contained sadness. The inner ends of his brows are lifted into the diagnostic AU1 inverted-V. Slight downturn of mouth corners. Looking past the camera into middle distance with restrained grief.` },
  { cardId: 'anger-3', prompt: `${STYLE_BASE} A 30-year-old woman with intense anger directed at the camera. AU4 (deep furrow between brows), AU5 (raised upper eyelids exposing iris top), AU7 (tense lower eyelids), AU24 (pressed lips). Visible jaw tension. Direct unblinking stare.` },
  { cardId: 'anger-4', prompt: `${STYLE_BASE} A 55-year-old man, sharp focused anger. Brows knit DOWN and TOGETHER (AU4) with deep vertical creases. Eyes hard and narrowed by AU7. Lips pressed thin and pale. The intense controlled fury of someone in mid-confrontation.` },
  { cardId: 'fear-3', prompt: `${STYLE_BASE} A 45-year-old woman in acute frozen fear. Eyes wide, sclera visible above the iris (AU5). Brows raised AND pulled together creating both horizontal forehead lines AND vertical creases between brows simultaneously (AU1+2+4). Mouth slightly open with lips stretched horizontally back (AU20). Visible neck tension.` },
  { cardId: 'fear-4', prompt: `${STYLE_BASE} A 25-year-old man, sudden fear reaction. Wide eyes with raised upper lids. Eyebrows pulled UP and INWARD at the same time — the diagnostic fear brow combination. Lips drawn back tight and horizontal. Caught the instant of seeing real danger.` },
  { cardId: 'surprise-3', prompt: `${STYLE_BASE} A 35-year-old woman in pure shocked surprise. Brows raised HIGH in clean unbroken arches (AU1+2 only — NO furrow between brows). Forehead with long horizontal wrinkles. Eyes wide. Jaw fully dropped — round open mouth in unmistakable "OH" shape (AU26). Brief flash expression.` },
  { cardId: 'surprise-4', prompt: `${STYLE_BASE} A 50-year-old man, mild positive surprise. Eyebrows raised in clean smooth arcs without any furrow between them. Eyes wide. Mouth slightly open in a relaxed small "oh". Bright alert expression with no muscle tension. Distinct from fear: no AU4, no horizontal lip stretch.` },
  { cardId: 'disgust-3', prompt: `${STYLE_BASE} A 28-year-old woman with strong physical disgust. Nose deeply wrinkled upward (AU9 — diagnostic). Upper lip raised exposing teeth on one side (AU10). Lower eyelids slightly raised. Eyes squinted. The face of smelling something rotten.` },
  { cardId: 'disgust-4', prompt: `${STYLE_BASE} A 45-year-old man with restrained moral disgust. Subtle nose wrinkle (AU9). Slight asymmetric lift of upper lip (AU10). Brows lowered, eyes narrowed. Visible nasolabial deepening. The "this is beneath me" expression.` },
  { cardId: 'contempt-3', prompt: `${STYLE_BASE} A 30-year-old man with an OBVIOUSLY ASYMMETRIC mouth — the LEFT corner of his mouth pulled SHARPLY UP into a tight smirk creating a visible dimple in his left cheek, while the RIGHT corner stays completely flat. The asymmetry must be unmistakable. Half-lidded cool eyes, slight chin lift. Strong unilateral AU14.` },
  { cardId: 'contempt-4', prompt: `${STYLE_BASE} A 50-year-old woman with sharply asymmetric contempt. The RIGHT corner of her mouth visibly tightened up, the LEFT corner flat-neutral. Cool dismissive eyes, slight head tilt. Theatrical aristocratic disdain. Clear unilateral AU14.` },

  // Tier 2 additions
  { cardId: 'duchenne-3', prompt: `${STYLE_BASE} A 38-year-old man, deep authentic laughter. Mouth wide open showing teeth. CRITICAL — deep visible crow's feet wrinkles at the outer corners of both eyes; cheeks pushed up high; eyes narrowed by the cheek lift. AU6 + AU12 simultaneously fully engaged. Caught candidly.` },
  { cardId: 'duchenne-4', prompt: `${STYLE_BASE} A 27-year-old woman with a soft contained Duchenne smile. Closed-lip smile but the eyes prove it's genuine: visible crow's feet, slight cheek lift narrowing the eye opening. Clear AU6 engagement.` },
  { cardId: 'social-3', prompt: `${STYLE_BASE} A 40-year-old woman, professional corporate headshot smile. Closed-lip pleasant smile (AU12). CRITICAL: the skin around her eyes is COMPLETELY SMOOTH — no crow's feet, no cheek lift, no eye narrowing. Eyes calm and observing. The disconnection between smiling mouth and neutral eyes must be clear.` },
  { cardId: 'social-4', prompt: `${STYLE_BASE} A 33-year-old male LinkedIn-style professional headshot. Slight friendly smile, mouth corners up. NO eye participation: smooth skin around eyes, no AU6. Eyes look directly into camera with cool professional neutrality. The classic "polite handshake" smile.` },
  { cardId: 'fearVs-2', prompt: `${STYLE_BASE} A 38-year-old man expressing fear (designed to contrast with surprise). Brows raised AND pulled together (AU1+2+4) creating vertical creases between brows AND horizontal forehead wrinkles simultaneously. Lips stretched horizontally back. Held tense expression.` },
  { cardId: 'fearVs-3', prompt: `${STYLE_BASE} A 45-year-old woman, sharp acute fear. Brows DRAMATICALLY raised AND knit together — vertical lines AND horizontal lines on forehead at the same time. Wide eyes with white above iris. Mouth open with lips pulled into a tense horizontal rectangle.` },
  { cardId: 'surpVs-2', prompt: `${STYLE_BASE} A 38-year-old man expressing pure surprise (designed to contrast with fear). Brows raised in clean smooth arcs — NO vertical lines between brows. Long horizontal forehead wrinkles. Eyes wide. Mouth open in relaxed "OH" oval. NO horizontal lip stretch — pure jaw drop.` },
  { cardId: 'surpVs-3', prompt: `${STYLE_BASE} A 27-year-old woman, momentary surprise. Brows up in clean arches without furrow. Eyes wide. Jaw slightly dropped, mouth in small open "oh". Quick light expression with no tension.` },
  { cardId: 'controlled-anger-3', prompt: `${STYLE_BASE} A 32-year-old woman, controlled anger in a professional setting. Lips pressed thin and pale (AU24). Slight visible jaw tension. Subtle brow tension without full furrow. Cold direct stare. The face of suppressed fury.` },
  { cardId: 'controlled-anger-4', prompt: `${STYLE_BASE} A 60-year-old man with tight restrained anger. Lips firmly pressed together. Visible masseter clench (jaw muscle bulge). Lower eyelids tense (AU7). Holding eye contact with cool intensity.` },
  { cardId: 'sadness-vs-2', prompt: `${STYLE_BASE} A 30-year-old woman with textbook AU1 sadness. The inner ends of her eyebrows are pulled DRAMATICALLY UPWARD AND TOGETHER, forming the diagnostic inverted-V "house roof" shape. Center forehead has short vertical wrinkles. Mouth corners down. The most-difficult-to-fake feature of true sadness, prominently displayed.` },
  { cardId: 'sadness-vs-3', prompt: `${STYLE_BASE} A 50-year-old woman, genuine sadness. INNER edges of her brows visibly higher than the outer edges, creating the inverted-V brow shape (AU1). Subtle AU4 sweep between brows. Slight downturn of mouth.` },
  { cardId: 'fatigue-vs-2', prompt: `${STYLE_BASE} A 30-year-old woman, exhausted but NOT sad. CRITICAL: brows are FLAT and relaxed — NO AU1 inner-brow lift. Heavy upper eyelids drooping under their own weight. Slack cheek muscles. Slight downturn of mouth from gravity, not muscle action. The face of someone after 12 hours of work.` },
  { cardId: 'fatigue-vs-3', prompt: `${STYLE_BASE} A 50-year-old woman, deep fatigue with disappointment. Brows flat and heavy, NOT raised at the inner ends. Tired drooping eyelids. Visible bags under eyes. Mouth corners turned slightly down passively. No active muscle action — pure exhaustion.` },
  { cardId: 'shame-2', prompt: `${STYLE_BASE} A 35-year-old man expressing shame. Head bowed downward, gaze averted from the camera looking down and away. Hand near his mouth or chin. Slight visible blush. Body posture compressed inward. The body language of wanting to disappear from sight.` },
  { cardId: 'shame-3', prompt: `${STYLE_BASE} A 19-year-old young woman, profound shame. Head turned slightly away from camera, eyes cast down, both hands partially covering the lower face. Shoulders rolled inward. Visible cheek flush. Posture small and folded.` },
  { cardId: 'guilt-2', prompt: `${STYLE_BASE} A 40-year-old woman expressing guilt. CRITICAL: she maintains eye contact directly with the camera (unlike shame). Lips pressed together with subtle bite mark. Slight brow furrow. Posture upright and composed. Reading: she knows she did wrong and is taking responsibility, looking the viewer in the eye.` },
  { cardId: 'guilt-3', prompt: `${STYLE_BASE} A 28-year-old man, restrained guilt. Direct unflinching eye contact with the camera (unlike shame which averts). Mouth set tight, slight inner-brow tension. Composed adult posture. The face of someone owning their mistake openly.` },

  // Tier 3 additions
  { cardId: 'nostalgia-3', prompt: `${STYLE_BASE} A 40-year-old woman with bittersweet contemplation. Conflict of facial zones: AU1 in upper face (inner brows raised in sadness), AU12 in lower face (subtle closed-lip smile). NO AU6 — the smile doesn't reach the eyes. Defocused gaze looking at a memory.` },
  { cardId: 'nostalgia-4', prompt: `${STYLE_BASE} A 70-year-old man with quiet wistful remembrance. Inner ends of brows lifted (sadness signal, AU1). Soft closed-lip smile (AU12 only). Eyes slightly wet, looking past the camera. Both gratitude and grief visible at once.` },
  { cardId: 'suppressed-anger-3', prompt: `${STYLE_BASE} A 35-year-old man whose face appears nearly neutral but micro-leakage betrays suppressed anger. Lips pressed flat and slightly thinner than normal (AU24). Subtle masseter clench visible at the jaw. Tiny tension between brows without full AU4. Cold fixed gaze with reduced blink rate.` },
  { cardId: 'suppressed-anger-4', prompt: `${STYLE_BASE} A 55-year-old woman holding back fury under professional composure. Mouth a tight closed line. Tiny vertical creases between brows. Eyes hard and unblinking. Looks "controlled" at first glance but the underlying tension is visible on close inspection.` },
  { cardId: 'anxiety-3', prompt: `${STYLE_BASE} A 32-year-old woman with acute anxiety — fear in upper face, sadness in lower face. Brows raised AND slightly furrowed (fear marker AU1+2+4). Mouth corners pulled DOWN (sadness marker AU15). Lower lip slightly bitten. Eyes scanning, not focused. Worried look from competing emotional zones.` },
  { cardId: 'anxiety-4', prompt: `${STYLE_BASE} A 45-year-old man with chronic background anxiety. Brows held in elevated furrowed position (held fear). Mouth corners turned down with lower lip pulled in. Tension lines around eyes. Alert eyes that don't focus on anything specific. The face of perpetual low-grade worry.` },

  // ─── BATCH 3 — AUTHENTICITY PAIRS (genuine vs performed) ─────────────────
  // Each pair uses similar-aged subjects with the same emotion expressed two
  // ways: genuine (with the hard-to-fake AU intact) vs performed (the
  // diagnostic AU absent or wrong).

  { cardId: 'auth-joy-genuine', prompt: `${STYLE_BASE} A 32-year-old woman in genuine, unforced laughter. CRITICAL: deep crow's feet wrinkles at the outer corners of both eyes (AU6 fully engaged), cheeks pushed up high narrowing the eye openings. Mouth open mid-laugh showing teeth. AU12 strong and symmetric. The eye component proves involuntary limbic-system activation. Caught candidly.` },
  { cardId: 'auth-joy-performed', prompt: `${STYLE_BASE} A 32-year-old woman with a polished but performed smile. Mouth pulled up symmetrically (AU12) — but CRITICALLY the skin around the eyes is COMPLETELY SMOOTH, no crow's feet, no cheek lift, eyes wide and unaffected. The mouth and eyes are visibly disconnected. The classic "PR smile" — held longer than natural. Same age and similar overall demographic to her genuine counterpart.` },

  { cardId: 'auth-sadness-genuine', prompt: `${STYLE_BASE} A 40-year-old man with genuine sadness. CRITICAL DIAGNOSTIC: inner ends of his eyebrows are pulled UPWARD AND TOGETHER, forming a sharp inverted-V "house roof" shape (AU1). Center forehead has short vertical wrinkles from this muscle action. Mouth corners pulled down (AU15). Restrained but unmistakably grieving. AU1 is the "hard-to-fake" muscle.` },
  { cardId: 'auth-sadness-performed', prompt: `${STYLE_BASE} A 40-year-old man performing sadness for a camera. CRITICAL: eyebrows are FLAT and unmoved — NO AU1 inner-brow lift, no inverted-V shape. Only the mouth is doing the work — corners pulled down (AU15). The forehead is smooth. This is the actor's "sad face" — externally similar to grief but missing the involuntary AU1 marker. Same age and similar overall look.` },

  { cardId: 'auth-anger-genuine', prompt: `${STYLE_BASE} A 35-year-old woman in real anger. AU4 (knit brows), AU5 (raised upper eyelids), AU7 (tense lower eyelids), AU24 (pressed pale lips) ALL engaged. Eyes hard, focused, intense — clearly part of the emotion. Visible jaw tension. Cohesive, congruent expression.` },
  { cardId: 'auth-anger-performed', prompt: `${STYLE_BASE} A 35-year-old woman performing anger. The MOUTH is tense — pressed lips, slight scowl — but CRITICALLY the eyes stay SOFT and unfocused: no AU5 raise, no AU7 tension, gaze is normal not aggressive. Brows slightly pulled together but without real intensity. Disconnect between aggressive mouth and neutral eyes. Same age and similar overall look.` },

  { cardId: 'auth-surprise-genuine', prompt: `${STYLE_BASE} A 28-year-old man in a genuine instant of surprise — caught at the half-second peak. Brows raised in clean smooth arcs (AU1+2 only). Eyes wide, mouth opened in a relaxed round "OH" (AU26). Expression is FLEETING — face captured mid-onset, slight blur of motion in the lips suggesting the emotion is just arriving.` },
  { cardId: 'auth-surprise-performed', prompt: `${STYLE_BASE} A 28-year-old man holding a posed "surprise" expression. Mouth open in O shape, brows raised — but the expression is HELD, FROZEN, sustained for several seconds. The face looks deliberately positioned: eyes not naturally wide, brows arched too neatly, no sense of momentary onset. Performed for camera, not reacting. Same age and similar overall look.` },

  { cardId: 'auth-fear-genuine', prompt: `${STYLE_BASE} A 30-year-old woman in real acute fear. CRITICAL: eyebrows raised AND PULLED TOGETHER (AU1+2+4 — note AU4 must be present), creating BOTH horizontal forehead lines AND vertical creases between brows simultaneously. Eyes wide, sclera visible above iris (AU5). Mouth open with lips stretched HORIZONTALLY back (AU20). Visible neck tension.` },
  { cardId: 'auth-fear-performed', prompt: `${STYLE_BASE} A 30-year-old woman performing fear. Brows raised — but in CLEAN ARCS without the AU4 inward pull. No vertical creases between brows. Mouth open in a round O shape, NOT stretched horizontally (no AU20). This is closer to surprise than fear — the diagnostic AU4 + AU20 combination is missing. Same age and similar overall look.` },

  { cardId: 'auth-contempt-genuine', prompt: `${STYLE_BASE} A 38-year-old man with genuine contempt. UNMISTAKABLE ASYMMETRIC SMIRK — the LEFT corner of his mouth is tight and pulled up into an obvious dimple, while the RIGHT corner stays flat and slightly down. Half-lidded cool eyes, slight chin lift. Strong unilateral AU14 — the only basic emotion with diagnostic asymmetry.` },
  { cardId: 'auth-contempt-performed', prompt: `${STYLE_BASE} A 38-year-old man trying to look contemptuous. Both corners of his mouth are SYMMETRICALLY pulled up into a "smug smile" — looks more like a polite social smile than real contempt. The diagnostic asymmetry is missing — both sides of the face do the same thing. This is the rookie mistake when impersonating contempt. Same age and similar overall look.` },

  // ─── BATCH 4 — More authenticity pairs (added v0.5) ──────────────────────

  { cardId: 'auth-disgust-genuine', prompt: `${STYLE_BASE} A 30-year-old woman in genuine visceral disgust — like she just smelled rotting food. CRITICAL: nose is sharply WRINKLED upward (AU9 strongly engaged), creating clear horizontal creases on the nose bridge. Upper lip raised showing teeth (AU10). Lower eyelids slightly raised. This is the protective slimy-membrane reflex — it MUST involve the nose.` },
  { cardId: 'auth-disgust-performed', prompt: `${STYLE_BASE} A 30-year-old woman performing disgust — moral disdain rather than visceral. Upper lip raised (AU10) into a sneer-like configuration — but CRITICALLY the nose stays SMOOTH, no AU9 wrinkling, no creases on the nose bridge. The expression is "I disapprove" rather than "I'm about to vomit". Lips do the work, nose doesn't. Same age and similar overall look.` },

  { cardId: 'auth-smile-duchenne', prompt: `${STYLE_BASE} A 36-year-old man with a textbook Duchenne smile. Closed-lip warm smile with both AU12 (lip corners up) and AU6 (cheek raise) clearly engaged: visible crow's feet at the outer corners of both eyes, cheeks pushed up high narrowing the eye openings. Eyes slightly twinkling. Caught at a moment of genuine mild amusement.` },
  { cardId: 'auth-smile-social', prompt: `${STYLE_BASE} A 36-year-old man with a polite social smile. Closed-lip pleasant smile (AU12 only) — corners of mouth turned up symmetrically. CRITICAL: NO crow's feet, NO cheek lift, COMPLETELY SMOOTH skin around the eyes. Eyes are calm and observing. Same age and similar overall look as the Duchenne version. The classic "professional handshake smile" — friendly facade.` },

  { cardId: 'auth-shame-genuine', prompt: `${STYLE_BASE} A 28-year-old woman in genuine shame. Head bowed, gaze averted DOWN AND TO THE SIDE, hand near the lower face partially covering chin or mouth. CRITICAL: very subtle natural warmth in the cheeks — light blush, NOT theatrical or strongly red, just a faint vegetative flush. Posture compressed inward, shoulders rolled forward. The body language of wanting to disappear.` },
  { cardId: 'auth-shame-performed', prompt: `${STYLE_BASE} A 28-year-old woman performing shame. Head bowed, hand near face — but CRITICALLY no blush, skin tone is even and normal. Eyes may glance to the side but movement feels deliberate not reflexive. Posture is shrunken but feels "held" rather than involuntary. The body language of someone who knows shame is expected and is producing the visible signs without the autonomic ones. Same age and similar overall look.` },

  { cardId: 'auth-suppressed-genuine', prompt: `${STYLE_BASE} A 42-year-old man with truly suppressed anger under apparent calm. Face appears nearly neutral at first glance, but micro-leakage signs are visible: lips pressed flat and slightly thinner than normal (AU24), faint vertical creases between brows from sub-threshold AU4, jaw tension with subtle masseter bulge ("игра желваков"), cold fixed gaze with reduced blink. The "controlled but barely" look.` },
  { cardId: 'auth-suppressed-performed', prompt: `${STYLE_BASE} A 42-year-old man with simulated calm — looking neutral but without the leakage signs of real suppression. Lips relaxed, no AU24 pressing. Brow smooth, no AU4 tension. Jaw relaxed. Gaze neutral and blinking normally. This is calm, not suppressed anger. The KEY DIFFERENCE: no micro-tension anywhere. Same age and similar overall look.` },

  // ─── BATCH 5 — Authenticity variants (added v0.8) ────────────────────────
  // Two additional visual variants per existing pair, varying age/gender/
  // ethnicity. Same diagnostic AU contract — variant rotation is purely visual.

  // JOY ═══
  { cardId: 'auth-joy-genuine-2', prompt: `${STYLE_BASE} A 28-year-old man of South Asian descent in genuine, unforced laughter. CRITICAL: deep crow's feet wrinkles at the outer corners of both eyes (AU6 fully engaged), cheeks pushed up high narrowing the eye openings. Mouth open mid-laugh showing teeth. AU12 strong and symmetric. Caught candidly.` },
  { cardId: 'auth-joy-performed-2', prompt: `${STYLE_BASE} A 28-year-old man of South Asian descent with a polished but performed smile. Mouth pulled up symmetrically (AU12) — but CRITICALLY the skin around the eyes is COMPLETELY SMOOTH, no crow's feet, no cheek lift. The classic "PR smile" — held longer than natural. Same age and similar overall demographic to his genuine counterpart.` },
  { cardId: 'auth-joy-genuine-3', prompt: `${STYLE_BASE} A 55-year-old woman with deep wrinkles in genuine warm laughter. Years of laughter etched into her face. Both AU12 (lip corners up) and AU6 (cheek raise) clearly engaged with prominent crow's feet. Caught at a moment of genuine amusement.` },
  { cardId: 'auth-joy-performed-3', prompt: `${STYLE_BASE} A 55-year-old woman with a polite professional smile. Closed-lip turned-up corners (AU12 only). NO eye crinkles despite her natural laugh-line wrinkles being absent in this expression — eyes are calm and unaffected. Same age and similar overall demographic.` },

  // SADNESS ═══
  { cardId: 'auth-sadness-genuine-2', prompt: `${STYLE_BASE} A 25-year-old woman with restrained genuine sadness. CRITICAL: inner ends of her eyebrows are pulled UPWARD AND TOGETHER, forming the inverted-V "house roof" shape (AU1). Mouth corners pulled down (AU15). Eyes downcast, lashes possibly wet but not crying. Tries to hold composure.` },
  { cardId: 'auth-sadness-performed-2', prompt: `${STYLE_BASE} A 25-year-old woman performing sadness for camera. CRITICAL: eyebrows are FLAT and unmoved — NO AU1 inner-brow lift, no inverted-V shape. Only the mouth is doing the work — corners pulled down (AU15). The forehead is smooth. The actor's "sad face" without the involuntary AU1. Same age.` },
  { cardId: 'auth-sadness-genuine-3', prompt: `${STYLE_BASE} A 60-year-old man with deep contemplative genuine sadness. AU1 strongly engaged — inner brow ends lifted into clear inverted-V, with vertical center-forehead wrinkles. Mouth corners pulled down. Eyes looking past camera into middle distance. Composed but unmistakably grieving.` },
  { cardId: 'auth-sadness-performed-3', prompt: `${STYLE_BASE} A 60-year-old man performing sadness. Brows flat, no AU1 lift. Mouth corners pulled down (AU15) — only the lower face is doing the work. Forehead smooth. The composed actor's sad face without the involuntary upper-face muscle action. Same age.` },

  // ANGER ═══
  { cardId: 'auth-anger-genuine-2', prompt: `${STYLE_BASE} A 50-year-old man in real anger. AU4 (knit brows), AU5 (raised upper eyelids), AU7 (tense lower eyelids), AU24 (pressed pale lips) ALL engaged. Eyes hard, focused, intense. Visible jaw tension. Cohesive, congruent expression — eyes and mouth working together.` },
  { cardId: 'auth-anger-performed-2', prompt: `${STYLE_BASE} A 50-year-old man performing anger. The MOUTH is tense — pressed lips, slight scowl — but CRITICALLY the eyes stay SOFT and unfocused: no AU5 raise, no AU7 tension, gaze is normal not aggressive. Brows slightly pulled together but without real intensity. Disconnect between aggressive mouth and neutral eyes. Same age.` },
  { cardId: 'auth-anger-genuine-3', prompt: `${STYLE_BASE} A 28-year-old woman in sharp focused anger. AU4 deep furrow between brows, AU5 raised upper eyelids, AU7 tense lower eyelids, AU24 pressed thin lips. Eyes hard and direct. Jaw set. Anger fully integrated across face zones.` },
  { cardId: 'auth-anger-performed-3', prompt: `${STYLE_BASE} A 28-year-old woman performing anger for a camera. Lips pressed and brows knit, but eyes remain calm and unaffected — no AU5/AU7 engagement. The aggressive mouth at odds with the neutral gaze. Same age.` },

  // SURPRISE ═══
  { cardId: 'auth-surprise-genuine-2', prompt: `${STYLE_BASE} A 22-year-old woman in a genuine instant of surprise. Brows raised in clean smooth arcs (AU1+2 only — no AU4 furrow). Eyes wide, mouth opened in a relaxed round "OH" (AU26). Expression captured at the half-second peak of onset.` },
  { cardId: 'auth-surprise-performed-2', prompt: `${STYLE_BASE} A 22-year-old woman holding a posed surprise expression. Mouth open in O shape, brows raised — but the expression is HELD, FROZEN, sustained for several seconds. Eyes not naturally wide, brows arched too neatly. Performed for camera, not reacting. Same age.` },
  { cardId: 'auth-surprise-genuine-3', prompt: `${STYLE_BASE} A 45-year-old man in mid-reaction genuine surprise. Brows up in clean unbroken arches without furrow. Eyes widened. Jaw dropped into a relaxed open mouth. Caught at the instant of seeing something completely unexpected.` },
  { cardId: 'auth-surprise-performed-3', prompt: `${STYLE_BASE} A 45-year-old man with a posed surprise face. Same brow raise and open mouth — but the expression is held statically, lacks the fleeting quality of real surprise. Eyes not naturally wide. Same age.` },

  // FEAR ═══
  { cardId: 'auth-fear-genuine-2', prompt: `${STYLE_BASE} A 35-year-old man in real acute fear, frozen the moment he saw something terrible. CRITICAL: eyebrows raised AND PULLED TOGETHER (AU1+2+4), creating BOTH horizontal forehead lines AND vertical creases between brows simultaneously. Eyes wide with sclera visible above iris (AU5). Mouth open with lips stretched HORIZONTALLY back (AU20). Visible neck tension.` },
  { cardId: 'auth-fear-performed-2', prompt: `${STYLE_BASE} A 35-year-old man performing fear. Brows raised — but in CLEAN ARCS without the AU4 inward pull. No vertical creases between brows. Mouth open in a round O shape, NOT stretched horizontally (no AU20). Closer to surprise than fear. Same age.` },
  { cardId: 'auth-fear-genuine-3', prompt: `${STYLE_BASE} A 50-year-old woman in acute fear. Eyebrows raised AND pulled together (AU1+2+4 simultaneous). Both horizontal lines AND vertical creases between brows. Eyes wide showing sclera. Mouth in tense horizontal stretch (AU20). Holding the moment of terror.` },
  { cardId: 'auth-fear-performed-3', prompt: `${STYLE_BASE} A 50-year-old woman performing fear. Brows raised in clean arches without AU4. Mouth open in round O shape, no AU20 horizontal stretch. The surprise-like configuration that lacks fear's diagnostic markers. Same age.` },

  // CONTEMPT ═══
  { cardId: 'auth-contempt-genuine-2', prompt: `${STYLE_BASE} A 30-year-old woman with genuine contempt. UNMISTAKABLE ASYMMETRIC SMIRK — the LEFT corner of her mouth pulled SHARPLY UP into a tight smirk creating a visible dimple in her left cheek, while the RIGHT corner stays flat. Half-lidded cool eyes, slight chin lift. Strong unilateral AU14.` },
  { cardId: 'auth-contempt-performed-2', prompt: `${STYLE_BASE} A 30-year-old woman trying to look contemptuous. Both corners of her mouth SYMMETRICALLY pulled up into a "smug smile" — looks more like a polite social smile than real contempt. The diagnostic asymmetry is missing. Same age.` },
  { cardId: 'auth-contempt-genuine-3', prompt: `${STYLE_BASE} A 60-year-old man with deep dismissive contempt. Sharp ASYMMETRIC SMIRK — the right corner of his mouth pulled tight and up creating a visible dimple in his right cheek, while the left side stays neutral and slightly down. Half-lidded eyes, chin slightly raised. Strong unilateral AU14.` },
  { cardId: 'auth-contempt-performed-3', prompt: `${STYLE_BASE} A 60-year-old man with a symmetric attempted contempt. Both corners of mouth pulled up evenly into a smug-but-symmetric expression — closer to satisfaction than dismissive contempt. Missing diagnostic asymmetry. Same age.` },

  // DISGUST ═══
  { cardId: 'auth-disgust-genuine-2', prompt: `${STYLE_BASE} A 45-year-old man in genuine moral disgust. Nose subtly wrinkled upward (AU9), nasolabial furrow deepened. Upper lip raised exposing upper teeth on one side (AU10). Brow lowered. Visceral physical reaction visible.` },
  { cardId: 'auth-disgust-performed-2', prompt: `${STYLE_BASE} A 45-year-old man performing disgust without the visceral reflex. Upper lip raised in a sneer (AU10) — but CRITICALLY no AU9, no nose wrinkling, no nasolabial deepening. The expression is "I disapprove" not "I'm about to vomit". Lips do the work, nose doesn't. Same age.` },
  { cardId: 'auth-disgust-genuine-3', prompt: `${STYLE_BASE} A 25-year-old woman in strong physical disgust. Nose deeply wrinkled upward (AU9 — diagnostic), creating clear horizontal creases on the bridge. Upper lip raised showing teeth (AU10). Lower eyelids slightly raised. The face of smelling something rotten — protective slimy-membrane reflex.` },
  { cardId: 'auth-disgust-performed-3', prompt: `${STYLE_BASE} A 25-year-old woman performing disdain rather than disgust. Upper lip raised slightly (AU10) — but CRITICALLY no nose wrinkling at all, AU9 absent. Nose smooth. The expression of polite disapproval, not visceral revulsion. Same age.` },

  // SMILE (Duchenne vs Social) ═══
  { cardId: 'auth-smile-duchenne-2', prompt: `${STYLE_BASE} A 28-year-old woman with a textbook Duchenne smile. Closed-lip warm smile with both AU12 (lip corners up) and AU6 (cheek raise) clearly engaged: visible crow's feet at outer eye corners, cheeks pushed up high narrowing the eye openings. Eyes slightly twinkling. Captured during genuine mild amusement.` },
  { cardId: 'auth-smile-social-2', prompt: `${STYLE_BASE} A 28-year-old woman with a polite social smile. Closed-lip pleasant smile (AU12 only) — corners of mouth turned up symmetrically. CRITICAL: NO crow's feet, NO cheek lift, COMPLETELY SMOOTH skin around the eyes. Eyes calm and observing. Same age. The classic "professional handshake smile".` },
  { cardId: 'auth-smile-duchenne-3', prompt: `${STYLE_BASE} A 50-year-old woman with a Duchenne smile. Closed-lip warm smile with strong AU6 engagement: visible crow's feet, raised cheeks, narrowed eye openings. The eye component proves involuntary genuineness.` },
  { cardId: 'auth-smile-social-3', prompt: `${STYLE_BASE} A 50-year-old woman with a polite professional smile. Closed-lip turned-up corners (AU12 only). Skin around eyes smooth and calm — NO crow's feet engagement despite age (laugh lines absent in this static moment). Same age. The applied social smile.` },

  // SHAME ═══
  { cardId: 'auth-shame-genuine-2', prompt: `${STYLE_BASE} A 35-year-old man in genuine shame. Head bowed downward, gaze averted DOWN AND AWAY from the camera. Hand near the lower face partially covering chin or mouth. Very subtle natural warmth in the cheeks (light blush, not theatrical). Posture compressed inward, shoulders rolled forward. The body language of wanting to disappear from sight.` },
  { cardId: 'auth-shame-performed-2', prompt: `${STYLE_BASE} A 35-year-old man performing shame. Head bowed, hand near face — but CRITICALLY no blush, skin tone is even and normal. Eyes glance to the side but the movement feels deliberate not reflexive. Posture is shrunken but feels "held" rather than involuntary. Same age.` },
  { cardId: 'auth-shame-genuine-3', prompt: `${STYLE_BASE} A 19-year-old young woman in profound genuine shame. Head turned slightly away from camera, eyes cast down, both hands partially covering the lower face. Shoulders rolled inward. Very subtle natural cheek flush (light, not theatrical). Posture small and folded.` },
  { cardId: 'auth-shame-performed-3', prompt: `${STYLE_BASE} A 19-year-old young woman performing shame for the camera. Head turned away, hands near face — but no vegetative flush, skin tone normal. The gestures feel posed rather than involuntary. Same age.` },

  // SUPPRESSED ANGER ═══
  { cardId: 'auth-suppressed-genuine-2', prompt: `${STYLE_BASE} A 50-year-old woman with truly suppressed anger under apparent calm. Face appears nearly neutral at first glance, but micro-leakage signs are visible: lips pressed flat and slightly thinner than normal (AU24), faint vertical creases between brows from sub-threshold AU4, jaw tension with subtle masseter bulge, cold fixed gaze with reduced blink. The "controlled but barely" look.` },
  { cardId: 'auth-suppressed-performed-2', prompt: `${STYLE_BASE} A 50-year-old woman with simulated calm — looking neutral but without the leakage signs of real suppression. Lips relaxed, no AU24 pressing. Brow smooth, no AU4 tension. Jaw relaxed. Gaze neutral and blinking normally. Calm, not suppressed anger. Same age.` },
  { cardId: 'auth-suppressed-genuine-3', prompt: `${STYLE_BASE} A 30-year-old man with suppressed fury under professional composure. Face nearly neutral, but micro-tension visible: pressed flat lips with slight pallor over upper lip, faint vertical creases between brows, visible masseter clench, cold unblinking gaze. The "barely held" look.` },
  { cardId: 'auth-suppressed-performed-3', prompt: `${STYLE_BASE} A 30-year-old man with simulated calm. Lips relaxed and natural color. Brow smooth. Jaw relaxed. Gaze neutral with normal blinking. Genuine calm, not suppressed anger. The KEY DIFFERENCE: no micro-tension anywhere. Same age.` },
];
