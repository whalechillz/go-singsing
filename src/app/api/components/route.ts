import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const REPO_OWNER = process.env.REPO_OWNER!;
const REPO_NAME = process.env.REPO_NAME!;

export async function GET() {
  try {
    // GitHub에서 components 디렉토리 내용 가져오기
    const response = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: "components",
    });

    // 디렉토리가 아직 없는 경우 빈 배열 반환
    if (!Array.isArray(response.data)) {
      return NextResponse.json({ success: true, components: [] });
    }

    // 각 파일의 기본 정보 추출
    const components = (response.data as Record<string, unknown>[])
      .filter((item) => (item as any).type === "file" && (item as any).name !== ".gitkeep")
      .map((item) => ({
        name: (item as any).name,
        path: (item as any).path,
        url: `/components/${(item as any).name}`,
        downloadUrl: (item as any).download_url,
      }));

    return NextResponse.json({ success: true, components });
  } catch (error) {
    // components 디렉토리가 없는 경우
    if (typeof error === "object" && error && "status" in error && (error as { status?: number }).status === 404) {
      return NextResponse.json({ success: true, components: [] });
    }
    console.error("GitHub API 에러:", error);
    return NextResponse.json({
      success: false,
      error: "컴포넌트 목록을 가져오는 중 오류가 발생했습니다",
    }, { status: 500 });
  }
} 