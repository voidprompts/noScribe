import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * POST /api/checkout/verify
 * Body: { provider: "stripe"|"paypal"|"gcash",
 *         sessionId?: string,   // Stripe checkout session id
 *         orderId?: string,     // PayPal order id (token param)
 *         sourceId?: string }   // PayMongo source id
 *
 * Confirms the payment actually completed with the provider
 * (and captures it, for PayPal / PayMongo). Returns { paid: boolean }.
 */
export async function POST(req: NextRequest) {
  let body: {
    provider?: string;
    sessionId?: string;
    orderId?: string;
    sourceId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    switch (body.provider) {
      case "stripe":
        return await verifyStripe(body.sessionId);
      case "paypal":
        return await capturePaypal(body.orderId);
      case "gcash":
        return await captureGcash(body.sourceId);
      default:
        return NextResponse.json({ error: "Unknown provider." }, { status: 400 });
    }
  } catch (err) {
    console.error("verify error:", err);
    return NextResponse.json({ paid: false, error: "Verification failed." });
  }
}

async function verifyStripe(sessionId?: string) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !sessionId) return NextResponse.json({ paid: false });

  const res = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    { headers: { Authorization: `Bearer ${key}` } }
  );
  const data = await res.json();
  return NextResponse.json({
    paid: res.ok && data.payment_status === "paid",
  });
}

function paypalBase() {
  return process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function capturePaypal(orderId?: string) {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret || !orderId) return NextResponse.json({ paid: false });

  const tokenRes = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) return NextResponse.json({ paid: false });

  const capRes = await fetch(
    `${paypalBase()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
    }
  );
  const capData = await capRes.json();

  // Already captured earlier (e.g. page refresh) still counts as paid.
  const alreadyCaptured =
    capData?.details?.[0]?.issue === "ORDER_ALREADY_CAPTURED";
  return NextResponse.json({
    paid: (capRes.ok && capData.status === "COMPLETED") || alreadyCaptured,
  });
}

async function captureGcash(sourceId?: string) {
  const key = process.env.PAYMONGO_SECRET_KEY;
  if (!key || !sourceId) return NextResponse.json({ paid: false });

  const auth = `Basic ${Buffer.from(`${key}:`).toString("base64")}`;

  // Check the source status first.
  const srcRes = await fetch(
    `https://api.paymongo.com/v1/sources/${encodeURIComponent(sourceId)}`,
    { headers: { Authorization: auth } }
  );
  const srcData = await srcRes.json();
  if (!srcRes.ok) return NextResponse.json({ paid: false });

  const status = srcData.data.attributes.status;
  if (status === "paid") return NextResponse.json({ paid: true });
  if (status !== "chargeable") return NextResponse.json({ paid: false });

  // Chargeable → create the payment to actually collect the funds.
  const payRes = await fetch("https://api.paymongo.com/v1/payments", {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: srcData.data.attributes.amount,
          currency: "PHP",
          source: { id: sourceId, type: "source" },
          description: srcData.data.attributes.description,
        },
      },
    }),
  });
  const payData = await payRes.json();
  return NextResponse.json({
    paid: payRes.ok && payData.data.attributes.status === "paid",
  });
}
