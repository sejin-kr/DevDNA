import { CommitRecord } from "@/lib/github/fetchCommits"
import { LanguageResult } from "@/types/analysis"

export function analyzeLanguage(commits: CommitRecord[]): LanguageResult {
  const counts: Record<string, number> = {}

  for (const commit of commits) {
    const lang = commit.language ?? "Unknown"
    counts[lang] = (counts[lang] ?? 0) + 1
  }

  const unknownCount = counts["Unknown"] ?? 0
  delete counts["Unknown"]

  // 알려진 언어만 정렬
  const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a)
  const knownTotal = sorted.reduce((sum, [, c]) => sum + c, 0)
  const total = commits.length

  const top5 = sorted.slice(0, 5)
  const othersCount = sorted.slice(5).reduce((sum, [, c]) => sum + c, 0)

  const distribution = [
    ...top5.map(([lang, count]) => ({
      lang,
      count,
      percentage: total > 0 ? Math.round(count / total * 100) : 0,
      knownPercentage: knownTotal > 0 ? Math.round(count / knownTotal * 100) : 0,
    })),
    ...(othersCount > 0
      ? [{
          lang: "기타",
          count: othersCount,
          percentage: Math.round(othersCount / total * 100),
          knownPercentage: Math.round(othersCount / knownTotal * 100),
        }]
      : []),
    ...(unknownCount > 0
      ? [{
          lang: "Unknown",
          count: unknownCount,
          percentage: Math.round(unknownCount / total * 100),
          knownPercentage: 0,
        }]
      : []),
  ]

  return {
    topLanguage: top5[0]?.[0] ?? "Unknown",
    distribution,
  }
}
