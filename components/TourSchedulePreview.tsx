import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Download, Share2, Printer, Calendar, MapPin, Phone, Clock, Users } from 'lucide-react';

interface TourSchedulePreviewProps {
  tourId: string;
}

export default function TourSchedulePreview({ tourId }: TourSchedulePreviewProps) {
  const [tourData, setTourData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('full');

  useEffect(() => {
    fetchTourData();
  }, [tourId]);

  const fetchTourData = async () => {
    try {
      setLoading(true);
      
      // 뷰에서 통합된 데이터 가져오기
      const { data, error } = await supabase
        .from('tour_schedule_preview')
        .select('*')
        .eq('tour_id', tourId)
        .single();

      if (error) throw error;
      setTourData(data);
    } catch (error) {
      console.error('Error fetching tour data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // PDF 다운로드 로직 구현
    console.log('Downloading PDF...');
  };

  const handleShare = () => {
    // 공유 링크 생성 로직
    if (navigator.share) {
      navigator.share({
        title: tourData?.tour_name,
        text: `${tourData?.tour_name} 일정표`,
        url: window.location.href,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!tourData) {
    return <div>투어 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="space-y-6">
      {/* 액션 버튼 */}
      <div className="flex justify-end gap-2 print:hidden">
        <button 
          className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50 flex items-center"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4 mr-1" /> 공유
        </button>
        <button 
          className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50 flex items-center"
          onClick={handlePrint}
        >
          <Printer className="w-4 h-4 mr-1" /> 인쇄
        </button>
        <button 
          className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 flex items-center"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4 mr-1" /> PDF 다운로드
        </button>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b print:hidden">
        <div className="flex space-x-8">
          <button
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'full' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('full')}
          >
            전체 일정표
          </button>
          <button
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'boarding' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('boarding')}
          >
            탑승 안내문
          </button>
          <button
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'simple' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('simple')}
          >
            간단 일정표
          </button>
        </div>
      </div>

      {/* 전체 일정표 */}
      {activeTab === 'full' && (
        <div className="space-y-6">
          {/* 헤더 */}
          <div className="border-2 border-blue-500 rounded-lg">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-lg">
              <h1 className="text-2xl font-bold text-center">
                {tourData.tour_name}
              </h1>
              <p className="text-center text-blue-100 mt-2">
                {new Date(tourData.start_date).toLocaleDateString('ko-KR')} ~ 
                {new Date(tourData.end_date).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>

          {/* 공지사항 */}
          {tourData.notices && tourData.notices.length > 0 && (
            <div className="border rounded-lg">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold flex items-center">
                  <Calendar className="w-5 h-5 mr-2" /> 공지사항
                </h3>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {tourData.notices.map((notice: any, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>{notice.notice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 일정별 상세 정보 */}
          {tourData.schedules?.map((schedule: any, index: number) => (
            <div key={index} className="border rounded-lg break-inside-avoid">
              <div className="bg-gray-50 p-4 border-b">
                <h3 className="text-lg font-semibold">
                  Day {schedule.day_number} - {new Date(schedule.date).toLocaleDateString('ko-KR', { 
                    month: 'long', 
                    day: 'numeric', 
                    weekday: 'long' 
                  })}
                </h3>
              </div>
              <div className="p-4 space-y-4">
                {/* 탑승 정보 */}
                {schedule.boarding_info && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" /> 탑승 정보
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">시간:</span>
                        <span className="ml-2 font-medium">{schedule.boarding_info.time}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">장소:</span>
                        <span className="ml-2 font-medium">{schedule.boarding_info.place}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 일정 항목 */}
                {schedule.schedule_items && schedule.schedule_items.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">일정</h4>
                    <ul className="space-y-1 text-sm">
                      {schedule.schedule_items.map((item: any, idx: number) => (
                        <li key={idx} className="flex items-center">
                          <Clock className="w-3 h-3 mr-2 text-gray-400" />
                          {item.time && <span className="text-gray-600 mr-2">{item.time}</span>}
                          <span>{item.content}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 티타임 정보 */}
                {schedule.tee_times && schedule.tee_times.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Users className="w-4 h-4 mr-2" /> 티타임 배정
                    </h4>
                    {schedule.tee_times.map((teeTime: any, idx: number) => (
                      <div key={idx} className="bg-green-50 p-3 rounded mb-2">
                        <div className="font-medium text-sm mb-1">
                          {teeTime.time} - {teeTime.course}
                        </div>
                        <div className="text-xs text-gray-600">
                          {teeTime.participants?.map((p: any) => `${p.name}(${p.gender || '-'})`).join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* 스탭 정보 */}
          {tourData.staff && tourData.staff.length > 0 && (
            <div className="border rounded-lg break-inside-avoid">
              <div className="bg-yellow-50 p-4 border-b">
                <h3 className="text-lg font-semibold">싱싱골프투어 스탭</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  {tourData.staff.map((staff: any, index: number) => (
                    <div key={index} className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <span className="font-medium">{staff.name}</span>
                        <span className="text-gray-600 ml-2">({staff.role})</span>
                        <div className="text-sm text-gray-500">{staff.phone}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 탑승 안내문 */}
      {activeTab === 'boarding' && (
        <BoardingGuidePreview tourId={tourId} />
      )}

      {/* 간단 일정표 */}
      {activeTab === 'simple' && (
        <SimpleScheduleView tourData={tourData} />
      )}

      {/* 인쇄용 스타일 */}
      <style jsx global>{`
        @media print {
          body {
            font-size: 12px;
          }
          .print\\:hidden {
            display: none !important;
          }
          .break-inside-avoid {
            break-inside: avoid;
          }
          .bg-gradient-to-r {
            background: #3b82f6 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}

// 탑승 안내문 컴포넌트
function BoardingGuidePreview({ tourId }: { tourId: string }) {
  // 기존 BoardingGuidePreview 로직 사용
  return (
    <div className="max-w-2xl mx-auto">
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold text-center mb-4">탑승 안내문</h2>
        <p className="text-center text-gray-600">탑승 안내문 미리보기가 여기에 표시됩니다.</p>
      </div>
    </div>
  );
}

// 간단 일정표 뷰
function SimpleScheduleView({ tourData }: { tourData: any }) {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-center">{tourData.tour_name}</h2>
        </div>
        <div className="p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">날짜</th>
                <th className="text-left p-2">주요 일정</th>
                <th className="text-left p-2">탑승 시간</th>
              </tr>
            </thead>
            <tbody>
              {tourData.schedules?.map((schedule: any, index: number) => (
                <tr key={index} className="border-b">
                  <td className="p-2">
                    Day {schedule.day_number}<br />
                    <span className="text-xs text-gray-500">
                      {new Date(schedule.date).toLocaleDateString('ko-KR')}
                    </span>
                  </td>
                  <td className="p-2">
                    {schedule.schedule_items?.[0]?.content || '-'}
                  </td>
                  <td className="p-2">
                    {schedule.boarding_info?.time || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}