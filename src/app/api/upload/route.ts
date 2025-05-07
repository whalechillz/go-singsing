import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const REPO_OWNER = process.env.REPO_OWNER!;
const REPO_NAME = process.env.REPO_NAME!;

export async function POST(req: NextRequest) {
  try {
    // form-data 파싱
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const filename = formData.get("filename") as string | null;
    if (!file || !filename) {
      return NextResponse.json({ success: false, error: "파일이 없습니다." }, { status: 400 });
    }

    // 파일 내용 읽기
    const arrayBuffer = await file.arrayBuffer();
    const fileContent = Buffer.from(arrayBuffer).toString("utf8");

    // 파일 이름 인코딩 없이 그대로 사용
    const dotIdx = filename.lastIndexOf(".");
    const namePart = dotIdx !== -1 ? filename.slice(0, dotIdx) : filename;
    const extPart = dotIdx !== -1 ? filename.slice(dotIdx) : "";
    let componentPath = `components/${filename}`;
    let uniqueIndex = 1;
    // 파일명 중복 시 (1), (2) 등 suffix 추가 (그대로 사용)
    while (true) {
      try {
        await octokit.repos.getContent({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path: componentPath,
        });
        // 이미 존재하면 suffix 추가
        componentPath = `components/${namePart}(${uniqueIndex})${extPart}`;
        uniqueIndex++;
      } catch {
        // 존재하지 않으면 break
        break;
      }
    }
    // 허용 확장자 검사
    const allowedExtensions = [".tsx", ".ts", ".html", ".md"];
    const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json({ success: false, error: `허용되지 않는 파일 형식입니다. (${allowedExtensions.join(", ")})` }, { status: 400 });
    }
    // GitHub에 파일 업로드 (항상 새 파일, 파일명 그대로)
    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: componentPath,
      message: `Add component: ${filename}`,
      content: Buffer.from(fileContent).toString("base64"),
      branch: "main",
    });
    return NextResponse.json({
      success: true,
      componentId: filename,
      url: `/component/${filename}`,
    });
  } catch (error) {
    console.error("GitHub 업로드 에러:", error);
    let message = "알 수 없는 오류";
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
} 