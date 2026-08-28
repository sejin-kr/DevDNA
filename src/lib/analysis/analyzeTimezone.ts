import { CommitRecord } from "@/lib/github/fetchCommits"
import { TimeSlot, TimezoneResult } from "@/types/analysis"

const SLOTS: { key: TimeSlot; from: number; to: number }[] = [
  { key: "midnight",     from: 0,  to: 3  },
  { key: "predawn",      from: 3,  to: 6  },
  { key: "earlyMorning", from: 6,  to: 9  },
  { key: "morning",      from: 9,  to: 12 },
  { key: "lunch",        from: 12, to: 14 },
  { key: "afternoon",    from: 14, to: 18 },
  { key: "evening",      from: 18, to: 21 },
  { key: "night",        from: 21, to: 24 },
]

function getSlot(hour: number): TimeSlot {
  return SLOTS.find(s => hour >= s.from && hour < s.to)!.key
}

export function analyzeTimezone(commits: CommitRecord[]): TimezoneResult {
  const counts = Object.fromEntries(SLOTS.map(s => [s.key, 0])) as Record<TimeSlot, number>
  const hourlyDistribution = new Array(24).fill(0)

  for (const commit of commits) {
    const hour = new Date(commit.date).getHours()
    counts[getSlot(hour)]++
    hourlyDistribution[hour]++
  }

  const total = commits.length
  const percentages = Object.fromEntries(
    SLOTS.map(s => [s.key, total > 0 ? Math.round(counts[s.key] / total * 100) : 0])
  ) as Record<TimeSlot, number>

  const dominantSlot = SLOTS.reduce((a, b) =>
    counts[a.key] >= counts[b.key] ? a : b
  ).key

  return { dominantSlot, percentages, hourlyDistribution }
}
