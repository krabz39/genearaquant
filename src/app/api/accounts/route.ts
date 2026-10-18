import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ accounts: [], connected: false, message: "Deriv OAuth and authenticated account retrieval are not implemented." }, { status: 200 });
}
