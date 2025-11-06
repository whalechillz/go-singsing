# Solapi 통합 가이드 (Next.js 14 + TypeScript)

본 문서는 본 프로젝트에서 검증된 솔라피(Solapi) 연동 방식을 재사용할 수 있도록 환경 변수, 보안 서명(HMAC), 서버 엔드포인트, 샘플 코드, 테스트/트러블슈팅 절차를 정리합니다.

## 1) 사전 준비
- **솔라피 계정** 및 최소 테스트 금액 충전
- **발신번호 등록/인증** (서류 또는 ARS)
- **API Key/Secret 발급** (콘솔의 API Key 관리)
- 카카오 알림톡 사용 시 **PFID** 준비

## 2) 환경 변수 설정
아래 값을 배포 환경(Vercel 등)과 개발 환경(.env.local)에 동일하게 설정합니다.

```env
SOLAPI_API_KEY=your_api_key
SOLAPI_API_SECRET=your_api_secret
SOLAPI_SENDER=0312153990
SOLAPI_PFID=your_kakao_pfid   # (선택, 알림톡 사용시)
```

주의사항
- 값에 따옴표를 넣지 않습니다. 예) ❌ "0312153990" → ✅ 0312153990
- 발신번호는 하이픈 없이 저장: 031-215-3990 → 0312153990

## 3) 공통 HMAC 서명 유틸
솔라피는 HMAC-SHA256 기반 서명을 사용합니다. 서버 라우트에서 아래 유틸을 공통으로 사용하세요.

```ts
// utils/solapiSignature.ts
import crypto from "crypto";

export const createSolapiSignature = (apiKey: string, apiSecret: string) => {
  const date = new Date().toISOString();
  const salt = Math.random().toString(36).substring(2, 15);
  const data = date + salt;
  const signature = crypto.createHmac("sha256", apiSecret).update(data).digest("hex");
  return {
    Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`,
  } as const;
};
```

## 4) 서버 엔드포인트 (SMS/LMS/MMS/알림톡)
Next.js Route Handler 예시입니다. 요구에 맞게 축소/확장하여 사용하세요.

```ts
// app/api/solapi/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSolapiSignature } from "@/utils/solapiSignature";

const SOLAPI_API_KEY = process.env.SOLAPI_API_KEY || "";
const SOLAPI_API_SECRET = process.env.SOLAPI_API_SECRET || "";
const SOLAPI_PFID = process.env.SOLAPI_PFID || ""; // optional
const SOLAPI_SENDER = process.env.SOLAPI_SENDER || "";

export async function POST(request: NextRequest) {
  try {
    if (!SOLAPI_API_KEY || !SOLAPI_API_SECRET || !SOLAPI_SENDER) {
      return NextResponse.json({ success: false, message: "환경변수 누락" }, { status: 500 });
    }

    const { type, recipients, title, content, template_id, image_url } = await request.json();

    // 1) 그룹 생성
    const groupRes = await fetch("https://api.solapi.com/messages/v4/groups", {
      method: "POST",
      headers: createSolapiSignature(SOLAPI_API_KEY, SOLAPI_API_SECRET),
    });
    if (!groupRes.ok) {
      const text = await groupRes.text();
      throw new Error(`그룹 생성 실패: ${text}`);
    }
    const { groupId } = await groupRes.json();

    // 2) 메시지 배열 구성
    const messages = (recipients as Array<{ phone: string }>).map((r) => {
      const to = r.phone.replace(/[\-\s]/g, "");
      const from = SOLAPI_SENDER.replace(/[\-\s]/g, "");
      const message: any = { to, from, text: content };

      if (type === "kakao_alimtalk") {
        message.type = "ATA";
        message.kakaoOptions = { pfId: SOLAPI_PFID, templateId: template_id };
      } else if (type === "mms") {
        message.type = "MMS";
        if (title) message.subject = title;
        if (image_url) message.imageId = undefined; // 사전 업로드 후 imageId로 교체 필요
      } else if (type === "lms") {
        message.type = "LMS";
        if (title) message.subject = title;
      } else {
        message.type = "SMS";
      }
      return message;
    });

    // 3) 메시지 추가
    const addRes = await fetch(`https://api.solapi.com/messages/v4/groups/${groupId}/messages`, {
      method: "PUT",
      headers: { ...createSolapiSignature(SOLAPI_API_KEY, SOLAPI_API_SECRET), "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    if (!addRes.ok) {
      const text = await addRes.text();
      throw new Error(`메시지 추가 실패: ${text}`);
    }

    // 4) 그룹 발송
    const sendRes = await fetch(`https://api.solapi.com/messages/v4/groups/${groupId}/send`, {
      method: "POST",
      headers: createSolapiSignature(SOLAPI_API_KEY, SOLAPI_API_SECRET),
    });
    if (!sendRes.ok) {
      const text = await sendRes.text();
      throw new Error(`그룹 발송 실패: ${text}`);
    }

    const result = await sendRes.json();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
```

### 이미지(MMS) 업로드 보조 엔드포인트
MMS 사용 시 이미지를 먼저 업로드하여 `imageId`를 받아야 합니다.

```ts
// app/api/solapi/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSolapiSignature } from "@/utils/solapiSignature";

const SOLAPI_API_KEY = process.env.SOLAPI_API_KEY || "";
const SOLAPI_API_SECRET = process.env.SOLAPI_API_SECRET || "";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ success: false, message: "file 필요" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadForm = new FormData();
  uploadForm.append("file", new Blob([buffer]), file.name);

  const res = await fetch("https://api.solapi.com/storage/v1/files", {
    method: "POST",
    headers: createSolapiSignature(SOLAPI_API_KEY, SOLAPI_API_SECRET),
    body: uploadForm,
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json({ success: false, message: data?.message || "업로드 실패" }, { status: 500 });
  return NextResponse.json({ success: true, imageId: data.fileId });
}
```

## 5) 클라이언트 사용 예시

```ts
// 예: 관리자 UI에서 발송
await fetch("/api/solapi/send", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "lms", // sms | lms | mms | kakao_alimtalk
    recipients: [{ phone: "010-1234-5678" }],
    title: "제목(옵션)",
    content: "본문 내용",
    template_id: null,
  }),
});
```

## 6) 테스트 체크리스트
- 환경 변수 4종 모두 존재 여부 확인
- 발신번호가 인증 완료 상태인지 확인
- 수신번호(테스트 번호)로 단건 SMS 발송 → 성공 여부 확인
- 실패 시: Vercel Logs 및 솔라피 대시보드 발송 내역/사유 확인

## 7) 트러블슈팅
- 401 Unauthorized: API Key/Secret, 서명 로직, 서버 시간(UTC) 확인
- 400 잘못된 파라미터: 메시지 타입/필드 누락, 전화번호 포맷 확인
- 413 Payload Too Large: 대량 발송 시 group → add → send 흐름으로 분할 처리
- MMS 이미지 실패: 업로드 엔드포인트 통해 `imageId` 선 발급 필요

## 8) 보안/운영 유의사항
- API 키는 서버 전용 라우트에서만 사용 (클라이언트 노출 금지)
- 로그에 전체 본문/전화번호 과다 출력 금지
- 재시도 정책 및 발송 이력 저장(성공/실패) 권장

---
참고: 본 레포지토리 구현 예시
- 서버 라우트: `app/api/solapi/send/route.ts`, `app/api/solapi/upload-image/route.ts`
- 서비스 계층: `lib/services/smsService.ts` (send-many/detail 방식)
- 관리 UI 예시: `app/admin/messages/page.tsx`
