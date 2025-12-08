"use client";

import { useState, useCallback } from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon, FileText } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/lib/supabaseClient";
import { uploadMeetingAttachment } from "@/utils/meetingUpload";
import type { MeetingAttachment } from "@/@types/meeting";

interface MeetingAttachmentUploaderProps {
  meetingMinuteId: string;
  existingAttachments?: MeetingAttachment[];
  onUploaded?: (attachments: MeetingAttachment[]) => void;
}

export default function MeetingAttachmentUploader({
  meetingMinuteId,
  existingAttachments = [],
  onUploaded,
}: MeetingAttachmentUploaderProps) {
  const [attachments, setAttachments] = useState<MeetingAttachment[]>(existingAttachments);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = files.map(async (file) => {
        // 파일 크기 검증 (10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name}: 파일 크기는 10MB 이하여야 합니다.`);
        }

        // 파일 업로드
        const { filePath, fileUrl } = await uploadMeetingAttachment({
          file,
          meetingMinuteId,
        });

        // 파일 타입 결정
        let fileCategory: "image" | "document" | "quotation" | "other" = "other";
        if (file.type.startsWith("image/")) {
          fileCategory = "image";
        } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
          fileCategory = "document";
        } else if (file.name.toLowerCase().includes("quotation") || file.name.toLowerCase().includes("견적")) {
          fileCategory = "quotation";
        }

        // DB에 첨부파일 정보 저장
        const { data, error: dbError } = await supabase
          .from("meeting_minute_attachments")
          .insert({
            meeting_minute_id: meetingMinuteId,
            file_name: file.name,
            file_path: filePath,
            file_url: fileUrl,
            file_size: file.size,
            file_type: file.type,
            file_category: fileCategory,
            display_order: attachments.length,
          })
          .select()
          .single();

        if (dbError) throw dbError;

        return data as MeetingAttachment;
      });

      const uploadedAttachments = await Promise.all(uploadPromises);
      const newAttachments = [...attachments, ...uploadedAttachments];
      setAttachments(newAttachments);
      onUploaded?.(newAttachments);
    } catch (err: any) {
      console.error("업로드 오류:", err);
      setError(err.message || "파일 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      handleUpload(acceptedFiles);
    },
    [meetingMinuteId, attachments]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"],
      "application/pdf": [".pdf"],
      "text/*": [".txt", ".md"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading,
  });

  const handleDelete = async (attachmentId: string, filePath: string) => {
    if (!confirm("정말 이 파일을 삭제하시겠습니까?")) return;

    try {
      // Storage에서 파일 삭제
      await supabase.storage.from("meeting-attachments").remove([filePath]);

      // DB에서 레코드 삭제
      const { error } = await supabase
        .from("meeting_minute_attachments")
        .delete()
        .eq("id", attachmentId);

      if (error) throw error;

      const newAttachments = attachments.filter((a) => a.id !== attachmentId);
      setAttachments(newAttachments);
      onUploaded?.(newAttachments);
    } catch (err: any) {
      console.error("삭제 오류:", err);
      alert(`파일 삭제에 실패했습니다: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* 업로드 영역 */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-600">업로드 중...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <UploadCloud className="w-8 h-8 text-gray-400" />
            <p className="text-sm text-gray-600">
              {isDragActive
                ? "파일을 여기에 놓으세요"
                : "파일을 드래그하거나 클릭하여 업로드"}
            </p>
            <p className="text-xs text-gray-500">
              이미지, PDF, 텍스트 파일 (최대 10MB)
            </p>
          </div>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 첨부파일 목록 */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">첨부파일 ({attachments.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="relative border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                {attachment.file_type?.startsWith("image/") ? (
                  <div className="aspect-square mb-2">
                    <img
                      src={attachment.file_url}
                      alt={attachment.file_name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ) : (
                  <div className="aspect-square mb-2 bg-gray-100 rounded flex items-center justify-center">
                    {attachment.file_category === "quotation" ? (
                      <FileText className="w-8 h-8 text-blue-500" />
                    ) : (
                      <FileText className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-700 truncate mb-1" title={attachment.file_name}>
                  {attachment.file_name}
                </p>
                {attachment.file_size && (
                  <p className="text-xs text-gray-500">
                    {(attachment.file_size / 1024).toFixed(1)} KB
                  </p>
                )}
                <button
                  onClick={() => handleDelete(attachment.id, attachment.file_path)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="삭제"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

