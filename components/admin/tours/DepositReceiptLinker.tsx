"use client";

import { useState, useEffect } from "react";
import { X, Eye, FileText, Search, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { createSettlementSignedUrl } from "@/utils/settlementDocsUpload";

interface SettlementDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  category: string | null;
  vendor: string | null;
  amount: number | null;
  paid_at: string | null;
  uploaded_at: string | null;
}

interface DepositReceiptLinkerProps {
  tourId: string;
  deposit: any;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (documentId: string) => void;
}

const DepositReceiptLinker: React.FC<DepositReceiptLinkerProps> = ({
  tourId,
  deposit,
  isOpen,
  onClose,
  onSelect,
}) => {
  const [documents, setDocuments] = useState<SettlementDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewDoc, setPreviewDoc] = useState<SettlementDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen, tourId]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      // 골프장 카테고리 또는 전체 문서 조회 (잔금 파일 포함)
      const { data, error } = await supabase
        .from("tour_settlement_documents")
        .select("*")
        .eq("tour_id", tourId)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      // 골프장 관련 문서만 필터링 (golf-course, expenses 중 잔금 포함, tax-invoice, other)
      const filtered = (data || []).filter(doc => {
        if (doc.category === "golf-course" || doc.category === "tax-invoice" || doc.category === "other") {
          return true;
        }
        // expenses 카테고리 중 잔금 파일 포함
        if (doc.category === "expenses" && doc.file_name && (doc.file_name.includes("잔금") || doc.file_name.includes("balance"))) {
          return true;
        }
        return false;
      });
      setDocuments(filtered);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      doc.file_name.toLowerCase().includes(search) ||
      (doc.vendor && doc.vendor.toLowerCase().includes(search))
    );
  });

  const handlePreview = async (doc: SettlementDocument) => {
    setPreviewDoc(doc);
    const url = await createSettlementSignedUrl(doc.file_path, 60 * 10);
    setPreviewUrl(url);
  };

  const handleSelect = (documentId: string) => {
    onSelect(documentId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                영수증 연결
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                입금 내역에 연결할 영수증을 선택하세요
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="파일명 또는 공급처로 검색..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Document List */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                연결할 수 있는 영수증이 없습니다.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {doc.file_name}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          {doc.vendor && <span>공급처: {doc.vendor}</span>}
                          {doc.amount && (
                            <span>
                              금액: {doc.amount.toLocaleString()}원
                            </span>
                          )}
                          {doc.paid_at && (
                            <span>
                              발행일:{" "}
                              {new Date(doc.paid_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePreview(doc)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="미리보기"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSelect(doc.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        선택
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewUrl && previewDoc && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <p className="font-semibold text-gray-900">
                {previewDoc.file_name}
              </p>
              <button
                onClick={() => {
                  setPreviewDoc(null);
                  setPreviewUrl(null);
                }}
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-900"
              >
                닫기
              </button>
            </div>
            <div className="flex-1 bg-gray-50 overflow-auto">
              {previewDoc.file_type?.startsWith("image/") ? (
                <div className="w-full min-h-full flex items-start justify-center p-4">
                  <img
                    src={previewUrl}
                    alt={previewDoc.file_name}
                    className="max-w-full h-auto object-contain rounded-lg"
                    style={{ minHeight: "100%" }}
                  />
                </div>
              ) : (
                <iframe
                  src={previewUrl}
                  className="w-full h-full min-h-[600px]"
                  title={previewDoc.file_name}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DepositReceiptLinker;

