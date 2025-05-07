"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ComponentItem {
  name: string;
  path: string;
  url: string;
  downloadUrl: string;
  sha?: string;
}

export default function Home() {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");
  const [showOverwrite, setShowOverwrite] = useState(false);
  const [overwriteSha, setOverwriteSha] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    async function fetchComponents() {
      try {
        const res = await fetch("/api/components");
        const data = await res.json();
        if (data.success) {
          setComponents(data.components);
        } else {
          setError(data.error || "알 수 없는 오류");
        }
      } catch {
        setError("네트워크 오류");
      } finally {
        setLoading(false);
      }
    }
    fetchComponents();
  }, []);

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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const exist = components.find((c) => c.name === file.name);
    if (exist) {
      try {
        const res = await fetch(`/api/components`);
        const data = await res.json();
        const found = (data.components as ComponentItem[]).find((c) => c.name === file.name);
        if (found && found.sha) {
          setOverwriteSha(found.sha);
        } else {
          setOverwriteSha(null);
        }
      } catch {
        setOverwriteSha(null);
      }
      setShowOverwrite(true);
      setUploading(false);
      return;
    }
    await doUpload();
  };

  const doUpload = async (sha?: string | null) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("filename", file.name);
    if (sha) formData.append("sha", sha);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        alert("업로드 성공!");
        setShowUpload(false);
        setShowOverwrite(false);
        setFile(null);
        setPreview("");
        setOverwriteSha(null);
        setComponents((prev) => [
          ...prev.filter((c) => c.name !== file.name),
          {
            name: file.name,
            path: `components/${file.name}`,
            url: `/components/${file.name}`,
            downloadUrl: data.url || "",
            sha: sha || undefined,
          },
        ]);
      } else {
        alert(`업로드 실패: ${data.error}`);
      }
    } catch {
      alert("업로드 중 오류 발생");
    } finally {
      setUploading(false);
    }
  };

  const handleOverwrite = async () => {
    await doUpload(overwriteSha);
  };

  const handlePreview = async (name: string) => {
    setPreviewFileName(name);
    setPreviewContent(null);
    setPreviewLoading(true);
    setPreviewOpen(true);
    try {
      const res = await fetch(`/api/raw?name=${name}`);
      if (!res.ok) throw new Error("파일을 불러오지 못했습니다");
      const text = await res.text();
      setPreviewContent(text);
    } catch (e) {
      setPreviewError("파일을 불러오지 못했습니다");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDelete = async (item: ComponentItem) => {
    if (!confirm(`${item.name} 파일을 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: item.name })
      });
      const data = await res.json();
      if (data.success) {
        setComponents((prev) => prev.filter((c) => c.name !== item.name));
        alert('삭제 성공!');
      } else {
        alert(`삭제 실패: ${data.error}`);
      }
    } catch {
      alert('삭제 중 오류 발생');
    }
  };

  function getPreviewButtonLabel(filename: string) {
    if (filename.endsWith('.md')) return '문서 보기';
    if (filename.endsWith('.html')) return '웹페이지 보기';
    if (filename.endsWith('.tsx') || filename.endsWith('.ts')) return '코드 보기';
    return '내용 보기';
  }

  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <h1 className="text-2xl font-bold mb-4">업로드된 파일 목록</h1>
        <button
          className="mb-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => setShowUpload(true)}
        >
          업로드
        </button>
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
                <span
                  className="cursor-pointer select-none px-1 py-0.5 rounded hover:bg-blue-100 focus:bg-blue-200 outline-none"
                  tabIndex={0}
                  role="button"
                  aria-label={`${item.name} 문서 보기`}
                  onClick={() => handlePreview(item.name)}
                  onKeyDown={() => {
                    handlePreview(item.name);
                  }}
                >
                  {item.name}
                </span>
                <a
                  href={item.downloadUrl}
                  className="text-blue-600 underline ml-4"
                  target="_blank"
                  rel="noopener noreferrer"
                  download={item.name}
                >
                  다운로드
                </a>
                <button
                  className="ml-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                  onClick={() => handlePreview(item.name)}
                >
                  {getPreviewButtonLabel(item.name)}
                </button>
                <button
                  className="ml-2 px-3 py-1 border border-red-500 bg-transparent text-red-400 hover:bg-red-500 hover:text-white focus:bg-red-600 focus:text-white rounded text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-400"
                  aria-label={`${item.name} 삭제`}
                  tabIndex={0}
                  onClick={() => handleDelete(item)}
                  onKeyDown={() => {
                    handleDelete(item);
                  }}
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
      {showUpload && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-gray-700 dark:hover:text-white"
              onClick={() => setShowUpload(false)}
              aria-label="닫기"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">파일 업로드</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <input
                type="file"
                accept=".tsx,.ts,.html,.md"
                onChange={handleFileChange}
                ref={fileInputRef}
                required
                className="border rounded px-2 py-1 w-full"
              />
              {preview && (
                <div className="bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-40">
                  <h3 className="font-semibold mb-1">파일 미리보기:</h3>
                  <pre>{preview}</pre>
                </div>
              )}
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 w-full"
                disabled={!file || uploading}
              >
                {uploading ? "업로드 중..." : "업로드"}
              </button>
            </form>
          </div>
        </div>
      )}
      {showOverwrite && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-sm shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-gray-700 dark:hover:text-white"
              onClick={() => setShowOverwrite(false)}
              aria-label="닫기"
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-4">덮어쓰기 확인</h2>
            <p className="mb-4">동일한 이름의 파일이 이미 존재합니다.<br />덮어쓰시겠습니까?</p>
            <div className="flex gap-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleOverwrite}
                disabled={uploading}
              >
                덮어쓰기
              </button>
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                onClick={() => setShowOverwrite(false)}
                disabled={uploading}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-3xl max-h-[90vh] shadow-lg relative flex flex-col">
            <button
              className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-gray-700 dark:hover:text-white"
              onClick={() => setShowPreview(false)}
              aria-label="닫기"
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-4 break-all">{previewFileName}</h2>
            <div className="flex-1 overflow-auto bg-gray-100 dark:bg-black/30 rounded p-4 text-xs whitespace-pre-wrap">
              {previewLoading ? (
                "로딩 중..."
              ) : previewFileName.endsWith('.md') ? (
                <ReactMarkdown>{previewContent}</ReactMarkdown>
              ) : previewFileName.endsWith('.html') ? (
                <iframe
                  srcDoc={previewContent}
                  title="HTML 미리보기"
                  className="w-full h-[60vh] bg-white border rounded"
                />
              ) : previewFileName.endsWith('.tsx') || previewFileName.endsWith('.ts') ? (
                <SyntaxHighlighter language="tsx" style={oneDark} wrapLongLines>
                  {previewContent}
                </SyntaxHighlighter>
              ) : (
                <pre>{previewContent}</pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
