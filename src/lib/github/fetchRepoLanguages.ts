const GITHUB_API = "https://api.github.com"
const CHUNK_SIZE = 5

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

export async function fetchRepoLanguages(
  repoFullNames: string[],
  accessToken: string
): Promise<Record<string, string | null>> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github+json",
  }

  const uniqueRepos = [...new Set(repoFullNames)]
  const langMap: Record<string, string | null> = {}
  const chunks = chunk(uniqueRepos, CHUNK_SIZE)

  for (const group of chunks) {
    await Promise.all(
      group.map(async (repoFullName) => {
        try {
          const res = await fetch(`${GITHUB_API}/repos/${repoFullName}`, { headers })
          const data = await res.json()
          langMap[repoFullName] = res.ok ? (data.language ?? null) : null
        } catch {
          langMap[repoFullName] = null
        }
      })
    )
  }

  return langMap
}
