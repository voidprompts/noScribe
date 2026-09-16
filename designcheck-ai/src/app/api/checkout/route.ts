import { NextRequest, NextResponse } from "next/server";
import {
  PAID_PLANS,
  PHP_RATE,
  totalDue,
  type Billing,
  type PaidPlan,
} from "@/lib/plans";

export const runtime = "nodejs";

/**
 * POST /api/checkout
 * Body: { plan: "pro"|"agency", billing: "monthly"|"yearly",
 *         method: "card"|"paypal"|"gcash", email?: string, phone?: string }
 *
 * Creates a real payment session with the matching provider and returns
 * { url } to redirect the customer to. If the provider's API keys are not
 * configured (e.g. local dev), returns { demo: true } so the client falls
 * back to the demo flow.
 */
export async function POST(req: NextRequest) {
  let body: {
    plan?: string;
    billing?: string;
    method?: string;
    email?: string;
    phone?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const plan = (body.plan === "agency" ? "agency" : "pro") as PaidPlan;
  const billing = (body.billing === "monthly" ? "monthly" : "yearly") as Billing;
  const method = body.method;
  if (method !== "card" && method !== "paypal" && method !== "gcash") {
    return NextResponse.json({ error: "Unknown payment method." }, { status: 400 });
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    req.headers.get("origin") ||
    `https://${req.headers.get("host")}`;

  const amountUsd = totalDue(plan, billing); // whole USD
  const label = `DesignCheck AI — ${PAID_PLANS[plan].name} (${billing})`;
  const successBase = `${origin}/checkout/success?plan=${plan}&billing=${billing}`;
  const cancelUrl = `${origin}/checkout?plan=${plan}&billing=${billing}&canceled=1`;

  try {
    if (method === "card") {
      return await stripeSession({
        amountUsd,
        label,
        email: body.email,
        successBase,
        cancelUrl,
      });
    }
    if (method === "paypal") {
      return await paypalOrder({ amountUsd, label, successBase, cancelUrl });
    }
    return await gcashSource({ amountUsd, label, successBase, cancelUrl });
  } catch (err) {
    console.error("checkout error:", err);
    return NextResponse.json(
      { error: "Payment provider error. Please try again." },
      { status: 502 }
    );
  }
}

/* ---------------- Stripe (cards) ---------------- */

async function stripeSession(opts: {
  amountUsd: number;
  label: string;
  email?: string;
  successBase: string;
  cancelUrl: string;
}) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ demo: true });

  const params = new URLSearchParams({
    mode: "payment",
    success_url: `${opts.successBase}&provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: opts.cancelUrl,
    "payment_method_types[0]": "card",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(opts.amountUsd * 100),
    "line_items[0][price_data][product_data][name]": opts.label,
  });
  if (opts.email) params.set("customer_email", opts.email);

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Stripe error");
  return NextResponse.json({ url: data.url });
}

/* ---------------- PayPal ---------------- */

function paypalBase() {
  return process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function paypalToken(): Promise<string> {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  const res = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error_description || "PayPal auth error");
  return data.access_token;
}

async function paypalOrder(opts: {
  amountUsd: number;
  label: string;
  successBase: string;
  cancelUrl: string;
}) {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return NextResponse.json({ demo: true });
  }
  const token = await paypalToken();

  const res = await fetch(`${paypalBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          description: opts.label,
          amount: { currency_code: "USD", value: opts.amountUsd.toFixed(2) },
        },
      ],
      application_context: {
        brand_name: "DesignCheck AI",
        user_action: "PAY_NOW",
        return_url: `${opts.successBase}&provider=paypal`,
        cancel_url: opts.cancelUrl,
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "PayPal order error");

  const approve = (data.links as { rel: string; href: string }[]).find(
    (l) => l.rel === "approve"
  );
  if (!approve) throw new Error("No PayPal approval link returned");
  return NextResponse.json({ url: approve.href });
}

/* ---------------- GCash via PayMongo ---------------- */

async function gcashSource(opts: {
  amountUsd: number;
  label: string;
  successBase: string;
  cancelUrl: string;
}) {
  const key = process.env.PAYMONGO_SECRET_KEY;
  if (!key) return NextResponse.json({ demo: true });

  const amountPhpCentavos = Math.round(opts.amountUsd * PHP_RATE * 100);

  const res = await fetch("https://api.paymongo.com/v1/sources", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${key}:`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        attributes: {
          type: "gcash",
          amount: amountPhpCentavos,
          currency: "PHP",
          description: opts.label,
          redirect: {
            success: `${opts.successBase}&provider=gcash`,
            failed: opts.cancelUrl,
          },
        },
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.errors?.[0]?.detail || "PayMongo error");
  }

  return NextResponse.json({
    url: data.data.attributes.redirect.checkout_url,
    sourceId: data.data.id,
  });
}
