// src/types/index.ts
export interface Component {
  name: string;
  content: string;
  createdAt: string;
  downloadUrl: string;
}

// src/components/Layout.tsx
import React, { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'TSX 갤러리' }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            TSX 갤러리
          </Link>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/" className="text-gray-600 hover:text-indigo-600">
                  홈
                </Link>
              </li>
              <li>
                <Link href="/upload" className="text-gray-600 hover:text-indigo-600">
                  업로드
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 mt-10">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          &copy; {new Date().getFullYear()} TSX 갤러리. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;

// src/components/ComponentCard.tsx
import React from 'react';
import Link from 'next/link';
import { Component } from '../types';

interface ComponentCardProps {
  component: Component;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ component }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 truncate">
          {component.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          업로드: {new Date(component.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
        <Link 
          href={`/component/${encodeURIComponent(component.name)}`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          자세히 보기 <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
};

export default ComponentCard;

// src/components/FileUploader.tsx
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';

const FileUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // 확장자 확인
    if (!selectedFile.name.endsWith('.tsx')) {
      setError('TSX 파일만 업로드할 수 있습니다.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError('');

    // 파일 미리보기
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreview(event.target.result as string);
      }
    };
    reader.readAsText(selectedFile);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file.name);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push(`/component/${encodeURIComponent(data.componentId)}`);
      } else {
        setError(data.error || '업로드 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setError('서버 연결 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900">TSX 컴포넌트 업로드</h2>
        <p className="mt-1 text-sm text-gray-500">
          React TSX 컴포넌트 파일을 업로드하여 갤러리에 공유하세요.
        </p>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>파일 선택</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".tsx"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">또는 여기에 파일을 드래그 앤 드롭하세요</p>
              </div>
              <p className="text-xs text-gray-500">TSX 파일만 허용됩니다</p>
            </div>
          </div>

          {file && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700">선택된 파일:</p>
              <p className="text-sm text-gray-500">{file.name}</p>
            </div>
          )}

          {preview && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700">미리보기:</p>
              <div className="mt-2 bg-gray-50 p-4 rounded-md overflow-x-auto">
                <pre className="text-xs text-gray-700">{preview.slice(0, 500)}...</pre>
              </div>
            </div>
          )}

          <div className="mt-5">
            <button
              type="submit"
              disabled={!file || loading}
              className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                (!file || loading) && 'opacity-50 cursor-not-allowed'
              }`}
            >
              {loading ? '업로드 중...' : '업로드'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FileUploader;

// src/components/CodeViewer.tsx
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CodeViewerProps {
  code: string;
  language?: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ code, language = 'tsx' }) => {
  return (
    <div className="rounded-md overflow-hidden bg-gray-900">
      <SyntaxHighlighter
        language={language}
        style={tomorrow}
        customStyle={{ margin: 0, borderRadius: '0.375rem' }}
        showLineNumbers
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeViewer;

// src/pages/index.tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { NextPage } from 'next';
import Layout from '../components/Layout';
import ComponentCard from '../components/ComponentCard';
import { Component } from '../types';

const HomePage: NextPage = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const response = await fetch('/api/components');
        const data = await response.json();

        if (response.ok && data.success) {
          setComponents(data.components);
        } else {
          setError(data.error || '컴포넌트를 불러오는 데 실패했습니다.');
        }
      } catch (err) {
        setError('서버 연결 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComponents();
  }, []);

  return (
    <Layout title="TSX 갤러리 - 홈">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">TSX 컴포넌트 갤러리</h1>
            <p className="mt-1 text-sm text-gray-500">
              React TSX 컴포넌트를 탐색하고 다운로드하세요
            </p>
          </div>
          <Link
            href="/upload"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            새 컴포넌트 업로드
          </Link>
        </div>

        {loading ? (
          <div className="mt-6 text-center py-10">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent"></div>
            <p className="mt-2 text-sm text-gray-500">컴포넌트를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        ) : components.length === 0 ? (
          <div className="mt-6 text-center py-10 bg-white shadow rounded-lg">
            <p className="text-gray-500">업로드된 컴포넌트가 없습니다.</p>
            <p className="mt-2 text-sm text-gray-500">
              새 컴포넌트를 업로드하여 갤러리를 채워보세요!
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {components.map((component) => (
              <ComponentCard key={component.name} component={component} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;

// src/pages/upload.tsx
import React from 'react';
import { NextPage } from 'next';
import Layout from '../components/Layout';
import FileUploader from '../components/FileUploader';

const UploadPage: NextPage = () => {
  return (
    <Layout title="TSX 갤러리 - 업로드">
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">컴포넌트 업로드</h1>
        <p className="mt-1 text-sm text-gray-500">
          TSX 파일을 업로드하여 갤러리에 공유하세요
        </p>
      </div>
      <div className="mt-6">
        <FileUploader />
      </div>
    </Layout>
  );
};

export default UploadPage;

// src/pages/component/[id].tsx
import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import CodeViewer from '../../components/CodeViewer';
import { Component } from '../../types';

const ComponentDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [component, setComponent] = useState<Component | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!id) return;

    const fetchComponent = async () => {
      try {
        const response = await fetch(`/api/component/${id}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setComponent(data.component);
        } else {
          setError(data.error || '컴포넌트를 불러오는 데 실패했습니다.');
        }
      } catch (err) {
        setError('서버 연결 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComponent();
  }, [id]);

  return (
    <Layout title={component ? `${component.name} - TSX 갤러리` : 'TSX 갤러리'}>
      <div className="px-4 py-5 sm:px-6">
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            <span aria-hidden="true">&larr;</span> 목록으로 돌아가기
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent"></div>
            <p className="mt-2 text-sm text-gray-500">컴포넌트를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        ) : component ? (
          <div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h1 className="text-2xl font-bold text-gray-900">{component.name}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  업로드: {new Date(component.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="flex justify-end">
                  <a
                    href={component.downloadUrl}
                    download={component.name}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    다운로드
                  </a>
                </div>
                <div className="mt-4">
                  <h2 className="text-lg font-medium text-gray-900">코드</h2>
                  <div className="mt-2">
                    <CodeViewer code={component.content} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-white shadow rounded-lg">
            <p className="text-gray-500">컴포넌트를 찾을 수 없습니다.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ComponentDetailPage;
