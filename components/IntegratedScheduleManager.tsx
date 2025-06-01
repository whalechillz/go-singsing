import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, Save, X, Calendar, MapPin, Clock, FileText } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface IntegratedScheduleManagerProps {
  tourId: string;
}

export default function IntegratedScheduleManager({ tourId }: IntegratedScheduleManagerProps) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [editingNotice, setEditingNotice] = useState<any>(null);
  const supabase = createClient();

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
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedule">
            <Calendar className="w-4 h-4 mr-2" /> 일정 관리
          </TabsTrigger>
          <TabsTrigger value="boarding">
            <MapPin className="w-4 h-4 mr-2" /> 탑승 정보
          </TabsTrigger>
          <TabsTrigger value="notices">
            <FileText className="w-4 h-4 mr-2" /> 공지사항
          </TabsTrigger>
        </TabsList>

        {/* 일정 관리 탭 */}
        <TabsContent value="schedule" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">일정 목록</h3>
            <Button
              size="sm"
              onClick={() => setEditingSchedule({ 
                date: '', 
                day_number: schedules.length + 1,
                schedule_items: [] 
              })}
            >
              <Plus className="w-4 h-4 mr-1" /> 일정 추가
            </Button>
          </div>

          {editingSchedule && (
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-base">
                  {editingSchedule.id ? '일정 수정' : '새 일정 추가'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>날짜</Label>
                    <Input
                      type="date"
                      value={editingSchedule.date}
                      onChange={(e) => setEditingSchedule({
                        ...editingSchedule,
                        date: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label>Day 번호</Label>
                    <Input
                      type="number"
                      value={editingSchedule.day_number}
                      onChange={(e) => setEditingSchedule({
                        ...editingSchedule,
                        day_number: parseInt(e.target.value)
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label>일정 항목</Label>
                  <Textarea
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingSchedule(null)}
                  >
                    <X className="w-4 h-4 mr-1" /> 취소
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveSchedule}
                  >
                    <Save className="w-4 h-4 mr-1" /> 저장
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {schedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardContent className="p-4">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingSchedule(schedule)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 탑승 정보 탭 */}
        <TabsContent value="boarding" className="space-y-4">
          <h3 className="text-lg font-semibold">탑승 정보 관리</h3>
          
          <div className="space-y-2">
            {schedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">
                      Day {schedule.day_number} - {new Date(schedule.date).toLocaleDateString('ko-KR')}
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">탑승 시간</Label>
                      <Input
                        type="time"
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
                      <Label className="text-sm">탑승 장소</Label>
                      <Input
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 공지사항 탭 */}
        <TabsContent value="notices" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">공지사항 관리</h3>
            <Button size="sm" onClick={addNotice}>
              <Plus className="w-4 h-4 mr-1" /> 공지 추가
            </Button>
          </div>

          <div className="space-y-2">
            {notices.map((notice, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex gap-2 items-start">
                    <span className="text-sm font-medium mt-2">{index + 1}.</span>
                    <Textarea
                      value={notice.notice}
                      onChange={(e) => updateNotice(index, e.target.value)}
                      placeholder="공지사항 내용 입력"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNotice(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {notices.length > 0 && (
            <div className="flex justify-end">
              <Button onClick={handleSaveNotices}>
                <Save className="w-4 h-4 mr-1" /> 공지사항 저장
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}