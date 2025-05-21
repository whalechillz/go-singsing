"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "players") {
      const last = value.split(/,|\n|\s*·\s*/).pop()?.trim() || "";
      if (last.length > 0) {
        setAutoList(participants.filter(p => p.name.includes(last) && !form.players.includes(p.name)));
        setShowAuto(true);
      } else {
        setShowAuto(false);
      }
    }
  };

  const handleAutoSelect = (name: string) => {
    let playersArr = form.players.split(/,|\n|\s*·\s*/).map(p => p.trim()).filter(Boolean);
    if (!playersArr.includes(name)) playersArr.push(name);
    setForm({ ...form, players: playersArr.join(" · ") + " · " });
    setShowAuto(false);
    inputRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.date || !form.course || !form.tee_time || !form.players) return;
    const playersArr = form.players.split(/,|\n|\s*·\s*/).map(p => p.trim()).filter(Boolean);
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
        fetchTeeTimes();
      }
    } else {
      // team_no 자동 증가: 같은 날짜+코스의 기존 티오프 중 가장 큰 team_no + 1
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

  // 참가자 입력란에서 X(삭제) 버튼
  const handleRemovePlayerInput = (idx: number) => {
    const arr = form.players.split(/,|\n|\s*·\s*/).map(p => p.trim()).filter(Boolean);
    arr.splice(idx, 1);
    setForm({ ...form, players: arr.join(" · ") });
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-blue-800 mb-4">티오프 시간 관리</h2>
        <form className="flex flex-col md:flex-row gap-2 mb-6 relative" onSubmit={handleSubmit} autoComplete="off">
          <input name="date" type="date" value={form.date} onChange={handleChange} className="border rounded px-2 py-1 flex-1" required aria-label="날짜" />
          <select name="course" value={form.course} onChange={handleChange} className="border rounded px-2 py-1 flex-1" required aria-label="코스">
            <option value="">코스 선택</option>
            {courses.length > 0
              ? courses.map((c) => <option key={c} value={c}>{c}</option>)
              : [
                  <option key="파인힐스 CC - 파인 코스" value="파인힐스 CC - 파인 코스">파인힐스 CC - 파인 코스</option>,
                  <option key="파인힐스 CC - 레이크 코스" value="파인힐스 CC - 레이크 코스">파인힐스 CC - 레이크 코스</option>,
                  <option key="파인힐스 CC - 힐스 코스" value="파인힐스 CC - 힐스 코스">파인힐스 CC - 힐스 코스</option>,
                ]}
          </select>
          <input name="team_no" type="number" min={1} value={form.team_no} onChange={handleChange} className="border rounded px-2 py-1 w-20" required aria-label="조 번호" />
          <input name="tee_time" type="time" value={form.tee_time} onChange={handleChange} className="border rounded px-2 py-1 w-28" required aria-label="티오프 시간" />
          <div className="relative flex-1">
            <div className="flex flex-wrap gap-1 mb-1">
              {form.players.split(/,|\n|\s*·\s*/).map((p, i, arr) => p && (
                <span key={i} className="inline-flex items-center bg-gray-100 rounded px-2 py-0.5 text-sm mr-1">
                  {p}
                  <button type="button" className="ml-1 text-gray-400 hover:text-red-500" onClick={() => handleRemovePlayerInput(i)} aria-label="삭제">×</button>
                </span>
              ))}
            </div>
            <input
              ref={inputRef}
              name="players"
              value={form.players}
              onChange={handleChange}
              placeholder="참가자 (자동완성, ·, ,로 구분)"
              className="border rounded px-2 py-1 w-full"
              required
              aria-label="참가자"
              autoComplete="off"
              onFocus={() => setShowAuto(true)}
              onBlur={() => setTimeout(() => setShowAuto(false), 200)}
            />
            {/* 자동 배정 버튼 */}
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 text-white px-3 py-1 rounded text-xs shadow hover:bg-green-700"
              onClick={handleAutoAssignPlayers}
              tabIndex={0}
              aria-label="4명 자동 배정"
            >
              자동 배정
            </button>
            {/* 자동완성 리스트 */}
            {showAuto && autoList.length > 0 && (
              <ul className="absolute z-10 bg-white border rounded shadow w-full max-h-40 overflow-auto mt-1">
                {autoList.map((p) => (
                  <li
                    key={p.id}
                    className="px-3 py-2 cursor-pointer hover:bg-blue-100"
                    onMouseDown={() => handleAutoSelect(p.name + (p.gender ? `(${p.gender})` : ""))}
                  >
                    {p.name}{p.gender ? <span className="ml-1 text-xs text-gray-500">({p.gender})</span> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="submit" className="bg-blue-800 text-white px-4 py-1 rounded min-w-[60px]">{editingId ? "수정" : "추가"}</button>
          {editingId && <button type="button" className="bg-gray-300 text-gray-800 px-4 py-1 rounded min-w-[60px]" onClick={() => { setEditingId(null); setForm(initialForm); }}>취소</button>}
        </form>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        {loading ? (
          <div className="text-center py-4 text-gray-500">불러오는 중...</div>
        ) : (
          <div className="bg-white rounded-lg shadow p-4">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2">날짜</th>
                  <th className="px-2 py-2">코스</th>
                  <th className="px-2 py-2">조</th>
                  <th className="px-2 py-2">티오프</th>
                  <th className="px-2 py-2">참가자</th>
                  <th className="px-2 py-2">관리</th>
                </tr>
              </thead>
              <tbody>
                {teeTimes.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="px-2 py-1 whitespace-nowrap">{t.date}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{t.course}</td>
                    <td className="px-2 py-1 text-center">{t.team_no}</td>
                    <td className="px-2 py-1 text-center text-red-600 font-bold">{formatTimeHHMM(t.tee_time)}</td>
                    <td className="px-2 py-1">
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
                              {teeTimes.filter(tt => tt.id !== t.id && tt.date === t.date && tt.course === t.course).map(tt => (
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
                    </td>
                    <td className="px-2 py-1 flex gap-1">
                      <button className="text-blue-700 underline" onClick={() => handleEdit(t)} aria-label="수정">수정</button>
                      <button className="text-red-600 underline" onClick={() => handleDelete(t.id)} aria-label="삭제">삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeeTimeManager; 