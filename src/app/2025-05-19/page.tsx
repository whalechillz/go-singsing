"use client";

import { useEffect, useState, useRef } from "react";

interface ComponentItem {
  name: string;
  path: string;
  url: string;
  downloadUrl: string;
  sha?: string;
}

const ADMIN_PASSWORD = "admin1234"; // 실제 배포 시 .env 등으로 분리 권장

const TourPage = () => {
  // tourId를 고정값으로 사용
  const tourId = "2025-05-19";
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/components?tourId=${tourId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setComponents(data.components);
        else setError(data.error || "알 수 없는 오류");
      })
      .catch(() => setError("네트워크 오류"))
      .finally(() => setLoading(false));
  }, [tourId]);

  const handlePwSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowPwModal(false);
      setPwError("");
    } else {
      setPwError("비밀번호가 올바르지 않습니다.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("filename", file.name);
    formData.append("tourId", tourId);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setComponents((prev) => [...prev, {
          name: file.name,
          path: `components/${tourId}/${file.name}`,
          url: `/components/${tourId}/${file.name}`,
          downloadUrl: data.url || "",
        }]);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        alert(`업로드 실패: ${data.error}`);
      }
    } catch {
      alert("업로드 중 오류 발생");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: ComponentItem) => {
    if (!confirm(`${item.name} 파일을 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: item.name, tourId }),
      });
      const data = await res.json();
      if (data.success) {
        setComponents((prev) => prev.filter((c) => c.name !== item.name));
        alert("삭제 성공!");
      } else {
        alert(`삭제 실패: ${data.error}`);
      }
    } catch {
      alert("삭제 중 오류 발생");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold mb-6">투어 파일 관리 ({tourId})</h1>
      {!isAdmin && (
        <button className="mb-6 px-4 py-2 bg-blue-600 rounded" onClick={() => setShowPwModal(true)}>
          관리자 로그인
        </button>
      )}
      {showPwModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <form className="bg-white text-black rounded-lg p-8 w-full max-w-xs shadow-lg relative" onSubmit={handlePwSubmit}>
            <h2 className="text-lg font-bold mb-4">관리자 비밀번호</h2>
            <input
              type="password"
              className="border rounded px-2 py-1 w-full mb-2"
              value={pwInput}
              onChange={(e) => setPwInput(e.target.value)}
              autoFocus
            />
            {pwError && <div className="text-red-500 text-sm mb-2">{pwError}</div>}
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">확인</button>
              <button type="button" className="bg-gray-300 text-gray-800 px-4 py-2 rounded w-full" onClick={() => setShowPwModal(false)}>취소</button>
            </div>
          </form>
        </div>
      )}
      {isAdmin && (
        <form onSubmit={handleUpload} className="mb-6 flex gap-2 items-center">
          <input
            type="file"
            accept=".tsx,.ts,.html,.md"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="border rounded px-2 py-1 bg-white text-black"
            required
          />
          <button type="submit" className="bg-green-600 px-4 py-2 rounded text-white" disabled={uploading}>
            {uploading ? "업로드 중..." : "업로드"}
          </button>
        </form>
      )}
      {loading ? (
        <div>로딩 중...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : components.length === 0 ? (
        <div>업로드된 파일이 없습니다.</div>
      ) : (
        <ul className="w-full max-w-xl space-y-2">
          {components.map((item) => (
            <li key={item.name} className="flex justify-between items-center border rounded px-4 py-2 bg-white/80 dark:bg-black/30">
              <span className="px-1 py-0.5 rounded text-black dark:text-white">{item.name}</span>
              <a
                href={item.downloadUrl}
                className="text-blue-600 underline ml-4"
                target="_blank"
                rel="noopener noreferrer"
                download={item.name}
              >
                다운로드
              </a>
              {isAdmin && (
                <button
                  className="ml-2 px-3 py-1 border border-red-500 bg-transparent text-red-400 hover:bg-red-500 hover:text-white rounded text-sm"
                  onClick={() => handleDelete(item)}
                >
                  삭제
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TourPage;