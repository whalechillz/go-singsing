/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Download,
  Trash2,
  Loader2,
  RefreshCw,
  FileText,
  FileCheck
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  createSettlementSignedUrl,
  deleteSettlementDocument
} from "@/utils/settlementDocsUpload";
import SettlementMappingModal from "./SettlementMappingModal";

const categoryLabels: Record<string, string> = {
  "golf-course": "골프장",
  bus: "차량/기사",
  guide: "가이드",
  expenses: "경비",
  "tax-invoice": "세금계산서",
  other: "기타"
};

interface SettlementDocument {
  id: string;
  tour_id: string;
  file_path: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  category: string | null;
  vendor: string | null;
  amount: number | null;
  currency: string | null;
  paid_at: string | null;
  notes: string | null;
  uploaded_by: string | null;
  uploaded_at: string | null;
}

interface SettlementReceiptViewerProps {
  tourId: string;
  refreshKey?: number;
  onExpenseUpdated?: () => void;
}

const formatBytes = (bytes?: number | null) => {
  if (!bytes) return "-";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const formatCurrencyValue = (value?: number | null, currency?: string | null) => {
  if (value === null || value === undefined) {
    return "-";
  }
  return `${value.toLocaleString()} ${currency || "KRW"}`;
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : "-";

const SettlementReceiptViewer: React.FC<SettlementReceiptViewerProps> = ({
  tourId,
  refreshKey = 0,
  onExpenseUpdated
}) => {
  const [documents, setDocuments] = useState<SettlementDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<SettlementDocument | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mappingModalOpen, setMappingModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<SettlementDocument | null>(null);
  const [appliedDocuments, setAppliedDocuments] = useState<Set<string>>(new Set());

  const handleFetchDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tour_settlement_documents")
        .select("*")
        .eq("tour_id", tourId)
        .order("uploaded_at", { ascending: false });

      if (error) {
        throw error;
      }

      setDocuments(data || []);

      // 이미 적용된 문서 확인
      if (data && data.length > 0) {
        const { data: mappings } = await supabase
          .from("tour_settlement_document_mappings")
          .select("document_id")
          .in("document_id", data.map((d) => d.id))
          .eq("is_applied", true);

        if (mappings) {
          setAppliedDocuments(new Set(mappings.map((m) => m.document_id)));
        }
      }
    } catch (error) {
      console.error("Failed to fetch settlement documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tourId) {
      handleFetchDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId, refreshKey]);

  const filteredDocuments = useMemo(() => {
    if (categoryFilter === "all") {
      return documents;
    }
    return documents.filter((doc) => doc.category === categoryFilter);
  }, [documents, categoryFilter]);

  const handlePreview = async (doc: SettlementDocument) => {
    setPreviewDoc(doc);
    const url = await createSettlementSignedUrl(doc.file_path, 60 * 10);
    setPreviewUrl(url);
  };

  const handleDownload = async (doc: SettlementDocument) => {
    const url = await createSettlementSignedUrl(doc.file_path, 60 * 10);
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = doc.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (doc: SettlementDocument) => {
    if (!confirm("정말로 이 파일을 삭제하시겠어요?")) {
      return;
    }
    try {
      setDeletingId(doc.id);
      await deleteSettlementDocument(doc.file_path);
      const { error } = await supabase
        .from("tour_settlement_documents")
        .delete()
        .eq("id", doc.id);
      if (error) {
        throw error;
      }
      await handleFetchDocuments();
    } catch (error) {
      console.error("Failed to delete settlement document:", error);
      alert("삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleApplyToSettlement = (doc: SettlementDocument) => {
    // tax-invoice 카테고리는 매핑 불가
    if (doc.category === "tax-invoice") {
      alert("세금계산서는 다른 항목에 연결되어야 합니다. 해당 항목에서 직접 입력해주세요.");
      return;
    }

    setSelectedDoc(doc);
    setMappingModalOpen(true);
  };

  const handleMappingApplied = () => {
    handleFetchDocuments();
    onExpenseUpdated?.();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">정산 자료 목록</h3>
          <p className="text-sm text-gray-500">
            업로드된 세금계산서 및 영수증을 한눈에 확인할 수 있습니다.
          </p>
        </div>
        <div className="flex-grow" />
        <button
          type="button"
          onClick={handleFetchDocuments}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          새로고침
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">전체 카테고리</option>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <div className="text-sm text-gray-500 flex items-center gap-1">
          <FileText className="w-4 h-4" />
          총 {filteredDocuments.length}건
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          불러오는 중입니다...
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-12 text-center text-gray-500">
          업로드된 자료가 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">카테고리</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">파일명</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">공급처</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">금액</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">발행일</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">업로드일</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">크기</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">
                    {doc.category ? categoryLabels[doc.category] : "-"}
                  </td>
                  <td className="px-4 py-3 text-blue-600 underline decoration-dotted">
                    {doc.file_name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{doc.vendor || "-"}</td>
                  <td className="px-4 py-3 text-gray-900">
                    {formatCurrencyValue(doc.amount, doc.currency)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{formatDate(doc.paid_at)}</td>
                  <td className="px-4 py-3 text-gray-700">{formatDate(doc.uploaded_at)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatBytes(doc.file_size)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {appliedDocuments.has(doc.id) ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          적용됨
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApplyToSettlement(doc)}
                          className="p-2 rounded-full text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                          aria-label="정산 폼에 적용"
                          title="정산 폼에 적용"
                        >
                          <FileCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handlePreview(doc)}
                        className="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                        aria-label="미리보기"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(doc)}
                        className="p-2 rounded-full text-gray-500 hover:text-green-600 hover:bg-green-50"
                        aria-label="다운로드"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(doc)}
                        className="p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                        aria-label="삭제"
                        disabled={deletingId === doc.id}
                      >
                        {deletingId === doc.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {previewUrl && previewDoc && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div>
                <p className="font-semibold text-gray-900">{previewDoc.file_name}</p>
                <p className="text-sm text-gray-500">
                  {previewDoc.vendor || "-"} ·{" "}
                  {formatCurrencyValue(previewDoc.amount, previewDoc.currency)}
                </p>
              </div>
              <button
                type="button"
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-900"
                onClick={() => {
                  setPreviewDoc(null);
                  setPreviewUrl(null);
                }}
              >
                닫기
              </button>
            </div>
            <div className="flex-1 bg-gray-50">
              {previewDoc.file_type?.startsWith("image/") ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img
                    src={previewUrl}
                    alt={previewDoc.file_name}
                    className="max-h-full max-w-full object-contain rounded-lg"
                  />
                </div>
              ) : (
                <iframe
                  src={previewUrl}
                  className="w-full h-full"
                  title={previewDoc.file_name}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* 매핑 모달 */}
      {selectedDoc && (
        <SettlementMappingModal
          document={selectedDoc}
          tourId={tourId}
          isOpen={mappingModalOpen}
          onClose={() => {
            setMappingModalOpen(false);
            setSelectedDoc(null);
          }}
          onApplied={handleMappingApplied}
        />
      )}
    </div>
  );
};

export default SettlementReceiptViewer;

