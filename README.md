# Clarity

**Understand any official document.** Paste a confusing benefits letter, court notice, or government form and Clarity uses Claude to return a plain-language explanation, a checklist of what to do (with deadlines), questions you could ask, and a translation into your language — with a reminder to verify important details with a qualified person.

![status](https://img.shields.io/badge/stage-MVP-blue)

## Why

People navigating a new country — refugees, immigrants, and the caseworkers helping them — face a flood of dense official documents with critical deadlines buried in bureaucratic English. Missing one can have serious consequences. Clarity turns that document into something clear, structured, and translated in seconds.

## What it generates

From pasted document text (plus a target language), Clarity returns:

1. **Document type** — what kind of document it is
2. **Urgency level** — a color-coded badge (act soon / don't delay / informational) with the reason
3. **Plain-language summary** — ~6th-grade reading level
4. **What this means for you** — a plain interpretation
5. **Action items & deadlines** — a structured checklist
6. **Confusing words, explained** — a plain-language glossary of the document's official/legal jargon
7. **Questions to ask** — for a caseworker, lawyer, or the issuing office
8. **Translation** — the summary in a language you choose (one-click copy)
9. **Safety note** — every result is an AI draft; verify important details with a qualified person

The home page also offers **six realistic sample documents** (benefits, immigration, housing,
court, medical, utilities) to try instantly, quick-select chips for common languages, and an
**"Already explained" tab** that saves past results in your browser.

## Tech

- **Next.js (App Router) + TypeScript + Tailwind CSS**
- **Anthropic API** — `claude-opus-4-8` with structured (schema-validated) output
- Designed to deploy to **Vercel**

## Run it locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Add your Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com); new accounts get free trial credits):
   ```bash
   cp .env.local.example .env.local
   # then edit .env.local and paste your key
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open <http://localhost:3000>, click a **sample document** (or paste your own), pick a language, and click **Explain this document**.

## Roadmap

- [x] One-click sample documents and quick-select languages
- [x] Urgency rating and a plain-language glossary of confusing terms
- [x] Saved history of past explanations
- [x] Deployed to Vercel with a public demo URL
- [ ] Upload a photo or PDF of a document (Claude reads it directly)
- [ ] Generate translations in several languages at once
- [ ] Audio playback of the plain-language summary
- [ ] A "simplify even more" toggle for lower reading levels

---

Built as a portfolio project exploring AI for mission-driven organizations. See [SPEC.md](SPEC.md) for the full design.
