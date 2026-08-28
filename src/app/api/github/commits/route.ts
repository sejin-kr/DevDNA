import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { fetchCommits } from "@/lib/github/fetchCommits"
import { fetchRepoLanguages } from "@/lib/github/fetchRepoLanguages"
import { MOCK_COMMITS } from "@/lib/github/mockCommits"
import { analyze } from "@/lib/analysis/analyze"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken || !session?.login) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const useMock = req.nextUrl.searchParams.get("mock") === "true"

  try {
    let commits

    if (useMock) {
      commits = MOCK_COMMITS
    } else {
      const raw = await fetchCommits(session.login, session.accessToken)
      const repoNames = raw.map((c) => c.repoFullName)
      const langMap = await fetchRepoLanguages(repoNames, session.accessToken)
      commits = raw.map((c) => ({ ...c, language: langMap[c.repoFullName] ?? null }))
    }

    const result = analyze(commits)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to fetch commits" }, { status: 500 })
  }
}
