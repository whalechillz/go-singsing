import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Edit2, Trash2, Save, X, Calendar } from 'lucide-react';

interface IntegratedScheduleManagerProps {
  tourId: string;
}

export default function IntegratedScheduleManager({ tourId }: IntegratedScheduleManagerProps) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [scheduleText, setScheduleText] = useState('');
  const [mealInfo, setMealInfo] = useState<any>({
    meal_breakfast: false,
    meal_lunch: false,
    meal_dinner: false,
    menu_breakfast: '',
    menu_lunch: '',
    menu_dinner: ''
  });
  const [tourProduct, setTourProduct] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [tourId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 일정 데이터 가져오기
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('singsing_schedules')
        .select('*')
        .eq('tour_id', tourId)
        .order('date', { ascending: true });

      if (scheduleError) throw scheduleError;

      // 투어 정보 가져오기
      const { data: tourData, error: tourError } = await supabase
        .from('singsing_tours')
        .select('*')
        .eq('id', tourId)
        .single();

      if (tourError) throw tourError;

      setSchedules(scheduleData || []);

      // tour_product 정보도 가져오기
      if (tourData?.tour_product_id) {
        const { data: productData } = await supabase
          .from('tour_products')
          .select('*')
          .eq('id', tourData.tour_product_id)
          .single();
        setTourProduct(productData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    try {
      // 필수 필드 검증
      if (!editingSchedule.date) {
        alert('날짜를 입력해주세요.');
        return;
      }

      if (!editingSchedule.title) {
        alert('제목을 입력해주세요.');
        return;
      }

      // 텍스트를 일정 항목으로 파싱
      const items = scheduleText.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const colonIndex = line.indexOf(':');
          if (colonIndex > -1) {
            return {
              time: line.substring(0, colonIndex).trim(),
              content: line.substring(colonIndex + 1).trim()
            };
          }
          return {
            time: '',
            content: line.trim()
          };
        });

      const scheduleData: any = {
        tour_id: tourId,
        title: editingSchedule.title,
        date: editingSchedule.date,
        day_number: editingSchedule.day_number || 1,
        schedule_items: items,
        meal_breakfast: mealInfo.meal_breakfast,
        meal_lunch: mealInfo.meal_lunch,
        meal_dinner: mealInfo.meal_dinner,
        menu_breakfast: mealInfo.menu_breakfast,
        menu_lunch: mealInfo.menu_lunch,
        menu_dinner: mealInfo.menu_dinner
      };

      console.log('저장할 데이터:', scheduleData);

      if (editingSchedule.id) {
        // 업데이트
        const { data, error } = await supabase
          .from('singsing_schedules')
          .update(scheduleData)
          .eq('id', editingSchedule.id)
          .select();

        if (error) {
          console.error('Update error details:', error);
          throw error;
        }
        console.log('업데이트 성공:', data);
      } else {
        // 새로 추가
        const { data, error } = await supabase
          .from('singsing_schedules')
          .insert(scheduleData)
          .select();

        if (error) {
          console.error('Insert error details:', error);
          throw error;
        }
        console.log('추가 성공:', data);
      }

      setEditingSchedule(null);
      setScheduleText('');
      setMealInfo({
        meal_breakfast: false,
        meal_lunch: false,
        meal_dinner: false,
        menu_breakfast: '',
        menu_lunch: '',
        menu_dinner: ''
      });
      fetchData();
      alert('저장되었습니다.');
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      alert(`저장 중 오류가 발생했습니다.\n\n오류 내용: ${error.message || '알 수 없는 오류'}`);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('singsing_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const handleEditSchedule = (schedule: any) => {
    setEditingSchedule(schedule);
    // schedule_items를 텍스트로 변환
    const text = schedule.schedule_items?.map((item: any) => 
      item.time ? `${item.time}: ${item.content}` : item.content
    ).join('\n') || '';
    setScheduleText(text);
    
    // 식사 정보 설정
    setMealInfo({
      meal_breakfast: schedule.meal_breakfast || false,
      meal_lunch: schedule.meal_lunch || false,
      meal_dinner: schedule.meal_dinner || false,
      menu_breakfast: schedule.menu_breakfast || '',
      menu_lunch: schedule.menu_lunch || '',
      menu_dinner: schedule.menu_dinner || ''
    });
  };

  const handleNewSchedule = () => {
    const dayNumber = schedules.length + 1;
    setEditingSchedule({ 
      title: `Day ${dayNumber} 일정`,
      date: '', 
      day_number: dayNumber,
      schedule_items: []
    });
    setScheduleText('');
    setMealInfo({
      meal_breakfast: false,
      meal_lunch: false,
      meal_dinner: false,
      menu_breakfast: '',
      menu_lunch: '',
      menu_dinner: ''
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 일정 관리 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">일정 목록</h3>
          <button
            className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 flex items-center"
            onClick={handleNewSchedule}
          >
            <Plus className="w-4 h-4 mr-1" /> 일정 추가
          </button>
        </div>

        {editingSchedule && (
          <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
            <h4 className="font-semibold mb-4">
              {editingSchedule.id ? '일정 수정' : '새 일정 추가'}
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">날짜</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-md"
                    value={editingSchedule.date || ''}
                    onChange={(e) => setEditingSchedule({
                      ...editingSchedule,
                      date: e.target.value
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Day 번호</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-md"
                    value={editingSchedule.day_number || ''}
                    onChange={(e) => setEditingSchedule({
                      ...editingSchedule,
                      day_number: parseInt(e.target.value) || 1
                    })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">제목</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  value={editingSchedule.title || ''}
                  placeholder="예: Day 1 일정"
                  onChange={(e) => setEditingSchedule({
                    ...editingSchedule,
                    title: e.target.value
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">일정 항목</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="시간: 내용 형식으로 입력 (한 줄에 하나씩)&#10;예) 08:00: 호텔 조식&#10;    09:00: 골프장 출발"
                  rows={5}
                  value={scheduleText}
                  onChange={(e) => setScheduleText(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  각 줄에 "시간: 내용" 형식으로 입력하세요. 시간은 선택사항입니다.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">식사 정보</label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-md p-3">
                    <label className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={mealInfo.meal_breakfast}
                        onChange={(e) => setMealInfo({
                          ...mealInfo,
                          meal_breakfast: e.target.checked
                        })}
                      />
                      <span className="font-medium">조식</span>
                    </label>
                    {mealInfo.meal_breakfast && (
                      <input
                        type="text"
                        className="w-full px-2 py-1 border rounded text-sm"
                        placeholder="메뉴 입력"
                        value={mealInfo.menu_breakfast}
                        onChange={(e) => setMealInfo({
                          ...mealInfo,
                          menu_breakfast: e.target.value
                        })}
                      />
                    )}
                  </div>
                  <div className="border rounded-md p-3">
                    <label className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={mealInfo.meal_lunch}
                        onChange={(e) => setMealInfo({
                          ...mealInfo,
                          meal_lunch: e.target.checked
                        })}
                      />
                      <span className="font-medium">중식</span>
                    </label>
                    {mealInfo.meal_lunch && (
                      <input
                        type="text"
                        className="w-full px-2 py-1 border rounded text-sm"
                        placeholder="메뉴 입력"
                        value={mealInfo.menu_lunch}
                        onChange={(e) => setMealInfo({
                          ...mealInfo,
                          menu_lunch: e.target.value
                        })}
                      />
                    )}
                  </div>
                  <div className="border rounded-md p-3">
                    <label className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={mealInfo.meal_dinner}
                        onChange={(e) => setMealInfo({
                          ...mealInfo,
                          meal_dinner: e.target.checked
                        })}
                      />
                      <span className="font-medium">석식</span>
                    </label>
                    {mealInfo.meal_dinner && (
                      <input
                        type="text"
                        className="w-full px-2 py-1 border rounded text-sm"
                        placeholder="메뉴 입력"
                        value={mealInfo.menu_dinner}
                        onChange={(e) => setMealInfo({
                          ...mealInfo,
                          menu_dinner: e.target.value
                        })}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50"
                  onClick={() => {
                    setEditingSchedule(null);
                    setScheduleText('');
                    setMealInfo({
                      meal_breakfast: false,
                      meal_lunch: false,
                      meal_dinner: false,
                      menu_breakfast: '',
                      menu_lunch: '',
                      menu_dinner: ''
                    });
                  }}
                >
                  <X className="w-4 h-4 inline mr-1" /> 취소
                </button>
                <button
                  className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                  onClick={handleSaveSchedule}
                >
                  <Save className="w-4 h-4 inline mr-1" /> 저장
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold">
                    {schedule.title || `Day ${schedule.day_number}`} - {new Date(schedule.date).toLocaleDateString('ko-KR')}
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    {schedule.schedule_items?.map((item: any, idx: number) => (
                      <li key={idx}>
                        {item.time && <span className="font-medium">{item.time}:</span>} {item.content}
                      </li>
                    ))}
                  </ul>
                  {/* 식사 정보 표시 */}
                  <div className="mt-3 flex gap-4 text-sm">
                    <span className={`px-2 py-1 rounded ${schedule.meal_breakfast ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      조식: {schedule.meal_breakfast ? (schedule.menu_breakfast || 'O') : 'X'}
                    </span>
                    <span className={`px-2 py-1 rounded ${schedule.meal_lunch ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      중식: {schedule.meal_lunch ? (schedule.menu_lunch || 'O') : 'X'}
                    </span>
                    <span className={`px-2 py-1 rounded ${schedule.meal_dinner ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      석식: {schedule.meal_dinner ? (schedule.menu_dinner || 'O') : 'X'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => handleEditSchedule(schedule)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => handleDeleteSchedule(schedule.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}