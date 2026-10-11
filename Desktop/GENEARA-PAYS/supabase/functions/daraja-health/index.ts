const headers = { "Content-Type": "application/json" };

Deno.serve((req) => {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Use GET" }), { status: 405, headers });
  }

  const names = [
    "DARAJA_BASE_URL",
    "DARAJA_CONSUMER_KEY",
    "DARAJA_CONSUMER_SECRET",
    "DARAJA_SHORTCODE",
    "DARAJA_PASSKEY",
    "DARAJA_CALLBACK_URL",
  ];

  const config: Record<string, boolean> = {};
  for (const name of names) config[name] = Boolean(Deno.env.get(name));

  return new Response(JSON.stringify({
    service: "GENEARA PAY Daraja integration",
    configured: Object.values(config).every(Boolean),
    secrets_present: config,
    note: "This endpoint reports whether settings exist; it never returns secret values or initiates a payment.",
  }), { headers });
});
