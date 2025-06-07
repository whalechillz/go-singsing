"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { simplifyCourseName } from "@/lib/utils";
import { Plus, X, Calendar, Clock, Trash2 } from "lucide-react";

type TeeTime = {
  id: string;
  tour_id: string;
  play_date: string;
  golf_course: string;
  tee_time: string;
  max_players: number;
  created_at?: string;
};

type TeeTimeForm = {
  play_date: string;
  golf_course: string;
  tee_time: string;
  max_players: string;
};

type Props = { tourId: string; onDataChange?: () => void };

const TeeTimeSlotManager: React.FC<Props> = ({ tourId, onDataChange }) => {
  const [teeTimes, setTeeTimes] = useState<TeeTime[]>([]);
  const [teeTimeRows, setTeeTimeRows] = useState<TeeTimeForm[]>([{ 
    play_date: "", 
    golf_course: "", 
    tee_time: "", 
    max_players: "4" 
  }]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [editingTeeTime, setEditingTeeTime] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<TeeTimeForm>({ 
    play_date: "", 
    golf_course: "", 
    tee_time: "", 
    max_players: "4" 
  });
  const [golfCourses, setGolfCourses] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  
  // 코스 로테이션 설정
  const [showRotation, setShowRotation] = useState(false);
  const [rotationSettings, setRotationSettings] = useState({
    startDate: "",
    days: "3",
    startTime: "06:00",
    interval: "8", // 분 단위
    groups: "4", // 그룹 수
    courses: [] as string[]
  });

  const fetchTeeTimes = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("singsing_tee_times")
      .select("*")
      .eq("tour_id", tourId)
      .order("play_date", { ascending: true })
      .order("tee_time", { ascending: true });
    
    if (error) setError(error.message);
    else setTeeTimes((data || []) as TeeTime[]);
    setLoading(false);
  };

  // 일괄 삭제 처리
  const handleBulkDelete = async () => {
    if (selectedTimes.size === 0) {
      setError("삭제할 티타임을 선택해주세요.");
      return;
    }
    
    if (!window.confirm(`선택한 ${selectedTimes.size}개의 티타임을 삭제하시겠습니까?\n배정된 참가자들은 미배정 상태가 됩니다.`)) return;
    
    try {
      const teeTimeIds = Array.from(selectedTimes);
      const { error: updateError } = await supabase
        .from("singsing_participant_tee_times")
        .delete()
        .in("tee_time_id", teeTimeIds);
      
      if (updateError) throw updateError;
      
      const { error: deleteError } = await supabase
        .from("singsing_tee_times")
        .delete()
        .in("id", teeTimeIds);
      
      if (deleteError) throw deleteError;
      
      setSelectedTimes(new Set());
      setIsSelectMode(false);
      await fetchTeeTimes();
      if (onDataChange) onDataChange();
    } catch (error: any) {
      setError(`티타임 일괄 삭제 중 오류 발생: ${error.message}`);
    }
  };

  // 체크박스 토글
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedTimes);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTimes(newSelected);
  };

  // 골프 코스 목록 가져오기
  const fetchGolfCourses = async () => {
    try {
      const { data: tour, error: tourErr } = await supabase
        .from("singsing_tours")
        .select("tour_product_id")
        .eq("id", tourId)
        .single();
      
      if (tourErr || !tour) {
        console.error("Tour not found", tourErr);
        return;
      }
      
      if (tour.tour_product_id) {
        const { data: product, error: prodErr } = await supabase
          .from("tour_products")
          .select("*")
          .eq("id", tour.tour_product_id)
          .single();
        
        if (!prodErr && product) {
          const courseList: string[] = [];
          
          if (product.golf_course && product.courses && Array.isArray(product.courses)) {
            product.courses.forEach((courseName: string) => {
              courseList.push(`${product.golf_course} - ${courseName}`);
            });
          } else if (product.golf_course) {
            courseList.push(product.golf_course);
          }
          
          if (courseList.length > 0) {
            setGolfCourses(courseList);
            // 로테이션 설정에도 기본값으로 설정
            setRotationSettings(prev => ({ ...prev, courses: courseList }));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching golf courses:", error);
    }
  };

  // 코스 로테이션 자동 생성
  const generateRotation = () => {
    if (!rotationSettings.startDate || !rotationSettings.startTime) {
      setError("시작 날짜와 시간을 입력해주세요.");
      return;
    }

    const newTeeTimes: TeeTimeForm[] = [];
    const days = parseInt(rotationSettings.days);
    const groups = parseInt(rotationSettings.groups);
    const interval = parseInt(rotationSettings.interval);
    const courses = rotationSettings.courses.length > 0 ? rotationSettings.courses : golfCourses;
    
    if (courses.length === 0) {
      setError("가용 가능한 코스가 없습니다. 먼저 투어 상품에 골프장 정보를 등록해주세요.");
      return;
    }
    
    for (let day = 0; day < days; day++) {
      const currentDate = new Date(rotationSettings.startDate);
      currentDate.setDate(currentDate.getDate() + day);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      for (let group = 0; group < groups; group++) {
        const [hours, minutes] = rotationSettings.startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + (group * interval);
        const teeHours = Math.floor(totalMinutes / 60);
        const teeMinutes = totalMinutes % 60;
        const teeTime = `${String(teeHours).padStart(2, '0')}:${String(teeMinutes).padStart(2, '0')}`;
        
        // 코스 로테이션: 각 그룹이 매일 다른 코스를 돌도록
        const courseIndex = (group + day) % courses.length;
        const course = courses[courseIndex];
        
        newTeeTimes.push({
          play_date: dateStr,
          golf_course: course,
          tee_time: teeTime,
          max_players: "4"
        });
      }
    }
    
    setTeeTimeRows(newTeeTimes);
    setShowRotation(false);
  };

  useEffect(() => {
    if (tourId) {
      fetchTeeTimes();
      fetchGolfCourses();
    }
  }, [tourId]);

  const handleRowChange = (idx: number, field: string, value: string) => {
    setTeeTimeRows(rows => rows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const handleAddRow = () => {
    setTeeTimeRows(rows => [...rows, { play_date: "", golf_course: "", tee_time: "", max_players: "4" }]);
  };

  const handleDeleteRow = (idx: number) => {
    setTeeTimeRows(rows => rows.filter((_, i) => i !== idx));
  };

  const handleBulkAdd = async () => {
    setError("");
    if (teeTimeRows.some(row => !row.play_date || !row.golf_course || !row.tee_time)) {
      setError("모든 행의 날짜, 골프장, 티타임을 입력해 주세요.");
      return;
    }
    
    try {
      const newTeeTimes = teeTimeRows.map(row => ({
        tour_id: tourId,
        play_date: row.play_date,
        golf_course: row.golf_course,
        tee_time: row.tee_time,
        max_players: Number(row.max_players) || 4,
      }));
      
      const { error } = await supabase.from("singsing_tee_times").insert(newTeeTimes);
      
      if (error) {
        setError(`티타임 추가 오류: ${error.message}`);
      } else {
        setTeeTimeRows([{ play_date: "", golf_course: "", tee_time: "", max_players: "4" }]);
        await fetchTeeTimes();
        if (onDataChange) onDataChange();
      }
    } catch (err: any) {
      setError(`예상치 못한 오류: ${err.message}`);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editForm.play_date || !editForm.golf_course || !editForm.tee_time) {
      setError("날짜, 골프장, 티타임을 입력해주세요.");
      return;
    }
    
    const { error } = await supabase
      .from("singsing_tee_times")
      .update({ 
        play_date: editForm.play_date,
        golf_course: editForm.golf_course,
        tee_time: editForm.tee_time,
        max_players: Number(editForm.max_players) || 4
      })
      .eq("id", id);
      
    if (error) setError(error.message);
    else {
      setEditingTeeTime(null);
      await fetchTeeTimes();
      if (onDataChange) onDataChange();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("정말 삭제하시겠습니까? 배정된 참가자들은 미배정 상태가 됩니다.")) return;
    
    try {
      const { error: updateError } = await supabase
        .from("singsing_participant_tee_times")
        .delete()
        .eq("tee_time_id", id);
      
      if (updateError) throw updateError;
      
      const { error: deleteError } = await supabase
        .from("singsing_tee_times")
        .delete()
        .eq("id", id);
      
      if (deleteError) throw deleteError;
      
      await fetchTeeTimes();
      if (onDataChange) onDataChange();
    } catch (error: any) {
      setError(`티타임 삭제 중 오류 발생: ${error.message}`);
    }
  };

  // 날짜 유효성 검사 함수
  const isValidDate = (dateString: string) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };
  
  // 날짜별로 그룹화
  const teeTimesByDate = teeTimes.reduce((acc, teeTime) => {
    const date = teeTime.play_date;
    if (!date || date === 'Invalid Date' || !isValidDate(date)) {
      console.warn('Invalid date found:', teeTime);
      return acc;
    }
    if (!acc[date]) acc[date] = [];
    acc[date].push(teeTime);
    return acc;
  }, {} as Record<string, TeeTime[]>);

  // 각 날짜의 티타임을 시간순으로 정렬 (코스 정렬 제거)
  Object.keys(teeTimesByDate).forEach(date => {
    teeTimesByDate[date].sort((a, b) => {
      // 단순히 시간순으로만 정렬
      return a.tee_time.localeCompare(b.tee_time);
    });
  });

  // 통계 계산
  const totalSlots = teeTimes.length;
  const totalCapacity = teeTimes.reduce((sum, tt) => sum + tt.max_players, 0);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">티오프시간 관리</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            총 {totalSlots}개 티타임 | 총 정원 {totalCapacity}명
          </div>
          {teeTimes.length > 0 && (
            <button
              type="button"
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                isSelectMode 
                  ? "bg-red-100 text-red-700 hover:bg-red-200" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                setSelectedTimes(new Set());
              }}
            >
              <Trash2 className="w-4 h-4" />
              {isSelectMode ? "선택 취소" : "일괄 삭제"}
            </button>
          )}
        </div>
      </div>
      
      {/* 일괄 삭제 버튼 */}
      {isSelectMode && selectedTimes.size > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
          <span className="text-red-700">
            {selectedTimes.size}개 티타임이 선택됨
          </span>
          <button
            type="button"
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            onClick={handleBulkDelete}
          >
            선택한 항목 삭제
          </button>
        </div>
      )}
      
      {/* 코스 로테이션 설정 */}
      <div className="mb-4">
        <button
          type="button"
          className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium"
          onClick={() => setShowRotation(!showRotation)}
        >
          <Calendar className="w-4 h-4" />
          코스 로테이션 자동 생성
        </button>
        
        {showRotation && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold mb-3">코스 로테이션 설정</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">시작 날짜</label>
                <input
                  type="date"
                  value={rotationSettings.startDate}
                  onChange={e => setRotationSettings({...rotationSettings, startDate: e.target.value})}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">일수</label>
                <input
                  type="number"
                  value={rotationSettings.days}
                  onChange={e => setRotationSettings({...rotationSettings, days: e.target.value})}
                  min="1"
                  max="7"
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간</label>
                <input
                  type="time"
                  value={rotationSettings.startTime}
                  onChange={e => setRotationSettings({...rotationSettings, startTime: e.target.value})}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">티타임 간격(분)</label>
                <input
                  type="number"
                  value={rotationSettings.interval}
                  onChange={e => setRotationSettings({...rotationSettings, interval: e.target.value})}
                  min="5"
                  max="15"
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">그룹 수</label>
                <input
                  type="number"
                  value={rotationSettings.groups}
                  onChange={e => setRotationSettings({...rotationSettings, groups: e.target.value})}
                  min="1"
                  max="10"
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">코스 순서</label>
                <select
                  multiple
                  value={rotationSettings.courses}
                  onChange={e => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    if (selected.length > 0) {
                      setRotationSettings({...rotationSettings, courses: selected});
                    }
                  }}
                  className="w-full border rounded px-2 py-1"
                  size={3}
                >
                  {golfCourses.map(course => (
                    <option key={course} value={course}>{simplifyCourseName(course)}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="button"
              className="mt-3 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
              onClick={generateRotation}
            >
              로테이션 생성
            </button>
          </div>
        )}
      </div>
      
      {/* 티타임 추가 폼 */}
      <div className="flex flex-col gap-2 mb-4">
        {teeTimeRows.map((row, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input 
              type="date"
              value={row.play_date} 
              onChange={e => handleRowChange(idx, "play_date", e.target.value)} 
              className="border rounded px-2 py-1" 
              required 
            />
            <select
              value={row.golf_course}
              onChange={e => handleRowChange(idx, "golf_course", e.target.value)}
              className="border rounded px-2 py-1"
              required
            >
              <option value="">골프장 선택</option>
              {golfCourses.map(course => (
                <option key={course} value={course}>{simplifyCourseName(course)}</option>
              ))}
            </select>
            <input 
              type="time"
              value={row.tee_time} 
              onChange={e => handleRowChange(idx, "tee_time", e.target.value)} 
              className="border rounded px-2 py-1" 
              required 
            />
            <input 
              type="number"
              value={row.max_players} 
              onChange={e => handleRowChange(idx, "max_players", e.target.value)} 
              placeholder="인원" 
              min="1" 
              max="4"
              className="border rounded px-2 py-1 w-20" 
            />
            <button 
              type="button" 
              className="text-red-600 hover:text-red-800" 
              onClick={() => handleDeleteRow(idx)}
            >
              <X size={18} />
            </button>
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          <button 
            type="button" 
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium" 
            onClick={handleAddRow}
          >
            <Plus size={16} /> 행 추가
          </button>
          <button 
            type="button" 
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors" 
            onClick={handleBulkAdd}
          >
            일괄 추가
          </button>
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </div>

      {loading ? (
        <div className="text-center py-4 text-gray-500">불러오는 중...</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(teeTimesByDate).map(([date, times]) => (
            <div key={date} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-gray-600" />
                <h3 className="font-semibold text-gray-900">
                  {new Date(date).toLocaleDateString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long' 
                  })}
                </h3>
              </div>
              
              {/* 코스별 통계 */}
              <div className="mb-3 flex flex-wrap gap-2">
                {(() => {
                  const courseStats = times.reduce((acc, t) => {
                    const course = t.golf_course;
                    if (!acc[course]) acc[course] = { count: 0, capacity: 0 };
                    acc[course].count++;
                    acc[course].capacity += t.max_players;
                    return acc;
                  }, {} as Record<string, { count: number; capacity: number }>);
                  
                  return Object.entries(courseStats).map(([course, stats]) => (
                    <div 
                      key={course}
                      className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-700 border-gray-300"
                    >
                      {simplifyCourseName(course)}: {stats.count}팀 ({stats.capacity}명)
                    </div>
                  ));
                })()}
              </div>
              
              <table className="w-full bg-white rounded shadow text-sm overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    {isSelectMode && (
                      <th className="py-2 px-2 text-center">
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={times.every(t => selectedTimes.has(t.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTimes(new Set([...selectedTimes, ...times.map(t => t.id)]));
                            } else {
                              const newSelected = new Set(selectedTimes);
                              times.forEach(t => newSelected.delete(t.id));
                              setSelectedTimes(newSelected);
                            }
                          }}
                        />
                      </th>
                    )}
                    <th className="py-2 px-2 text-left">시간</th>
                    <th className="py-2 px-2 text-left">골프장</th>
                    <th className="py-2 px-2 text-center">정원</th>
                    <th className="py-2 px-2 text-center">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {times.map((teeTime, index) => {
                    // 코스가 변경되는 지점 확인
                    const prevCourse = index > 0 ? times[index - 1].golf_course : null;
                    const isNewCourse = prevCourse !== teeTime.golf_course;
                    
                    return (
                      <tr 
                        key={teeTime.id} 
                        className={`${isNewCourse ? 'border-t-2 border-gray-300' : 'border-t border-gray-200'} ${isSelectMode ? 'hover:bg-gray-100 cursor-pointer' : ''}`}
                        onClick={(e) => {
                          if (isSelectMode && !(e.target as HTMLElement).closest('button, input, select')) {
                            toggleSelect(teeTime.id);
                          }
                        }}
                      >
                        {isSelectMode && (
                          <td className="py-1 px-2 text-center">
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={selectedTimes.has(teeTime.id)}
                              onChange={() => toggleSelect(teeTime.id)}
                            />
                          </td>
                        )}
                        <td className="py-1 px-2">
                          {editingTeeTime === teeTime.id ? (
                            <input
                              type="time"
                              value={editForm.tee_time}
                              onChange={e => setEditForm({...editForm, tee_time: e.target.value})}
                              className="border rounded px-1 py-0.5 text-sm"
                            />
                          ) : (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-500" />
                              {teeTime.tee_time}
                            </div>
                          )}
                        </td>
                        <td className="py-1 px-2">
                          {editingTeeTime === teeTime.id ? (
                            <select
                              value={editForm.golf_course}
                              onChange={e => setEditForm({...editForm, golf_course: e.target.value})}
                              className="border rounded px-1 py-0.5 text-sm"
                            >
                              {golfCourses.map(course => (
                              <option key={course} value={course}>{simplifyCourseName(course)}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="font-medium">{simplifyCourseName(teeTime.golf_course)}</span>
                          )}
                        </td>
                        <td className="py-1 px-2 text-center">
                          {editingTeeTime === teeTime.id ? (
                            <input
                              type="number"
                              value={editForm.max_players}
                              onChange={e => setEditForm({...editForm, max_players: e.target.value})}
                              className="border rounded px-1 py-0.5 w-16 text-sm"
                              min="1"
                              max="4"
                            />
                          ) : (
                            `${teeTime.max_players}명`
                          )}
                        </td>
                        <td className="py-1 px-2">
                          {!isSelectMode && (
                            <div className="flex justify-center items-center gap-2">
                              {editingTeeTime === teeTime.id ? (
                                <>
                                  <button
                                    className="text-green-600 text-sm underline"
                                    onClick={() => handleUpdate(teeTime.id)}
                                  >
                                    저장
                                  </button>
                                  <button
                                    className="text-gray-600 text-sm underline"
                                    onClick={() => setEditingTeeTime(null)}
                                  >
                                    취소
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button 
                                    className="text-blue-700 underline text-sm" 
                                    onClick={() => {
                                      setEditingTeeTime(teeTime.id);
                                      setEditForm({ 
                                        play_date: teeTime.play_date,
                                        golf_course: teeTime.golf_course,
                                        tee_time: teeTime.tee_time,
                                        max_players: teeTime.max_players.toString()
                                      });
                                    }} 
                                  >
                                    수정
                                  </button>
                                  <button 
                                    className="text-red-600 underline text-sm" 
                                    onClick={() => handleDelete(teeTime.id)}
                                  >
                                    삭제
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeeTimeSlotManager;