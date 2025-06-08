"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { MEMO_CATEGORIES } from "@/@types/memo";

export default function TemplateDebugger() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('urgent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchTemplates = async (category: string) => {
    setLoading(true);
    setError('');
    
    console.log(`=== 템플릿 디버깅 시작 ===`);
    console.log('선택된 카테고리:', category);
    
    const { data, error: fetchError } = await supabase
      .from('singsing_memo_templates')
      .select('*')
      .eq('category', category)
      .order('usage_count', { ascending: false });
    
    if (fetchError) {
      console.error('조회 오류:', fetchError);
      setError(fetchError.message);
    } else if (data) {
      console.log(`조회 결과: ${data.length}개`);
      console.table(data);
      setTemplates(data);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates(selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-bold mb-4">템플릿 디버거</h3>
      
      {/* 카테고리 선택 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">카테고리 선택</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        >
          {Object.entries(MEMO_CATEGORIES).map(([key, info]) => (
            <option key={key} value={key}>
              {info.icon} {info.label}
            </option>
          ))}
        </select>
      </div>

      {/* 결과 표시 */}
      <div className="space-y-2">
        <div className="text-sm">
          <strong>상태:</strong> {loading ? '조회 중...' : '완료'}
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-800 p-2 rounded">
            에러: {error}
          </div>
        )}
        
        <div className="text-sm">
          <strong>조회된 템플릿 수:</strong> {templates.length}개
        </div>
        
        {/* 템플릿 목록 */}
        <div className="mt-4">
          <h4 className="font-medium mb-2">템플릿 목록:</h4>
          {templates.length === 0 ? (
            <p className="text-gray-500">템플릿이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {templates.map((template, index) => (
                <div key={template.id} className="bg-white p-3 rounded border">
                  <div className="text-sm">
                    <strong>{index + 1}. {template.title}</strong>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    ID: {template.id}
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    내용: {template.content_template}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    사용 횟수: {template.usage_count || 0}회
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Raw 데이터 */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium">
            Raw 데이터 보기
          </summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(templates, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
