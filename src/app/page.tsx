import Image from "next/image";
import { useEffect, useState } from "react";

interface ComponentItem {
  name: string;
  path: string;
  url: string;
  downloadUrl: string;
}

export default function Home() {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (e) {
        setError("네트워크 오류");
      } finally {
        setLoading(false);
      }
    }
    fetchComponents();
  }, []);

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
                <span>{item.name}</span>
                <a
                  href={item.downloadUrl}
                  className="text-blue-600 underline ml-4"
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  다운로드
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
