import { supabase } from "@/lib/supabaseClient";

const MEETING_BUCKET = "meeting-attachments";

interface UploadParams {
  file: File;
  meetingMinuteId: string;
}

export const uploadMeetingAttachment = async ({
  file,
  meetingMinuteId,
}: UploadParams): Promise<{ filePath: string; fileUrl: string }> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${meetingMinuteId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(MEETING_BUCKET)
    .upload(filePath, file, { upsert: false });

  if (error) {
    throw error;
  }

  // 공개 URL 생성
  const { data: urlData } = supabase.storage
    .from(MEETING_BUCKET)
    .getPublicUrl(filePath);

  return {
    filePath: data?.path || filePath,
    fileUrl: urlData?.publicUrl || "",
  };
};

export const deleteMeetingAttachment = async (filePath: string) => {
  const { error } = await supabase.storage
    .from(MEETING_BUCKET)
    .remove([filePath]);
  if (error) throw error;
};

export const createMeetingSignedUrl = async (filePath: string, expiresIn: number = 60 * 60) => {
  const { data, error } = await supabase.storage
    .from(MEETING_BUCKET)
    .createSignedUrl(filePath, expiresIn);
  if (error) throw error;
  return data?.signedUrl || null;
};

