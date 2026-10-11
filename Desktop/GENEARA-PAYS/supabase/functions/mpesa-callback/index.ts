import { createClient } from "npm:@supabase/supabase-js@2";

const headers = { "Content-Type": "application/json" };

function response(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return response({ ResultCode: 1, ResultDesc: "Method not allowed" }, 405);

  let raw: Record<string, any> = {};
  try {
    raw = await req.json();
  } catch {
    return response({ ResultCode: 1, ResultDesc: "Invalid JSON" }, 400);
  }

  const callback = raw?.Body?.stkCallback;
  if (!callback?.CheckoutRequestID) {
    console.error("Daraja callback missing CheckoutRequestID");
    return response({ ResultCode: 0, ResultDesc: "Callback received" });
  }

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) throw new Error("Supabase server configuration missing.");

    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const checkoutId = String(callback.CheckoutRequestID);
    const merchantId = String(callback.MerchantRequestID ?? "");
    const resultCode = String(callback.ResultCode ?? "");
    const resultDescription = String(callback.ResultDesc ?? "No description");
    const items = callback.CallbackMetadata?.Item ?? [];

    const metadata: Record<string, unknown> = {};
    for (const item of items) {
      if (item?.Name) metadata[String(item.Name)] = item.Value ?? null;
    }

    // Save the raw callback for audit/debugging before updating payment status.
    const { error: eventError } = await admin.from("mpesa_callback_events").insert({
      checkout_request_id: checkoutId,
      merchant_request_id: merchantId || null,
      payload: raw,
      processed: false,
    });
    if (eventError) console.error("Could not store callback event:", eventError.message);

    const { data: payment, error: lookupError } = await admin
      .from("mpesa_stk_payments")
      .select("*")
      .eq("checkout_request_id", checkoutId)
      .maybeSingle();

    if (lookupError) throw new Error(lookupError.message);

    if (!payment) {
      console.error("Callback received for unknown CheckoutRequestID", checkoutId);
      return response({ ResultCode: 0, ResultDesc: "Callback received" });
    }

    // Idempotency: do not overwrite a terminal result on a duplicate callback.
    if (["paid", "failed", "cancelled"].includes(payment.status)) {
      return response({ ResultCode: 0, ResultDesc: "Duplicate callback acknowledged" });
    }

    const success = resultCode === "0";
    const receipt = metadata.MpesaReceiptNumber == null
      ? null : String(metadata.MpesaReceiptNumber);
    const transactionDate = metadata.TransactionDate == null
      ? null : String(metadata.TransactionDate);
    const callbackAmount = metadata.Amount == null ? null : Number(metadata.Amount);

    if (success && (!receipt || !Number.isFinite(callbackAmount) || callbackAmount <= 0)) {
      throw new Error("Success callback missing receipt number or valid amount.");
    }

    // A successful callback is marked paid only when the callback's amount
    // matches the requested amount. Amounts are integer KES for STK Push.
    if (success && Math.abs(Number(payment.amount_kes) - callbackAmount!) > 1) {
      await admin.from("mpesa_stk_payments").update({
        status: "unknown",
        result_code: resultCode,
        result_description: "Callback amount did not match requested amount; manual review required.",
        callback_payload: raw,
      }).eq("id", payment.id);

      console.error("Callback amount mismatch", checkoutId);
      return response({ ResultCode: 0, ResultDesc: "Callback received; requires review" });
    }

    const { error: updateError } = await admin.from("mpesa_stk_payments").update({
      status: success ? "paid" : (resultCode === "1032" ? "cancelled" : "failed"),
      result_code: resultCode,
      result_description: resultDescription.slice(0, 500),
      mpesa_receipt_number: receipt,
      transaction_date: transactionDate,
      callback_payload: raw,
      completed_at: success ? new Date().toISOString() : null,
    }).eq("id", payment.id);

    if (updateError) throw new Error(updateError.message);

    // IMPORTANT: transaction status is not changed here because existing
    // transactions schema/status values vary by project. Wire this update
    // through a project-specific SQL RPC after confirming the schema.
    await admin.from("mpesa_callback_events")
      .update({ processed: true })
      .eq("checkout_request_id", checkoutId)
      .eq("processed", false);

    return response({ ResultCode: 0, ResultDesc: "Callback processed" });
  } catch (error) {
    console.error("mpesa-callback error:", error instanceof Error ? error.message : "Unknown error");
    // Daraja should receive its callback acknowledgement; failures are visible
    // in Supabase logs and callback-event storage where available.
    return response({ ResultCode: 0, ResultDesc: "Callback received for processing" });
  }
});
