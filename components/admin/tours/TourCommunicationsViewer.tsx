"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { UploadCloud, Loader2, Filter, Trash2, FileText, Eye } from "lucide-react";

const COMM_BUCKET = "tour-communications";

const channelOptions = [
  { value: "kakao", label: "카카오톡" },
  { value: "nateon", label: "네이트온" },
  { value: "booking", label: "부킹 정보" },
  { value: "driver", label: "기사 공지" },
  { value: "guide", label: "가이드 공지" },
  { value: "other", label: "기타" }
];

const sentimentOptions = [
  { value: "neutral", label: "중립" },
  { value: "positive", label: "긍정" },
  { value: "negative", label: "부정" }
];

const getChannelLabel = (value: string | null) => {
  const option = channelOptions.find((opt) => opt.value === value);
  return option ? option.label : "기타";
};

const getSentimentLabel = (value: string | null) => {
  const option = sentimentOptions.find((opt) => opt.value === value);
  return option ? option.label : "중립";
};

const formatFileSize = (size?: number | null) => {
  if (!size) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate()
  ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
};

const isImageType = (fileType?: string | null) => !!fileType && fileType.startsWith("image/");

interface TourCommunicationDocument {
  id: string;
  tour_id: string;
  file_path: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  channel: string | null;
  topic: string | null;
  participants: string[] | null;
  action_item: string | null;
  sentiment: string | null;
  ocr_text: string | null;
  uploaded_by: string | null;
  uploaded_at: string | null;
  ai_summary: any;
}

interface DocumentWithUrl extends TourCommunicationDocument {
  signedUrl?: string | null;
}

interface TourCommunicationsViewerProps {
  tourId: string;
  tourTitle?: string;
}

const TourCommunicationsViewer: React.FC<TourCommunicationsViewerProps> = ({
  tourId,
  tourTitle
}) => {
  const [documents, setDocuments] = useState<DocumentWithUrl[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [channel, setChannel] = useState<string>("kakao");
  const [topic, setTopic] = useState<string>("");
  const [participantsText, setParticipantsText] = useState<string>("");
  const [actionItem, setActionItem] = useState<string>("");
  const [sentiment, setSentiment] = useState<string>("neutral");
  const [error, setError] = useState<string>("");
  const [filterChannel, setFilterChannel] = useState<string>("all");
  const [fileInputKey, setFileInputKey] = useState<number>(Date.now());

  useEffect(() => {
    if (tourId) {
      fetchDocuments();
    }
  }, [tourId]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: fetchError } = await supabase
        .from("tour_communication_documents")
        .select("*")
        .eq("tour_id", tourId)
        .order("uploaded_at", { ascending: false });

      if (fetchError) throw fetchError;

      const docs = await attachSignedUrls(data || []);
      setDocuments(docs);
    } catch (err: any) {
      console.error("Failed to fetch communications:", err);
      setError(err.message || "커뮤니케이션 자료를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const attachSignedUrls = async (docs: TourCommunicationDocument[]): Promise<DocumentWithUrl[]> => {
    const signedDocs = await Promise.all(
      docs.map(async (doc) => {
        try {
          const { data } = await supabase.storage
            .from(COMM_BUCKET)
            .createSignedUrl(doc.file_path, 60 * 60);
          return { ...doc, signedUrl: data?.signedUrl || null };
        } catch (error) {
          console.error("Failed to create signed url:", error);
          return { ...doc, signedUrl: null };
        }
      })
    );
    return signedDocs;
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      const participants = participantsText
        ? participantsText
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean)
        : null;

      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const filePath = `${new Date().getFullYear()}/${tourId}/communications/${channel}/${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from(COMM_BUCKET)
          .upload(filePath, file, { upsert: false });

        if (uploadError) {
          throw uploadError;
        }

        const insertPayload = {
          tour_id: tourId,
          file_path: data?.path || filePath,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          channel,
          topic: topic || null,
          participants,
          action_item: actionItem || null,
          sentiment: sentiment || null,
          uploaded_by: user?.id || null
        };

        const { error: insertError } = await supabase
          .from("tour_communication_documents")
          .insert(insertPayload);

        if (insertError) {
          await supabase.storage.from(COMM_BUCKET).remove([filePath]);
          throw insertError;
        }
      });

      await Promise.all(uploadPromises);
      setTopic("");
      setParticipantsText("");
      setActionItem("");
      setSentiment("neutral");
      setFileInputKey(Date.now());
      fetchDocuments();
    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(err.message || "업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: DocumentWithUrl) => {
    if (!window.confirm("이 파일을 삭제하시겠습니까?")) return;

    try {
      const { error: storageError } = await supabase.storage
        .from(COMM_BUCKET)
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      const { error: deleteError } = await supabase
        .from("tour_communication_documents")
        .delete()
        .eq("id", doc.id);

      if (deleteError) throw deleteError;

      setDocuments((prev) => prev.filter((item) => item.id !== doc.id));
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(err.message || "삭제에 실패했습니다.");
    }
  };

  const handlePreview = async (doc: DocumentWithUrl) => {
    try {
      if (doc.signedUrl) {
        window.open(doc.signedUrl, "_blank", "noopener,noreferrer");
        return;
      }

      const { data, error } = await supabase.storage
        .from(COMM_BUCKET)
        .createSignedUrl(doc.file_path, 60 * 60);
      if (error) throw error;
      window.open(data?.signedUrl || "", "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Preview failed:", err);
      alert("파일을 열 수 없습니다.");
    }
  };

  const filteredDocuments = useMemo(() => {
    if (filterChannel === "all") return documents;
    return documents.filter((doc) => doc.channel === filterChannel);
  }, [documents, filterChannel]);

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">커뮤니케이션 자료</h2>
            {tourTitle && <p className="text-gray-500 text-sm">{tourTitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체 채널</option>
              {channelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">채널</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {channelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">감정</label>
            <select
              value={sentiment}
              onChange={(e) => setSentiment(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sentimentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">주제</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 부킹 확정, 참가자 문의"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">참여자 (쉼표로 구분)</label>
            <input
              type="text"
              value={participantsText}
              onChange={(e) => setParticipantsText(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 홍길동, 김가이드"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Action Item</label>
          <input
            type="text"
            value={actionItem}
            onChange={(e) => setActionItem(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 11/25까지 골프장 확정 회신"
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              key={fileInputKey}
              type="file"
              multiple
              onChange={handleUpload}
              className="hidden"
              accept="image/*,application/pdf"
              disabled={uploading}
            />
            <span className="inline-flex items-center px-4 py-2 border border-dashed border-gray-400 rounded-lg text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600">
              <UploadCloud className="w-4 h-4 mr-2" />
              파일 선택 (이미지/PDF)
            </span>
          </label>
          {uploading && (
            <div className="inline-flex items-center text-sm text-gray-500">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              업로드 중...
            </div>
          )}
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
      </div>

      <div className="px-6 py-6">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" /> 데이터를 불러오는 중입니다...
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">등록된 커뮤니케이션 자료가 없습니다.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                  {doc.signedUrl && isImageType(doc.file_type) ? (
                    <button
                      onClick={() => handlePreview(doc)}
                      className="group block w-full h-full"
                    >
                      <img
                        src={doc.signedUrl}
                        alt={doc.file_name}
                        className="object-contain w-full h-full transition-transform duration-200 group-hover:scale-105"
                      />
                    </button>
                  ) : (
                    <div className="flex flex-col items-center text-gray-400 text-sm">
                      <FileText className="w-10 h-10 mb-2" />
                      <span>미리보기 없음</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">
                      {doc.topic || doc.file_name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {getChannelLabel(doc.channel)}
                    </span>
                  </div>
                  <div>업로드: {formatDateTime(doc.uploaded_at)}</div>
                  <div>파일: {doc.file_name} ({formatFileSize(doc.file_size)})</div>
                  {doc.participants?.length ? (
                    <div>참여자: {doc.participants.join(", ")}</div>
                  ) : null}
                  {doc.action_item && <div>Action: {doc.action_item}</div>}
                  {doc.sentiment && <div>감정: {getSentimentLabel(doc.sentiment)}</div>}
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handlePreview(doc)}
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="w-4 h-4" /> 보기
                  </button>
                  <button
                    onClick={() => handleDelete(doc)}
                    className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" /> 삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TourCommunicationsViewer;
