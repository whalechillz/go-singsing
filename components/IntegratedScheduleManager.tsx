import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Edit2, Trash2, Save, X, Calendar, MapPin, Clock, FileText } from 'lucide-react';

interface IntegratedScheduleManagerProps {
  tourId: string;
}

export default function IntegratedScheduleManager({ tourId }: IntegratedScheduleManagerProps) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [editingNotice, setEditingNotice] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('schedule');

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

      // 투어 공지사항 가져오기
      const { data: tourData, error: tourError } = await supabase
        .from('singsing_tours')
        .select('notices')
        .eq('id', tourId)
        .single();

      if (tourError) throw tourError;

      setSchedules(scheduleData || []);
      setNotices(tourData?.notices || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    try {
      const scheduleData = {
        ...editingSchedule,
        boarding_info: {
          time: editingSchedule.boarding_time || '',
          place: editingSchedule.boarding_place || '',
          order: editingSchedule.boarding_order || 1
        }
      };

      if (editingSchedule.id) {
        // 업데이트
        const { error } = await supabase
          .from('singsing_schedules')
          .update(scheduleData)
          .eq('id', editingSchedule.id);

        if (error) throw error;
      } else {
        // 새로 추가
        const { error } = await supabase
          .from('singsing_schedules')
          .insert({
            ...scheduleData,
            tour_id: tourId
          });

        if (error) throw error;
      }

      setEditingSchedule(null);
      fetchData();
    } catch (error) {
      console.error('Error saving schedule:', error);
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

  const handleSaveNotices = async () => {
    try {
      const { error } = await supabase
        .from('singsing_tours')
        .update({ notices })
        .eq('id', tourId);

      if (error) throw error;
      setEditingNotice(null);
    } catch (error) {
      console.error('Error saving notices:', error);
    }
  };

  const addNotice = () => {
    setNotices([...notices, { notice: '', order: notices.length + 1 }]);
  };

  const updateNotice = (index: number, value: string) => {
    const newNotices = [...notices];
    newNotices[index].notice = value;
    setNotices(newNotices);
  };

  const removeNotice = (index: number) => {
    setNotices(notices.filter((_, i) => i !== index));
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
      {/* 탭 네비게이션 */}
      <div className="border-b">
        <div className="flex space-x-8">
          <button
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'schedule' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('schedule')}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            일정 관리
          </button>
          <button
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'boarding' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('boarding')}
          >
            <MapPin className="w-4 h-4 inline mr-2" />
            탑승 정보
          </button>
          <button
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notices' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('notices')}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            공지사항
          </button>
        </div>
      </div>

      {/* 일정 관리 탭 */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">일정 목록</h3>
            <button
              className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 flex items-center"
              onClick={() => setEditingSchedule({ 
                date: '', 
                day_number: schedules.length + 1,
                schedule_items: [] 
              })}
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
                      value={editingSchedule.date}
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
                      value={editingSchedule.day_number}
                      onChange={(e) => setEditingSchedule({
                        ...editingSchedule,
                        day_number: parseInt(e.target.value)
                      })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">일정 항목</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="시간: 내용 형식으로 입력 (한 줄에 하나씩)"
                    rows={5}
                    value={editingSchedule.schedule_items?.map((item: any) => 
                      `${item.time || ''}: ${item.content}`
                    ).join('\n') || ''}
                    onChange={(e) => {
                      const items = e.target.value.split('\n').map(line => {
                        const [time, ...contentParts] = line.split(':');
                        return {
                          time: time?.trim() || '',
                          content: contentParts.join(':').trim()
                        };
                      }).filter(item => item.content);
                      
                      setEditingSchedule({
                        ...editingSchedule,
                        schedule_items: items
                      });
                    }}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50"
                    onClick={() => setEditingSchedule(null)}
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
                      Day {schedule.day_number} - {new Date(schedule.date).toLocaleDateString('ko-KR')}
                    </h4>
                    <ul className="mt-2 space-y-1 text-sm text-gray-600">
                      {schedule.schedule_items?.map((item: any, idx: number) => (
                        <li key={idx}>
                          {item.time && <span className="font-medium">{item.time}:</span>} {item.content}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="p-1 hover:bg-gray-100 rounded"
                      onClick={() => setEditingSchedule(schedule)}
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
      )}

      {/* 탑승 정보 탭 */}
      {activeTab === 'boarding' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">탑승 정보 관리</h3>
          
          <div className="space-y-2">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">
                    Day {schedule.day_number} - {new Date(schedule.date).toLocaleDateString('ko-KR')}
                  </h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">탑승 시간</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border rounded-md"
                      value={schedule.boarding_info?.time || ''}
                      onChange={async (e) => {
                        const updated = {
                          ...schedule,
                          boarding_info: {
                            ...schedule.boarding_info,
                            time: e.target.value
                          }
                        };
                        await supabase
                          .from('singsing_schedules')
                          .update({ boarding_info: updated.boarding_info })
                          .eq('id', schedule.id);
                        fetchData();
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">탑승 장소</label>
                    <input
                      className="w-full px-3 py-2 border rounded-md"
                      value={schedule.boarding_info?.place || ''}
                      placeholder="탑승 장소 입력"
                      onChange={async (e) => {
                        const updated = {
                          ...schedule,
                          boarding_info: {
                            ...schedule.boarding_info,
                            place: e.target.value
                          }
                        };
                        await supabase
                          .from('singsing_schedules')
                          .update({ boarding_info: updated.boarding_info })
                          .eq('id', schedule.id);
                        fetchData();
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 공지사항 탭 */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">공지사항 관리</h3>
            <button
              className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
              onClick={addNotice}
            >
              <Plus className="w-4 h-4 inline mr-1" /> 공지 추가
            </button>
          </div>

          <div className="space-y-2">
            {notices.map((notice, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex gap-2 items-start">
                  <span className="text-sm font-medium mt-2">{index + 1}.</span>
                  <textarea
                    className="flex-1 px-3 py-2 border rounded-md"
                    value={notice.notice}
                    onChange={(e) => updateNotice(index, e.target.value)}
                    placeholder="공지사항 내용 입력"
                  />
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => removeNotice(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {notices.length > 0 && (
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={handleSaveNotices}
              >
                <Save className="w-4 h-4 inline mr-1" /> 공지사항 저장
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}