import { z } from "zod";

// The structured "clarity pack" produced for a confusing document.
export const ClarityPackSchema = z.object({
  documentType: z
    .string()
    .describe(
      "A short plain label for what kind of document this is, e.g. 'Benefits eligibility letter' or 'Court notice'.",
    ),
  urgency: z
    .object({
      level: z
        .enum(["high", "medium", "low"])
        .describe(
          "How time-sensitive this is. 'high' if there is a near deadline or serious consequence, 'low' if informational only.",
        ),
      reason: z
        .string()
        .describe("One short sentence explaining why it is this urgent."),
    })
    .describe("How urgently the reader needs to act."),
  plainSummary: z
    .string()
    .describe("A plain-language summary of the document at roughly a 6th-grade reading level."),
  whatThisMeans: z
    .string()
    .describe("A plain explanation of what this means for the reader and why it matters to them."),
  actionItems: z
    .array(
      z.object({
        action: z.string().describe("One thing the reader needs to do."),
        deadline: z
          .string()
          .describe("When it must be done by, or 'No deadline stated' if none is given."),
      }),
    )
    .describe("The concrete steps the reader should take, with deadlines."),
  keyTerms: z
    .array(
      z.object({
        term: z.string().describe("A confusing or official word or phrase from the document."),
        definition: z.string().describe("A simple, plain-language explanation of that term."),
      }),
    )
    .describe(
      "A short glossary of the most confusing official or legal terms used in the document, explained simply.",
    ),
  questionsToAsk: z
    .array(z.string())
    .describe("Helpful questions the reader could ask a caseworker, lawyer, or the issuing office."),
  translation: z
    .string()
    .describe("The plain-language summary translated into the requested target language."),
  safetyNote: z
    .string()
    .describe(
      "A reminder that this is an AI-generated draft to aid understanding, and important details should be verified with a qualified person before acting.",
    ),
});

export type ClarityPack = z.infer<typeof ClarityPackSchema>;
