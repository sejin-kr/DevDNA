import { CommitRecord } from "@/lib/github/fetchCommits"
import { WeekdayResult } from "@/types/analysis"

export function analyzeWeekday(commits: CommitRecord[]): WeekdayResult {
  const distribution = new Array(7).fill(0)

  for (const commit of commits) {
    const day = new Date(commit.date).getDay() // 0=일, 6=토
    distribution[day]++
  }

  const topDay = distribution.indexOf(Math.max(...distribution))

  const weekdayCount = distribution.slice(1, 6).reduce((a, b) => a + b, 0)
  const weekdayRatio = commits.length > 0 ? weekdayCount / commits.length : 0

  return { topDay, distribution, weekdayRatio }
}
