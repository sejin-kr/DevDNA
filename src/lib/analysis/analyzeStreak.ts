import { CommitRecord } from "@/lib/github/fetchCommits"
import { StreakResult } from "@/types/analysis"

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function dayDiff(a: string, b: string): number {
  return (new Date(b).getTime() - new Date(a).getTime()) / 86400000
}

export function analyzeStreak(commits: CommitRecord[]): StreakResult {
  const dates = [...new Set(commits.map(c => c.date.slice(0, 10)))].sort()
  const activeDays = dates.length

  if (dates.length === 0) {
    return { maxStreak: 0, maxStart: "", maxEnd: "", ongoingStreak: 0, activeDays: 0 }
  }

  let maxStreak = 1
  let current = 1
  let maxStart = dates[0]
  let maxEnd = dates[0]
  let tempStart = dates[0]

  for (let i = 1; i < dates.length; i++) {
    if (dayDiff(dates[i - 1], dates[i]) === 1) {
      current++
      if (current > maxStreak) {
        maxStreak = current
        maxStart = tempStart
        maxEnd = dates[i]
      }
    } else {
      current = 1
      tempStart = dates[i]
    }
  }

  // 현재 진행 중인 스트릭
  const today = toDateStr(new Date())
  const yesterday = toDateStr(new Date(Date.now() - 86400000))
  const lastDate = dates[dates.length - 1]
  const isOngoing = lastDate === today || lastDate === yesterday

  let ongoingStreak = 0
  if (isOngoing) {
    ongoingStreak = 1
    for (let i = dates.length - 2; i >= 0; i--) {
      if (dayDiff(dates[i], dates[i + 1]) === 1) ongoingStreak++
      else break
    }
  }

  return { maxStreak, maxStart, maxEnd, ongoingStreak, activeDays }
}
