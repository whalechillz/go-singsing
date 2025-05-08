"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsText(selectedFile);
    } else {
      setPreview("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("filename", file.name);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        alert("업로드 성공!");
        router.push(`/component/${data.componentId}`);
      } else {
        alert(`업로드 실패: ${data.error}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`오류 발생: ${error.message}`);
      } else {
        alert("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">TSX 컴포넌트 업로드</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="file" className="block font-medium mb-1">TSX 파일 선택</label>
          <input
            type="file"
            id="file"
            accept=".tsx,.ts,.html,.md"
            onChange={handleFileChange}
            required
            className="border rounded px-2 py-1"
          />
        </div>
        {preview && (
          <div className="bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-64">
            <h3 className="font-semibold mb-1">파일 미리보기:</h3>
            <pre>{preview}</pre>
          </div>
        )}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={!file || loading}
        >
          {loading ? "업로드 중..." : "업로드"}
        </button>
      </form>
    </div>
  );
} 