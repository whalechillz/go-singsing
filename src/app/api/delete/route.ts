import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const REPO_OWNER = process.env.REPO_OWNER!;
const REPO_NAME = process.env.REPO_NAME!;

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ success: false, error: "파일명이 필요합니다." }, { status: 400 });
    }
    // sha 조회
    const res = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `components/${decodeURIComponent(name)}`,
    });
    if (!('sha' in res.data)) {
      return NextResponse.json({ success: false, error: "sha를 찾을 수 없습니다." }, { status: 400 });
    }
    const sha = res.data.sha;
    // 파일 삭제
    await octokit.repos.deleteFile({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `components/${decodeURIComponent(name)}`,
      message: `Delete component: ${name}`,
      sha,
      branch: "main",
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("GitHub 삭제 에러:", error);
    let message = "알 수 없는 오류";
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
} 