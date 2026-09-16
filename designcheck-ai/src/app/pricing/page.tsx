"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPlan, Plan } from "@/lib/storage";

const TIERS: {
  id: Plan;
  name: string;
  price: { monthly: number; yearly: number };
  tagline: string;
  features: string[];
  cta: string;
  highlight?: boolean;
}[] = [
  {
    id: "free",
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    tagline: "Kick the tires",
    features: [
      "3 audits per month",
      "Brand + accessibility scores",
      "Top findings with fixes",
      "Local report history",
    ],
    cta: "Current plan",
  },
  {
    id: "pro",
    name: "Pro",
    price: { monthly: 19, yearly: 15 },
    tagline: "For founders shipping fast",
    features: [
      "Unlimited audits",
      "Full finding list + WCAG references",
      "PDF export & shareable links",
      "Weekly automatic re-scans",
      "Competitor comparisons",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    highlight: true,
  },
  {
    id: "agency",
    name: "Agency",
    price: { monthly: 49, yearly: 39 },
    tagline: "For teams & client work",
    features: [
      "Everything in Pro",
      "5 team seats",
      "White-label PDF reports",
      "Client workspaces",
      "API access",
      "Dedicated support",
    ],
    cta: "Upgrade to Agency",
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<Plan>("free");

  useEffect(() => {
    setCurrentPlan(getPlan());
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="animate-fade-up text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Simple pricing for serious founders
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          Start free. Upgrade when you want unlimited audits and reports you can
          put in front of investors and customers.
        </p>

        {/* Billing toggle */}
        <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-slate-100 p-1.5">
          <button
            onClick={() => setYearly(false)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              !yearly ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              yearly ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            Yearly <span className="text-emerald-600">−20%</span>
          </button>
        </div>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {TIERS.map((t) => {
          const price = yearly ? t.price.yearly : t.price.monthly;
          const isCurrent = currentPlan === t.id;
          return (
            <div
              key={t.id}
              className={`animate-fade-up relative flex flex-col rounded-2xl border bg-white p-7 shadow-sm ${
                t.highlight
                  ? "border-indigo-300 shadow-xl shadow-indigo-100 ring-2 ring-indigo-600"
                  : "border-slate-200"
              }`}
            >
              {t.highlight && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
                  Most popular
                </span>
              )}
              <h2 className="text-lg font-bold text-slate-900">{t.name}</h2>
              <p className="text-sm text-slate-500">{t.tagline}</p>
              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-5xl font-bold tracking-tight text-slate-900">
                  ${price}
                </span>
                <span className="text-slate-500">/mo</span>
                {yearly && price > 0 && (
                  <span className="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    billed yearly
                  </span>
                )}
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="mt-0.5 text-emerald-500">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 py-3 text-center font-semibold text-slate-500">
                  ✓ Current plan
                </div>
              ) : t.id === "free" ? (
                <Link
                  href="/"
                  className="mt-7 rounded-xl border border-slate-300 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Run a free audit
                </Link>
              ) : (
                <Link
                  href={`/checkout?plan=${t.id}&billing=${yearly ? "yearly" : "monthly"}`}
                  className={`mt-7 rounded-xl py-3 text-center font-semibold transition ${
                    t.highlight
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500"
                      : "border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  }`}
                >
                  {t.cta}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-10 text-center text-sm text-slate-400">
        Cancel anytime · 14-day money-back guarantee · Prices in USD
      </p>
      <p className="mt-3 flex items-center justify-center gap-3 text-sm text-slate-500">
        <span className="font-medium">We accept:</span>
        <span className="rounded-lg bg-slate-100 px-3 py-1 font-semibold">💳 Card</span>
        <span className="rounded-lg bg-slate-100 px-3 py-1 font-semibold">🅿️ PayPal</span>
        <span className="rounded-lg bg-slate-100 px-3 py-1 font-semibold">📱 GCash</span>
      </p>
    </div>
  );
}
