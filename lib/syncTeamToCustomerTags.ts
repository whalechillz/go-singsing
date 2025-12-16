/**
 * 참가자의 team_name을 customers.tags에 동기화하는 유틸리티 함수
 */

import { supabase } from "@/lib/supabaseClient";

/**
 * 참가자의 team_name을 customers.tags에 추가/업데이트
 * @param phone 고객 전화번호
 * @param teamName 팀명/모임명
 */
export const syncTeamNameToCustomerTags = async (
  phone: string,
  teamName: string | null | undefined
): Promise<void> => {
  if (!phone || !teamName || teamName.trim() === "") {
    return;
  }

  try {
    // 고객 정보 조회
    const { data: customer, error: fetchError } = await supabase
      .from("customers")
      .select("tags, phone")
      .eq("phone", phone)
      .single();

    if (fetchError) {
      // 고객이 없으면 무시 (새 고객은 나중에 생성될 수 있음)
      if (fetchError.code === "PGRST116") {
        return;
      }
      console.error("고객 조회 오류:", fetchError);
      return;
    }

    if (!customer) {
      return;
    }

    const normalizedTeamName = teamName.trim();
    const currentTags = customer.tags || [];

    // 이미 tags에 포함되어 있으면 업데이트하지 않음
    if (currentTags.includes(normalizedTeamName)) {
      return;
    }

    // tags에 team_name 추가
    const updatedTags = [...currentTags, normalizedTeamName];

    const { error: updateError } = await supabase
      .from("customers")
      .update({ tags: updatedTags })
      .eq("phone", phone);

    if (updateError) {
      console.error("고객 tags 업데이트 오류:", updateError);
    }
  } catch (error) {
    console.error("team_name 동기화 오류:", error);
  }
};

/**
 * 여러 참가자의 team_name을 일괄 동기화
 * @param participants 참가자 배열 (phone, team_name 포함)
 */
export const syncMultipleTeamNamesToCustomerTags = async (
  participants: Array<{ phone: string; team_name?: string | null }>
): Promise<void> => {
  // 전화번호와 팀명이 모두 있는 참가자만 필터링
  const validParticipants = participants.filter(
    (p) => p.phone && p.team_name && p.team_name.trim() !== ""
  );

  // 각 참가자에 대해 동기화 (병렬 처리)
  await Promise.all(
    validParticipants.map((p) =>
      syncTeamNameToCustomerTags(p.phone, p.team_name)
    )
  );
};

