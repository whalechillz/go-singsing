ㄴimport React, { useState, useEffect } from "react";

type Tour = { id: string; title: string };
type BoardingPlace = { id: string; name: string };

type UserFormProps = {
  mode: "all" | "tour";
  tourId?: string;
  tours: Tour[];
  boardingPlaces: BoardingPlace[];
  defaultValues?: any;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
};

const roleOptions = ["총무", "회장", "회원", "부회장", "서기", "기타"];

const UserForm: React.FC<UserFormProps> = ({ mode, tourId, tours, boardingPlaces, defaultValues, onSubmit, onCancel }) => {
  const [form, setForm] = useState<any>(defaultValues || {
    name: "",
    phone: "",
    team_name: "",
    note: "",
    status: "확정",
    role: "",
    tour_id: tourId || "",
    boarding_place_id: ""
  });
  const [customRole, setCustomRole] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (defaultValues) setForm(defaultValues);
  }, [defaultValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;
    if (name === "role" && value === "기타") setCustomRole("");
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.phone || !form.tour_id || !form.boarding_place_id) {
      setError("이름, 연락처, 투어, 탑승지는 필수입니다.");
      return;
    }
    const payload = { ...form, role: form.role === "기타" ? customRole : form.role };
    onSubmit(payload);
    setForm(defaultValues || { name: "", phone: "", team_name: "", note: "", status: "확정", role: "", tour_id: tourId || "", boarding_place_id: "" });
    setCustomRole("");
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <input name="name" value={form.name} onChange={handleChange} placeholder="이름" className="border rounded px-2 py-1 flex-1" required />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="연락처(숫자만)" className="border rounded px-2 py-1 flex-1" required maxLength={11} />
      </div>
      <div className="flex gap-2">
        <input name="team_name" value={form.team_name} onChange={handleChange} placeholder="팀/동호회" className="border rounded px-2 py-1 flex-1" />
        <select name="status" value={form.status} onChange={handleChange} className="border rounded px-2 py-1 flex-1">
          <option value="확정">확정</option>
          <option value="대기">대기</option>
          <option value="취소">취소</option>
        </select>
      </div>
      <div className="flex gap-2">
        <select name="role" value={form.role} onChange={handleChange} className="border rounded px-2 py-1 flex-1">
          <option value="">직책 선택</option>
          {roleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        {form.role === "기타" && (
          <input name="customRole" value={customRole} onChange={e => setCustomRole(e.target.value)} placeholder="직접입력" className="border rounded px-2 py-1 flex-1" />
        )}
      </div>
      <textarea name="note" value={form.note} onChange={handleChange} placeholder="메모" className="border rounded px-2 py-1" rows={2} />
      {mode === "all" && (
        <select name="tour_id" value={form.tour_id} onChange={handleChange} className="border rounded px-2 py-1" required>
          <option value="">투어 선택</option>
          {tours.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
      )}
      <select name="boarding_place_id" value={form.boarding_place_id} onChange={handleChange} className="border rounded px-2 py-1" required>
        <option value="">탑승지 선택</option>
        {boardingPlaces.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex gap-2 mt-2">
        <button type="submit" className="bg-blue-800 text-white px-4 py-1 rounded font-semibold hover:bg-blue-900 transition-colors">저장</button>
        {onCancel && <button type="button" className="bg-gray-300 text-gray-800 px-4 py-1 rounded font-semibold hover:bg-gray-400 transition-colors" onClick={onCancel}>취소</button>}
      </div>
    </form>
  );
};

export default UserForm; 