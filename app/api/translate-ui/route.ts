import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

// Translate an ordered list of short UI strings into the target language,
// returning the same number of strings in the same order.
const TranslationSchema = z.object({
  values: z
    .array(z.string())
    .describe("The translated strings, in the same order and count as the input."),
});

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Server is missing ANTHROPIC_API_KEY." },
      { status: 500 },
    );
  }

  let body: { language?: string; values?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const language = body.language?.trim();
  const values = body.values;
  if (!language || !Array.isArray(values) || values.length === 0) {
    return NextResponse.json({ error: "Missing language or values." }, { status: 400 });
  }

  const client = new Anthropic();

  const instructions = [
    `You are translating the user-interface text of a web app into ${language}.`,
    "Translate each string naturally and simply, as it would appear in a friendly, accessible app for people who may be new to the country.",
    "Keep it concise. Do not add explanations. Keep any punctuation like ':' or '…' where it makes sense.",
    "Return exactly the same number of strings, in the same order. If a string is a proper noun or should not change, return it unchanged.",
    "",
    "STRINGS (JSON array):",
    JSON.stringify(values),
  ].join("\n");

  try {
    const response = await client.messages.parse({
      model: "claude-opus-4-8",
      max_tokens: 2000,
      messages: [{ role: "user", content: instructions }],
      output_config: { format: zodOutputFormat(TranslationSchema) },
    });

    const out = response.parsed_output;
    if (!out || out.values.length !== values.length) {
      return NextResponse.json(
        { error: "Translation came back malformed. Try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ values: out.values });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "Invalid Anthropic API key." }, { status: 401 });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Rate limited. Try again shortly." }, { status: 429 });
    }
    const message = error instanceof Error ? error.message : "Unknown error.";
    return NextResponse.json({ error: `Something went wrong: ${message}` }, { status: 500 });
  }
}
