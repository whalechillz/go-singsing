"use client";
import React, { useState } from 'react';
import { X, Copy, Calendar, CheckSquare, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface Tour {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  driver_name: string;
  price: number;
  max_participants: number;
  tour_product_id?: string;
  [key: string]: any;
}

interface TourCopyModalProps {
  tour: Tour;
  isOpen: boolean;
  onClose: () => void;
}

const TourCopyModal: React.FC<TourCopyModalProps> = ({ tour, isOpen, onClose }) => {
  const router = useRouter();
  const [newTitle, setNewTitle] = useState(`${tour.title} (복사본)`);
  const [copySchedules, setCopySchedules] = useState(true);
  const [copyJourneyInfo, setCopyJourneyInfo] = useState(true);
  const [copying, setCopying] = useState(false);
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (!newTitle.trim()) {
      alert('투어 제목을 입력해주세요.');
      return;
    }

    if (!newStartDate || !newEndDate) {
      alert('새 투어의 시작일과 종료일을 입력해주세요.');
      return;
    }

    setCopying(true);

    try {
      // 1. 투어 기본 정보 복사
      const { data: newTour, error: tourError } = await supabase
        .from('singsing_tours')
        .insert({
          title: newTitle,
          start_date: newStartDate,
          end_date: newEndDate,
          driver_name: tour.driver_name,
          price: tour.price,
          max_participants: tour.max_participants,
          tour_product_id: tour.tour_product_id,
          // 기타 필드들 복사 (마감 상태 제외)
          footer_message: tour.footer_message,
          company_phone: tour.company_phone,
          company_mobile: tour.company_mobile,
          golf_reservation_phone: tour.golf_reservation_phone,
          golf_reservation_mobile: tour.golf_reservation_mobile,
          show_staff_info: tour.show_staff_info,
          show_footer_message: tour.show_footer_message,
          show_company_phone: tour.show_company_phone,
          show_golf_phones: tour.show_golf_phones,
          other_notices: tour.other_notices,
          document_settings: tour.document_settings,
          phone_display_settings: tour.phone_display_settings
        })
        .select()
        .single();

      if (tourError) throw tourError;

      const newTourId = newTour.id;

      // 2. 일정 정보 복사 (선택한 경우)
      if (copySchedules) {
        // 일별 일정 복사
        const { data: schedules } = await supabase
          .from('singsing_schedules')
          .select('*')
          .eq('tour_id', tour.id);

        if (schedules && schedules.length > 0) {
          // 날짜 차이 계산
          const originalStartDate = new Date(tour.start_date);
          const newStartDateObj = new Date(newStartDate);
          const dateDiff = Math.floor((newStartDateObj.getTime() - originalStartDate.getTime()) / (1000 * 60 * 60 * 24));

          const newSchedules = schedules.map(schedule => {
            const { id, tour_id, created_at, ...rest } = schedule;
            
            // 일정 날짜 조정
            let adjustedDate = rest.date;
            if (rest.date) {
              const scheduleDate = new Date(rest.date);
              scheduleDate.setDate(scheduleDate.getDate() + dateDiff);
              adjustedDate = scheduleDate.toISOString().split('T')[0];
            }
            
            let adjustedScheduleDate = rest.schedule_date;
            if (rest.schedule_date) {
              const scheduleDate = new Date(rest.schedule_date);
              scheduleDate.setDate(scheduleDate.getDate() + dateDiff);
              adjustedScheduleDate = scheduleDate.toISOString().split('T')[0];
            }

            return {
              ...rest,
              tour_id: newTourId,
              date: adjustedDate,
              schedule_date: adjustedScheduleDate
            };
          });

          await supabase
            .from('singsing_schedules')
            .insert(newSchedules);
        }
      }

      // 3. 탑승 정보 복사 (선택한 경우)
      if (copyBoardingInfo) {
        // 탑승 시간 정보 복사
        const { data: boardingTimes } = await supabase
          .from('singsing_tour_boarding_times')
          .select('*')
          .eq('tour_id', tour.id);

        if (boardingTimes && boardingTimes.length > 0) {
          const newBoardingTimes = boardingTimes.map(bt => {
            const { id, tour_id, created_at, updated_at, ...rest } = bt;
            return {
              ...rest,
              tour_id: newTourId
            };
          });

          await supabase
            .from('singsing_tour_boarding_times')
            .insert(newBoardingTimes);
        }

        // 여정 정보 복사
        const { data: journeyItems } = await supabase
          .from('tour_journey_items')
          .select('*')
          .eq('tour_id', tour.id);

        if (journeyItems && journeyItems.length > 0) {
          const newJourneyItems = journeyItems.map(item => {
            const { id, tour_id, created_at, updated_at, ...rest } = item;
            return {
              ...rest,
              tour_id: newTourId
            };
          });

          await supabase
            .from('tour_journey_items')
            .insert(newJourneyItems);
        }
      }

      // 성공 메시지
      alert('투어가 성공적으로 복사되었습니다!');
      
      // 새 투어 편집 페이지로 이동
      router.push(`/admin/tours/${newTourId}/edit`);
      
    } catch (error: any) {
      console.error('투어 복사 실패:', error);
      alert('투어 복사 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Copy className="w-6 h-6" />
            투어 복사
          </h3>
          <button 
            type="button" 
            className="text-gray-500 hover:text-gray-700" 
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* 원본 투어 정보 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">원본 투어</p>
            <p className="font-medium text-gray-900">{tour.title}</p>
            <p className="text-sm text-gray-500">
              {new Date(tour.start_date).toLocaleDateString('ko-KR')} - {new Date(tour.end_date).toLocaleDateString('ko-KR')}
            </p>
          </div>

          {/* 새 투어 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              새 투어 제목 *
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="새 투어 제목을 입력하세요"
            />
          </div>

          {/* 새 투어 날짜 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시작일 *
              </label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                종료일 *
              </label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                min={newStartDate}
              />
            </div>
          </div>

          {/* 복사 옵션 */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">복사할 항목 선택</p>
            
            <label className="flex items-center cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={copySchedules}
                onChange={(e) => setCopySchedules(e.target.checked)}
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">일정 정보</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  일별 스케줄, 식사 정보 등
                </p>
              </div>
            </label>

            <label className="flex items-center cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={copyBoardingInfo}
                onChange={(e) => setCopyBoardingInfo(e.target.checked)}
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">탑승 및 여정 정보</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  탑승 장소, 시간, 이동 경로 등
                </p>
              </div>
            </label>
          </div>

          {/* 안내 메시지 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>복사되지 않는 항목:</strong>
              <br />
              • 참가자 정보
              <br />
              • 결제 정보
              <br />
              • 객실 배정
              <br />
              • 티타임 배정
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 border-t pt-4">
          <button
            type="button"
            className="px-5 py-2.5 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            onClick={onClose}
            disabled={copying}
          >
            취소
          </button>
          <button
            type="button"
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            onClick={handleCopy}
            disabled={copying}
          >
            {copying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                복사 중...
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                투어 복사
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourCopyModal;
