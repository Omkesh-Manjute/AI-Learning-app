// ============================================================
// AI Test Generation Service
// Supports: Groq (FREE ✅) | Gemini (FREE ✅) | OpenAI (Paid 💰)
// ============================================================

export const PROVIDERS = {
  groq: {
    name: 'Groq (Llama 3)',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama3-8b-8192',
    badge: '⚡ Free & Fast',
    docsUrl: 'https://console.groq.com/keys',
  },
  gemini: {
    name: 'Google Gemini',
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    model: 'gemini-2.0-flash',
    badge: '🌟 Free Tier',
    docsUrl: 'https://aistudio.google.com/app/apikey',
  },
  openai: {
    name: 'OpenAI GPT-4o mini',
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    badge: '💰 Paid',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
};

// Auto-detect from Vite env variables (set in .env or Vercel dashboard)
export function getAutoProvider() {
  if (import.meta.env.VITE_GROQ_API_KEY)
    return { provider: 'groq', apiKey: import.meta.env.VITE_GROQ_API_KEY };
  if (import.meta.env.VITE_GEMINI_API_KEY)
    return { provider: 'gemini', apiKey: import.meta.env.VITE_GEMINI_API_KEY };
  if (import.meta.env.VITE_OPENAI_API_KEY)
    return { provider: 'openai', apiKey: import.meta.env.VITE_OPENAI_API_KEY };
  return null;
}

function buildPrompt(chapter, questionCount, questionTypes) {
  const typeInstructions = questionTypes.map(t => {
    if (t === 'mcq')          return 'Multiple Choice (exactly 4 options)';
    if (t === 'true_false')   return 'True/False';
    if (t === 'short_answer') return 'Short Answer';
    return t;
  }).join(', ');

  return `You are an expert teacher making a test for Class ${chapter.class} students.
Chapter: "${chapter.title}" | Subject: ${chapter.subject}
Content: ${(chapter.content || chapter.description || '').slice(0, 2000)}

Generate EXACTLY ${questionCount} questions. Types to use: ${typeInstructions}. Distribute evenly.

Return ONLY a raw JSON array, no markdown, no backticks. Start with [ directly.

[
  {"type":"mcq","question":"...","options":["A","B","C","D"],"correctAnswer":"A","explanation":"..."},
  {"type":"true_false","question":"...","correctAnswer":"true","explanation":"..."},
  {"type":"short_answer","question":"...","correctAnswer":"...","explanation":"..."}
]

Keep language simple and appropriate for Class ${chapter.class}.`;
}

function parseJSON(text) {
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('Could not find JSON array in AI response');
  const arr = JSON.parse(match[0]);
  if (!Array.isArray(arr)) throw new Error('AI response is not an array');
  return arr.map((q, i) => ({ ...q, id: `q${i + 1}` }));
}

async function callOpenAICompatible(url, apiKey, model, prompt) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 3000,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callGemini(apiKey, prompt) {
  const res = await fetch(`${PROVIDERS.gemini.url}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 3000 },
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini error ${res.status}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function generateTestWithAI({ apiKey, provider = 'groq', chapter, questionCount, questionTypes }) {
  if (!apiKey) return generateFallbackTest({ chapter, questionCount, questionTypes });

  const prompt = buildPrompt(chapter, questionCount, questionTypes);
  let rawText = '';

  if (provider === 'groq') {
    rawText = await callOpenAICompatible(PROVIDERS.groq.url, apiKey, PROVIDERS.groq.model, prompt);
  } else if (provider === 'gemini') {
    rawText = await callGemini(apiKey, prompt);
  } else if (provider === 'openai') {
    rawText = await callOpenAICompatible(PROVIDERS.openai.url, apiKey, PROVIDERS.openai.model, prompt);
  } else {
    throw new Error(`Unknown provider: ${provider}`);
  }

  return parseJSON(rawText);
}

export function generateFallbackTest({ chapter, questionCount, questionTypes }) {
  const questions = [];
  const types = questionTypes.length > 0 ? questionTypes : ['mcq', 'true_false', 'short_answer'];

  const pool = {
    mcq: [
      { question: `What is the main subject of "${chapter.title}"?`, options: [chapter.subject, 'History', 'Geography', 'Sports'], correctAnswer: chapter.subject, explanation: `This chapter belongs to ${chapter.subject}.` },
      { question: `"${chapter.title}" is for which class?`, options: ['5', '8', chapter.class, '12'], correctAnswer: chapter.class, explanation: `This chapter is for Class ${chapter.class}.` },
      { question: `Which subject is "${chapter.title}" part of?`, options: [chapter.subject, 'Physical Education', 'Fine Arts', 'Music'], correctAnswer: chapter.subject, explanation: `It is a ${chapter.subject} chapter.` },
    ],
    true_false: [
      { question: `"${chapter.title}" is studied in Class ${chapter.class}.`, correctAnswer: 'true', explanation: `Yes, this chapter is for Class ${chapter.class}.` },
      { question: `${chapter.subject} is an important school subject.`, correctAnswer: 'true', explanation: `Yes, ${chapter.subject} is a core subject.` },
      { question: `"${chapter.title}" is a chapter about Sports.`, correctAnswer: 'false', explanation: `No, it is about ${chapter.subject}.` },
    ],
    short_answer: [
      { question: `What is the title of this chapter?`, correctAnswer: chapter.title, explanation: `The chapter is titled "${chapter.title}".` },
      { question: `Which subject does this chapter belong to?`, correctAnswer: chapter.subject, explanation: `This is a ${chapter.subject} chapter.` },
      { question: `Write one thing you will learn from this chapter.`, correctAnswer: chapter.description || chapter.title, explanation: chapter.description || `This chapter covers ${chapter.title}.` },
    ],
  };

  const idx = { mcq: 0, true_false: 0, short_answer: 0 };
  for (let i = 0; i < questionCount; i++) {
    const type = types[i % types.length];
    const list = pool[type] || pool.mcq;
    const item = list[idx[type] % list.length];
    idx[type] = (idx[type] || 0) + 1;
    questions.push({ id: `q${i + 1}`, type, ...item });
  }
  return questions;
}
