'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Loader2, AlertCircle, Copy, RefreshCw } from 'lucide-react';

interface TestResult {
  status: 'pending' | 'testing' | 'success' | 'error';
  message: string;
  details?: any;
}

interface EnvCheck {
  name: string;
  value: boolean;
  details: string;
}

export default function NaverDebugPage() {
  const [envChecks, setEnvChecks] = useState<EnvCheck[]>([]);
  const [apiTests, setApiTests] = useState<Record<string, TestResult>>({
    local: { status: 'pending', message: '대기 중' },
    blog: { status: 'pending', message: '대기 중' },
    image: { status: 'pending', message: '대기 중' },
    comprehensive: { status: 'pending', message: '대기 중' },
  });
  const [testQuery, setTestQuery] = useState('경복궁');
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [rawResponse, setRawResponse] = useState<any>(null);

  // 환경 변수 체크
  const checkEnvironment = async () => {
    try {
      const response = await fetch('/api/debug/naver-env-check');
      const data = await response.json();
      
      const checks: EnvCheck[] = [
        {
          name: 'NAVER_CLIENT_ID',
          value: data.hasClientId,
          details: data.clientIdInfo || 'Not found'
        },
        {
          name: 'NAVER_CLIENT_SECRET',
          value: data.hasClientSecret,
          details: data.hasClientSecret ? 'Set (hidden)' : 'Not found'
        },
        {
          name: 'Environment',
          value: true,
          details: data.environment || 'Unknown'
        },
        {
          name: 'Vercel Deployment',
          value: data.isVercel,
          details: data.isVercel ? 'Running on Vercel' : 'Local development'
        }
      ];
      
      setEnvChecks(checks);
      setRawResponse(data);
    } catch (error) {
      console.error('Environment check failed:', error);
    }
  };

  // 개별 API 테스트
  const testAPI = async (type: string) => {
    setApiTests(prev => ({
      ...prev,
      [type]: { status: 'testing', message: '테스트 중...' }
    }));

    try {
      const response = await fetch('/api/attractions/search-naver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: testQuery, type })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        const resultCount = 
          type === 'comprehensive' 
            ? `Local: ${data.data?.local?.length || 0}, Blog: ${data.data?.blogs?.length || 0}, Image: ${data.data?.images?.length || 0}`
            : `${data.data?.length || 0}개 결과`;

        setApiTests(prev => ({
          ...prev,
          [type]: {
            status: 'success',
            message: `성공! (${resultCount})`,
            details: data
          }
        }));
      } else {
        setApiTests(prev => ({
          ...prev,
          [type]: {
            status: 'error',
            message: data.error || `오류: ${response.status}`,
            details: data
          }
        }));
      }
      
      setRawResponse(data);
    } catch (error: any) {
      setApiTests(prev => ({
        ...prev,
        [type]: {
          status: 'error',
          message: error.message || '네트워크 오류',
          details: error
        }
      }));
    }
  };

  // 모든 API 테스트
  const testAllAPIs = async () => {
    setIsTestingAll(true);
    for (const type of ['local', 'blog', 'image', 'comprehensive']) {
      await testAPI(type);
      await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
    }
    setIsTestingAll(false);
  };

  // 복사 기능
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'testing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">네이버 API 디버깅 도구</h1>

      {/* 1. 환경 변수 체크 */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">1단계: 환경 변수 확인</h2>
          <button
            onClick={checkEnvironment}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            환경 체크
          </button>
        </div>

        <div className="space-y-3">
          {envChecks.map((check, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                {check.value ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">{check.name}</span>
              </div>
              <span className="text-sm text-gray-600">{check.details}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. API 테스트 */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">2단계: API 엔드포인트 테스트</h2>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="검색어 입력"
              className="px-3 py-2 border rounded"
            />
            <button
              onClick={testAllAPIs}
              disabled={isTestingAll}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 flex items-center gap-2"
            >
              {isTestingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              전체 테스트
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {Object.entries(apiTests).map(([type, result]) => (
            <div key={type} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium capitalize">{type} Search</h3>
                <button
                  onClick={() => testAPI(type)}
                  disabled={result.status === 'testing'}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                >
                  {getStatusIcon(result.status)}
                </button>
              </div>
              <p className="text-sm text-gray-600">{result.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 체크리스트 */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">3단계: 네이버 개발자 센터 체크리스트</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-medium mb-2">필수 확인 사항:</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>애플리케이션 등록 완료</li>
              <li>API 사용 설정: 검색 → 지역, 블로그, 이미지 체크</li>
              <li>서비스 환경: WEB 설정</li>
              <li>서비스 URL 등록:
                <ul className="list-disc list-inside ml-5 mt-1">
                  <li>https://go2.singsinggolf.kr</li>
                  <li>https://go-singsing.vercel.app</li>
                  <li>https://*.vercel.app (개발용)</li>
                </ul>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-medium mb-2">Vercel 환경 변수:</h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex items-center justify-between">
                <span>NAVER_CLIENT_ID</span>
                <button
                  onClick={() => copyToClipboard('NAVER_CLIENT_ID')}
                  className="p-1 hover:bg-blue-100 rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span>NAVER_CLIENT_SECRET</span>
                <button
                  onClick={() => copyToClipboard('NAVER_CLIENT_SECRET')}
                  className="p-1 hover:bg-blue-100 rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Raw Response */}
      {rawResponse && (
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">응답 상세 정보</h2>
          <pre className="p-4 bg-gray-900 text-gray-100 rounded overflow-auto text-xs">
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        </div>
      )}

      {/* 5. 문제 해결 가이드 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">문제 해결 가이드</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-red-600 mb-2">401 Unauthorized</h3>
            <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
              <li>Client ID/Secret이 정확한지 확인</li>
              <li>네이버 개발자 센터에서 API 권한 확인</li>
              <li>서비스 URL이 현재 도메인과 일치하는지 확인</li>
              <li>Vercel 환경 변수가 올바르게 설정되었는지 확인</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-red-600 mb-2">403 Forbidden</h3>
            <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
              <li>API 사용 권한이 없음 - 네이버 개발자 센터에서 검색 API 활성화</li>
              <li>일일 호출 한도 초과 (25,000회)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-red-600 mb-2">500 Internal Server Error</h3>
            <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
              <li>서버 코드 오류 - 로그 확인 필요</li>
              <li>환경 변수 로드 실패</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
