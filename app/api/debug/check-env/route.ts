import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    hasEnvVars: {
      SOLAPI_API_KEY: !!process.env.SOLAPI_API_KEY,
      SOLAPI_API_SECRET: !!process.env.SOLAPI_API_SECRET,
      SOLAPI_SENDER: !!process.env.SOLAPI_SENDER,
      SOLAPI_PFID: !!process.env.SOLAPI_PFID,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    solapi: {
      sender: process.env.SOLAPI_SENDER ? process.env.SOLAPI_SENDER.substring(0, 3) + "****" + process.env.SOLAPI_SENDER.substring(7) : null,
      pfid: process.env.SOLAPI_PFID ? process.env.SOLAPI_PFID.substring(0, 4) + "****" : null,
      apiKey: process.env.SOLAPI_API_KEY ? process.env.SOLAPI_API_KEY.substring(0, 8) + "****" : null,
    },
    timestamp: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
}
