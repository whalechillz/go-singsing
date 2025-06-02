"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Save, FileText, AlertCircle } from 'lucide-react';

interface DocumentFooter {
  id?: string;
  tour_id: string;
  document_type: string;
  section_title: string;
  content: string;
  order_index: number;
}

interface DocumentFooterManagerProps {
  tourId: string;
}

// 문서별 하단 섹션 정의
const DOCUMENT_SECTIONS = [
  {
    document_type: 'rounding_timetable',
    document_name: '라운딩 시간표',
    sections: [
      { key: 'round_notice', title: '라운딩 주의사항', order: 1 }
    ]
  },
  {
    document_type: 'boarding_guide', 
    document_name: '탑승지 안내',
    sections: [
      { key: 'boarding_notice', title: '탑승 주의사항', order: 1 }
    ]
  },
  {
    document_type: 'room_assignment',
    document_name: '객실 배정',
    sections: [
      { key: 'room_usage', title: '객실 이용 안내', order: 1 },
      { key: 'meal_info', title: '식사 안내', order: 2 }
    ]
  },
  {
    document_type: 'tour_schedule',
    document_name: '전체 일정표', 
    sections: [
      { key: 'locker_usage', title: '락카 이용 안내', order: 1 }
    ]
  }
];

export default function DocumentFooterManager({ tourId }: DocumentFooterManagerProps) {
  const [footers, setFooters] = useState<Record<string, DocumentFooter>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('rounding_timetable');

  useEffect(() => {
    if (tourId) {
      fetchFooters();
    }
  }, [tourId]);

  const fetchFooters = async () => {
    try {
      const { data, error } = await supabase
        .from('document_footers')
        .select('*')
        .eq('tour_id', tourId);

      if (error) throw error;

      // 데이터를 키-값 형태로 변환
      const footerMap: Record<string, DocumentFooter> = {};
      if (data) {
        data.forEach(footer => {
          const key = `${footer.document_type}_${footer.section_title}`;
          footerMap[key] = footer;
        });
      }

      // 기본값 설정
      DOCUMENT_SECTIONS.forEach(doc => {
        doc.sections.forEach(section => {
          const key = `${doc.document_type}_${section.title}`;
          if (!footerMap[key]) {
            footerMap[key] = {
              tour_id: tourId,
              document_type: doc.document_type,
              section_title: section.title,
              content: getDefaultContent(doc.document_type, section.key),
              order_index: section.order
            };
          }
        });
      });

      setFooters(footerMap);
    } catch (error) {
      console.error('Error fetching footers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultContent = (docType: string, sectionKey: string): string => {
    const defaults: Record<string, string> = {
      'rounding_timetable_round_notice': `• 티오프 시간 준수: 티오프 15분 전까지 카트 대기선에 도착해주세요.
• 복장 규정: 골프장 드레스 코드를 준수해주세요. (청바지, 트레이닝복 착용 금지)
• 진행 속도: 앞 조와의 간격을 유지하여 원활한 플레이를 부탁드립니다.
• 에티켓: 벙커 정리, 디보트 복구 등 기본 에티켓을 준수해주세요.
• 캐디피: 캐디피는 별도 현장 결제입니다. (4인 기준: 150,000원)`,
      
      'boarding_guide_boarding_notice': `• 출발 시간보다 20분 전 도착해주세요.
• 멀미가 심하신 분은 출발 전에 기사님께 말씀해주시면 앞좌석을 우선 배정해 드립니다.
• 여행에 필요한 물품과 신분증을 꼭 지참해주세요.
• 개인 짐은 선반과 트렁크에 보관 가능합니다.
• 이동 중 약 2시간 간격으로 휴게소에 정차할 예정입니다.`,
      
      'room_assignment_room_usage': `• 체크아웃: 10시 이전 골프 이용고객의 경우 퇴실 당일 골프예약시간 이전
• 기본 제공: 샴푸, 린스, 비누, 바디워시, 로션, 스킨, 드라이기, 커피포트
• 준비 필요: 칫솔, 치약, 면도기, 휴대폰 충전기
• 추가 사항: 건조대 필요 시 프론트에서 대여 가능`,
      
      'room_assignment_meal_info': `• 클럽하우스 운영 시간 내 이용
• 외부 음식 및 주류 반입 금지
• 미이용 시 환불 불가
• 패키지 외 추가 식사는 당일 결제 필수`,
      
      'tour_schedule_locker_usage': `• 2일 차부터 제공, 프론트 데스크에서 개별 배정
• 매일 새로운 번호로 배정, 사용 시마다 수령 필요
• 장시간 보관 불가, 분실 시 책임지지 않음`
    };
    
    return defaults[`${docType}_${sectionKey}`] || '';
  };

  const handleContentChange = (key: string, content: string) => {
    setFooters(prev => ({
      ...prev,
      [key]: { ...prev[key], content }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 각 footer를 저장
      for (const [key, footer] of Object.entries(footers)) {
        if (footer.id) {
          // 업데이트
          await supabase
            .from('document_footers')
            .update({ content: footer.content })
            .eq('id', footer.id);
        } else {
          // 새로 생성
          await supabase
            .from('document_footers')
            .insert(footer);
        }
      }

      alert('저장되었습니다.');
      fetchFooters(); // 다시 로드
    } catch (error) {
      console.error('Error saving footers:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  const activeDocument = DOCUMENT_SECTIONS.find(doc => doc.document_type === activeTab);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">문서별 하단 내용 관리</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? '저장 중...' : '모두 저장'}
        </button>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b mb-6">
        <div className="flex gap-0 overflow-x-auto">
          {DOCUMENT_SECTIONS.map(doc => (
            <button
              key={doc.document_type}
              onClick={() => setActiveTab(doc.document_type)}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === doc.document_type
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-800'
              }`}
            >
              <FileText className="w-4 h-4 inline-block mr-1" />
              {doc.document_name}
            </button>
          ))}
        </div>
      </div>

      {/* 활성 탭 내용 */}
      {activeDocument && (
        <div className="space-y-6">
          {activeDocument.sections.map(section => {
            const key = `${activeDocument.document_type}_${section.title}`;
            const footer = footers[key];

            return (
              <div key={key} className="border rounded-lg p-4">
                <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                  {section.title}
                </h3>
                <textarea
                  value={footer?.content || ''}
                  onChange={(e) => handleContentChange(key, e.target.value)}
                  className="w-full h-40 p-3 border rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`${section.title} 내용을 입력하세요...`}
                />
                <div className="mt-2 text-sm text-gray-500">
                  * 줄바꿈은 Enter키, 목록은 • 기호를 사용하세요
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 미리보기 정보 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>안내:</strong> 여기서 설정한 내용은 각 문서의 하단에 자동으로 표시됩니다.
          문서 생성 시 이 내용들이 포함되어 출력됩니다.
        </p>
      </div>
    </div>
  );
}