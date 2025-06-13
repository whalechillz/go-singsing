"use client";

import { useState } from "react";
import { Search, Key, Copy, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function PasswordResetPage() {
  const [searchData, setSearchData] = useState({
    email: "",
    name: "",
    phone: ""
  });
  const [newPassword, setNewPassword] = useState("");
  const [sqlQuery, setSqlQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 비밀번호 생성
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  // 사용자 검색
  const searchUser = async () => {
    if (!searchData.email && !searchData.name && !searchData.phone) {
      alert('최소 하나의 검색 조건을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      let query = supabase.from('users').select('*');
      
      if (searchData.email) {
        query = query.eq('email', searchData.email);
      }
      if (searchData.name) {
        query = query.eq('name', searchData.name);
      }
      if (searchData.phone) {
        query = query.eq('phone', searchData.phone);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          alert('해당하는 사용자를 찾을 수 없습니다.');
        } else {
          throw error;
        }
        return;
      }

      setSearchResult(data);
      
      // 자동으로 비밀번호 생성
      generatePassword();
    } catch (error) {
      console.error('Error searching user:', error);
      alert('사용자 검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // SQL 쿼리 생성
  const generateSQLQuery = () => {
    if (!searchResult || !newPassword) {
      alert('먼저 사용자를 검색하고 비밀번호를 생성해주세요.');
      return;
    }

    const query = searchResult.email
      ? `-- ${searchResult.name}님의 비밀번호 초기화
UPDATE auth.users 
SET 
  encrypted_password = crypt('${newPassword}', gen_salt('bf')),
  updated_at = NOW()
WHERE email = '${searchResult.email}';

-- 확인
SELECT email, updated_at 
FROM auth.users 
WHERE email = '${searchResult.email}';`
      : `-- 이메일이 없는 사용자입니다.
-- 먼저 이메일을 등록해야 합니다.
-- 또는 임시 이메일로 계정을 생성할 수 있습니다:

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  '${searchResult.phone}@temp.local',
  crypt('${newPassword}', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"${searchResult.name}","phone":"${searchResult.phone}"}',
  NOW(),
  NOW()
);`;

    setSqlQuery(query);
  };

  // 클립보드에 복사
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlQuery);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      alert('복사에 실패했습니다. 수동으로 복사해주세요.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">비밀번호 초기화 도구</h1>
        <p className="text-gray-600 mt-2">
          사용자의 비밀번호를 초기화하기 위한 SQL 쿼리를 생성합니다.
        </p>
      </div>

      {/* 단계 1: 사용자 검색 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
          사용자 검색
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input
              type="email"
              value={searchData.email}
              onChange={(e) => setSearchData({ ...searchData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <input
              type="text"
              value={searchData.name}
              onChange={(e) => setSearchData({ ...searchData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="홍길동"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
            <input
              type="tel"
              value={searchData.phone}
              onChange={(e) => setSearchData({ ...searchData, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="010-0000-0000"
            />
          </div>
        </div>

        <button
          onClick={searchUser}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Search className="w-5 h-5" />
          {loading ? '검색 중...' : '사용자 검색'}
        </button>

        {searchResult && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="font-medium text-blue-900 mb-2">검색 결과:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p><strong>이름:</strong> {searchResult.name}</p>
              <p><strong>전화번호:</strong> {searchResult.phone}</p>
              <p><strong>이메일:</strong> {searchResult.email || '등록된 이메일 없음'}</p>
              <p><strong>역할:</strong> {searchResult.role}</p>
            </div>
          </div>
        )}
      </div>

      {/* 단계 2: 비밀번호 생성 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
          새 비밀번호 생성
        </h2>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg"
              placeholder="새 비밀번호"
            />
            <p className="text-xs text-gray-500 mt-1">
              * 사용자에게 이 비밀번호를 안전하게 전달해주세요.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={generatePassword}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors h-[42px]"
            >
              자동 생성
            </button>
            <button
              onClick={generateSQLQuery}
              disabled={!searchResult || !newPassword}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors h-[42px]"
            >
              SQL 생성
            </button>
          </div>
        </div>
      </div>

      {/* 단계 3: SQL 쿼리 */}
      {sqlQuery && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">3</span>
            SQL 쿼리 실행
          </h2>

          <div className="mb-4">
            <p className="text-sm text-gray-700 mb-2">
              아래 SQL을 Supabase SQL Editor에서 실행하세요:
            </p>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{sqlQuery}</code>
              </pre>
              <button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
              >
                {copied ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-300" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>주의사항:</strong>
            </p>
            <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
              <li>SQL Editor는 Supabase Dashboard → SQL Editor에서 찾을 수 있습니다.</li>
              <li>쿼리 실행 후 사용자에게 새 비밀번호를 전달해주세요.</li>
              <li>보안을 위해 비밀번호는 안전한 방법으로 전달하세요.</li>
              <li>사용자에게 첫 로그인 후 비밀번호를 변경하도록 안내하세요.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
