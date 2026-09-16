import type { Metadata } from "next";
import Link from "next/link";
import AuditForm from "@/components/AuditForm";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title:
    "Free Instant Website Design Audit — Brand & Accessibility Checker | DesignCheck AI",
  description:
    "Is your website costing you customers? Paste a URL or screenshot and get an AI design audit with brand, WCAG accessibility scores and actionable fixes in 30 seconds. Free — no signup.",
  alternates: { canonical: "/" },
};

const FAQS = [
  {
    q: "What does DesignCheck AI actually check?",
    a: "Two things founders usually can't afford an agency for: brand consistency (color palette discipline, typography scale, button systems, CTA voice, spacing rhythm) and accessibility against WCAG 2.2 (contrast ratios, alt text, focus states, touch target sizes, color-only signals). Every finding includes a concrete suggested fix.",
  },
  {
    q: "Is the audit really free?",
    a: "Yes. The Free plan includes 3 audits per month with scores and top findings — no signup and no credit card required. Pro unlocks unlimited audits, full finding lists, PDF exports, and weekly re-scans.",
  },
  {
    q: "How long does an audit take?",
    a: "Under 30 seconds. Paste your URL or drop a screenshot, and the report — with overall, brand, and accessibility scores — is generated instantly.",
  },
  {
    q: "Why does accessibility matter for a startup?",
    a: "Over 1 billion people live with some form of disability, accessibility lawsuits are rising every year, and accessible sites rank better on Google. Fixing contrast, alt text, and focus states is one of the highest-ROI improvements you can ship.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept credit and debit cards (Visa, Mastercard, Amex), PayPal, and GCash. All plans come with a 14-day money-back guarantee and you can cancel anytime.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. DesignCheck AI runs entirely in your browser — no extension, no code snippet, no site access needed.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE_URL}/#faq`,
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const TESTIMONIALS = [
  {
    quote:
      "We fixed the top 4 issues the same afternoon and our demo-request conversion went up 22% in two weeks. Best $15 we spend each month.",
    name: "Maya Chen",
    role: "Founder, Loopdesk (YC W24)",
    avatar: "MC",
  },
  {
    quote:
      "Our seed investors literally asked who did our design review. It was DesignCheck's PDF export. Closed the round two months later.",
    name: "Daniel Reyes",
    role: "CEO, Fintrail",
    avatar: "DR",
  },
  {
    quote:
      "As a solo founder I can't afford an accessibility consultant. This caught contrast and focus-state issues that would've been a lawsuit risk.",
    name: "Sofia Almeida",
    role: "Founder, HireSense",
    avatar: "SA",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="pt-14 pb-10 text-center sm:pt-20">
        <div className="animate-fade-up">
          <span className="mb-5 inline-block rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
            ⚡ 12,400+ audits run by startup founders
          </span>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Is your website{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              costing you customers?
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            Paste a URL or drop a screenshot. Get an instant AI-powered{" "}
            <strong className="font-semibold text-slate-800">
              brand & accessibility design audit
            </strong>{" "}
            — scored, prioritized, and fixable in one afternoon. Free, no
            signup.
          </p>
        </div>
      </section>

      {/* Audit input card */}
      <section
        className="animate-fade-up mx-auto max-w-2xl pb-8"
        style={{ animationDelay: "0.1s" }}
      >
        <AuditForm />
      </section>

      {/* Trust strip */}
      <section className="pb-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Trusted by founders from
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-lg font-bold tracking-tight text-slate-300">
          <span>Loopdesk</span>
          <span>Fintrail</span>
          <span>HireSense</span>
          <span>Parcelo</span>
          <span>Nimbus Labs</span>
          <span>Kudo</span>
        </div>
      </section>

      {/* Feature strip */}
      <section className="grid gap-6 pb-20 sm:grid-cols-3">
        {[
          {
            icon: "🎨",
            title: "Brand consistency score",
            body: "Palette discipline, typography scale, button systems, logo clear-space, and CTA voice — scored and explained in plain English.",
          },
          {
            icon: "♿",
            title: "WCAG 2.2 accessibility",
            body: "Contrast ratios, alt text, focus states, target sizes, and color-only signals mapped to the exact WCAG criteria you'd be audited on.",
          },
          {
            icon: "⚡",
            title: "Fixes, not just flags",
            body: "Every finding ships with a concrete, copy-pasteable fix so you can raise your score the same afternoon.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-3 text-3xl">{f.icon}</div>
            <h2 className="mb-1.5 font-semibold text-slate-900">{f.title}</h2>
            <p className="text-sm leading-relaxed text-slate-600">{f.body}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="pb-20">
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
          From URL to action plan in 3 steps
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {[
            {
              n: "1",
              title: "Paste or drop",
              body: "Enter your website URL or drag in a screenshot of any page — landing page, pricing page, signup flow.",
            },
            {
              n: "2",
              title: "AI analyzes in seconds",
              body: "We extract your palette and typography, run WCAG 2.2 checks, and score brand consistency across the page.",
            },
            {
              n: "3",
              title: "Ship the fixes",
              body: "Get a prioritized report: critical issues first, each with a specific fix. Re-run anytime to watch your score climb.",
            },
          ].map((s) => (
            <div key={s.n} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white shadow-lg shadow-indigo-200">
                {s.n}
              </div>
              <h3 className="font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="mb-20 rounded-2xl bg-slate-900 px-6 py-10 text-center sm:px-10">
        <div className="grid gap-8 sm:grid-cols-4">
          {[
            ["12,400+", "audits run"],
            ["4.8/5", "founder rating"],
            ["30 sec", "average audit time"],
            ["96%", "would recommend"],
          ].map(([v, l]) => (
            <div key={l}>
              <p className="text-3xl font-bold text-white">{v}</p>
              <p className="mt-1 text-sm text-slate-400">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="pb-20">
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
          Founders ship better sites with DesignCheck
        </h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-3 text-amber-400" aria-label="5 out of 5 stars">
                ★★★★★
              </div>
              <blockquote className="flex-1 text-sm leading-relaxed text-slate-700">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                  {t.avatar}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-900">
                    {t.name}
                  </span>
                  <span className="block text-xs text-slate-500">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl pb-20">
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
          Frequently asked questions
        </h2>
        <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-sm">
          {FAQS.map((f) => (
            <details key={f.q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
                {f.q}
                <span className="text-slate-400 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mb-20 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-10 text-center text-white shadow-xl">
        <h2 className="text-3xl font-bold">
          Your next customer is judging your site right now
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-indigo-100">
          Run your free audit and find out what they see — before they bounce.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#"
            className="rounded-xl bg-white px-8 py-3.5 font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
          >
            Run my free audit ↑
          </a>
          <Link
            href="/pricing"
            className="rounded-xl border border-white/40 px-8 py-3.5 font-semibold text-white transition hover:bg-white/10"
          >
            See pricing
          </Link>
        </div>
        <p className="mt-4 text-xs text-indigo-200">
          Free forever plan · 14-day money-back guarantee on paid plans
        </p>
      </section>
    </div>
  );
}
