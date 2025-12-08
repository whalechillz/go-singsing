"use client";

import { useState } from "react";
import { UploadCloud, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { uploadSettlementDocument } from "@/utils/settlementDocsUpload";

const categoryOptions = [
  { value: "golf-course", label: "골프장" },
  { value: "bus", label: "차량/기사" },
  { value: "guide", label: "가이드" },
  { value: "expenses", label: "경비" },
  { value: "tax-invoice", label: "세금계산서" },
  { value: "other", label: "기타" }
];

interface SettlementReceiptUploaderProps {
  tourId: string;
  onUploaded?: () => void;
}

const formatNumber = (value: string) => {
  const cleaned = value.replace(/[^0-9]/g, "");
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const parseNumber = (value: string) =>
  value ? parseInt(value.replace(/,/g, ""), 10) : null;

const extractErrorMessage = (value: unknown): string | null => {
  if (value instanceof Error) {
    return value.message;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof (value as { message: unknown }).message === "string"
  ) {
    return (value as { message: string }).message;
  }

  return null;
};

const SettlementReceiptUploader: React.FC<SettlementReceiptUploaderProps> = ({
  tourId,
  onUploaded
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [category, setCategory] = useState<string>("golf-course");
  const [vendor, setVendor] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<string>("KRW");
  const [paidAt, setPaidAt] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const resetForm = () => {
    setSelectedFiles(null);
    setVendor("");
    setAmount("");
    setPaidAt("");
    setNotes("");
    const input = document.getElementById(
      "settlement-documents-input"
    ) as HTMLInputElement | null;
    if (input) {
      input.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setErrorMessage("업로드할 파일을 선택해주세요.");
      return;
    }

    setIsUploading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const ensureResponse = await fetch("/api/storage/ensure-settlement-bucket", {
        method: "POST"
      });

      if (!ensureResponse.ok) {
        const ensureResult = await ensureResponse.json().catch(() => ({}));
        throw new Error(
          ensureResult?.error ||
            "스토리지 버킷 초기화에 실패했습니다. 관리자에게 문의해주세요."
        );
      }

      const insertDocument = async (payload: Record<string, unknown>) => {
        const { error } = await supabase.from("tour_settlement_documents").insert(payload);
        return { error };
      };

      const fileArray = Array.from(selectedFiles);
      for (const file of fileArray) {
        const { filePath } = await uploadSettlementDocument({
          file,
          tourId,
          category
        });

        const payloadWithExtendedFields = {
          tour_id: tourId,
          file_path: filePath,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          category,
          vendor: vendor || null,
          amount: parseNumber(amount),
          currency,
          paid_at: paidAt || null,
          notes: notes || null
        };

        const basePayload = {
          tour_id: tourId,
          file_path: filePath,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          category,
          notes: notes || null
        };

        const { error } = await insertDocument(payloadWithExtendedFields);

        if (error) {
          const normalizedMessage = error.message?.toLowerCase() || "";
          const columnMissing =
            normalizedMessage.includes("column") &&
            (normalizedMessage.includes("does not exist") ||
              normalizedMessage.includes("schema cache") ||
              normalizedMessage.includes("could not find"));

          if (columnMissing) {
            const fallbackResult = await insertDocument(basePayload);

            if (fallbackResult.error) {
              throw fallbackResult.error;
            }
          } else {
            throw error;
          }
        }
      }

      setSuccessMessage(`${selectedFiles.length}건 업로드 완료`);
      resetForm();
      onUploaded?.();
    } catch (error) {
      console.error("Settlement document upload error:", error);
      const formattedMessage = extractErrorMessage(error);
      setErrorMessage(
        formattedMessage || "업로드 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <UploadCloud className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">정산 자료 업로드</h3>
          <p className="text-sm text-gray-500">
            세금계산서, 영수증, 가이드 정산표 등 관련 자료를 업로드하세요.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            카테고리
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            공급처 / 발급처
          </label>
          <input
            type="text"
            value={vendor}
            onChange={(event) => setVendor(event.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="예: 순천 CC"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            금액
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(event) => setAmount(formatNumber(event.target.value))}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
            <select
              className="w-24 border border-gray-300 rounded-lg px-2 py-2 focus:ring-blue-500 focus:border-blue-500"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              <option value="KRW">KRW</option>
              <option value="USD">USD</option>
              <option value="JPY">JPY</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            결제 / 발행일
          </label>
          <input
            type="date"
            value={paidAt}
            onChange={(event) => setPaidAt(event.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          비고
        </label>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="추가 설명이 필요하면 입력하세요."
        />
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center mb-4">
        <input
          id="settlement-documents-input"
          type="file"
          className="hidden"
          multiple
          onChange={handleFileChange}
        />
        <label
          htmlFor="settlement-documents-input"
          className="cursor-pointer flex flex-col items-center gap-2 text-gray-600"
          tabIndex={0}
          role="button"
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              const input = document.getElementById(
                "settlement-documents-input"
              ) as HTMLInputElement | null;
              input?.click();
            }
          }}
        >
          <UploadCloud className="w-10 h-10 text-gray-400" />
          <span className="text-base font-medium">파일을 선택하거나 끌어다 놓으세요</span>
          <span className="text-sm text-gray-500">
            JPG, PNG, PDF 등 최대 20MB / 다중 업로드 가능
          </span>
        </label>
        {selectedFiles && selectedFiles.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            선택된 파일: {selectedFiles.length}개
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {errorMessage && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4" />
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-4 h-4" />
            {successMessage}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleUpload}
          disabled={isUploading || !selectedFiles || selectedFiles.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              업로드 중...
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              업로드
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SettlementReceiptUploader;

