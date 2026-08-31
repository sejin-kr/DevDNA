import { getToken } from "next-auth/jwt"
import { fetchCommits } from "@/lib/github/fetchCommits"
import { fetchRepoLanguages } from "@/lib/github/fetchRepoLanguages"
import { MOCK_COMMITS } from "@/lib/github/mockCommits"
import { analyze } from "@/lib/analysis/analyze"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const token = await getToken({ req })

  if (!token?.accessToken || !token?.login) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const useMock = req.nextUrl.searchParams.get("mock") === "true"

  try {
    let commits

    if (useMock) {
      commits = MOCK_COMMITS
    } else {
      const raw = await fetchCommits(token.login as string, token.accessToken as string)
      const repoNames = raw.map((c) => c.repoFullName)
      const langMap = await fetchRepoLanguages(repoNames, token.accessToken as string)
      commits = raw.map((c) => ({ ...c, language: langMap[c.repoFullName] ?? null }))
    }

    const result = analyze(commits)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to fetch commits" }, { status: 500 })
  }
}
