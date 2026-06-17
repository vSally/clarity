"use client";

import { useEffect, useState } from "react";
import type { ClarityPack } from "@/lib/clarityPack";

// Realistic, fictional sample documents people commonly struggle with.
type Sample = { icon: string; label: string; kind: string; text: string };

const SAMPLES: Sample[] = [
  {
    icon: "🍎",
    label: "Benefits expiring",
    kind: "SNAP / food assistance",
    text: `NOTICE OF EXPIRATION OF BENEFITS

Case Number: 4471-22B

Dear Recipient,

Our records indicate that your Supplemental Nutrition Assistance benefits are scheduled to terminate effective the last day of the current certification period. To avoid an interruption in benefits, you must complete a recertification interview and submit all required verification documents, including proof of income and proof of residence, no later than thirty (30) days from the date of this notice.

Failure to respond by the stated deadline will result in case closure. If your case is closed, you will be required to submit a new application and may experience a lapse in assistance. You have the right to request a fair hearing within 90 days if you disagree with this determination.`,
  },
  {
    icon: "🛂",
    label: "Immigration appointment",
    kind: "USCIS biometrics notice",
    text: `U.S. CITIZENSHIP AND IMMIGRATION SERVICES
APPLICATION SUPPORT CENTER APPOINTMENT NOTICE

The above application has been received and processed by USCIS. You are required to appear at the below Application Support Center for biometrics services. Please bring this notice and a valid photo identification.

You will be required to provide your fingerprints, photograph, and/or signature. Failure to appear for this appointment as scheduled may result in denial of your application pursuant to Title 8, Code of Federal Regulations. If you are unable to appear, you must submit a written request to reschedule before your scheduled date.`,
  },
  {
    icon: "🏠",
    label: "Pay rent or leave",
    kind: "Housing / eviction notice",
    text: `NOTICE TO PAY RENT OR QUIT

TO: Tenant(s) in possession

YOU ARE HEREBY NOTIFIED that rent is now past due and owing on the premises you currently occupy in the amount of one thousand four hundred fifty dollars ($1,450.00).

You are required to pay the full amount due or to vacate and surrender possession of the premises within FOURTEEN (14) DAYS of service of this notice. Failure to comply will result in the commencement of legal proceedings to recover possession of the premises, which may include a judgment for unpaid rent, court costs, and attorney's fees.`,
  },
  {
    icon: "⚖️",
    label: "Court summons",
    kind: "Civil court notice",
    text: `SUMMONS — CIVIL

NOTICE TO DEFENDANT: You have been sued. The court may decide against you without your being heard unless you respond within 20 days.

You have 20 CALENDAR DAYS after this summons and legal papers are served on you to file a written response at this court and have a copy served on the plaintiff. A letter or phone call will not protect you. If you do not file your response on time, you may lose the case by default, and your wages, money, and property may be taken without further warning from the court.`,
  },
  {
    icon: "🏥",
    label: "Medical bill",
    kind: "Final notice / collections",
    text: `FINAL NOTICE BEFORE COLLECTION

Statement Date: [date]
Account Balance: $612.38

This is a final notice regarding the outstanding balance on your account for services rendered. Our records show that previous statements have gone unpaid.

Please remit payment in full within 30 days of the date of this notice. If payment is not received, your account may be referred to a third-party collection agency, and this delinquency may be reported to the credit bureaus, which could affect your credit score. If you believe this balance is incorrect or you are unable to pay, please contact our billing office to discuss financial assistance or a payment plan.`,
  },
  {
    icon: "💡",
    label: "Utility shut-off",
    kind: "Disconnection notice",
    text: `IMPORTANT NOTICE — RISK OF DISCONNECTION

Account is past due in the amount of $238.74.

To avoid interruption of your electric service, payment must be received by the disconnection date listed above. If payment is not received, service may be disconnected without further notice, and a reconnection fee plus a security deposit may be required to restore service.

If you are unable to pay the full amount, you may qualify for a payment arrangement or energy assistance program. Customers who depend on electric-powered medical equipment may be eligible for protection from disconnection by submitting a certified medical form.`,
  },
];

const LANGUAGES = [
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

type HistoryEntry = {
  id: string;
  createdAt: number;
  documentType: string;
  language: string;
  urgency: ClarityPack["urgency"]["level"];
  pack: ClarityPack;
};

const HISTORY_KEY = "clarity:history:v1";
const HISTORY_LIMIT = 15;

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  let trimmed = entries.slice(0, HISTORY_LIMIT);
  while (trimmed.length > 0) {
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
      return;
    } catch {
      trimmed = trimmed.slice(0, -1);
    }
  }
}

export default function Home() {
  const [tab, setTab] = useState<"explain" | "history">("explain");
  const [documentText, setDocumentText] = useState("");
  const [language, setLanguage] = useState("Spanish");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClarityPack | null>(null);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  async function clarify(text?: string) {
    const doc = (text ?? documentText).trim();
    if (!doc) {
      setError("Paste the document text first, or pick a sample below.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentText: doc, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed.");
      const pack = data.clarityPack as ClarityPack;
      setResult(pack);

      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
        documentType: pack.documentType,
        language,
        urgency: pack.urgency.level,
        pack,
      };
      setHistory((prev) => {
        const next = [entry, ...prev].slice(0, HISTORY_LIMIT);
        saveHistory(next);
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function pickSample(s: Sample) {
    setTab("explain");
    setDocumentText(s.text);
    setResult(null);
    setError(null);
  }

  function clearHistory() {
    setHistory([]);
    setSelectedId(null);
    try {
      window.localStorage.removeItem(HISTORY_KEY);
    } catch {
      /* ignore */
    }
  }

  const selected = history.find((h) => h.id === selectedId) ?? null;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Clarity</h1>
        <p className="mt-2 max-w-3xl text-lg text-slate-600">
          Official documents can be confusing and stressful — especially in a new country. Paste a
          benefits letter, immigration notice, or court form and Clarity explains it in plain
          language, tells you what to do and by when, defines the hard words, and translates it.
        </p>
      </header>

      {/* Tabs */}
      <div className="mb-8 flex gap-1 border-b border-slate-200">
        <TabButton active={tab === "explain"} onClick={() => setTab("explain")}>
          Explain a document
        </TabButton>
        <TabButton active={tab === "history"} onClick={() => setTab("history")}>
          Already explained{history.length > 0 ? ` (${history.length})` : ""}
        </TabButton>
      </div>

      {tab === "explain" ? (
        <>
          {/* Sample gallery */}
          <section className="mb-10">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Try a sample document
              </h2>
              <span className="text-xs text-slate-400">Click one to load it, then press Explain</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {SAMPLES.map((s) => (
                <button
                  key={s.label}
                  onClick={() => pickSample(s)}
                  className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 text-left transition hover:border-blue-400 hover:bg-blue-50/40"
                >
                  <span className="text-2xl leading-none">{s.icon}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-slate-800">{s.label}</span>
                    <span className="block truncate text-xs text-slate-500">{s.kind}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Input */}
            <section className="space-y-4">
              <label htmlFor="doc" className="block text-sm font-medium text-slate-700">
                Document text
              </label>
              <textarea
                id="doc"
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                rows={14}
                placeholder="Paste the full text of the letter or form here…"
                className="block w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
              />

              <div>
                <span className="text-sm font-medium text-slate-700">Translate into</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {LANGUAGES.map((lng) => (
                    <button
                      key={lng}
                      type="button"
                      onClick={() => setLanguage(lng)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        language === lng
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-300 text-slate-600 hover:border-slate-500"
                      }`}
                    >
                      {lng}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="…or type another language"
                  className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
                />
              </div>

              <button
                onClick={() => clarify()}
                disabled={loading}
                className="w-full rounded-md bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
              >
                {loading ? "Reading the document…" : "Explain this document"}
              </button>

              {error && (
                <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              )}
            </section>

            {/* Output */}
            <section>
              {result ? (
                <PackView pack={result} />
              ) : (
                <div className="flex h-full min-h-64 items-center justify-center rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-400">
                  {loading
                    ? "Reading the document…"
                    : "The plain-language explanation will appear here."}
                </div>
              )}
            </section>
          </div>
        </>
      ) : (
        /* History tab */
        <div>
          {history.length === 0 ? (
            <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-400">
              Nothing here yet. Explain a document and it will be saved to this tab.
            </div>
          ) : selected ? (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedId(null)}
                className="text-sm font-medium text-slate-600 hover:underline"
              >
                ← Back to all
              </button>
              <p className="text-xs text-slate-400">
                {new Date(selected.createdAt).toLocaleString()} · translated into {selected.language}
              </p>
              <PackView pack={selected.pack} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Saved on this device. Click any item to reopen its full explanation.
                </p>
                <button
                  onClick={clearHistory}
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Clear history
                </button>
              </div>
              <ul className="space-y-2">
                {history.map((h) => (
                  <li key={h.id}>
                    <button
                      onClick={() => setSelectedId(h.id)}
                      className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-3 text-left transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      <UrgencyDot level={h.urgency} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-800">{h.documentType}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(h.createdAt).toLocaleDateString()} · {h.language}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function PackView({ pack }: { pack: ClarityPack }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-800">
          {pack.documentType}
        </span>
        <UrgencyBadge level={pack.urgency.level} reason={pack.urgency.reason} />
      </div>

      <Card title="In plain language">{pack.plainSummary}</Card>
      <Card title="What this means for you">{pack.whatThisMeans}</Card>

      <div className="rounded-lg border border-slate-200 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">What to do</h2>
        {pack.actionItems.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No specific action is required.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {pack.actionItems.map((item, i) => (
              <li key={i} className="flex flex-col">
                <span className="text-slate-800">• {item.action}</span>
                <span className="ml-3 text-xs font-medium text-amber-700">
                  Deadline: {item.deadline}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pack.keyTerms.length > 0 && (
        <div className="rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Confusing words, explained
          </h2>
          <dl className="mt-2 space-y-2">
            {pack.keyTerms.map((t, i) => (
              <div key={i}>
                <dt className="font-medium text-slate-800">{t.term}</dt>
                <dd className="text-sm text-slate-600">{t.definition}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Questions you could ask
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-800">
          {pack.questionsToAsk.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </div>

      <CopyCard title="Translation" text={pack.translation} />

      <p className="rounded-md bg-amber-50 px-4 py-3 text-xs text-amber-800">{pack.safetyNote}</p>
    </div>
  );
}

function UrgencyBadge({
  level,
  reason,
}: {
  level: ClarityPack["urgency"]["level"];
  reason: string;
}) {
  const styles: Record<string, string> = {
    high: "bg-red-100 text-red-800",
    medium: "bg-amber-100 text-amber-800",
    low: "bg-emerald-100 text-emerald-800",
  };
  const labels: Record<string, string> = {
    high: "Act soon",
    medium: "Don't delay",
    low: "Informational",
  };
  return (
    <span
      title={reason}
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${styles[level]}`}
    >
      <UrgencyDot level={level} />
      {labels[level]}
    </span>
  );
}

function UrgencyDot({ level }: { level: ClarityPack["urgency"]["level"] }) {
  const colors: Record<string, string> = {
    high: "bg-red-500",
    medium: "bg-amber-500",
    low: "bg-emerald-500",
  };
  return <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${colors[level]}`} />;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      <p className="mt-1 whitespace-pre-wrap text-slate-800">{children}</p>
    </div>
  );
}

function CopyCard({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              /* ignore */
            }
          }}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="mt-1 whitespace-pre-wrap text-slate-800">{text}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-slate-900 text-slate-900"
          : "border-transparent text-slate-500 hover:text-slate-800"
      }`}
    >
      {children}
    </button>
  );
}
