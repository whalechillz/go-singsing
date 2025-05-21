"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const [autoList, setAutoList] = useState<Participant[]>([]);
  const [showAuto, setShowAuto] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [courses, setCourses] = useState<string[]>([]);
  const [moveTarget, setMoveTarget] = useState<{ player: string; fromId: string } | null>(null);
  const [moveToTeam, setMoveToTeam] = useState<string>("");
  const [selectedParticipants, setSelectedParticipants] = useState<{ id: string; name: string; gender?: string }[]>([]);
  const [participantSearch, setParticipantSearch] = useState("");
  const [allSelected, setAllSelected] = useState(false);

  // 참가자 자동완성 데이터 불러오기 (gender 포함)
  useEffect(() => {
    const fetchParticipants = async () => {
      const { data, error } = await supabase.from("singsing_participants").select("id, name, gender").eq("tour_id", tourId);
      if (!error && data) setParticipants(data);
    };
    if (tourId) fetchParticipants();
  }, [tourId]);

  // 투어의 tour_product_id → courses 배열 fetch
  useEffect(() => {
    const fetchCourses = async () => {
      // 1. 투어 정보에서 tour_product_id 조회
      const { data: tour, error: tourErr } = await supabase.from("singsing_tours").select("tour_product_id").eq("id", tourId).single();
      if (tourErr || !tour?.tour_product_id) {
        setCourses([]);
        return;
      }
      // 2. tour_products에서 courses 배열 조회
      const { data: product, error: prodErr } = await supabase.from("tour_products").select("courses").eq("id", tour.tour_product_id).single();
      if (!prodErr && product && Array.isArray(product.courses)) {
        setCourses(product.courses);
      } else {
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
    // 같은 날짜+코스의 기존 티오프 중 가장 큰 team_no 찾기
    const filtered = teeTimes.filter(t => t.date === form.date && t.course === form.course);
    const maxTeamNo = filtered.length > 0 ? Math.max(...filtered.map(t => t.team_no)) : 0;
    setForm(f => ({ ...f, team_no: maxTeamNo + 1 }));
  }, [form.date, form.course, teeTimes]);

  // 참가자 옵션 변환
  const participantOptions = participants.map(p => ({ id: p.id, name: p.name, gender: p.gender }));

  const handleSelectParticipant = (p: { id: string; name: string; gender?: string }) => {
    if (selectedParticipants.find(sp => sp.id === p.id)) return;
    setSelectedParticipants([...selectedParticipants, p]);
  };

  const handleRemoveParticipant = (id: string) => {
    setSelectedParticipants(selectedParticipants.filter(p => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.date || !form.course || !form.tee_time || selectedParticipants.length === 0) return;
    const playersArr = selectedParticipants.map(p => p.name + (p.gender ? `(${p.gender})` : ""));
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

  const handleEdit = (t: TeeTime) => {
    setEditingId(t.id);
    setForm({
      date: t.date,
      course: t.course,
      team_no: t.team_no,
      tee_time: t.tee_time,
      players: t.players.join(" · "),
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("singsing_tee_times").delete().eq("id", id);
    if (error) setError(error.message);
    else fetchTeeTimes();
  };

  // 시간 포맷 함수 추가
  const formatTimeHHMM = (time: string) => {
    if (!time) return "";
    // "13:15:00" → "13:15"
    return time.length >= 5 ? time.slice(0, 5) : time;
  };

  // 4명 자동 배정 핸들러
  const handleAutoAssignPlayers = () => {
    // 이미 배정된 참가자(이름) 목록
    const assigned = teeTimes.flatMap(t => t.players);
    // 미배정 참가자만 필터
    const unassigned = participants.filter(p => !assigned.includes(p.name + (p.gender ? `(${p.gender})` : "")));
    // 4명 추천 (이름+성별)
    const selected = unassigned.slice(0, 4).map(p => p.name + (p.gender ? `(${p.gender})` : ""));
    setForm({ ...form, players: selected.join(" · ") });
  };

  // 참가자 이동 처리
  const handleMovePlayer = async () => {
    if (!moveTarget || !moveToTeam) return;
    // from 조, to 조 찾기
    const fromTee = teeTimes.find(t => t.id === moveTarget.fromId);
    const toTee = teeTimes.find(t => t.id === moveToTeam);
    if (!fromTee || !toTee) return;
    // from 조에서 참가자 삭제
    const newFromPlayers = fromTee.players.filter(p => p !== moveTarget.player);
    // to 조에 참가자 추가
    const newToPlayers = [...toTee.players, moveTarget.player];
    // DB 업데이트
    await supabase.from("singsing_tee_times").update({ players: newFromPlayers }).eq("id", fromTee.id);
    await supabase.from("singsing_tee_times").update({ players: newToPlayers }).eq("id", toTee.id);
    setMoveTarget(null);
    setMoveToTeam("");
    fetchTeeTimes();
  };

  // 1. 코스명 가공 함수 추가
  const formatCourseName = (course: string) => {
    // 예: "파인힐스 CC - 파인 코스" → "파인힐스(파인)"
    if (!course) return "";
    const match = course.match(/(.+?) CC - (.+?) 코스/);
    if (match) return `${match[1]}(${match[2]})`;
    return course;
  };

  // 1. 참가자 멀티 셀렉트 개선: 체크박스+전체리스트+검색+접근성
  const filteredOptions = participantOptions.filter(p =>
    p.name.includes(participantSearch)
  );

  // 참가자 멀티 셀렉트: 전체 선택/해제, 성별 그룹핑, 모바일 대응, 상단 고정, UX 강화
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
      setSelectedParticipants(participantOptions);
      setAllSelected(true);
    }
  };
  useEffect(() => {
    setAllSelected(selectedParticipants.length === participantOptions.length && participantOptions.length > 0);
  }, [selectedParticipants, participantOptions]);

  // 2. 날짜/코스/조별 그룹핑 UI로 표/카드 구조 리팩토링
  const grouped = teeTimes.reduce((acc, t) => {
    if (!acc[t.date]) acc[t.date] = {};
    if (!acc[t.date][t.course]) acc[t.date][t.course] = [];
    acc[t.date][t.course].push(t);
    return acc;
  }, {} as Record<string, Record<string, TeeTime[]>>);

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-blue-800 mb-4">티오프 시간 관리</h2>
        <form className="flex flex-col md:flex-row gap-2 mb-6 relative" onSubmit={handleSubmit} autoComplete="off">
          <input name="date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="border rounded px-2 py-1 flex-1" required aria-label="날짜" />
          <select name="course" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} className="border rounded px-2 py-1 flex-1" required aria-label="코스">
            <option value="">코스 선택</option>
            {courses.length > 0
              ? courses.map((c) => <option key={c} value={c}>{formatCourseName(c)}</option>)
              : [
                  <option key="파인힐스 CC - 파인 코스" value="파인힐스 CC - 파인 코스">{formatCourseName("파인힐스 CC - 파인 코스")}</option>,
                  <option key="파인힐스 CC - 레이크 코스" value="파인힐스 CC - 레이크 코스">{formatCourseName("파인힐스 CC - 레이크 코스")}</option>,
                  <option key="파인힐스 CC - 힐스 코스" value="파인힐스 CC - 힐스 코스">{formatCourseName("파인힐스 CC - 힐스 코스")}</option>,
                ]}
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
                    {Object.entries(groupedOptions).map(([gender, list]) => (
                      <div key={gender} className="py-1">
                        <div className="px-3 py-1 text-xs text-blue-700 bg-blue-50 rounded-t font-semibold sticky top-0 z-10">{gender === "남" ? "남자" : gender === "여" ? "여자" : gender}</div>
                        {list.length === 0 && <div className="p-2 text-gray-400">검색 결과 없음</div>}
                        {list.map(p => {
                          const checked = !!selectedParticipants.find(sp => sp.id === p.id);
                          return (
                            <CommandItem
                              key={p.id}
                              onSelect={() => handleSelectParticipant(p)}
                              className={checked ? "bg-blue-50 text-blue-700" : ""}
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
                            </CommandItem>
                          );
                        })}
                      </div>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <button type="submit" className="bg-blue-800 text-white px-4 py-1 rounded min-w-[60px]">{editingId ? "수정" : "추가"}</button>
          {editingId && <button type="button" className="bg-gray-300 text-gray-800 px-4 py-1 rounded min-w-[60px]" onClick={() => { setEditingId(null); setForm(initialForm); }}>취소</button>}
        </form>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        {loading ? (
          <div className="text-center py-4 text-gray-500">불러오는 중...</div>
        ) : (
          <div className="bg-white rounded-lg shadow p-4">
            {Object.keys(grouped).length === 0 && <div className="text-gray-400 text-center py-8">등록된 티오프가 없습니다.</div>}
            {Object.entries(grouped).map(([date, courses]) => (
              <div key={date} className="mb-8">
                <div className="text-lg font-bold text-blue-900 border-b pb-1 mb-2 flex items-center gap-2">
                  <span className="material-icons text-blue-400">event</span>{date}
                </div>
                {Object.entries(courses).length === 0 && <div className="text-gray-400 text-center py-4">코스 없음</div>}
                {Object.entries(courses).map(([course, teams]) => (
                  <div key={course} className="mb-4">
                    <div className="text-base font-semibold text-blue-700 mb-1 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-50 rounded border border-blue-100">{formatCourseName(course)}</span>
                      <span className="text-xs text-gray-400">{teams.length}조</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {teams.sort((a, b) => a.team_no - b.team_no).map((t) => (
                        <div key={t.id} className="border rounded-lg p-3 flex flex-col gap-1 bg-gray-50 shadow-sm hover:shadow-md transition">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-bold text-blue-800 text-lg">{t.team_no}조</div>
                            <div className="text-red-600 font-bold text-base">{formatTimeHHMM(t.tee_time)}</div>
                          </div>
                          <div className="flex flex-wrap gap-2 items-center mb-1">
                            {t.players.length === 0 && <span className="text-gray-400">참가자 없음</span>}
                            {t.players.map((p, i, arr) => (
                              <span key={i} className={p.includes("(남)") ? "text-blue-700 font-medium" : ""}>
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
                            <span>참가자 수: <span className={t.players.length === 4 ? "text-blue-700 font-bold" : t.players.length > 4 ? "text-red-600 font-bold" : ""}>{t.players.length}</span>/4</span>
                            {t.players.length > 4 && <span className="text-red-600 font-bold">정원 초과</span>}
                          </div>
                          <div className="flex gap-2 mt-1">
                            <button className="text-blue-700 underline" onClick={() => handleEdit(t)} aria-label="수정">수정</button>
                            <button className="text-red-600 underline" onClick={() => handleDelete(t.id)} aria-label="삭제">삭제</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeeTimeManager; 