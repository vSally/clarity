import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { NextResponse } from "next/server";
import { ClarityPackSchema } from "@/lib/clarityPack";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Server is missing ANTHROPIC_API_KEY. Add it to .env.local and restart." },
      { status: 500 },
    );
  }

  let body: { documentText?: string; language?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const documentText = body.documentText?.trim();
  const language = body.language?.trim() || "Spanish";

  if (!documentText) {
    return NextResponse.json({ error: "Please paste the document text first." }, { status: 400 });
  }
  if (documentText.length > 20000) {
    return NextResponse.json(
      { error: "That document is very long. Paste a shorter section (under ~20,000 characters)." },
      { status: 400 },
    );
  }

  const client = new Anthropic();

  const instructions = [
    "You are Clarity, an assistant that helps people understand confusing, high-stakes documents — benefits letters, legal notices, housing and government forms.",
    "Read the document below and explain it clearly and kindly for someone who may be new to the country, may not be a native English speaker, and may find official documents stressful.",
    "Be accurate. Do not invent rights, deadlines, or facts that are not in the document. If something important is unclear or missing, say so plainly and suggest asking about it.",
    "Assess how urgent this is: 'high' if there is a near deadline or a serious consequence like losing benefits, housing, or a legal right; 'low' if it is purely informational.",
    "For keyTerms, pick the 3-6 most confusing official, legal, or bureaucratic words or phrases that actually appear in the document, and define each in simple words. If the document is already simple, return fewer or an empty list.",
    `Translate the plain-language summary into: ${language}. Use natural, simple wording in that language.`,
    "",
    "DOCUMENT:",
    documentText,
  ].join("\n");

  try {
    const response = await client.messages.parse({
      model: "claude-opus-4-8",
      max_tokens: 4000,
      messages: [{ role: "user", content: instructions }],
      output_config: { format: zodOutputFormat(ClarityPackSchema) },
    });

    if (!response.parsed_output) {
      return NextResponse.json(
        { error: "Could not interpret this document. Try pasting a cleaner copy of the text." },
        { status: 502 },
      );
    }

    return NextResponse.json({ clarityPack: response.parsed_output });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "Invalid Anthropic API key." }, { status: 401 });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Rate limited. Wait a moment and try again." },
        { status: 429 },
      );
    }
    const message = error instanceof Error ? error.message : "Unknown error.";
    return NextResponse.json({ error: `Something went wrong: ${message}` }, { status: 500 });
  }
}
