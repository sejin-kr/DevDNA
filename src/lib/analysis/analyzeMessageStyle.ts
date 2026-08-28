import { CommitRecord } from "@/lib/github/fetchCommits"
import { MessageStyleResult } from "@/types/analysis"

const PREFIX_PATTERN = /^(feat|fix|docs|chore|refactor|style|test|build|ci|perf)[\s(:]/i

export function analyzeMessageStyle(commits: CommitRecord[]): MessageStyleResult {
  if (commits.length === 0) {
    return { averageLength: 0, styleType: "balanced", topPrefixes: [] }
  }

  const totalLength = commits.reduce((sum, c) => sum + c.message.length, 0)
  const averageLength = Math.round(totalLength / commits.length)

  const styleType =
    averageLength <= 15 ? "concise" :
    averageLength <= 40 ? "balanced" : "verbose"

  const prefixCounts: Record<string, number> = {}
  for (const commit of commits) {
    const match = commit.message.match(PREFIX_PATTERN)
    if (match) {
      const prefix = match[1].toLowerCase()
      prefixCounts[prefix] = (prefixCounts[prefix] ?? 0) + 1
    }
  }

  const topPrefixes = Object.entries(prefixCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([prefix, count]) => ({ prefix, count }))

  return { averageLength, styleType, topPrefixes }
}
