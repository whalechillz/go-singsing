"use client";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import * as XLSX from "xlsx";

type Participant = {
  id: string;
  name: string;
  phone: string;
  team_name: string;
  note: string;
  status: string;
  tour_id: string;
  role?: string;
  room_name?: string;
  created_at?: string;
  singsing_rooms?: {
    room_type?: string;
    capacity?: number;
    quantity?: number;
  };
};

type ParticipantForm = {
  name: string;
  phone: string;
  team_name: string;
  note: string;
  status: string;
  role: string;
};

type Props = { tourId: string };

const ParticipantsManager: React.FC<Props> = ({ tourId }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [form, setForm] = useState<ParticipantForm>({ name: "", phone: "", team_name: "", note: "", status: "확정", role: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortKey, setSortKey] = useState<keyof Participant | "">("created_at");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const roleOptions = ["총무", "회장", "회원", "부회장", "서기", "기타"];
  const [customRole, setCustomRole] = useState("");
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  const fetchParticipants = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("singsing_participants").select("*").eq("tour_id", tourId).order("created_at", { ascending: true });
    if (error) setError(error.message);
    else setParticipants((data || []) as Participant[]);
    setLoading(false);
  };

  useEffect(() => {
    if (tourId) fetchParticipants();
  }, [tourId]);

  const normalizePhone = (input: string) => {
    let phone = input.replace(/[^0-9]/g, "");
    if (phone.length === 10 && !phone.startsWith("0")) phone = "0" + phone;
    if (phone.length > 11) phone = phone.slice(0, 11);
    return phone;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    if (name === "phone") value = normalizePhone(value);
    if (name === "role" && value === "기타") setCustomRole("");
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!form.name) {
      setError("이름은 필수입니다.");
      return;
    }
    const phone = form.phone ? normalizePhone(form.phone) : "";
    const role = form.role === "기타" ? customRole : form.role;
    const isDuplicate = participants.some(
      (p) => p.name === form.name && p.phone === phone
    );
    if (!editingId && isDuplicate) {
      setError("이미 등록된 참가자입니다.");
      return;
    }
    const payload = { ...form, phone, role, tour_id: tourId };
    if (editingId) {
      const { error } = await supabase.from("singsing_participants").update(payload).eq("id", editingId);
      if (error) setError(error.message);
      else {
        setEditingId(null);
        setForm({ name: "", phone: "", team_name: "", note: "", status: "확정", role: "" });
        setCustomRole("");
        fetchParticipants();
      }
    } else {
      const { error } = await supabase.from("singsing_participants").insert([payload]);
      if (error) setError(error.message);
      else {
        setForm({ name: "", phone: "", team_name: "", note: "", status: "확정", role: "" });
        setCustomRole("");
        fetchParticipants();
      }
    }
  };

  const handleEdit = (p: Participant) => {
    setEditingId(p.id);
    setForm({ name: p.name, phone: p.phone, team_name: p.team_name || "", note: p.note || "", status: p.status || "확정", role: p.role || "" });
    if (p.role && !roleOptions.includes(p.role)) setCustomRole(p.role);
    else setCustomRole("");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("singsing_participants").delete().eq("id", id);
    if (error) setError(error.message);
    else fetchParticipants();
  };

  const filtered = participants
    .filter(p =>
      (!search ||
        p.name.includes(search) ||
        p.phone.includes(search) ||
        (p.team_name || "").includes(search)) &&
      (!statusFilter || p.status === statusFilter)
    )
    .sort((a, b) => {
      if (!sortKey) return 0;
      const aValue = a[sortKey] ?? "";
      const bValue = b[sortKey] ?? "";
      if (aValue === bValue) return 0;
      if (sortAsc) return aValue > bValue ? 1 : -1;
      return aValue < bValue ? 1 : -1;
    });

  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(participants.map((p, idx) => ({
      순번: idx + 1,
      이름: p.name,
      연락처: p.phone,
      팀명: p.team_name,
      메모: p.note,
      상태: p.status,
      직책: p.role || ""
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "참가자목록");
    XLSX.writeFile(wb, "참가자목록.xlsx");
  };

  const handleUploadExcel = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFileName(file ? file.name : "");
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);
      let added = 0, skipped = 0;
      for (const row of rows as any[]) {
        const name = row["이름"]?.toString().trim();
        const phone = row["연락처"] ? normalizePhone(row["연락처"].toString()) : "";
        const role = row["직책"]?.toString().trim() || "";
        if (!name) { skipped++; continue; }
        if (participants.some(p => p.name === name && p.phone === phone)) { skipped++; continue; }
        const { error } = await supabase.from("singsing_participants").insert([
          {
            name,
            phone,
            team_name: row["팀명"] || "",
            note: row["메모"] || "",
            status: row["상태"] || "확정",
            role,
            tour_id: tourId
          }
        ]);
        if (!error) added++;
        else skipped++;
      }
      fetchParticipants();
      alert(`업로드 완료: ${added}명 추가, ${skipped}명 건너뜀`);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div>
      {/* 상단 고정 엑셀 업로드/다운로드/파일 안내 블럭 */}
      <div className="w-full flex flex-col md:flex-row gap-2 items-center justify-center bg-white border-b py-3 sticky top-0 z-50">
        <button type="button" onClick={handleDownloadExcel} className="bg-green-700 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-green-400 w-full md:w-auto">엑셀 다운로드</button>
        <label className="relative bg-blue-700 text-white px-3 py-1 rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400">
          엑셀 업로드
          <input type="file" accept=".xlsx,.xls" onChange={handleUploadExcel} className="hidden" aria-label="엑셀 업로드" />
        </label>
        <div className="text-xs text-black font-bold bg-white border px-3 py-1 rounded min-w-[120px] text-center" aria-live="polite" style={{ opacity: 1, zIndex: 1000 }}>
          {selectedFileName || "선택된 파일 없음"}
        </div>
      </div>
      {/* 1. 검색/필터 블럭 */}
      <div className="flex flex-col md:flex-row gap-2 mb-2 items-center mt-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="이름, 전화번호, 팀명 검색"
          className="border rounded px-2 py-1 flex-1"
          aria-label="검색"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border rounded px-2 py-1 flex-none"
          aria-label="상태 필터"
        >
          <option value="">전체 상태</option>
          <option value="확정">확정</option>
          <option value="대기">대기</option>
          <option value="취소">취소</option>
        </select>
      </div>
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      {loading ? (
        <div className="text-center py-4 text-gray-500">불러오는 중...</div>
      ) : (
        <div className="mb-2 text-right text-gray-700 font-semibold">총 {filtered.length}명</div>
      )}
      {loading ? (
        <div className="text-center py-4 text-gray-500">불러오는 중...</div>
      ) : (
        <table className="w-full bg-white dark:bg-gray-900 rounded shadow text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              <th className="py-2 px-2">순번</th>
              <th className="py-2 px-2 text-left cursor-pointer" onClick={() => { setSortKey("name"); setSortAsc(sortKey === "name" ? !sortAsc : true); }}>이름</th>
              <th className="py-2 px-2 text-left cursor-pointer" onClick={() => { setSortKey("phone"); setSortAsc(sortKey === "phone" ? !sortAsc : true); }}>연락처</th>
              <th className="py-2 px-2 text-left cursor-pointer" onClick={() => { setSortKey("team_name"); setSortAsc(sortKey === "team_name" ? !sortAsc : true); }}>팀명</th>
              <th className="py-2 px-2 text-left">직책</th>
              <th className="py-2 px-2 text-left">메모</th>
              <th className="py-2 px-2 text-left cursor-pointer" onClick={() => { setSortKey("status"); setSortAsc(sortKey === "status" ? !sortAsc : true); }}>상태</th>
              <th className="py-2 px-2">관리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, idx) => (
              <tr key={p.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="py-1 px-2 text-center">{idx + 1}</td>
                <td className="py-1 px-2">{p.name}</td>
                <td className="py-1 px-2">{p.phone ? p.phone.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3') : ""}</td>
                <td className="py-1 px-2">{p.team_name}</td>
                <td className="py-1 px-2">{p.role || "-"}</td>
                <td className="py-1 px-2">{p.note}</td>
                <td className="py-1 px-2">
                  <span className={
                    p.status === "확정"
                      ? "bg-green-100 text-green-800 px-2 py-1 rounded"
                      : p.status === "대기"
                      ? "bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
                      : "bg-gray-200 text-gray-700 px-2 py-1 rounded"
                  }>
                    {p.status || "확정"}
                  </span>
                </td>
                <td className="py-1 px-2 flex gap-1">
                  <button className="text-blue-700 underline" onClick={() => handleEdit(p)}>수정</button>
                  <button className="text-red-600 underline" onClick={() => handleDelete(p.id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ParticipantsManager; 