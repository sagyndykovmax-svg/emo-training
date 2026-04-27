/**
 * AI-judge endpoint for free-text answers in /train.
 *
 * NOTE: this is the FIRST runtime AI-dependent route in the project. The
 * project's stated principle in CLAUDE.md was "runtime stays key-less,
 * AI is build-time only" — this route is a deliberate exception for the
 * AI-judge feature, which fundamentally requires per-answer LLM evaluation.
 *
 * Provider: Google Gemini 2.5 Pro (uses GOOGLE_GENAI_API_KEY env var that
 * is already configured for the build-time generate-images script). No
 * separate provider account needed.
 *
 * Cost: ~$0.002 per call at current Gemini 2.5 Pro pricing
 * (input ~$1.25/M tokens, output ~$5/M tokens, ~500 in / ~300 out per call).
 *
 * Rate limiting: not implemented in v1. Add IP-based debounce + daily cap
 * if abuse becomes visible in Vercel Analytics.
 */

import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { EMOTIONS, type EmotionId } from '@/data/emotions';

export const runtime = 'nodejs';

// Hard cap on user input to prevent prompt-injection ballooning + cost runaway.
const MAX_USER_TEXT_LENGTH = 800;

interface JudgeRequest {
  cardId: string;
  emotionId: EmotionId;
  userText: string;
}

export interface JudgeResponse {
  /** 0 = completely missed, 100 = textbook-perfect description. */
  score: number;
  /** One-sentence overall verdict shown at the top of feedback. */
  verdict: string;
  /** Markers the user correctly identified or alluded to. */
  foundMarkers: string[];
  /** Diagnostic markers the user missed — what to look for next time. */
  missedMarkers: string[];
  /** 1-2 sentences of pedagogical guidance for the user. */
  guidance: string;
}

export async function POST(req: Request) {
  let body: JudgeRequest;
  try {
    body = (await req.json()) as JudgeRequest;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  // Validation
  if (!body.cardId || !body.emotionId || typeof body.userText !== 'string') {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }
  if (body.userText.length > MAX_USER_TEXT_LENGTH) {
    return NextResponse.json(
      { error: 'too_long', max: MAX_USER_TEXT_LENGTH },
      { status: 400 },
    );
  }
  if (body.userText.trim().length < 5) {
    return NextResponse.json({ error: 'too_short' }, { status: 400 });
  }
  const emotion = EMOTIONS[body.emotionId];
  if (!emotion) {
    return NextResponse.json({ error: 'unknown_emotion' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'judge_not_configured' }, { status: 503 });
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemPrompt = `Ты — преподаватель FACS (Facial Action Coding System) Пола Экмана и физиогномической традиции (Лафатер, Велховер, Хигир).

Твоя задача: оценить, насколько точно пользователь описал эмоцию по лицу. Ты НЕ оцениваешь литературное качество текста — только точность распознавания мимических маркеров.

Правила:
1. score: 0-100. 90+ за точное определение эмоции + 2+ корректных маркеров. 70-89 за правильную эмоцию + 1 маркер. 40-69 за правильную эмоцию без маркеров ИЛИ за родственную эмоцию (например "тревога" вместо "страх") с маркерами. 0-39 за неверную эмоцию или отсутствие конкретики.
2. verdict: одно предложение, тон уважительный.
3. foundMarkers: какие из ожидаемых маркеров пользователь упомянул (синонимы засчитываются — "сведённые брови" = AU4, "морщины у глаз" = AU6, etc.).
4. missedMarkers: какие диагностические маркеры пользователь НЕ заметил (с пояснением).
5. guidance: 1-2 предложения, что обратить внимание в следующий раз.

Отвечай строго в JSON-формате без обрамления markdown.`;

  const userPrompt = `Эмоция (правильный ответ): "${emotion.ru}"
Краткое описание эмоции: ${emotion.short}
Ожидаемые мимические маркеры:
${emotion.markers.map((m, i) => `${i + 1}. ${m}`).join('\n')}

Описание пользователя:
"${body.userText.replace(/"/g, '\\"')}"

Оцени описание пользователя. Верни JSON с полями: score (number 0-100), verdict (string), foundMarkers (string[]), missedMarkers (string[]), guidance (string).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const text = response.text;
    if (!text) {
      return NextResponse.json({ error: 'empty_response' }, { status: 502 });
    }

    let parsed: JudgeResponse;
    try {
      parsed = JSON.parse(text) as JudgeResponse;
    } catch {
      return NextResponse.json({ error: 'invalid_response_format' }, { status: 502 });
    }

    // Defensive shape validation.
    const safe: JudgeResponse = {
      score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
      verdict: String(parsed.verdict ?? '').slice(0, 300),
      foundMarkers: Array.isArray(parsed.foundMarkers)
        ? parsed.foundMarkers.slice(0, 8).map((m) => String(m).slice(0, 200))
        : [],
      missedMarkers: Array.isArray(parsed.missedMarkers)
        ? parsed.missedMarkers.slice(0, 8).map((m) => String(m).slice(0, 200))
        : [],
      guidance: String(parsed.guidance ?? '').slice(0, 500),
    };

    return NextResponse.json(safe);
  } catch (err) {
    console.error('judge route error', err);
    return NextResponse.json(
      { error: 'judge_failed', message: (err as Error).message },
      { status: 500 },
    );
  }
}
