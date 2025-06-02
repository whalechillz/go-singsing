"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command";

type TeeTime = {
  id: string;
  date: string;
  course: string;
  team_no: number;
  tee_time: string;
  players: string[];
};

type Participant = {
  id: string;
  name: string;
  gender?: string;
};

type GolfCourse = {
  name: string;
  courses: string[];
};

const initialForm = {
  date: "",
  course: "",
  team_no: 1,
  tee_time: "",
  players: "",
};

type Props = { tourId: string };

const TeeTimeManager: React.FC<Props> = ({ tourId }) => {
  const [form, setForm] = useState({ ...initialForm });
  const [teeTimes, setTeeTimes] = useState<TeeTime[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [moveTarget, setMoveTarget] = useState<{ player: string; fromId: string } | null>(null);
  const [moveToTeam, setMoveToTeam] = useState<string>("");
  const [selectedParticipants, setSelectedParticipants] = useState<{ id: string; name: string; gender?: string }[]>([]);
  const [participantSearch, setParticipantSearch] = useState("");
  const [allSelected, setAllSelected] = useState(false);
  const [selectedTeeTimes, setSelectedTeeTimes] = useState<string[]>([]);

  // 참가자 자동완성 데이터 불러오기
  useEffect(() => {
    const fetchParticipants = async () => {
      const { data, error } = await supabase.from("singsing_participants").select("id, name, gender").eq("tour_id", tourId);
      if (!error && data) {
        setParticipants(data);
      }
    };
    if (tourId) fetchParticipants();
  }, [tourId]);

  // 투어의 tour_product_id → golf_courses 배열 fetch
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data: tour, error: tourErr } = await supabase
          .from("singsing_tours")
          .select("tour_product_id")
          .eq("id", tourId)
          .single();
        
        if (tourErr || !tour?.tour_product_id) {
          console.error("Tour product ID not found", tourErr);
          setCourses([]);
          return;
        }
        
        const { data: product, error: prodErr } = await supabase
          .from("tour_products")
          .select("golf_courses")
          .eq("id", tour.tour_product_id)
          .single();
        
        if (!prodErr && product?.golf_courses) {
          const courseList: string[] = [];
          
          if (Array.isArray(product.golf_courses)) {
            (product.golf_courses as GolfCourse[]).forEach((gc) => {
              if (gc.courses && Array.isArray(gc.courses)) {
                gc.courses.forEach((courseName: string) => {
                  courseList.push(`${gc.name} - ${courseName}`);
                });
              }
            });
          }
          
          setCourses(courseList.length > 0 ? courseList : []);
        } else {
          console.error("Failed to fetch courses", prodErr);
          setCourses([]);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]);
      }
    };
    
    if (tourId) fetchCourses();
  }, [tourId]);

  // DB에서 티오프 시간표 불러오기
  const fetchTeeTimes = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase.from("singsing_tee_times").select("*").eq("tour_id", tourId).order("date").order("course").order("team_no");
    if (error) setError(error.message);
    else setTeeTimes((data || []).map((t: any) => ({ ...t, players: Array.isArray(t.players) ? t.players : [] })));
    setLoading(false);
  };

  useEffect(() => {
    if (tourId) fetchTeeTimes();
  }, [tourId]);

  // 날짜/코스 변경 시 team_no 자동 증가
  useEffect(() => {
    if (!form.date || !form.course) return;
    const filtered = teeTimes.filter(t => t.date === form.date && t.course === form.course);
    const maxTeamNo = filtered.length > 0 ? Math.max(...filtered.map(t => t.team_no)) : 0;
    setForm(f => ({ ...f, team_no: maxTeamNo + 1 }));
  }, [form.date, form.course, teeTimes]);

  // 참가자 옵션 변환
  const participantOptions = participants.map(p => ({ id: p.id, name: p.name, gender: p.gender }));

  // 중복 참가자 체크 함수
  const getParticipantAssignmentsOnDate = (date: string, participantName: string) => {
    return teeTimes
      .filter(t => t.date === date && t.players.some(p => p.includes(participantName)))
      .map(t => ({
        course: t.course,
        team_no: t.team_no,
        tee_time: t.tee_time
      }));
  };

  const handleSelectParticipant = (p: { id: string; name: string; gender?: string }) => {
    if (selectedParticipants.find(sp => sp.id === p.id)) return;
    
    // 날짜가 선택된 경우 중복 체크
    if (form.date) {
      const existingAssignments = getParticipantAssignmentsOnDate(form.date, p.name);
      if (existingAssignments.length > 0 && !editingId) {
        const assignment = existingAssignments[0];
        const confirmMessage = `${p.name}님은 이미 ${form.date}에 배정되어 있습니다.\n` +
          `(${formatCourseName(assignment.course)} ${assignment.team_no}조 ${formatTimeHHMM(assignment.tee_time)})\n\n` +
          `그래도 추가하시겠습니까?`;
        
        if (!window.confirm(confirmMessage)) {
          return;
        }
      }
    }
    
    setSelectedParticipants([...selectedParticipants, p]);
  };

  const handleRemoveParticipant = (id: string) => {
    setSelectedParticipants(selectedParticipants.filter(p => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.date || !form.course || !form.tee_time || selectedParticipants.length === 0) return;
    
    const playersArr = selectedParticipants.map(p => {
      const genderSuffix = p.gender ? `(${p.gender})` : "";
      return p.name + genderSuffix;
    });
    
    if (editingId) {
      const { error } = await supabase.from("singsing_tee_times").update({
        tour_id: tourId,
        date: form.date,
        course: form.course,
        team_no: Number(form.team_no),
        tee_time: form.tee_time,
        players: playersArr,
      }).eq("id", editingId);
      if (error) setError(error.message);
      else {
        setEditingId(null);
        setForm({ ...initialForm });
        setSelectedParticipants([]);
        fetchTeeTimes();
      }
    } else {
      const filtered = teeTimes.filter(t => t.date === form.date && t.course === form.course);
      const maxTeamNo = filtered.length > 0 ? Math.max(...filtered.map(t => t.team_no)) : 0;
      const nextTeamNo = maxTeamNo + 1;
      const { error } = await supabase.from("singsing_tee_times").insert([
        {
          tour_id: tourId,
          date: form.date,
          course: form.course,
          team_no: Number(form.team_no) || nextTeamNo,
          tee_time: form.tee_time,
          players: playersArr,
        },
      ]);
      if (error) setError(error.message);
      else {
        setForm({ ...initialForm });
        setSelectedParticipants([]);
        fetchTeeTimes();
      }
    }
  };

  // 시간 포맷 함수
  const formatTimeHHMM = (time: string) => {
    if (!time) return "";
    return time.length >= 5 ? time.slice(0, 5) : time;
  };

  // 코스명 가공 함수
  const formatCourseName = (course: string) => {
    if (!course) return "";
    
    const parts = course.split(' - ');
    if (parts.length === 2) {
      const golfCourseName = parts[0].replace(' CC', '').replace(' GC', '').replace(' 골프클럽', '');
      const courseName = parts[1].replace(' 코스', '').replace('코스', '');
      return `${golfCourseName}(${courseName})`;
    }
    
    return course;
  };

  const handleEdit = (t: TeeTime) => {
    setEditingId(t.id);
    setForm({
      date: t.date,
      course: t.course,
      team_no: t.team_no,
      tee_time: t.tee_time,
      players: t.players.join(" · "),
    });
    const selectedFromPlayers = t.players.map(playerName => {
      const cleanName = playerName.replace(/\([남여]\)$/, '');
      const participant = participants.find(p => p.name === cleanName);
      if (participant) {
        return participant;
      }
      const gender = playerName.includes('(남)') ? '남' : playerName.includes('(여)') ? '여' : undefined;
      return { id: playerName, name: cleanName, gender };
    });
    setSelectedParticipants(selectedFromPlayers);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("singsing_tee_times").delete().eq("id", id);
    if (error) setError(error.message);
    else fetchTeeTimes();
  };

  const handleDeleteByDate = async (date: string) => {
    if (!window.confirm(`${date} 날짜의 모든 티타임을 삭제하시겠습니까?`)) return;
    
    const { error } = await supabase
      .from("singsing_tee_times")
      .delete()
      .eq("tour_id", tourId)
      .eq("date", date);
    
    if (error) {
      setError(error.message);
    } else {
      fetchTeeTimes();
    }
  };

  const handleBulkCreate = async () => {
    const startTime = prompt("시작 시간을 입력하세요 (예: 06:00)");
    const interval = prompt("간격(분)을 입력하세요 (예: 8)");
    const count = prompt("생성할 티타임 개수를 입력하세요 (예: 8)");
    
    if (!startTime || !interval || !count || !form.date || !form.course) {
      alert("모든 정보를 입력해주세요.");
      return;
    }
    
    const intervalMinutes = parseInt(interval);
    const teeTimeCount = parseInt(count);
    
    const existing = teeTimes.filter(t => t.date === form.date && t.course === form.course);
    if (existing.length > 0) {
      if (!window.confirm(`${form.date} ${form.course}에 이미 ${existing.length}개의 티타임이 있습니다. 계속하시겠습니까?`)) {
        return;
      }
    }
    
    const newTeeTimes = [];
    let currentTime = startTime;
    const maxTeamNo = existing.length > 0 ? Math.max(...existing.map(t => t.team_no)) : 0;
    
    for (let i = 0; i < teeTimeCount; i++) {
      newTeeTimes.push({
        tour_id: tourId,
        date: form.date,
        course: form.course,
        team_no: maxTeamNo + i + 1,
        tee_time: currentTime,
        players: []
      });
      
      const [hours, minutes] = currentTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + intervalMinutes;
      const newHours = Math.floor(totalMinutes / 60);
      const newMinutes = totalMinutes % 60;
      currentTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    }
    
    const { error } = await supabase
      .from("singsing_tee_times")
      .insert(newTeeTimes);
    
    if (error) {
      setError(error.message);
    } else {
      fetchTeeTimes();
      alert(`${teeTimeCount}개의 티타임이 생성되었습니다.`);
    }
  };

  const handleMovePlayer = async () => {
    if (!moveTarget || !moveToTeam) return;
    const fromTee = teeTimes.find(t => t.id === moveTarget.fromId);
    const toTee = teeTimes.find(t => t.id === moveToTeam);
    if (!fromTee || !toTee) return;
    
    const playerName = moveTarget.player.replace(/\([남여]\)$/, '');
    if (toTee.players.some(p => p.includes(playerName))) {
      alert(`${playerName}님은 이미 ${toTee.team_no}조에 있습니다.`);
      setMoveTarget(null);
      setMoveToTeam("");
      return;
    }
    
    const newFromPlayers = fromTee.players.filter(p => p !== moveTarget.player);
    const newToPlayers = [...toTee.players, moveTarget.player];
    await supabase.from("singsing_tee_times").update({ players: newFromPlayers }).eq("id", fromTee.id);
    await supabase.from("singsing_tee_times").update({ players: newToPlayers }).eq("id", toTee.id);
    setMoveTarget(null);
    setMoveToTeam("");
    fetchTeeTimes();
  };

  const getCourseColor = (course: string, index: number) => {
    // 인덱스 기반 색상 (선택적 - 필요하면 사용)
    const colors = [
      'bg-green-100 border-green-300 text-green-800',
      'bg-blue-100 border-blue-300 text-blue-800',
      'bg-orange-100 border-orange-300 text-orange-800',
    ];
    return colors[index % colors.length] || 'bg-gray-100 border-gray-300 text-gray-800';
  };

  const filteredOptions = participantOptions.filter(p =>
    p.name.includes(participantSearch)
  );

  const groupedOptions = filteredOptions.reduce((acc, p) => {
    const key = p.gender || "기타";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {} as Record<string, typeof participantOptions>);

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedParticipants([]);
      setAllSelected(false);
    } else {
      const toSelect: typeof participantOptions = [];
      for (const p of participantOptions) {
        if (form.date) {
          const existingAssignments = getParticipantAssignmentsOnDate(form.date, p.name);
          if (existingAssignments.length === 0 || editingId) {
            toSelect.push(p);
          }
        } else {
          toSelect.push(p);
        }
      }
      setSelectedParticipants(toSelect);
      setAllSelected(toSelect.length === participantOptions.length);
    }
  };

  useEffect(() => {
    setAllSelected(selectedParticipants.length === participantOptions.length && participantOptions.length > 0);
  }, [selectedParticipants, participantOptions]);

  const grouped = teeTimes.reduce((acc, t) => {
    if (!acc[t.date]) acc[t.date] = {};
    if (!acc[t.date][t.course]) acc[t.date][t.course] = [];
    acc[t.date][t.course].push(t);
    return acc;
  }, {} as Record<string, Record<string, TeeTime[]>>);

  const calculateStats = () => {
    const stats = {
      totalParticipants: 0,
      assignedParticipants: 0,
      maleCount: 0,
      femaleCount: 0,
      dateStats: {} as Record<string, { total: number; male: number; female: number; duplicates: string[] }>
    };

    Object.entries(grouped).forEach(([date, courses]) => {
      let dateTotal = 0;
      let dateMale = 0;
      let dateFemale = 0;
      const dateParticipants = new Map<string, number>();
      
      Object.values(courses).forEach(teams => {
        teams.forEach(team => {
          team.players.forEach(player => {
            dateTotal++;
            const cleanName = player.replace(/\([남여]\)$/, '');
            dateParticipants.set(cleanName, (dateParticipants.get(cleanName) || 0) + 1);
            
            if (player.includes('(남)')) dateMale++;
            else if (player.includes('(여)')) dateFemale++;
          });
        });
      });
      
      const duplicates = Array.from(dateParticipants.entries())
        .filter(([_, count]) => count > 1)
        .map(([name, count]) => `${name}(${count}회)`);
      
      stats.dateStats[date] = { total: dateTotal, male: dateMale, female: dateFemale, duplicates };
      stats.totalParticipants = Math.max(stats.totalParticipants, dateTotal);
    });

    const uniquePlayers = new Set<string>();
    teeTimes.forEach(t => {
      t.players.forEach(p => {
        const cleanName = p.replace(/\([남여]\)$/, '');
        uniquePlayers.add(cleanName);
      });
    });
    stats.assignedParticipants = uniquePlayers.size;

    return stats;
  };

  const stats = calculateStats();

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-800">티오프 시간 관리</h2>
          <div className="flex gap-2">
            {selectedTeeTimes.length > 0 && (
              <>
                <button
                  onClick={() => setSelectedTeeTimes([])}
                  className="bg-gray-400 text-white px-3 py-2 rounded hover:bg-gray-500 text-sm"
                >
                  선택 해제
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm(`선택한 ${selectedTeeTimes.length}개의 티타임을 삭제하시겠습니까?`)) {
                      for (const id of selectedTeeTimes) {
                        await supabase.from("singsing_tee_times").delete().eq("id", id);
                      }
                      setSelectedTeeTimes([]);
                      fetchTeeTimes();
                    }
                  }}
                  className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 text-sm"
                >
                  선택 삭제
                </button>
              </>
            )}
            <button 
              onClick={handleBulkCreate}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
              disabled={!form.date || !form.course}
            >
              티타임 일괄 생성
            </button>
          </div>
        </div>
        <form className="flex flex-col md:flex-row gap-2 mb-6 relative" onSubmit={handleSubmit} autoComplete="off">
          <input name="date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="border rounded px-2 py-1 flex-1" required aria-label="날짜" />
          <select name="course" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} className="border rounded px-2 py-1 flex-1" required aria-label="코스">
            <option value="">코스 선택</option>
            {courses.map((c) => (
              <option key={c} value={c}>{formatCourseName(c)}</option>
            ))}
          </select>
          <input name="team_no" type="number" min={1} value={form.team_no} onChange={e => setForm({ ...form, team_no: Number(e.target.value) })} className="border rounded px-2 py-1 w-20" required aria-label="조 번호" />
          <input name="tee_time" type="time" value={form.tee_time} onChange={e => setForm({ ...form, tee_time: e.target.value })} className="border rounded px-2 py-1 w-28" required aria-label="티오프 시간" />
          <div className="relative flex-1">
            <Popover>
              <PopoverTrigger asChild>
                <div className="w-full min-h-[40px] border rounded px-2 py-1 flex flex-wrap items-center gap-1 cursor-pointer bg-white">
                  {selectedParticipants.length === 0 && <span className="text-gray-400">참가자 선택</span>}
                  {selectedParticipants.map(p => (
                    <span key={p.id} className="inline-flex items-center bg-blue-100 text-blue-800 rounded px-2 py-0.5 text-sm mr-1">
                      {p.name}{p.gender ? <span className="ml-1 text-xs text-blue-600">({p.gender})</span> : null}
                      <button type="button" className="ml-1 text-blue-400 hover:text-red-500" onClick={e => { e.stopPropagation(); handleRemoveParticipant(p.id); }} aria-label="삭제">×</button>
                    </span>
                  ))}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0">
                <Command>
                  <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50 sticky top-0 z-10">
                    <CommandInput placeholder="이름 검색" value={participantSearch} onValueChange={setParticipantSearch} className="w-40" />
                    <button type="button" className="text-xs px-2 py-1 rounded border ml-2 bg-white hover:bg-blue-50" onClick={handleSelectAll}>{allSelected ? "전체 해제" : "전체 선택"}</button>
                  </div>
                  <CommandList className="max-h-60 overflow-y-auto">
                    {filteredOptions.length === 0 ? (
                      <div className="p-2 text-gray-400">검색 결과 없음</div>
                    ) : (
                      Object.entries(groupedOptions)
                        .filter(([_, list]) => list.length > 0)
                        .map(([gender, list]) => (
                          <div key={gender} className="py-1">
                            <div className="px-3 py-1 text-xs text-blue-700 bg-blue-50 rounded-t font-semibold sticky top-0 z-10">
                              {gender === "남" ? "남자" : gender === "여" ? "여자" : gender}
                            </div>
                            {list.map(p => {
                              const checked = !!selectedParticipants.find(sp => sp.id === p.id);
                              const existingAssignments = form.date ? getParticipantAssignmentsOnDate(form.date, p.name) : [];
                              const isDuplicate = existingAssignments.length > 0 && !editingId;
                              
                              return (
                                <CommandItem
                                  key={p.id}
                                  onSelect={() => handleSelectParticipant(p)}
                                  className={`${checked ? "bg-blue-50 text-blue-700" : ""} ${isDuplicate ? "bg-yellow-50" : ""}`}
                                  tabIndex={0}
                                  aria-selected={checked}
                                  role="option"
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    readOnly
                                    className="mr-2 accent-blue-600"
                                    tabIndex={-1}
                                  />
                                  {p.name}{p.gender ? <span className="ml-1 text-xs text-blue-600">({p.gender})</span> : null}
                                  {isDuplicate && (
                                    <span className="ml-2 text-xs text-orange-600">
                                      ({existingAssignments[0].team_no}조 배정됨)
                                    </span>
                                  )}
                                </CommandItem>
                              );
                            })}
                          </div>
                        ))
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <button type="submit" className="bg-blue-800 text-white px-4 py-1 rounded min-w-[60px]">{editingId ? "수정" : "추가"}</button>
          {editingId && <button type="button" className="bg-gray-300 text-gray-800 px-4 py-1 rounded min-w-[60px]" onClick={() => { setEditingId(null); setForm(initialForm); setSelectedParticipants([]); }}>취소</button>}
        </form>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        {loading ? (
          <div className="text-center py-4 text-gray-500">불러오는 중...</div>
        ) : (
          <div className="bg-white rounded-lg shadow p-4">
            {Object.keys(grouped).length === 0 && <div className="text-gray-400 text-center py-8">등록된 티오프가 없습니다.</div>}
            {Object.entries(grouped)
              .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
              .map(([date, courses]) => {
                const dateStats = stats.dateStats[date] || { total: 0, male: 0, female: 0, duplicates: [] };
                return (
                  <div key={date} className="mb-8">
                    <div className="text-lg font-bold text-blue-900 border-b pb-1 mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{date}</span>
                        <span className="text-sm font-normal text-gray-600">
                          ({dateStats.total}명: 남 {dateStats.male}, 여 {dateStats.female})
                        </span>
                        {dateStats.duplicates.length > 0 && (
                          <span className="text-sm text-orange-600 font-normal">
                            ⚠️ 중복: {dateStats.duplicates.join(', ')}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteByDate(date)}
                        className="text-sm text-red-600 hover:text-red-800 underline"
                      >
                        날짜 전체 삭제
                      </button>
                    </div>
                    {Object.entries(courses).length === 0 && <div className="text-gray-400 text-center py-4">코스 없음</div>}
                    {Object.keys(courses).map((course, courseIndex) => {
                      const teams = courses[course];
                      return (
                        <div key={course} className="mb-4">
                          <div className="text-base font-semibold text-blue-700 mb-1 flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded border ${getCourseColor(course, courseIndex)}`}>
                              {formatCourseName(course)}
                            </span>
                            <span className="text-xs text-gray-400">{teams.length}조</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {teams.sort((a, b) => a.team_no - b.team_no).map((t) => {
                              const maleCount = t.players.filter(p => p.includes('(남)')).length;
                              const femaleCount = t.players.filter(p => p.includes('(여)')).length;
                              const isSelected = selectedTeeTimes.includes(t.id);
                              
                              return (
                                <div key={t.id} className={`border rounded-lg p-3 flex flex-col gap-1 shadow-sm hover:shadow-md transition ${isSelected ? 'bg-blue-100 border-blue-400' : 'bg-gray-50'}`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedTeeTimes([...selectedTeeTimes, t.id]);
                                          } else {
                                            setSelectedTeeTimes(selectedTeeTimes.filter(id => id !== t.id));
                                          }
                                        }}
                                        className="w-4 h-4"
                                      />
                                      <div className="font-bold text-blue-800 text-lg">{t.team_no}조</div>
                                    </div>
                                    <div className="text-red-600 font-bold text-base">{formatTimeHHMM(t.tee_time)}</div>
                                  </div>
                                  <div className="flex flex-wrap gap-2 items-center mb-1">
                                    {t.players.length === 0 && <span className="text-gray-400">참가자 없음</span>}
                                    {t.players.map((p, i, arr) => (
                                      <span key={i} className={p.includes("(남)") ? "text-blue-700 font-medium" : p.includes("(여)") ? "text-pink-600 font-medium" : ""}>
                                        {p}
                                        <button
                                          type="button"
                                          className="ml-1 text-xs text-green-700 underline"
                                          onClick={() => setMoveTarget({ player: p, fromId: t.id })}
                                          aria-label="이동"
                                        >이동</button>
                                        {moveTarget && moveTarget.player === p && moveTarget.fromId === t.id && (
                                          <select
                                            className="ml-1 border rounded px-1 py-0.5 text-xs"
                                            value={moveToTeam}
                                            onChange={e => setMoveToTeam(e.target.value)}
                                          >
                                            <option value="">조 선택</option>
                                            {teams.filter(tt => tt.id !== t.id).map(tt => (
                                              <option key={tt.id} value={tt.id}>{tt.team_no}조</option>
                                            ))}
                                          </select>
                                        )}
                                        {moveTarget && moveTarget.player === p && moveTarget.fromId === t.id && moveToTeam && (
                                          <button
                                            type="button"
                                            className="ml-1 text-xs text-blue-700 underline"
                                            onClick={handleMovePlayer}
                                          >이동확정</button>
                                        )}
                                        {i < arr.length - 1 && <span className="mx-1 text-gray-400">·</span>}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                    <span>인원: <span className={t.players.length === 4 ? "text-blue-700 font-bold" : t.players.length > 4 ? "text-red-600 font-bold" : ""}>{t.players.length}</span>/4</span>
                                    {(maleCount > 0 || femaleCount > 0) && (
                                      <span className="text-gray-600">
                                        ({maleCount > 0 && <span className="text-blue-600">남{maleCount}</span>}
                                        {maleCount > 0 && femaleCount > 0 && ', '}
                                        {femaleCount > 0 && <span className="text-pink-600">여{femaleCount}</span>})
                                      </span>
                                    )}
                                    {t.players.length > 4 && <span className="text-red-600 font-bold">정원 초과</span>}
                                  </div>
                                  <div className="flex gap-2 mt-1">
                                    <button className="text-blue-700 underline" onClick={() => handleEdit(t)} aria-label="수정">수정</button>
                                    <button className="text-red-600 underline" onClick={() => handleDelete(t.id)} aria-label="삭제">삭제</button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeeTimeManager;