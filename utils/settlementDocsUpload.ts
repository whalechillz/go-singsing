import { supabase } from "@/lib/supabaseClient";

const SETTLEMENT_BUCKET = "tour-settlement-docs";

interface UploadParams {
  file: File;
  tourId: string;
  category: string;
  folderExtra?: string;
}

export const uploadSettlementDocument = async ({
  file,
  tourId,
  category,
  folderExtra
}: UploadParams): Promise<{ filePath: string }> => {
  const fileExt = file.name.split(".").pop();
  const folder = `${new Date().getFullYear()}/${tourId}/${category}${folderExtra ? `/${folderExtra}` : ""}`;
  const filePath = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(SETTLEMENT_BUCKET)
    .upload(filePath, file, { upsert: false });

  if (error) {
    throw error;
  }

  return { filePath: data?.path || filePath };
};

export const deleteSettlementDocument = async (filePath: string) => {
  const { error } = await supabase.storage
    .from(SETTLEMENT_BUCKET)
    .remove([filePath]);
  if (error) throw error;
};

export const createSettlementSignedUrl = async (filePath: string, expiresIn: number = 60 * 60) => {
  const { data, error } = await supabase.storage
    .from(SETTLEMENT_BUCKET)
    .createSignedUrl(filePath, expiresIn);
  if (error) throw error;
  return data?.signedUrl || null;
};
