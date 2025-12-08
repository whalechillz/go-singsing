#!/usr/bin/env tsx
import "dotenv/config";
import path from "path";
import fs from "fs/promises";
import { createClient } from "@supabase/supabase-js";

const ROOT_DIR = path.join(process.cwd(), "docs/2025-tour-settlement-docs");
const BUCKET_ID = "tour-settlement-docs";
const TARGET_YEAR = "2025";
const DRY_RUN = !process.argv.includes("--apply");
const VERBOSE = process.argv.includes("--debug");

const CATEGORY_MAP: Record<string, string> = {
  "영수증": "expenses",
  "경비지출영수증": "expenses",
  "경비지출영수증": "expenses",
  "경비지출": "expenses",
  "영수증": "expenses",
  "골프장": "golf-course",
  "golf": "golf-course",
  "가이드": "guide",
  "guide": "guide",
  "버스": "bus",
  "bus": "bus",
  "기타": "other"
};

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".pdf": "application/pdf",
  ".webp": "image/webp",
  ".heic": "image/heic"
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("❌  Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

type MigrationResult = {
  tourFolder: string;
  tourId?: string;
  totalFiles: number;
  uploaded: number;
  skipped: number;
  reason?: string;
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();

const detectCategory = (folderName: string): string => {
  const normalized = normalize(folderName);
  for (const key of Object.keys(CATEGORY_MAP)) {
    if (normalized.includes(normalize(key))) {
      return CATEGORY_MAP[key];
    }
  }
  return "expenses";
};

const detectMime = (fileName: string) => {
  const ext = path.extname(fileName).toLowerCase();
  return MIME_MAP[ext] || "application/octet-stream";
};

const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const parseFolder = (folderName: string) => {
  const segments = folderName.split("-");
  if (segments.length < 4) {
    return null;
  }
  const [year, month, day, ...rest] = segments;
  if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month) || !/^\d{2}$/.test(day)) {
    return null;
  }
  const date = `${year}-${month}-${day}`;
  const keyword = rest.join("-");
  return keyword ? { date, keyword } : null;
};

const resolveTourId = async (folderName: string): Promise<{ id?: string; reason?: string }> => {
  const parsed = parseFolder(folderName);
  if (!parsed) {
    return { reason: "폴더명이 YYYY-MM-DD-slug 형식이 아닙니다." };
  }

  const { date, keyword } = parsed;
  const normalizedKeyword = normalize(keyword);

  const { data, error } = await supabase
    .from("singsing_tours")
    .select("id,title,start_date,tour_products ( name, golf_course )")
    .eq("start_date", date);

  if (error) {
    return { reason: `투어 조회 실패: ${error.message}` };
  }

  if (!data || data.length === 0) {
    return { reason: `${date} 날짜의 투어를 찾을 수 없습니다.` };
  }

  if (data.length === 1) {
    return { id: data[0].id };
  }

  const scored = data.map((record) => {
    const fields = [
      record.title || "",
      record.tour_products?.name || "",
      record.tour_products?.golf_course || ""
    ]
      .map(normalize)
      .join("");
    return { record, score: fields.includes(normalizedKeyword) ? 1 : 0 };
  });

  const best = scored.find((item) => item.score === 1);
  if (best) {
    return { id: best.record.id };
  }

  return { reason: `${date} 날짜에 여러 투어가 있어 슬러그(${keyword})로 매칭되지 않습니다.` };
};

const collectFiles = async (dir: string): Promise<Array<{ category: string; absolutePath: string; originalName: string }>> => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: Array<{ category: string; absolutePath: string; originalName: string }> = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const category = detectCategory(entry.name);
      const child = await fs.readdir(fullPath, { withFileTypes: true });
      for (const childEntry of child) {
        if (childEntry.isFile()) {
          files.push({
            category,
            absolutePath: path.join(fullPath, childEntry.name),
            originalName: childEntry.name
          });
        }
      }
      continue;
    }

    if (entry.isFile()) {
      files.push({
        category: "expenses",
        absolutePath: fullPath,
        originalName: entry.name
      });
    }
  }

  return files;
};

const uploadDocument = async (params: {
  tourId: string;
  category: string;
  filePath: string;
  originalName: string;
}) => {
  const buffer = await fs.readFile(params.filePath);
  const ext = path.extname(params.originalName) || path.extname(params.filePath);
  const safeName = `${Date.now()}-${slugify(path.basename(params.originalName, ext))}${ext}`;
  const storagePath = `${TARGET_YEAR}/${params.tourId}/${params.category}/${safeName}`;

  if (DRY_RUN) {
    if (VERBOSE) {
      console.log(`📝 [DRY-RUN] ${storagePath}`);
    }
    return;
  }

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_ID)
    .upload(storagePath, buffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: detectMime(params.originalName)
    });

  if (uploadError) {
    throw new Error(`스토리지 업로드 실패 (${params.originalName}): ${uploadError.message}`);
  }

  const { error: insertError } = await supabase.from("tour_settlement_documents").insert({
    tour_id: params.tourId,
    file_path: storagePath,
    file_name: params.originalName,
    file_type: detectMime(params.originalName),
    file_size: buffer.length,
    category: params.category,
    notes: `Migrated from local folder (${params.originalName})`
  });

  if (insertError) {
    throw new Error(`DB 저장 실패 (${params.originalName}): ${insertError.message}`);
  }
};

const migrateFolder = async (folderName: string): Promise<MigrationResult> => {
  const folderPath = path.join(ROOT_DIR, folderName);
  const stats: MigrationResult = {
    tourFolder: folderName,
    totalFiles: 0,
    uploaded: 0,
    skipped: 0
  };

  const { id, reason } = await resolveTourId(folderName);
  if (!id) {
    stats.reason = reason;
    return stats;
  }

  stats.tourId = id;
  const files = await collectFiles(folderPath);
  stats.totalFiles = files.length;

  for (const file of files) {
    try {
      await uploadDocument({
        tourId: id,
        category: file.category,
        filePath: file.absolutePath,
        originalName: file.originalName
      });
      stats.uploaded += 1;
    } catch (error) {
      stats.skipped += 1;
      console.error(`❌  ${file.originalName}: ${(error as Error).message}`);
    }
  }

  return stats;
};

const main = async () => {
  const entries = await fs.readdir(ROOT_DIR, { withFileTypes: true });
  const folders = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

  const summary: MigrationResult[] = [];
  for (const folder of folders) {
    console.log(`\n📂  Processing ${folder} ${DRY_RUN ? "(dry-run)" : ""}`);
    const result = await migrateFolder(folder);
    summary.push(result);
  }

  console.log("\n=== Migration Summary ===");
  console.table(
    summary.map((item) => ({
      Folder: item.tourFolder,
      Tour: item.tourId ?? "N/A",
      Files: item.totalFiles,
      Uploaded: item.uploaded,
      Skipped: item.skipped,
      Reason: item.reason ?? ""
    }))
  );

  if (DRY_RUN) {
    console.log("\nℹ️  Dry-run mode. Use `pnpm settlement-docs:migrate --apply` to perform the upload.");
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

