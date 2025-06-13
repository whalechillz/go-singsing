import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "파일이 없습니다." },
        { status: 400 }
      );
    }

    // 파일을 버퍼로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 엑셀 파일 읽기
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // 데이터 검증 및 정리
    const customers = data.map((row: any) => {
      // 전화번호 정규화
      const phone = row["전화번호"] || row["phone"] || row["연락처"] || "";
      const normalizedPhone = phone.toString().replace(/[^0-9]/g, "").replace(/^(010|011|016|017|018|019)(\d{3,4})(\d{4})$/, "$1-$2-$3");

      return {
        name: row["이름"] || row["name"] || "",
        phone: normalizedPhone,
        email: row["이메일"] || row["email"] || null,
        birth_date: row["생년월일"] || row["birth_date"] || null,
        gender: row["성별"] || row["gender"] || null,
        address: row["주소"] || row["address"] || null,
        memo: row["메모"] || row["memo"] || null,
        tags: row["태그"] || row["tags"] ? (row["태그"] || row["tags"]).split(",").map((t: string) => t.trim()) : [],
        marketing_agreed: row["마케팅동의"] === "Y" || row["marketing_agreed"] === true,
        kakao_friend: row["카카오친구"] === "Y" || row["kakao_friend"] === true,
        status: "active"
      };
    }).filter((customer: any) => customer.name && customer.phone); // 이름과 전화번호가 있는 데이터만

    // 중복 체크
    const existingPhones = await supabase
      .from("customers")
      .select("phone")
      .in("phone", customers.map(c => c.phone));

    const existingPhoneSet = new Set(existingPhones.data?.map(c => c.phone) || []);
    const newCustomers = customers.filter(c => !existingPhoneSet.has(c.phone));
    const duplicateCount = customers.length - newCustomers.length;

    // 새 고객 추가
    if (newCustomers.length > 0) {
      const { error } = await supabase
        .from("customers")
        .insert(newCustomers);

      if (error) {
        console.error("고객 추가 오류:", error);
        return NextResponse.json(
          { error: "고객 추가 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      total: customers.length,
      added: newCustomers.length,
      duplicates: duplicateCount,
      message: `총 ${customers.length}명 중 ${newCustomers.length}명 추가, ${duplicateCount}명 중복`
    });
  } catch (error) {
    console.error("엑셀 업로드 오류:", error);
    return NextResponse.json(
      { error: "파일 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
