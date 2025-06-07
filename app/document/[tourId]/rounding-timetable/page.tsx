"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { simplifyCourseName } from "@/lib/utils";

const RoundingTimetableDoc = () => {
  const { tourId } = useParams();
  const [tour, setTour] = useState<any>(null);
  const [teeTimes, setTeeTimes] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [footer, setFooter] = useState<string>("");

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${date.getMonth() + 1}월 ${date.getDate()}일 (${dayOfWeek})`;
  };

  // 시간 포맷 함수 추가 (초 제거)
  const formatTimeHHMM = (time: string) => {
    if (!time) return "";
    return time.length >= 5 ? time.slice(0, 5) : time;
  };

  // 조 구성 표기 함수
  const getTeamType = (players: string[]) => {
    if (!Array.isArray(players) || players.length === 0) return "-";
    const hasMale = players.some(p => p.includes("(남)"));
    const hasFemale = players.some(p => p.includes("(여)"));
    if (hasMale && hasFemale) return "(혼성팀)";
    if (hasMale) return "(남성팀)";
    return "(여성팀)";
  };

  useEffect(() => {
    // 투어 정보
    supabase.from("singsing_tours").select("*").eq("id", tourId).single().then(({ data }) => setTour(data));
    // 티오프 시간표
    supabase.from("singsing_tee_times").select("*").eq("tour_id", tourId).then(({ data }) => setTeeTimes(data || []));
    // 주의사항
    supabase.from("rounding_timetable_notices").select("*").eq("tour_id", tourId).order("order", { ascending: true }).then(({ data }) => setNotices(data || []));
    // 연락처
    supabase.from("rounding_timetable_contacts").select("*").eq("tour_id", tourId).then(({ data }) => setContacts(data || []));
    // 푸터
    supabase.from("rounding_timetable_footers").select("*").eq("tour_id", tourId).single().then(({ data }) => setFooter(data?.footer || ""));
  }, [tourId]);

  // 티오프 시간표를 날짜/코스별로 그룹핑
  const grouped: Record<string, Record<string, any[]>> = {};
  teeTimes.forEach((t) => {
    if (!grouped[t.date]) grouped[t.date] = {};
    if (!grouped[t.date][t.course]) grouped[t.date][t.course] = [];
    grouped[t.date][t.course].push(t);
  });

  if (!tour) return <div>불러오는 중...</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* 헤더 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-blue-800">라운딩 조별 시간표</h1>
            <p className="text-gray-600 text-sm">{tour.title} / {tour.start_date}~{tour.end_date} / {tour.golf_course}</p>
          </div>
          <div className="text-lg font-bold text-blue-800 mt-2 md:mt-0">싱싱골프투어</div>
        </div>
        {/* 일자별 시간표 */}
        {Object.entries(grouped).map(([date, courses], dayIndex) => (
          <div key={date} className="mb-8">
            <div className="bg-blue-50 text-blue-800 font-bold text-lg px-4 py-3 rounded-lg mb-4 border border-blue-100">
              {formatDate(date)} - {["첫째날", "둘째날", "셋째날", "넷째날"][dayIndex] || `${dayIndex+1}일차`}
            </div>
            {Object.entries(courses).map(([course, groups], courseIndex) => (
              <div key={course} className="mb-4 bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-blue-600 text-white px-4 py-2 font-medium">{simplifyCourseName(course)}</div>
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">시간</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">조 구성</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">참가자</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {groups.sort((a, b) => a.team_no - b.team_no).map((g, groupIndex) => (
                      <tr key={g.id || groupIndex} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">{formatTimeHHMM(g.tee_time)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            getTeamType(g.players) === '(여성팀)'
                              ? 'bg-pink-100 text-pink-800'
                              : getTeamType(g.players) === '(남성팀)'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {getTeamType(g.players)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {Array.isArray(g.players)
                            ? g.players.map((player: string, i: number, arr: string[]) => {
                                // 성별 정보 추출
                                const cleanName = player.replace(/\([남여]\)$/, '');
                                const gender = player.includes('(남)') ? '남' : player.includes('(여)') ? '여' : '';
                                
                                return (
                                  <span key={i}>
                                    <span className={
                                      gender === '남' ? 'text-blue-700 font-medium' : 
                                      gender === '여' ? 'text-pink-600 font-medium' : ''
                                    }>
                                      {cleanName}
                                      {gender && <span className="text-xs ml-0.5">({gender})</span>}
                                    </span>
                                    {i < arr.length - 1 && <span className="mx-1 text-gray-400">·</span>}
                                  </span>
                                );
                              })
                            : g.players}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ))}
        {/* 라운딩 주의사항 */}
        {notices.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r">
            <h3 className="text-sm font-bold text-red-800 mb-2">라운딩 주의사항</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-red-700">
              {notices.map((n) =>
                n.notice
                  .split('\n')
                  .filter((line: string) => line.trim() !== '')
                  .map((line: string, idx: number) => (
                    <li key={n.id + '-' + idx}>{line}</li>
                  ))
              )}
            </ul>
          </div>
        )}
        {/* 연락처 정보 */}
        {contacts.length > 0 && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r">
            <h3 className="text-sm font-bold text-green-800 mb-2">비상 연락처</h3>
            <ul className="text-sm text-green-700">
              {contacts.map((c) => (
                <li key={c.id}>
                  <strong>{c.name}</strong>
                  {c.role && <> ({c.role})</>}
                  : {c.phone}
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* 푸터 */}
        {footer && (
          <div
            className="text-center p-4 bg-white rounded-lg shadow mt-6"
            dangerouslySetInnerHTML={{ __html: footer.replace(/\n/g, '<br />') }}
          />
        )}
      </div>
    </div>
  );
};

export default RoundingTimetableDoc;