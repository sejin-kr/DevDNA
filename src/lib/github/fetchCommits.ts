const GITHUB_API = "https://api.github.com"
const PER_PAGE = 100
const DELAY_MS = 200
const MAX_COMMITS = 1000

export interface CommitRecord {
  sha: string
  date: string        // ISO 8601
  repoFullName: string
  message: string     // 첫 줄만
  language: string | null
}

interface GitHubSearchItem {
  sha: string
  commit: {
    author: { date: string }
    message: string
  }
  repository: { full_name: string }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getSinceDate(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 1)
  return d.toISOString().slice(0, 10)
}

export async function fetchCommits(
  username: string,
  accessToken: string
): Promise<CommitRecord[]> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github+json",
  }

  const since = getSinceDate()
  const now = new Date().toISOString().slice(0, 10)
  const query = `author:${username} author-date:${since}..${now}`

  let page = 1
  const allCommits: CommitRecord[] = []

  while (true) {
    const url = new URL(`${GITHUB_API}/search/commits`)
    url.searchParams.set("q", query)
    url.searchParams.set("sort", "author-date")
    url.searchParams.set("order", "desc")
    url.searchParams.set("per_page", String(PER_PAGE))
    url.searchParams.set("page", String(page))

    const res = await fetch(url.toString(), { headers })

    // Rate Limit 초과 시 대기
    if (res.status === 403) {
      const reset = res.headers.get("X-RateLimit-Reset")
      const waitMs = reset ? Number(reset) * 1000 - Date.now() + 1000 : 60000
      await delay(waitMs)
      continue
    }

    if (!res.ok) break

    const data = await res.json()
    const items: GitHubSearchItem[] = data.items ?? []

    for (const item of items) {
      allCommits.push({
        sha: item.sha,
        date: item.commit.author.date,
        repoFullName: item.repository.full_name,
        message: item.commit.message.split("\n")[0],
        language: null, // 언어 정보는 fetchRepoLanguages에서 추가
      })
    }

    if (items.length < PER_PAGE || allCommits.length >= MAX_COMMITS) break

    page++
    await delay(DELAY_MS)
  }

  return allCommits
}
