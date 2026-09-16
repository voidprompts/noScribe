"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { setPlan } from "@/lib/storage";
import { PAID_PLANS as PLANS, PHP_RATE, type PaidPlan } from "@/lib/plans";

type Method = "card" | "paypal" | "gcash";

const METHODS: { id: Method; label: string; icon: string; note: string }[] = [
  { id: "card", label: "Card", icon: "💳", note: "Visa · Mastercard · Amex" },
  { id: "paypal", label: "PayPal", icon: "🅿️", note: "Pay with your PayPal balance or linked cards" },
  { id: "gcash", label: "GCash", icon: "📱", note: "Popular e-wallet in the Philippines" },
];

function formatCard(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

function CheckoutInner() {
  const router = useRouter();
  const params = useSearchParams();
  const planId = (params.get("plan") === "agency" ? "agency" : "pro") as PaidPlan;
  const billing = params.get("billing") === "monthly" ? "monthly" : "yearly";
  const canceled = params.get("canceled") === "1";
  const plan = PLANS[planId];
  const perMonth = billing === "yearly" ? plan.yearly : plan.monthly;
  const total = billing === "yearly" ? plan.yearly * 12 : plan.monthly;

  const [method, setMethod] = useState<Method>("card");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [phone, setPhone] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [payError, setPayError] = useState<string | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email.";
    if (method === "card") {
      if (name.trim().length < 2) e.name = "Enter the name on the card.";
      if (card.replace(/\s/g, "").length !== 16)
        e.card = "Card number must be 16 digits.";
      if (!/^\d{2}\/\d{2}$/.test(expiry)) e.expiry = "Use MM/YY.";
      else {
        const mm = parseInt(expiry.slice(0, 2), 10);
        if (mm < 1 || mm > 12) e.expiry = "Invalid month.";
      }
      if (!/^\d{3,4}$/.test(cvc)) e.cvc = "3–4 digits.";
    }
    if (method === "gcash") {
      if (!/^(09|\+639)\d{9}$/.test(phone.replace(/[\s-]/g, "")))
        e.phone = "Enter a valid GCash mobile number (09XX XXX XXXX).";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const pay = async () => {
    if (!validate()) return;
    setPayError(null);
    setProcessing(true);

    try {
      // Ask the server to create a real payment session with the provider.
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planId,
          billing,
          method,
          email,
          phone,
        }),
      });
      const data = await res.json();

      if (res.ok && data.url) {
        // Real provider session created → hand off to Stripe/PayPal/GCash.
        if (data.sourceId) {
          // PayMongo needs the source id after the redirect back.
          window.sessionStorage.setItem("designcheck.gcash.source", data.sourceId);
        }
        window.location.href = data.url;
        return;
      }

      if (res.ok && data.demo) {
        // Provider keys not configured → demo flow.
        setTimeout(() => {
          setPlan(planId);
          setProcessing(false);
          setDone(true);
          setTimeout(() => router.push("/dashboard"), 2200);
        }, 1400);
        return;
      }

      setPayError(data.error || "Payment failed. Please try again.");
      setProcessing(false);
    } catch {
      setPayError("Network error. Please check your connection and try again.");
      setProcessing(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="animate-fade-up">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl">
            🎉
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome to {plan.name}!
          </h1>
          <p className="mt-3 text-slate-600">
            Your account has been upgraded. Redirecting you to your dashboard…
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500"
          >
            Go to dashboard now
          </Link>
        </div>
      </div>
    );
  }

  const inputCls = (err?: string) =>
    `w-full rounded-xl border px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition focus:ring-4 ${
      err
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
    }`;

  const payLabel =
    method === "paypal"
      ? `Continue with PayPal — $${total}`
      : method === "gcash"
        ? `Pay ₱${(total * PHP_RATE).toLocaleString()} with GCash`
        : `Pay $${total} ${billing === "yearly" ? "/year" : "/month"}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Link
        href="/pricing"
        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
      >
        ← Back to pricing
      </Link>
      <h1 className="mt-3 mb-8 text-3xl font-bold tracking-tight text-slate-900">
        Checkout
      </h1>

      {canceled && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Payment was canceled — no charge was made. You can try again below or
          pick a different payment method.
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Payment form */}
        <div className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Payment method
          </h2>

          {/* Method selector */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            {METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setMethod(m.id);
                  setErrors({});
                }}
                className={`rounded-xl border-2 px-3 py-3.5 text-center transition ${
                  method === m.id
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
                aria-pressed={method === m.id}
              >
                <span className="block text-2xl">{m.icon}</span>
                <span
                  className={`mt-1 block text-sm font-semibold ${
                    method === m.id ? "text-indigo-700" : "text-slate-700"
                  }`}
                >
                  {m.label}
                </span>
              </button>
            ))}
          </div>
          <p className="mb-6 -mt-3 text-xs text-slate-400">
            {METHODS.find((m) => m.id === method)?.note}
          </p>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email for receipt
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@yourstartup.com"
                className={inputCls(errors.email)}
              />
              {errors.email && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            {method === "card" && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Name on card
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ada Lovelace"
                    className={inputCls(errors.name)}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Card number
                  </label>
                  <div className="relative">
                    <input
                      inputMode="numeric"
                      value={card}
                      onChange={(e) => setCard(formatCard(e.target.value))}
                      placeholder="4242 4242 4242 4242"
                      className={inputCls(errors.card)}
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xl">
                      💳
                    </span>
                  </div>
                  {errors.card && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      {errors.card}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Expiry
                    </label>
                    <input
                      inputMode="numeric"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      className={inputCls(errors.expiry)}
                    />
                    {errors.expiry && (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        {errors.expiry}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      CVC
                    </label>
                    <input
                      inputMode="numeric"
                      value={cvc}
                      onChange={(e) =>
                        setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      placeholder="123"
                      className={inputCls(errors.cvc)}
                    />
                    {errors.cvc && (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        {errors.cvc}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {method === "paypal" && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
                <p className="text-3xl">🅿️</p>
                <p className="mt-2 text-sm text-slate-600">
                  You&apos;ll be redirected to PayPal to approve the payment of{" "}
                  <span className="font-semibold text-slate-900">
                    ${total}.00 USD
                  </span>
                  , then returned here automatically.
                </p>
              </div>
            )}

            {method === "gcash" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  GCash mobile number
                </label>
                <input
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0917 123 4567"
                  className={inputCls(errors.phone)}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {errors.phone}
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-400">
                  You&apos;ll receive a payment confirmation prompt in your GCash
                  app. Amount charged in PHP at today&apos;s rate.
                </p>
              </div>
            )}

            {payError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {payError}
              </div>
            )}

            <button
              onClick={pay}
              disabled={processing}
              className={`w-full rounded-xl py-3.5 font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60 ${
                method === "paypal"
                  ? "bg-[#0070ba] shadow-blue-200 hover:bg-[#005ea6]"
                  : method === "gcash"
                    ? "bg-[#007dfe] shadow-blue-200 hover:bg-[#0066d0]"
                    : "bg-indigo-600 shadow-indigo-200 hover:bg-indigo-500"
              }`}
            >
              {processing ? "Processing payment…" : payLabel}
            </button>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
              <span>🔒 256-bit SSL</span>
              <span>·</span>
              <span>PCI-DSS compliant</span>
              <span>·</span>
              <span>14-day refund</span>
            </div>
            <p className="text-center text-xs text-slate-400">
              Payments are processed securely by Stripe, PayPal, or GCash
              (PayMongo). If no provider is configured, checkout runs in demo
              mode and no real payment is made.
            </p>
          </div>
        </div>

        {/* Order summary */}
        <div
          className="animate-fade-up h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          style={{ animationDelay: "0.08s" }}
        >
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Order summary
          </h2>
          <div className="flex items-center justify-between rounded-xl bg-indigo-50 p-4">
            <div>
              <p className="font-semibold text-indigo-900">
                DesignCheck {plan.name}
              </p>
              <p className="text-sm capitalize text-indigo-600">
                {billing} billing
              </p>
            </div>
            <p className="text-xl font-bold text-indigo-900">${perMonth}/mo</p>
          </div>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <dt>Subtotal</dt>
              <dd>${total}.00</dd>
            </div>
            <div className="flex justify-between text-slate-600">
              <dt>Tax</dt>
              <dd>Calculated at billing</dd>
            </div>
            {billing === "yearly" && (
              <div className="flex justify-between font-medium text-emerald-600">
                <dt>Yearly discount</dt>
                <dd>−${(plan.monthly - plan.yearly) * 12}.00</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
              <dt>Due today</dt>
              <dd>${total}.00</dd>
            </div>
          </dl>

          <ul className="mt-6 space-y-2.5 border-t border-slate-100 pt-5 text-sm text-slate-600">
            <li className="flex gap-2">
              <span className="text-emerald-500">✓</span> 14-day money-back
              guarantee
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-500">✓</span> Cancel anytime, no
              questions
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-500">✓</span> Instant access after
              payment
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-slate-400">
          Loading checkout…
        </div>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}
