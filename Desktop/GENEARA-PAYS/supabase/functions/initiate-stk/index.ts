import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("APP_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, idempotency-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders });
}

function required(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing server secret: ${name}`);
  return value;
}

function normalizePhone(input: unknown): string {
  const raw = String(input ?? "").replace(/[\\s()-]/g, "");
  let phone = raw;
  if (phone.startsWith("+")) phone = phone.slice(1);
  if (phone.startsWith("0")) phone = "254" + phone.slice(1);
  if (phone.startsWith("7") || phone.startsWith("1")) phone = "254" + phone;
  if (!/^254[17]\\d{8}$/.test(phone)) {
    throw new Error("Enter a valid Kenyan M-Pesa number, e.g. 254712345678.");
  }
  return phone;
}

function darajaTimestamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

async function getDarajaToken(baseUrl: string, key: string, secret: string) {
  const auth = btoa(`${key}:${secret}`);
  const response = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.access_token) {
    console.error("Daraja OAuth failed", response.status, body.errorMessage ?? body.error ?? "No token");
    throw new Error("Daraja authentication failed. Check API credentials and environment.");
  }
  return String(body.access_token);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    // Require an authenticated Supabase user. The service key is used only
    // server-side, after the caller's JWT has been validated here.
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace(/^Bearer\\s+/i, "");
    if (!jwt) return json({ error: "Sign in is required to initiate a payment." }, 401);

    const supabaseUrl = required("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!anonKey || !serviceKey) {
      throw new Error("Supabase server keys are not configured for this function.");
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser(jwt);
    if (userError || !userData.user) return json({ error: "Invalid or expired login session." }, 401);
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const transactionId = String(body.transaction_id ?? "").trim();
    const phone = normalizePhone(body.phone_number);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(transactionId)) {
      return json({ error: "A valid transaction_id is required." }, 400);
    }

    const idempotencyKey =
      req.headers.get("Idempotency-Key") ??
      String(body.idempotency_key ?? "").trim();

    if (!idempotencyKey || idempotencyKey.length < 12 || idempotencyKey.length > 128) {
      return json({ error: "Send a unique Idempotency-Key (12–128 characters)." }, 400);
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Ensure the user is permitted to pay this transaction. Adapt ownership
    // field if your existing transactions table uses a different column.
    const { data: transaction, error: txError } = await admin
      .from("transactions").select("*").eq("id", transactionId).maybeSingle();

    if (txError) throw new Error(`Could not load transaction: ${txError.message}`);
    if (!transaction) return json({ error: "Transaction was not found." }, 404);

    const ownerId = transaction.user_id ?? transaction.customer_id ?? transaction.profile_id;
    if (!ownerId || ownerId !== userId) {
      return json({ error: "You are not authorized to pay this transaction." }, 403);
    }

    const status = String(transaction.status ?? transaction.transaction_status ?? "").toLowerCase();
    if (!["pending_payment", "awaiting_payment", "payment_pending", "pending"].includes(status)) {
      return json({ error: "This transaction is not awaiting payment." }, 409);
    }

    const rawAmount =
      transaction.total_kes ??
      transaction.total_amount_kes ??
      transaction.amount_kes ??
      transaction.amount;
    const amount = Number(rawAmount);

    if (!Number.isFinite(amount) || amount < 1 || amount > 250000) {
      return json({
        error: "Transaction KES amount is missing or outside the configured STK limits. Check the transaction schema and server-side quote logic.",
      }, 422);
    }

    const { data: existing, error: existingError } = await admin
      .from("mpesa_stk_payments").select("*")
      .eq("idempotency_key", idempotencyKey).maybeSingle();

    if (existingError) throw new Error(existingError.message);
    if (existing) {
      if (existing.transaction_id !== transactionId) {
        return json({ error: "Idempotency key was already used for another transaction." }, 409);
      }
      return json({
        success: true,
        duplicate: true,
        payment_id: existing.id,
        status: existing.status,
        checkout_request_id: existing.checkout_request_id,
        message: "Existing payment attempt returned; no duplicate STK was sent.",
      });
    }

    const baseUrl = required("DARAJA_BASE_URL").replace(/\\/$/, "");
    const consumerKey = required("DARAJA_CONSUMER_KEY");
    const consumerSecret = required("DARAJA_CONSUMER_SECRET");
    const shortcode = required("DARAJA_SHORTCODE");
    const passkey = required("DARAJA_PASSKEY");
    const callbackUrl = required("DARAJA_CALLBACK_URL");
    const transactionType = Deno.env.get("DARAJA_TRANSACTION_TYPE") ?? "CustomerPayBillOnline";

    const timestamp = darajaTimestamp();
    const password = btoa(`${shortcode}${passkey}${timestamp}`);
    const token = await getDarajaToken(baseUrl, consumerKey, consumerSecret);

    const insert = await admin.from("mpesa_stk_payments").insert({
      transaction_id: transactionId,
      phone_number: phone,
      amount_kes: amount,
      account_reference: `GEN${transactionId.replaceAll("-", "").slice(0, 10).toUpperCase()}`,
      transaction_desc: "GENEARA PAY transfer",
      status: "initiating",
      idempotency_key: idempotencyKey,
      initiated_by: userId,
    }).select("id").single();

    if (insert.error) {
      // Unique idempotency constraint protects against concurrent duplicate calls.
      if (insert.error.code === "23505") {
        return json({ error: "This payment attempt already exists. Refresh the transaction status." }, 409);
      }
      throw new Error(`Could not create payment attempt: ${insert.error.message}`);
    }

    const paymentId = insert.data.id;

    const stkResponse = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: transactionType,
        Amount: Math.ceil(amount),
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: callbackUrl,
        AccountReference: `GEN${paymentId.replaceAll("-", "").slice(0, 10).toUpperCase()}`,
        TransactionDesc: "GENEARA PAY transfer",
      }),
    });

    const stkBody = await stkResponse.json().catch(() => ({}));
    if (!stkResponse.ok || String(stkBody.ResponseCode ?? "") !== "0" || !stkBody.CheckoutRequestID) {
      await admin.from("mpesa_stk_payments").update({
        status: "failed",
        result_description: String(stkBody.errorMessage ?? stkBody.ResponseDescription ?? "STK request rejected").slice(0, 500),
        callback_payload: stkBody,
      }).eq("id", paymentId);

      console.error("Daraja STK rejected", stkResponse.status, stkBody);
      return json({
        success: false,
        payment_id: paymentId,
        error: "Daraja did not accept the STK request. Check the Edge Function logs and Daraja configuration.",
      }, 502);
    }

    const { error: updateError } = await admin.from("mpesa_stk_payments").update({
      status: "pending",
      merchant_request_id: String(stkBody.MerchantRequestID ?? ""),
      checkout_request_id: String(stkBody.CheckoutRequestID),
      result_description: String(stkBody.ResponseDescription ?? "STK prompt accepted"),
    }).eq("id", paymentId);

    if (updateError) throw new Error(`STK sent but payment record update failed: ${updateError.message}`);

    return json({
      success: true,
      payment_id: paymentId,
      transaction_id: transactionId,
      status: "pending",
      customer_message: "STK request sent. Check the phone and authorize the payment.",
    });
  } catch (error) {
    console.error("initiate-stk error:", error instanceof Error ? error.message : "Unknown error");
    return json({
      error: error instanceof Error ? error.message : "Unexpected server error",
    }, 500);
  }
});
