import ParticipantsManager from "@/components/ParticipantsManager";

export default function AdminParticipantsPage() {
  return <ParticipantsManager showColumns={["이름", "연락처", "팀", "투어", "객실", "상태", "관리"]} />;
} 