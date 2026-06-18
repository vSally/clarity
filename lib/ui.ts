// All user-facing interface strings, in English. The whole page renders from
// this object so it can be translated on demand (see /api/translate-ui).
// The brand name "Clarity" is intentionally NOT included — it stays as-is.

export const defaultUI = {
  tagline:
    "Official documents can be confusing and stressful — especially in a new country. Paste a benefits letter, immigration notice, or court form and Clarity explains it in plain language, tells you what to do and by when, defines the hard words, and translates it.",
  langLabel: "Language",
  translating: "Translating page…",
  tabExplain: "Explain a document",
  tabHistory: "Already explained",
  samplesHeading: "Try a sample document",
  samplesHint: "Click one to load it, then press Explain",
  docLabel: "Document text",
  docPlaceholder: "Paste the full text of the letter or form here…",
  explain: "Explain this document",
  explaining: "Reading the document…",
  outputEmpty: "The plain-language explanation will appear here.",
  needText: "Paste the document text first, or pick a sample below.",
  secPlain: "In plain language",
  secMeans: "What this means for you",
  secDo: "What to do",
  noAction: "No specific action is required.",
  deadline: "Deadline:",
  secTerms: "Confusing words, explained",
  secQuestions: "Questions you could ask",
  secHelp: "Where to get help",
  scamTitle: "This may be a scam — be careful",
  resourcesTitle: "Free help, nationwide",
  resourcesHint:
    "Free services that connect you to local help. Clarity is not affiliated with them.",
  r211: "Call 2-1-1 — free, confidential help finding local services, available 24/7 in many languages.",
  rFindhelp: "findhelp.org — search free and low-cost local services by ZIP code.",
  rLawhelp: "LawHelp.org — find free legal aid programs in your state.",
  rImmi: "immigrationlawhelp.org — a directory of free and low-cost immigration legal help.",
  listen: "Listen",
  listenStop: "Stop",
  secTranslation: "Translation",
  copy: "Copy",
  copied: "Copied!",
  urgentHigh: "Act soon",
  urgentMed: "Don't delay",
  urgentLow: "Informational",
  histEmpty: "Nothing here yet. Explain a document and it will be saved to this tab.",
  histSaved: "Saved on this device. Click any item to reopen its full explanation.",
  clearHistory: "Clear history",
  backToAll: "Back to all",
  translatedInto: "translated into",
  // Sample document labels (the document body text itself is never translated)
  s0label: "Benefits expiring",
  s0kind: "SNAP / food assistance",
  s1label: "Immigration appointment",
  s1kind: "USCIS biometrics notice",
  s2label: "Pay rent or leave",
  s2kind: "Housing / eviction notice",
  s3label: "Court summons",
  s3kind: "Civil court notice",
  s4label: "Medical bill",
  s4kind: "Final notice / collections",
  s5label: "Utility shut-off",
  s5kind: "Disconnection notice",
};

export type UI = typeof defaultUI;

// Languages offered in the top-of-page switcher. "English" resets to defaults.
export const PAGE_LANGUAGES = [
  "English",
  "Spanish",
  "Arabic",
  "Ukrainian",
  "Haitian Creole",
  "Dari",
  "Swahili",
  "French",
  "Mandarin",
  "Somali",
  "Vietnamese",
];

// Native name (endonym) for each offered language, so someone who can't read
// English can still find their own language in the switcher. The English key is
// kept as the value everywhere else (API, RTL/code lookups); only the label changes.
export const LANG_ENDONYMS: Record<string, string> = {
  English: "English",
  Spanish: "Español",
  Arabic: "العربية",
  Ukrainian: "Українська",
  "Haitian Creole": "Kreyòl Ayisyen",
  Dari: "دری",
  Swahili: "Kiswahili",
  French: "Français",
  Mandarin: "中文",
  Somali: "Soomaali",
  Vietnamese: "Tiếng Việt",
};

// Languages that read right-to-left.
export const RTL_LANGUAGES = ["Arabic", "Dari", "Pashto", "Urdu", "Farsi", "Persian", "Hebrew"];

// Map language names to BCP-47 codes for the document's `lang` attribute (a11y).
export const LANG_CODES: Record<string, string> = {
  English: "en",
  Spanish: "es",
  Arabic: "ar",
  Ukrainian: "uk",
  "Haitian Creole": "ht",
  Dari: "prs",
  Swahili: "sw",
  French: "fr",
  Mandarin: "zh",
  Somali: "so",
  Vietnamese: "vi",
};
