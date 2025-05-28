"use client";
import TestMemoDb from "@/components/memo/TestMemoDb";

export default function TestMemoPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">메모 시스템 진단</h1>
      <TestMemoDb />
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-bold text-blue-800 mb-2">문제 해결 가이드</h3>
        <ol className="list-decimal ml-5 space-y-2 text-sm">
          <li>
            <strong>테이블이 없는 경우:</strong>
            <ul className="list-disc ml-5 mt-1">
              <li>Supabase 대시보드 &gt; SQL Editor로 이동</li>
              <li>/supabase/migrations/20250528_create_memo_system.sql 파일 내용 복사</li>
              <li>SQL Editor에 붙여넣고 실행</li>
            </ul>
          </li>
          <li>
            <strong>권한 오류가 나는 경우:</strong>
            <ul className="list-disc ml-5 mt-1">
              <li>RLS 정책이 올바르게 설정되었는지 확인</li>
              <li>anon 키가 올바른지 확인</li>
            </ul>
          </li>
          <li>
            <strong>참가자 ID 오류가 나는 경우:</strong>
            <ul className="list-disc ml-5 mt-1">
              <li>참가자 데이터가 먼저 저장되어 있어야 함</li>
              <li>참가자 ID가 올바른 UUID 형식인지 확인</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  );
}
