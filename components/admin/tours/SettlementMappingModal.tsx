"use client";

import { useState, useEffect } from "react";
import { X, FileText, CheckCircle, AlertCircle, Loader2, Eye } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { createSettlementSignedUrl } from "@/utils/settlementDocsUpload";
import {
  SettlementDocument as SettlementDocumentType,
  MappingSuggestion,
  generateMappingSuggestion,
  applyMappingToExpenses,
} from "@/utils/settlementMapping";

interface SettlementDocument {
  id: string;
  tour_id: string;
  file_name: string;
  file_type: string | null;
  category: string | null;
  vendor: string | null;
  amount: number | null;
  currency: string | null;
  paid_at: string | null;
  notes: string | null;
}

interface SettlementMappingModalProps {
  document: SettlementDocument;
  tourId: string;
  isOpen: boolean;
  onClose: () => void;
  onApplied: () => void;
}

const SettlementMappingModal: React.FC<SettlementMappingModalProps> = ({
  document,
  tourId,
  isOpen,
  onClose,
  onApplied,
}) => {
  const [suggestion, setSuggestion] = useState<MappingSuggestion | null>(null);
  const [customFields, setCustomFields] = useState<Record<string, any>>({});
  const [applying, setApplying] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && document) {
      const docForMapping: SettlementDocumentType = {
        id: document.id,
        tour_id: document.tour_id,
        category: document.category,
        vendor: document.vendor,
        amount: document.amount,
        currency: document.currency,
        paid_at: document.paid_at,
        notes: document.notes,
      };
      const suggestion = generateMappingSuggestion(docForMapping);
      setSuggestion(suggestion);
      setCustomFields(suggestion?.fields || {});
    }
  }, [isOpen, document]);

  const handlePreview = async () => {
    const { data: doc } = await supabase
      .from("tour_settlement_documents")
      .select("file_path")
      .eq("id", document.id)
      .single();

    if (doc) {
      const url = await createSettlementSignedUrl(doc.file_path, 60 * 10);
      setPreviewUrl(url);
    }
  };

  const handleApply = async () => {
    if (!suggestion) return;

    setApplying(true);
    try {
      const docForMapping: SettlementDocumentType = {
        id: document.id,
        tour_id: document.tour_id,
        category: document.category,
        vendor: document.vendor,
        amount: document.amount,
        currency: document.currency,
        paid_at: document.paid_at,
        notes: document.notes,
      };
      const result = await applyMappingToExpenses(
        tourId,
        document.id,
        suggestion,
        customFields
      );

      if (result.success) {
        alert("정산 폼에 성공적으로 적용되었습니다.");
        onApplied();
        onClose();
      } else {
        alert(`적용 실패: ${result.error}`);
      }
    } catch (error: any) {
      console.error("Apply error:", error);
      alert(`적용 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setApplying(false);
    }
  };

  const updateField = (key: string, value: any) => {
    setCustomFields((prev) => ({ ...prev, [key]: value }));
  };

  if (!isOpen || !suggestion) return null;

  const renderFields = () => {
    switch (suggestion.mappingType) {
      case "golf_course":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                골프장명
              </label>
              <input
                type="text"
                value={customFields.golf_course_name || ""}
                onChange={(e) => updateField("golf_course_name", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                날짜
              </label>
              <input
                type="date"
                value={customFields.date || ""}
                onChange={(e) => updateField("date", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                소계 (원)
              </label>
              <input
                type="number"
                value={customFields.subtotal || 0}
                onChange={(e) =>
                  updateField("subtotal", parseInt(e.target.value) || 0)
                }
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                세금계산서 종류
              </label>
              <select
                value={customFields.receipt_type || ""}
                onChange={(e) => updateField("receipt_type", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">선택</option>
                <option value="tax_invoice">매입세금계산서</option>
                <option value="cash_receipt">현금영수증</option>
                <option value="simple_receipt">간이영수증</option>
                <option value="none">없음</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                세금계산서 번호
              </label>
              <input
                type="text"
                value={customFields.receipt_number || ""}
                onChange={(e) => updateField("receipt_number", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="세금계산서 번호 입력"
              />
            </div>
          </div>
        );

      case "bus":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비용 구분
              </label>
              <select
                value={
                  customFields.bus_driver_cost !== undefined
                    ? "driver"
                    : "bus"
                }
                onChange={(e) => {
                  if (e.target.value === "driver") {
                    setCustomFields({
                      bus_driver_cost: customFields.bus_cost || customFields.bus_driver_cost || 0,
                      bus_notes: customFields.bus_notes || "",
                    });
                  } else {
                    setCustomFields({
                      bus_cost: customFields.bus_driver_cost || customFields.bus_cost || 0,
                      bus_notes: customFields.bus_notes || "",
                    });
                  }
                }}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="bus">버스 비용</option>
                <option value="driver">버스 기사 비용</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                금액 (원)
              </label>
              <input
                type="number"
                value={
                  customFields.bus_cost ||
                  customFields.bus_driver_cost ||
                  0
                }
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (customFields.bus_driver_cost !== undefined) {
                    updateField("bus_driver_cost", value);
                  } else {
                    updateField("bus_cost", value);
                  }
                }}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                메모
              </label>
              <input
                type="text"
                value={customFields.bus_notes || ""}
                onChange={(e) => updateField("bus_notes", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
        );

      case "guide":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                가이드 비용 구분
              </label>
              <select
                value={
                  customFields.guide_fee !== undefined
                    ? "fee"
                    : customFields.guide_meal_cost !== undefined
                    ? "meal"
                    : customFields.guide_accommodation_cost !== undefined
                    ? "accommodation"
                    : "other"
                }
                onChange={(e) => {
                  const value =
                    customFields.guide_fee ||
                    customFields.guide_meal_cost ||
                    customFields.guide_accommodation_cost ||
                    customFields.guide_other_cost ||
                    0;
                  const notes = customFields.guide_notes || "";

                  setCustomFields({
                    [e.target.value === "fee"
                      ? "guide_fee"
                      : e.target.value === "meal"
                      ? "guide_meal_cost"
                      : e.target.value === "accommodation"
                      ? "guide_accommodation_cost"
                      : "guide_other_cost"]: value,
                    guide_notes: notes,
                  });
                }}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="fee">인건비</option>
                <option value="meal">식사비</option>
                <option value="accommodation">숙박비</option>
                <option value="other">기타</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                금액 (원)
              </label>
              <input
                type="number"
                value={
                  customFields.guide_fee ||
                  customFields.guide_meal_cost ||
                  customFields.guide_accommodation_cost ||
                  customFields.guide_other_cost ||
                  0
                }
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  const currentType =
                    customFields.guide_fee !== undefined
                      ? "guide_fee"
                      : customFields.guide_meal_cost !== undefined
                      ? "guide_meal_cost"
                      : customFields.guide_accommodation_cost !== undefined
                      ? "guide_accommodation_cost"
                      : "guide_other_cost";

                  setCustomFields({
                    ...customFields,
                    [currentType]: value,
                  });
                }}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                메모
              </label>
              <input
                type="text"
                value={customFields.guide_notes || ""}
                onChange={(e) => updateField("guide_notes", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
        );

      case "meal":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                경비 종류
              </label>
              <select
                value={customFields.type || "other"}
                onChange={(e) => updateField("type", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="gimbap">김밥</option>
                <option value="water">생수/음료</option>
                <option value="snack">간식</option>
                <option value="other">기타</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              <input
                type="text"
                value={customFields.description || ""}
                onChange={(e) => updateField("description", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                단가 (원)
              </label>
              <input
                type="number"
                value={customFields.unit_price || 0}
                onChange={(e) =>
                  updateField("unit_price", parseInt(e.target.value) || 0)
                }
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                수량
              </label>
              <input
                type="number"
                value={customFields.quantity || 1}
                onChange={(e) => {
                  const qty = parseInt(e.target.value) || 1;
                  const unitPrice = customFields.unit_price || 0;
                  updateField("quantity", qty);
                  updateField("total", qty * unitPrice);
                }}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                총액 (원)
              </label>
              <input
                type="number"
                value={customFields.total || 0}
                onChange={(e) =>
                  updateField("total", parseInt(e.target.value) || 0)
                }
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
        );

      case "other":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              <input
                type="text"
                value={customFields.description || ""}
                onChange={(e) => updateField("description", e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                금액 (원)
              </label>
              <input
                type="number"
                value={customFields.amount || 0}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  updateField("amount", value);
                  updateField("other_expenses_total", value);
                }}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
        );

      default:
        return <div className="text-gray-500">지원하지 않는 카테고리입니다.</div>;
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  정산 폼에 적용
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 왼쪽: 문서 정보 */}
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      문서 정보
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">파일명:</span>{" "}
                        <span className="font-medium">{document.file_name || "-"}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">카테고리:</span>{" "}
                        <span className="font-medium">
                          {document.category || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">공급처:</span>{" "}
                        <span className="font-medium">
                          {document.vendor || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">금액:</span>{" "}
                        <span className="font-medium">
                          {document.amount
                            ? `${document.amount.toLocaleString()} ${document.currency || "KRW"}`
                            : "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">발행일:</span>{" "}
                        <span className="font-medium">
                          {document.paid_at
                            ? new Date(document.paid_at).toLocaleDateString()
                            : "-"}
                        </span>
                      </div>
                      {document.notes && (
                        <div>
                          <span className="text-gray-600">비고:</span>{" "}
                          <span className="font-medium">{document.notes}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handlePreview}
                      className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-4 h-4" />
                      문서 미리보기
                    </button>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">자동 매핑 제안</p>
                        <p>{suggestion.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 오른쪽: 정산 폼 입력값 */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      정산 폼 입력값
                    </h3>
                    {renderFields()}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {applying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    적용 중...
                  </>
                ) : (
                  "적용"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 문서 미리보기 모달 */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <p className="font-semibold text-gray-900">{document.file_name}</p>
              <button
                onClick={() => setPreviewUrl(null)}
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-900"
              >
                닫기
              </button>
            </div>
            <div className="flex-1 bg-gray-50">
              {document.file_type?.startsWith("image/") ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img
                    src={previewUrl}
                    alt={document.file_name || ""}
                    className="max-h-full max-w-full object-contain rounded-lg"
                  />
                </div>
              ) : (
                <iframe
                  src={previewUrl}
                  className="w-full h-full"
                  title={document.file_name || ""}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettlementMappingModal;

