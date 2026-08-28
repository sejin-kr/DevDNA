import { CommitRecord } from "@/lib/github/fetchCommits"
import { AnalysisResult } from "@/types/analysis"
import { analyzeTimezone } from "./analyzeTimezone"
import { analyzeWeekday } from "./analyzeWeekday"
import { analyzeLanguage } from "./analyzeLanguage"
import { analyzeStreak } from "./analyzeStreak"
import { analyzeMessageStyle } from "./analyzeMessageStyle"
import { analyzeDevPersona } from "./analyzeDevPersona"

export function analyze(commits: CommitRecord[]): AnalysisResult {
  const language = analyzeLanguage(commits)
  const messageStyle = analyzeMessageStyle(commits)

  return {
    totalCommits: commits.length,
    timezone: analyzeTimezone(commits),
    weekday: analyzeWeekday(commits),
    language,
    streak: analyzeStreak(commits),
    messageStyle,
    persona: analyzeDevPersona(commits, language, messageStyle),
  }
}
