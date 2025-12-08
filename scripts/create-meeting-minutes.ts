import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createMeetingMinutes() {
  try {
    // 1. 코코넛 골프투어 업체 등록
    console.log("1. 협업 업체 등록 중...");
    const { data: partner, error: partnerError } = await supabase
      .from("partner_companies")
      .insert({
        name: "코코넛 골프투어",
        country: "베트남 하노이",
        contact_person: "양일성",
        contact_phone: "010-7515-2020",
        kakao_talk_id: "yang1912",
        facebook_url: "https://facebook.com/share/176kzmGx1C/",
        status: "active",
      })
      .select()
      .single();

    if (partnerError && !partnerError.message.includes("duplicate")) {
      throw partnerError;
    }

    let partnerId = partner?.id;
    
    // 이미 존재하는 경우 조회
    if (!partnerId) {
      const { data: existingPartner } = await supabase
        .from("partner_companies")
        .select("id")
        .eq("name", "코코넛 골프투어")
        .single();
      partnerId = existingPartner?.id;
    }

    console.log("협업 업체 ID:", partnerId);

    // 2. 회의록 1: 2025년 11월 24일 전화 통화
    console.log("\n2. 회의록 1 작성 중...");
    const meeting1 = {
      title: "싱싱골프-코코넛 골프투어 협업 회의 (전화)",
      meeting_date: "2025-11-24",
      meeting_time: "10:00",
      meeting_type: "phone",
      meeting_location: "",
      partner_company_id: partnerId,
      attendees: [
        {
          name: "나수진",
          role: "과장",
          company: "싱싱골프",
          type: "internal",
        },
        {
          name: "양일성",
          role: "대표",
          company: "코코넛 골프투어",
          type: "external",
        },
      ],
      agenda: "하노이 골프 투어 협업 관련 상담",
      discussion: `하노이 골프 (코코넛 골프투어)

양일성대표. 010-7515-2020
한국과 시차 2시간

하노이 북부골프
원래는 부킹업체였으나 형님과 여행사 차림
라오스,캄보디아 사태때문에 하노이쪽 수요가 높아짐. 치안은 문제없음

- 호텔: 무엉탄 럭셔리 호텔 박린 (5성급) 1박/1객실 당 130만동/75천원 선.

- 골프: 치린 스타CC, 옌중(엠버이힐)CC, 콘힐 등 40개 골프장 예약 가능 
        >매일 다른 골프장 부킹
        >그린피: 평일 250만동~/주말 400만동~ , 주말은 up, 요금변동 있음
        > 2인가능(2인카트) , 3인시 카트차지 발생, 주말은 2인시 조인
        >골프장 밀리고 있는 상황. 오전은 풀부킹이라 오후티만 가능할 수 있음

- 식사: 호텔조식, 중식 클럽식, 석식 불포함

- 여성분들은 보통 하노이쪽 골프장 원함. 남성분들은 북부쪽.
  한인타운쪽이 번화가. 술집이 있음.
  호텔에서 택시비 2천원이면 갈 수 있음.

- 포함: 그린피18홀(카포), 호텔, 조식, 중식

- 불포함: 항공, 석식, 캐디팁, 미팅샌딩비 

- 호텔-옌중CC 30분거리 / 보통 다른 골프장은 호텔에서 1시간 거리임`,
      decisions: "협업 가능성 검토, 추가 회의 일정 조율",
      action_items: [
        {
          task: "하노이 골프 투어 상세 정보 검토",
          assignee: "나수진",
          due_date: "2025-11-30",
          status: "completed",
        },
        {
          task: "대면 회의 일정 조율",
          assignee: "나수진",
          due_date: "2025-12-01",
          status: "completed",
        },
      ],
      details: {
        호텔: {
          name: "무엉탄 럭셔리 호텔 박린",
          rating: "5성급",
          price_per_night: "130만동/75천원",
          location: "하노이",
        },
        골프장: {
          available_courses: ["치린 스타CC", "옌중(엠버이힐)CC", "콘힐"],
          total_courses: 40,
          green_fee_weekday: "250만동~",
          green_fee_weekend: "400만동~",
          notes: "주말은 up, 요금변동 있음",
        },
        특이사항: [
          "베트남 한인골프대회(1회) 대회 검증 필요",
          "에이스골프(스크린사장),콩골프,토탈골프(회원권사이트)",
          "마쓰구 드라이버 베트남사이트, 중국사이트 만들어서 홍보",
        ],
      },
      tags: ["하노이", "코코넛", "협업", "골프투어"],
      status: "published",
    };

    const { data: meeting1Data, error: meeting1Error } = await supabase
      .from("meeting_minutes")
      .insert(meeting1)
      .select()
      .single();

    if (meeting1Error) throw meeting1Error;
    console.log("회의록 1 생성 완료:", meeting1Data.id);

    // 3. 회의록 2: 2025년 12월 1일 대면 회의
    console.log("\n3. 회의록 2 작성 중...");
    const meeting2 = {
      title: "싱싱골프-코코넛 골프투어 협업 회의 (대면)",
      meeting_date: "2025-12-01",
      meeting_time: "14:00",
      meeting_type: "in_person",
      meeting_location: "마스골프 오피스",
      partner_company_id: partnerId,
      attendees: [
        {
          name: "나수진",
          role: "과장",
          company: "싱싱골프",
          type: "internal",
        },
        {
          name: "양일성",
          role: "대표",
          company: "코코넛 골프투어",
          type: "external",
        },
        {
          name: "신희갑",
          role: "프로",
          company: "",
          type: "external",
        },
        {
          name: "김탁수",
          role: "",
          company: "마스골프",
          type: "external",
        },
        {
          name: "이은정",
          role: "",
          company: "마스골프",
          type: "external",
        },
        {
          name: "최형호",
          role: "",
          company: "마스골프",
          type: "external",
        },
      ],
      agenda: "콩골프와 코코넛투어 비교 및 협업 방안 논의",
      discussion: `콩골프//코코넛투어 비교표

1. 플랫폼: 카카오 단톡방 200명/일 모객수준 http://pf.kakao.com/_xfNxbZj // 페이스북, 대구,부산 밴드키페 facebook.com/share/176kzmGx1C/

2. 대행수수료: 200만동 // 205만동 

3. 기사: 샌딩 50불/인(맥스 500불 받음) // 좌동

4. 가이드: X // 가이드 있음(중국직원)

5. 호텔: 한정적 // 좌동

*특이사항

-베트남 한인골프대회(1회) 대회 검증 필요
-에이스골프(스크린사장),콩골프,토탈골프(회원권사이트),
-마쓰구 드라이버 베트남사이트, 중국사이트 만들어서 홍보`,
      decisions: "코코넛 골프투어와 협업 진행 결정, 상세 조건 협의 필요",
      action_items: [
        {
          task: "베트남 한인골프대회 검증",
          assignee: "양일성",
          due_date: "2025-12-20",
          status: "pending",
        },
        {
          task: "협업 계약서 초안 작성",
          assignee: "나수진",
          due_date: "2025-12-15",
          status: "pending",
        },
        {
          task: "대행수수료 최종 협의",
          assignee: "나수진",
          due_date: "2025-12-10",
          status: "in_progress",
        },
      ],
      comparison_data: {
        콩골프: {
          플랫폼: "카카오 단톡방 200명/일",
          대행수수료: "200만동",
          기사: "샌딩 50불/인(맥스 500불)",
          가이드: "X",
          호텔: "한정적",
        },
        코코넛투어: {
          플랫폼: "카카오 단톡방 200명/일, 페이스북, 대구/부산 밴드",
          대행수수료: "205만동",
          기사: "샌딩 50불/인(맥스 500불)",
          가이드: "가이드 있음(중국직원)",
          호텔: "한정적",
        },
      },
      details: {
        특이사항: [
          "베트남 한인골프대회(1회) 대회 검증 필요",
          "에이스골프(스크린사장),콩골프,토탈골프(회원권사이트)",
          "마쓰구 드라이버 베트남사이트, 중국사이트 만들어서 홍보",
        ],
      },
      tags: ["하노이", "코코넛", "협업", "골프투어", "마스골프"],
      status: "published",
    };

    const { data: meeting2Data, error: meeting2Error } = await supabase
      .from("meeting_minutes")
      .insert(meeting2)
      .select()
      .single();

    if (meeting2Error) throw meeting2Error;
    console.log("회의록 2 생성 완료:", meeting2Data.id);

    console.log("\n✅ 모든 회의록이 성공적으로 생성되었습니다!");
    console.log("\n생성된 회의록:");
    console.log(`- 회의록 1 (전화): ${meeting1Data.id}`);
    console.log(`- 회의록 2 (대면): ${meeting2Data.id}`);
  } catch (error: any) {
    console.error("오류 발생:", error);
    process.exit(1);
  }
}

createMeetingMinutes();

