"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { setPlan } from "@/lib/storage";
import { PAID_PLANS, type PaidPlan } from "@/lib/plans";

type State = "verifying" | "paid" | "failed";

function SuccessInner() {
  const params = useSearchParams();
  const plan = (params.get("plan") === "agency" ? "agency" : "pro") as PaidPlan;
  const provider = params.get("provider") || "demo";
  const [state, setState] = useState<State>("verifying");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const verify = async () => {
      // Demo flow (no provider keys configured) — trust the redirect.
      if (provider === "demo") {
        setPlan(plan);
        setState("paid");
        return;
      }

      const payload: Record<string, string | undefined> = { provider };
      if (provider === "stripe") {
        payload.sessionId = params.get("session_id") ?? undefined;
      } else if (provider === "paypal") {
        // PayPal appends ?token=<orderId> to the return URL.
        payload.orderId = params.get("token") ?? undefined;
      } else if (provider === "gcash") {
        payload.sourceId =
          window.sessionStorage.getItem("designcheck.gcash.source") ?? undefined;
      }

      try {
        const res = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.paid) {
          setPlan(plan);
          window.sessionStorage.removeItem("designcheck.gcash.source");
          setState("paid");
        } else {
          setState("failed");
        }
      } catch {
        setState("failed");
      }
    };

    verify();
  }, [plan, provider, params]);

  if (state === "verifying") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-4xl animate-pulse-bar">
          🔄
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Confirming your payment…
        </h1>
        <p className="mt-3 text-slate-600">
          Hold on a second while we verify the transaction with{" "}
          {provider === "stripe"
            ? "Stripe"
            : provider === "paypal"
              ? "PayPal"
              : "GCash"}
          .
        </p>
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl">
          ⚠️
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          We couldn&apos;t confirm the payment
        </h1>
        <p className="mt-3 text-slate-600">
          If you were charged, your upgrade will be applied shortly — or contact
          support with your receipt. Otherwise, you can try again.
        </p>
        <Link
          href="/pricing"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500"
        >
          Back to pricing
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="animate-fade-up">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl">
          🎉
        </div>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome to {PAID_PLANS[plan].name}!
        </h1>
        <p className="mt-3 text-slate-600">
          Your payment is confirmed and your account has been upgraded. Happy
          auditing!
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500"
        >
          Go to my dashboard →
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-slate-400">
          Loading…
        </div>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}
