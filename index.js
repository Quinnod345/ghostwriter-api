import express from 'express';
import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load API key from env or ~/.env.local
if (!process.env.OPENAI_API_KEY) {
  try {
    const envLocal = readFileSync(resolve(process.env.HOME, '.env.local'), 'utf8');
    const match = envLocal.match(/OPENAI_API_KEY="?([^"\n]+)"?/);
    if (match) process.env.OPENAI_API_KEY = match[1];
  } catch {}
}

const openai = new OpenAI();
const app = express();
app.use(express.json({ limit: '5mb' }));

const MODEL = 'gpt-4o-mini';

// POST /analyze — extract a style profile from writing samples
app.post('/analyze', async (req, res) => {
  try {
    const { samples } = req.body;
    if (!samples || !Array.isArray(samples) || samples.length === 0) {
      return res.status(400).json({ error: 'Provide { samples: string[] }' });
    }

    const numbered = samples.map((s, i) => `--- Sample ${i + 1} ---\n${s}`).join('\n\n');

    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a literary style analyst. Given writing samples, produce a JSON style profile with these fields:
- tone (string): overall emotional tone
- voice (string): narrative voice description  
- sentence_structure (string): patterns in sentence length/complexity
- vocabulary_level (string): simple/moderate/advanced/mixed
- rhetorical_devices (string[]): devices used (metaphor, irony, etc.)
- pacing (string): fast/moderate/slow/varied
- distinctive_patterns (string[]): unique quirks or habits
- summary (string): 2-3 sentence overall style summary`
        },
        { role: 'user', content: `Analyze the writing style of these samples:\n\n${numbered}` }
      ]
    });

    const profile = JSON.parse(completion.choices[0].message.content);
    res.json({ style_profile: profile, samples_analyzed: samples.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /generate — generate text matching a style profile
app.post('/generate', async (req, res) => {
  try {
    const { style_profile, prompt } = req.body;
    if (!style_profile || !prompt) {
      return res.status(400).json({ error: 'Provide { style_profile: object, prompt: string }' });
    }

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a ghostwriter. Write in exactly the style described by this profile:\n\n${JSON.stringify(style_profile, null, 2)}\n\nMatch the tone, voice, sentence structure, vocabulary, and distinctive patterns precisely. Output ONLY the generated text, no meta-commentary.`
        },
        { role: 'user', content: prompt }
      ]
    });

    res.json({ text: completion.choices[0].message.content, model: MODEL });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3456;
app.listen(PORT, () => console.log(`ghostwriter-api listening on :${PORT}`));
