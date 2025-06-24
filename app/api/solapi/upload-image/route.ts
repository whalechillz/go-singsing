import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// 솔라피 API 설정
const SOLAPI_API_KEY = process.env.SOLAPI_API_KEY || "";
const SOLAPI_API_SECRET = process.env.SOLAPI_API_SECRET || "";

// HMAC 서명 생성
function getSignature() {
  const date = new Date().toISOString();
  const salt = Math.random().toString(36).substring(2, 15);
  const data = date + salt;
  const signature = crypto
    .createHmac("sha256", SOLAPI_API_SECRET)
    .update(data)
    .digest("hex");
  
  return {
    Authorization: `HMAC-SHA256 apiKey=${SOLAPI_API_KEY}, date=${date}, salt=${salt}, signature=${signature}`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: "파일이 없습니다." },
        { status: 400 }
      );
    }

    // 파일을 버퍼로 변환
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 솔라피 이미지 업로드 API 호출
    const uploadFormData = new FormData();
    uploadFormData.append('file', new Blob([buffer]), file.name);
    
    const response = await fetch("https://api.solapi.com/storage/v1/files", {
      method: "POST",
      headers: {
        ...getSignature(),
      },
      body: uploadFormData,
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || "이미지 업로드 실패");
    }

    return NextResponse.json({
      success: true,
      fileId: result.fileId,
      url: result.url
    });
    
  } catch (error: any) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "이미지 업로드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
