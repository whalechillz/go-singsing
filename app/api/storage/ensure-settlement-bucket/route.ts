import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BUCKET_ID = "tour-settlement-docs";
const FILE_SIZE_LIMIT = 20 * 1024 * 1024; // 20MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "image/gif",
  "image/jpg"
];

const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase admin credentials are not configured.");
  }

  return createClient(supabaseUrl, serviceRoleKey);
};

export async function POST() {
  try {
    const supabaseAdmin = createAdminClient();

    const { data: existingBucket, error: bucketError } = await supabaseAdmin.storage.getBucket(
      BUCKET_ID
    );

    if (bucketError && bucketError.message?.toLowerCase().includes("not found")) {
      const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_ID, {
        public: false,
        fileSizeLimit: FILE_SIZE_LIMIT,
        allowedMimeTypes: ALLOWED_MIME_TYPES
      });

      if (createError) {
        return NextResponse.json(
          { error: createError.message, code: createError.name },
          { status: 500 }
        );
      }

      return NextResponse.json({ created: true });
    }

    if (bucketError) {
      return NextResponse.json(
        { error: bucketError.message, code: bucketError.name },
        { status: 500 }
      );
    }

    return NextResponse.json({ created: !existingBucket });
  } catch (error: unknown) {
    const typedError = error as Error;
    return NextResponse.json(
      {
        error: typedError.message || "Failed to ensure settlement bucket.",
        code: typedError.name || "unknown_error"
      },
      { status: 500 }
    );
  }
}

