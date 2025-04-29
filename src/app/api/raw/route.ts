import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const REPO_OWNER = process.env.REPO_OWNER!;
const REPO_NAME = process.env.REPO_NAME!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  if (!name) {
    return NextResponse.json({ error: "파일명이 필요합니다." }, { status: 400 });
  }
  try {
    const response = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `components/${name}`,
    });
    if (!("content" in response.data)) {
      return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
    }
    const content = Buffer.from(response.data.content, "base64").toString("utf8");
    return new NextResponse(content, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
  }
} 