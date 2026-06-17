# Clarity — Spec

**One line:** An AI tool that turns a confusing, high-stakes document into something anyone can understand and act on — a plain-language summary, what it means for you, an action-items-and-deadlines checklist, questions to ask, and a translation.

## Why this exists (the problem)

People navigating a new country — refugees, immigrants, and the caseworkers who help them — face a flood of dense official documents: benefits eligibility letters, court and immigration notices, housing and government forms. These are often written at a high reading level, in bureaucratic English, with critical deadlines buried in dense paragraphs. Missing a deadline or misunderstanding a notice can have serious consequences. Caseworkers don't have time to translate and explain every document line by line.

Clarity reads the document and produces a clear, structured, translated explanation in seconds — a draft a caseworker or the reader can rely on to understand what's going on and what to do next.

## Who it's for
- **Refugee and immigrant-services nonprofits** and the people they serve.
- The kind of AI tool a forward-deployed engineer would build *for* such an organization.

## What it does (MVP)

Input:
- The **document text** (pasted), and
- A **target language** for the translation.

Output — a "clarity pack":
1. **Document type** — a plain label for what the document is
2. **Plain-language summary** (~6th-grade reading level)
3. **What this means for you** — a plain interpretation
4. **Action items & deadlines** — a structured checklist (each item has a deadline or "No deadline stated")
5. **Questions to ask** — suggested questions for a caseworker, lawyer, or the issuing office
6. **Translation** of the plain-language summary into the chosen language
7. **Safety note** — every pack reminds the reader it is an AI draft to aid understanding and that important details should be verified with a qualified person before acting

## How it maps to Claude Corps criteria
- **AI experience** — long-document comprehension, **structured extraction** of actions and deadlines into typed JSON, prompt engineering for reading level and tone, translation.
- **Communication** — the product's entire purpose is making communication clear; clean README + before/after demo.
- **Societal motivation** — directly serves a vulnerable population navigating critical systems.
- **Mirrors the fellowship work** — an AI tool for a real refugee-services workflow.

## Tech
- **Next.js (App Router) + TypeScript + Tailwind**
- **Anthropic API** (`claude-opus-4-8`) in a server route (`/api/clarify`)
- **Structured output** via a zod schema
- Deployable to **Vercel**

## Responsible AI
Clarity never tells someone their legal rights or guarantees an outcome. It explains what the document says, flags what's unclear, and always directs the reader to verify important details with a qualified person.

## Build stages
1. **MVP (this build):** paste document text → clarity pack, in a clean UI. Run locally.
2. Deploy to Vercel for a live URL.
3. **Stretch:** upload a photo/PDF of a document (Claude reads it directly); multiple languages at once; audio playback of the summary; a "simplify even more" toggle.
