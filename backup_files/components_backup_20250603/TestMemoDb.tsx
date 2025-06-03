"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TestMemoDb() {
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    try {
      // 1. 테이블 존재 확인
      const { data: memos, error: memoError } = await supabase
        .from('singsing_memos')
        .select('count')
        .limit(1);
      
      if (memoError) {
        setError(`메모 테이블 오류: ${memoError.message}`);
        console.error('메모 테이블 오류:', memoError);
      } else {
        setStatus(prev => prev + '\n✅ singsing_memos 테이블 존재');
      }

      // 2. 템플릿 테이블 확인
      const { data: templates, error: templateError } = await supabase
        .from('singsing_memo_templates')
        .select('*')
        .limit(5);
      
      if (templateError) {
        setError(prev => prev + `\n템플릿 테이블 오류: ${templateError.message}`);
        console.error('템플릿 테이블 오류:', templateError);
      } else {
        setStatus(prev => prev + `\n✅ singsing_memo_templates 테이블 존재 (${templates?.length || 0}개 템플릿)`);
      }

      // 3. 테스트 데이터 삽입 시도
      const testMemo = {
        participant_id: '00000000-0000-0000-0000-000000000000', // 임시 UUID
        tour_id: '00000000-0000-0000-0000-000000000000', // 임시 UUID
        category: 'general' as const,
        priority: 0,
        content: '테스트 메모',
        status: 'pending' as const,
        created_by: '테스트'
      };

      const { data: insertData, error: insertError } = await supabase
        .from('singsing_memos')
        .insert(testMemo)
        .select();

      if (insertError) {
        setError(prev => prev + `\n❌ 메모 삽입 실패: ${insertError.message}`);
        console.error('삽입 오류 상세:', {
          error: insertError,
          message: insertError.message,
          hint: insertError.hint,
          details: insertError.details,
          code: insertError.code
        });
      } else {
        setStatus(prev => prev + '\n✅ 테스트 메모 삽입 성공');
        
        // 삽입한 데이터 삭제
        if (insertData && insertData[0]) {
          await supabase
            .from('singsing_memos')
            .delete()
            .eq('id', insertData[0].id);
        }
      }

    } catch (err) {
      console.error('데이터베이스 체크 오류:', err);
      setError(`치명적 오류: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const runMigration = async () => {
    setLoading(true);
    try {
      const migrationSQL = await fetch('/supabase/migrations/20250528_create_memo_system.sql').then(r => r.text());
      
      // 이 부분은 Supabase 대시보드에서 직접 실행해야 합니다
      setStatus(prev => prev + '\n\n⚠️ 마이그레이션 SQL을 Supabase 대시보드에서 직접 실행해주세요.');
      
    } catch (err) {
      setError(`마이그레이션 로드 실패: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">메모 데이터베이스 상태 점검</h3>
      
      {loading && <p className="text-blue-600">확인 중...</p>}
      
      {status && (
        <pre className="text-sm text-green-700 whitespace-pre-wrap bg-green-50 p-2 rounded mt-2">
          {status}
        </pre>
      )}
      
      {error && (
        <pre className="text-sm text-red-700 whitespace-pre-wrap bg-red-50 p-2 rounded mt-2">
          {error}
        </pre>
      )}

      <div className="mt-4 space-y-2">
        <button
          onClick={checkDatabase}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          다시 확인
        </button>
        
        <div className="text-sm text-gray-600 mt-2">
          <p>만약 테이블이 없다면:</p>
          <ol className="list-decimal ml-5 mt-1">
            <li>Supabase 대시보드로 이동</li>
            <li>SQL Editor 열기</li>
            <li>20250528_create_memo_system.sql 내용 복사하여 실행</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
