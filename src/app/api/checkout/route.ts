import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseServerClient, getSupabaseAdminClient } from '@/lib/supabase/server';

/**
 * Create a payment for an order and hand back a gateway redirect URL.
 *
 * Why this runs on the server rather than in the checkout component:
 *
 *  - The gateway secret key lives here and nowhere else.
 *  - `payments` has no INSERT policy for `authenticated`, deliberately: a
 *    client that could write payments could mark its own order paid. Only
 *    service_role can, and service_role only exists on this side.
 *  - The AMOUNT IS RE-READ FROM THE DATABASE, never taken from the request
 *    body. Trusting a client-supplied total is the classic checkout bug, and
 *    it is worth a lot of money to whoever finds it.
 *
 * Stripe is called over its REST API with `fetch` instead of the SDK -- one
 * form-encoded POST, no extra dependency in the bundle.
 */
const CheckoutBody = z.object({
  orderId: z.string().uuid(),
  method: z.enum(['card', 'knet', 'transfer']).default('card'),
});

/** Log the detail server-side; never hand a database message to the browser. */
function internalError(context: string, detail: unknown) {
  console.error(`[checkout] ${context}`, detail);
  return NextResponse.json({ error: 'The order could not be processed.' }, { status: 500 });
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request body.' }, { status: 400 });
  }

  const parsed = CheckoutBody.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid order request.' }, { status: 400 });
  }
  const { orderId, method } = parsed.data;

  // Read the order through the USER's client, so RLS proves they own it.
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });
  }

  const { data: order, error: orderError } = await supabase
    .from('service_orders')
    .select('id, reference, total, currency, status, contact_email, customer_id')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }
  if (order.customer_id !== user.id) {
    // RLS should already have hidden it; this is belt and braces.
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }
  if (order.status !== 'draft' && order.status !== 'awaiting_payment') {
    return NextResponse.json(
      { error: `This order is already ${order.status}.` },
      { status: 409 },
    );
  }

  const admin = getSupabaseAdminClient();

  // Bank transfer needs no gateway: record the intent and show instructions.
  if (method === 'transfer') {
    const { error } = await admin.from('payments').insert({
      order_id: order.id,
      provider: 'manual',
      status: 'requires_payment',
      amount: order.total,
      currency: order.currency,
    });
    if (error) return internalError('manual payment insert', error);
    await admin
      .from('service_orders')
      .update({ status: 'awaiting_payment' })
      .eq('id', order.id);

    return NextResponse.json({
      url: `/checkout/transfer/${encodeURIComponent(order.reference)}`,
    });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json(
      { error: 'Card payment is not available yet.' },
      { status: 501 },
    );
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

  // Stripe expects the smallest currency unit, which is what we store.
  const params = new URLSearchParams({
    mode: 'payment',
    'payment_method_types[0]': 'card',
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': order.currency.toLowerCase(),
    'line_items[0][price_data][unit_amount]': String(order.total),
    'line_items[0][price_data][product_data][name]': 'Contract Writing',
    'line_items[0][price_data][product_data][description]': `Order ${order.reference}`,
    customer_email: order.contact_email,
    client_reference_id: order.reference,
    'metadata[order_id]': order.id,
    success_url: `${origin}/checkout/success?ref=${encodeURIComponent(order.reference)}`,
    cancel_url: `${origin}/checkout/contract-writing?cancelled=${encodeURIComponent(order.reference)}`,
  });

  const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      // Replay safety: retrying this request cannot create a second session.
      'Idempotency-Key': `order_${order.id}`,
    },
    body: params,
  });

  const session = (await stripeRes.json()) as {
    id?: string;
    url?: string;
    error?: { message?: string };
  };

  if (!stripeRes.ok || !session.url) {
    console.error('[checkout] stripe rejected session', session.error?.message);
    return NextResponse.json(
      { error: 'The payment provider rejected the request.' },
      { status: 502 },
    );
  }

  const { error: paymentError } = await admin.from('payments').insert({
    order_id: order.id,
    provider: 'stripe',
    provider_payment_id: session.id ?? null,
    status: 'processing',
    amount: order.total,
    currency: order.currency,
  });
  if (paymentError) return internalError('stripe payment insert', paymentError);

  await admin
    .from('service_orders')
    .update({ status: 'awaiting_payment' })
    .eq('id', order.id);

  return NextResponse.json({ url: session.url });
}
