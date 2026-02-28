# ghostwriter-api

REST API that analyzes writing style from samples and generates new text matching that style. Powered by GPT-4o-mini.

## Quickstart

```bash
npm install
OPENAI_API_KEY=sk-... npm start
```

Server runs on port 3456 (override with `PORT` env var).

## Endpoints

### `POST /analyze`

Extract a style profile from writing samples.

**Request:**
```json
{
  "samples": [
    "First writing sample...",
    "Second writing sample..."
  ]
}
```

**Response:**
```json
{
  "style_profile": {
    "tone": "conversational, slightly sardonic",
    "voice": "first-person, intimate",
    "sentence_structure": "short declarative sentences mixed with longer compound ones",
    "vocabulary_level": "moderate",
    "rhetorical_devices": ["metaphor", "understatement"],
    "pacing": "fast",
    "distinctive_patterns": ["sentence fragments for emphasis", "em-dashes"],
    "summary": "Direct, punchy prose..."
  },
  "samples_analyzed": 2
}
```

### `POST /generate`

Generate text in a given style.

**Request:**
```json
{
  "style_profile": { "...from /analyze..." },
  "prompt": "Write a blog post about morning coffee"
}
```

**Response:**
```json
{
  "text": "Generated text matching the style...",
  "model": "gpt-4o-mini"
}
```

### `GET /health`

Returns `{ "status": "ok" }`.

## Docker

```bash
docker build -t ghostwriter-api .
docker run -p 3456:3456 -e OPENAI_API_KEY=sk-... ghostwriter-api
```

## Pricing

**Self-hosted** — free forever. You pay only OpenAI API costs:
- GPT-4o-mini: ~$0.15/1M input tokens, ~$0.60/1M output tokens
- Typical /analyze call: ~$0.001
- Typical /generate call: ~$0.001

**Managed API** (coming soon): $0.01/request, no OpenAI key needed.

## License

MIT — built by Oneiro.
