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

    // 파일 이름에서 특수문자 제거
    const safeFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const componentPath = `components/${safeFilename}`;

    // GitHub에 파일 업로드
    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: componentPath,
      message: `Add component: ${safeFilename}`,
      content: Buffer.from(fileContent).toString("base64"),
      branch: "main",
    });

    return NextResponse.json({
      success: true,
      componentId: safeFilename,
      url: `/component/${safeFilename}`,
    });
  } catch (error) {
    console.error("GitHub 업로드 에러:", error);
    let message = "알 수 없는 오류";
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
} 