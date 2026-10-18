import { NextRequest, NextResponse } from "next/server";

/**
 * Deliberately safe placeholder.
 * Do not exchange tokens until the registered Deriv OAuth flow, state/PKCE
 * verification, provider response schema and encrypted token storage are implemented.
 */
export async function GET(request: NextRequest) {
  const url = new URL("/login", request.url);
  const error = request.nextUrl.searchParams.get("error");
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (error) url.searchParams.set("notice", "deriv_authorization_cancelled");
  else if (code && state) url.searchParams.set("notice", "oauth_callback_received_setup_required");
  else url.searchParams.set("notice", "oauth_callback_missing_parameters");

  return NextResponse.redirect(url);
}
