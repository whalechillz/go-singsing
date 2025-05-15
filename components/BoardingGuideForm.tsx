"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Route = { id?: string; time: string; place: string };
type Notice = { id?: string; notice: string };
type Contact = { id?: string; name: string; phone: string; role: string };

type Props = { tourId: string };

const BoardingGuideForm: React.FC<Props> = ({ tourId }) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      // 이동 경로
      const { data: routeRows, error: routeErr } = await supabase
        .from("boarding_guide_routes")
        .select("id, time, place")
        .eq("tour_id", tourId)
        .order("order");
      setRoutes(routeRows || []);
      // 주의사항
      const { data: noticeRows, error: noticeErr } = await supabase
        .from("boarding_guide_notices")
        .select("id, notice")
        .eq("tour_id", tourId)
        .order("order");
      setNotices(noticeRows || []);
      // 연락처
      const { data: contactRows, error: contactErr } = await supabase
        .from("boarding_guide_contacts")
        .select("id, name, phone, role")
        .eq("tour_id", tourId);
      setContacts(contactRows || []);
      if (routeErr || noticeErr || contactErr) setError("데이터를 불러오지 못했습니다.");
      setLoading(false);
    };
    fetchData();
  }, [tourId]);

  // 이동 경로
  const handleAddRoute = () => setRoutes([...routes, { time: "", place: "" }]);
  const handleRemoveRoute = (idx: number) => setRoutes(routes.filter((_, i) => i !== idx));
  const handleChangeRoute = (idx: number, key: keyof Route, value: string) => setRoutes(routes.map((r, i) => i === idx ? { ...r, [key]: value } : r));

  // 주의사항
  const handleAddNotice = () => setNotices([...notices, { notice: "" }]);
  const handleRemoveNotice = (idx: number) => setNotices(notices.filter((_, i) => i !== idx));
  const handleChangeNotice = (idx: number, value: string) => setNotices(notices.map((n, i) => i === idx ? { ...n, notice: value } : n));

  // 연락처
  const handleAddContact = () => setContacts([...contacts, { name: "", phone: "", role: "" }]);
  const handleRemoveContact = (idx: number) => setContacts(contacts.filter((_, i) => i !== idx));
  const handleChangeContact = (idx: number, key: keyof Contact, value: string) => setContacts(contacts.map((c, i) => i === idx ? { ...c, [key]: value } : c));

  // 저장
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    // upsert: 기존 row는 id, 신규 row는 id 없음
    // 1. 이동 경로
    const routePayload = routes.map((r, i) => ({ ...r, tour_id: tourId, order: i }));
    // 2. 주의사항
    const noticePayload = notices.map((n, i) => ({ ...n, tour_id: tourId, order: i }));
    // 3. 연락처
    const contactPayload = contacts.map((c, i) => ({ ...c, tour_id: tourId }));
    // 트랜잭션 불가, 병렬 처리
    const [routeRes, noticeRes, contactRes] = await Promise.all([
      supabase.from("boarding_guide_routes").upsert(routePayload, { onConflict: "id" }),
      supabase.from("boarding_guide_notices").upsert(noticePayload, { onConflict: "id" }),
      supabase.from("boarding_guide_contacts").upsert(contactPayload, { onConflict: "id" })
    ]);
    if (routeRes.error || noticeRes.error || contactRes.error) {
      setError("저장 중 오류가 발생했습니다.");
    } else {
      setSuccess("저장되었습니다.");
    }
    setLoading(false);
  };

  return (
    <form className="bg-white rounded-lg shadow p-6 mb-8" onSubmit={handleSave} aria-label="탑승지 안내 하단 입력 폼">
      <h2 className="text-xl font-bold mb-4">탑승지 안내 하단 입력</h2>
      {/* 이동 경로 */}
      <div className="mb-6">
        <label className="block text-base font-semibold mb-2" htmlFor="route-list">이동 경로 및 정차 정보</label>
        <div id="route-list">
          {routes.map((r, i) => (
            <div key={i} className="flex gap-2 mb-2 items-center">
              <input
                type="text"
                className="border rounded px-2 py-1 w-24"
                placeholder="시간"
                aria-label="시간"
                tabIndex={0}
                value={r.time}
                onChange={e => handleChangeRoute(i, "time", e.target.value)}
                required
              />
              <input
                type="text"
                className="border rounded px-2 py-1 flex-1"
                placeholder="장소"
                aria-label="장소"
                tabIndex={0}
                value={r.place}
                onChange={e => handleChangeRoute(i, "place", e.target.value)}
                required
              />
              <button type="button" onClick={() => handleRemoveRoute(i)} aria-label="이동 경로 삭제" tabIndex={0} className="text-red-500 px-2">삭제</button>
            </div>
          ))}
          <button type="button" onClick={handleAddRoute} className="mt-2 text-blue-600 font-semibold" aria-label="이동 경로 추가" tabIndex={0}>+ 추가</button>
        </div>
      </div>
      {/* 주의사항 */}
      <div className="mb-6">
        <label className="block text-base font-semibold mb-2" htmlFor="notice-list">탑승 주의사항</label>
        <div id="notice-list">
          {notices.map((n, i) => (
            <div key={i} className="flex gap-2 mb-2 items-center">
              <input
                type="text"
                className="border rounded px-2 py-1 flex-1"
                placeholder="주의사항"
                aria-label="주의사항"
                tabIndex={0}
                value={n.notice}
                onChange={e => handleChangeNotice(i, e.target.value)}
                required
              />
              <button type="button" onClick={() => handleRemoveNotice(i)} aria-label="주의사항 삭제" tabIndex={0} className="text-red-500 px-2">삭제</button>
            </div>
          ))}
          <button type="button" onClick={handleAddNotice} className="mt-2 text-blue-600 font-semibold" aria-label="주의사항 추가" tabIndex={0}>+ 추가</button>
        </div>
      </div>
      {/* 비상 연락처 */}
      <div className="mb-6">
        <label className="block text-base font-semibold mb-2" htmlFor="contact-list">비상 연락처</label>
        <div id="contact-list">
          {contacts.map((c, i) => (
            <div key={i} className="flex gap-2 mb-2 items-center">
              <input
                type="text"
                className="border rounded px-2 py-1 w-32"
                placeholder="이름"
                aria-label="이름"
                tabIndex={0}
                value={c.name}
                onChange={e => handleChangeContact(i, "name", e.target.value)}
                required
              />
              <input
                type="text"
                className="border rounded px-2 py-1 w-40"
                placeholder="전화번호"
                aria-label="전화번호"
                tabIndex={0}
                value={c.phone}
                onChange={e => handleChangeContact(i, "phone", e.target.value)}
                required
              />
              <input
                type="text"
                className="border rounded px-2 py-1 w-32"
                placeholder="역할"
                aria-label="역할"
                tabIndex={0}
                value={c.role}
                onChange={e => handleChangeContact(i, "role", e.target.value)}
                required
              />
              <button type="button" onClick={() => handleRemoveContact(i)} aria-label="연락처 삭제" tabIndex={0} className="text-red-500 px-2">삭제</button>
            </div>
          ))}
          <button type="button" onClick={handleAddContact} className="mt-2 text-blue-600 font-semibold" aria-label="연락처 추가" tabIndex={0}>+ 추가</button>
        </div>
      </div>
      {/* 저장 버튼 및 알림 */}
      <div className="flex items-center gap-4 mt-6">
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 transition" disabled={loading} aria-label="저장" tabIndex={0}>저장</button>
        {success && <span className="text-green-600 font-semibold">{success}</span>}
        {error && <span className="text-red-600 font-semibold">{error}</span>}
      </div>
    </form>
  );
};

export default BoardingGuideForm; 