"use client";

import { useEffect, useState } from "react";
import type { ClarityPack } from "@/lib/clarityPack";
import { defaultUI, PAGE_LANGUAGES, RTL_LANGUAGES, type UI } from "@/lib/ui";

// Sample document bodies (never translated — this is the English input to explain).
const SAMPLE_ICONS = ["🍎", "🛂", "🏠", "⚖️", "🏥", "💡"];
const SAMPLE_TEXTS = [
  `NOTICE OF EXPIRATION OF BENEFITS

Case Number: 4471-22B

Dear Recipient,

Our records indicate that your Supplemental Nutrition Assistance benefits are scheduled to terminate effective the last day of the current certification period. To avoid an interruption in benefits, you must complete a recertification interview and submit all required verification documents, including proof of income and proof of residence, no later than thirty (30) days from the date of this notice.

Failure to respond by the stated deadline will result in case closure. If your case is closed, you will be required to submit a new application and may experience a lapse in assistance. You have the right to request a fair hearing within 90 days if you disagree with this determination.`,
  `U.S. CITIZENSHIP AND IMMIGRATION SERVICES
APPLICATION SUPPORT CENTER APPOINTMENT NOTICE

The above application has been received and processed by USCIS. You are required to appear at the below Application Support Center for biometrics services. Please bring this notice and a valid photo identification.

You will be required to provide your fingerprints, photograph, and/or signature. Failure to appear for this appointment as scheduled may result in denial of your application pursuant to Title 8, Code of Federal Regulations. If you are unable to appear, you must submit a written request to reschedule before your scheduled date.`,
  `NOTICE TO PAY RENT OR QUIT

TO: Tenant(s) in possession

YOU ARE HEREBY NOTIFIED that rent is now past due and owing on the premises you currently occupy in the amount of one thousand four hundred fifty dollars ($1,450.00).

You are required to pay the full amount due or to vacate and surrender possession of the premises within FOURTEEN (14) DAYS of service of this notice. Failure to comply will result in the commencement of legal proceedings to recover possession of the premises, which may include a judgment for unpaid rent, court costs, and attorney's fees.`,
  `SUMMONS — CIVIL

NOTICE TO DEFENDANT: You have been sued. The court may decide against you without your being heard unless you respond within 20 days.

You have 20 CALENDAR DAYS after this summons and legal papers are served on you to file a written response at this court and have a copy served on the plaintiff. A letter or phone call will not protect you. If you do not file your response on time, you may lose the case by default, and your wages, money, and property may be taken without further warning from the court.`,
  `FINAL NOTICE BEFORE COLLECTION

Statement Date: [date]
Account Balance: $612.38

This is a final notice regarding the outstanding balance on your account for services rendered. Our records show that previous statements have gone unpaid.

Please remit payment in full within 30 days of the date of this notice. If payment is not received, your account may be referred to a third-party collection agency, and this delinquency may be reported to the credit bureaus, which could affect your credit score. If you believe this balance is incorrect or you are unable to pay, please contact our billing office to discuss financial assistance or a payment plan.`,
  `IMPORTANT NOTICE — RISK OF DISCONNECTION

Account is past due in the amount of $238.74.

To avoid interruption of your electric service, payment must be received by the disconnection date listed above. If payment is not received, service may be disconnected without further notice, and a reconnection fee plus a security deposit may be required to restore service.

If you are unable to pay the full amount, you may qualify for a payment arrangement or energy assistance program. Customers who depend on electric-powered medical equipment may be eligible for protection from disconnection by submitting a certified medical form.`,
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClarityPack | null>(null);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Whole-page language / translation.
  const [pageLanguage, setPageLanguage] = useState("English");
  const [ui, setUi] = useState<UI>(defaultUI);
  const [uiBusy, setUiBusy] = useState(false);
  const [uiCache, setUiCache] = useState<Record<string, UI>>({ English: defaultUI });

  const isRtl = RTL_LANGUAGES.includes(pageLanguage);
  const wantsTranslation = pageLanguage !== "English";

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  async function translatePage(lang: string) {
    setError(null);
    if (lang === "English") {
      setPageLanguage("English");
      setUi(defaultUI);
      return;
    }
    if (uiCache[lang]) {
      setPageLanguage(lang);
      setUi(uiCache[lang]);
      return;
    }
    setUiBusy(true);
    try {
      const keys = Object.keys(defaultUI) as (keyof UI)[];
      const values = keys.map((k) => defaultUI[k]);
      const res = await fetch("/api/translate-ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang, values }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not translate the page.");
      const rebuilt = {} as UI;
      keys.forEach((k, i) => {
        rebuilt[k] = data.values[i] ?? defaultUI[k];
      });
      setUiCache((prev) => ({ ...prev, [lang]: rebuilt }));
      setUi(rebuilt);
      setPageLanguage(lang);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not translate the page.");
    } finally {
      setUiBusy(false);
    }
  }

  async function clarify(text?: string) {
    const doc = (text ?? documentText).trim();
    if (!doc) {
      setError(ui.needText);
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentText: doc, language: wantsTranslation ? pageLanguage : "Spanish" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed.");
      const pack = data.clarityPack as ClarityPack;
      setResult(pack);

      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
        documentType: pack.documentType,
        language: wantsTranslation ? pageLanguage : "Spanish",
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

  function pickSample(i: number) {
    setTab("explain");
    setDocumentText(SAMPLE_TEXTS[i]);
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
    <main dir={isRtl ? "rtl" : "ltr"} className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-6 flex items-start justify-between gap-4">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Clarity</h1>
        {/* Whole-site language switcher */}
        <div className="flex items-center gap-2">
          <span aria-hidden className="text-lg">🌐</span>
          <label className="sr-only" htmlFor="pagelang">
            {ui.langLabel}
          </label>
          <select
            id="pagelang"
            value={pageLanguage}
            onChange={(e) => translatePage(e.target.value)}
            disabled={uiBusy}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 focus:border-slate-500 focus:outline-none disabled:opacity-50"
          >
            {PAGE_LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          {uiBusy && <span className="text-xs text-slate-400">{ui.translating}</span>}
        </div>
      </div>

      <p className="mb-8 max-w-3xl text-lg text-slate-600">{ui.tagline}</p>

      {/* Tabs */}
      <div className="mb-8 flex gap-1 border-b border-slate-200">
        <TabButton active={tab === "explain"} onClick={() => setTab("explain")}>
          {ui.tabExplain}
        </TabButton>
        <TabButton active={tab === "history"} onClick={() => setTab("history")}>
          {ui.tabHistory}
          {history.length > 0 ? ` (${history.length})` : ""}
        </TabButton>
      </div>

      {tab === "explain" ? (
        <>
          {/* Sample gallery */}
          <section className="mb-10">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {ui.samplesHeading}
              </h2>
              <span className="text-xs text-slate-400">{ui.samplesHint}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {SAMPLE_ICONS.map((icon, i) => (
                <button
                  key={i}
                  onClick={() => pickSample(i)}
                  className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 text-start transition hover:border-blue-400 hover:bg-blue-50/40"
                >
                  <span className="text-2xl leading-none">{icon}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-slate-800">
                      {ui[`s${i}label` as keyof UI]}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {ui[`s${i}kind` as keyof UI]}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Input */}
            <section className="space-y-4">
              <label htmlFor="doc" className="block text-sm font-medium text-slate-700">
                {ui.docLabel}
              </label>
              <textarea
                id="doc"
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                rows={16}
                placeholder={ui.docPlaceholder}
                className="block w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
              />

              <button
                onClick={() => clarify()}
                disabled={loading}
                className="w-full rounded-md bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
              >
                {loading ? ui.explaining : ui.explain}
              </button>

              {error && (
                <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              )}
            </section>

            {/* Output */}
            <section>
              {result ? (
                <PackView pack={result} ui={ui} showTranslation={wantsTranslation} />
              ) : (
                <div className="flex h-full min-h-64 items-center justify-center rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-400">
                  {loading ? ui.explaining : ui.outputEmpty}
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
              {ui.histEmpty}
            </div>
          ) : selected ? (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedId(null)}
                className="text-sm font-medium text-slate-600 hover:underline"
              >
                ← {ui.backToAll}
              </button>
              <p className="text-xs text-slate-400">
                {new Date(selected.createdAt).toLocaleString()} · {ui.translatedInto}{" "}
                {selected.language}
              </p>
              <PackView pack={selected.pack} ui={ui} showTranslation />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">{ui.histSaved}</p>
                <button
                  onClick={clearHistory}
                  className="shrink-0 text-xs font-medium text-red-600 hover:underline"
                >
                  {ui.clearHistory}
                </button>
              </div>
              <ul className="space-y-2">
                {history.map((h) => (
                  <li key={h.id}>
                    <button
                      onClick={() => setSelectedId(h.id)}
                      className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-3 text-start transition hover:border-slate-400 hover:bg-slate-50"
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

function PackView({
  pack,
  ui,
  showTranslation,
}: {
  pack: ClarityPack;
  ui: UI;
  showTranslation: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-800">
          {pack.documentType}
        </span>
        <UrgencyBadge level={pack.urgency.level} reason={pack.urgency.reason} ui={ui} />
      </div>

      <Card title={ui.secPlain}>{pack.plainSummary}</Card>
      <Card title={ui.secMeans}>{pack.whatThisMeans}</Card>

      <div className="rounded-lg border border-slate-200 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{ui.secDo}</h2>
        {pack.actionItems.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">{ui.noAction}</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {pack.actionItems.map((item, i) => (
              <li key={i} className="flex flex-col">
                <span className="text-slate-800">• {item.action}</span>
                <span className="ms-3 text-xs font-medium text-amber-700">
                  {ui.deadline} {item.deadline}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pack.keyTerms.length > 0 && (
        <div className="rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {ui.secTerms}
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
          {ui.secQuestions}
        </h2>
        <ul className="mt-2 list-disc space-y-1 ps-5 text-slate-800">
          {pack.questionsToAsk.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </div>

      {showTranslation && <CopyCard title={ui.secTranslation} text={pack.translation} ui={ui} />}

      <p className="rounded-md bg-amber-50 px-4 py-3 text-xs text-amber-800">{pack.safetyNote}</p>
    </div>
  );
}

function UrgencyBadge({
  level,
  reason,
  ui,
}: {
  level: ClarityPack["urgency"]["level"];
  reason: string;
  ui: UI;
}) {
  const styles: Record<string, string> = {
    high: "bg-red-100 text-red-800",
    medium: "bg-amber-100 text-amber-800",
    low: "bg-emerald-100 text-emerald-800",
  };
  const labels: Record<string, string> = {
    high: ui.urgentHigh,
    medium: ui.urgentMed,
    low: ui.urgentLow,
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

function CopyCard({ title, text, ui }: { title: string; text: string; ui: UI }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-3">
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
          className="shrink-0 text-xs font-medium text-blue-600 hover:underline"
        >
          {copied ? ui.copied : ui.copy}
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
