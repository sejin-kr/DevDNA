export type TimeSlot =
  | "midnight"      // 00~03 이 시간에 왜 깨어있지
  | "predawn"       // 03~06 해 뜨기 전에 한 커밋
  | "earlyMorning"  // 06~09 출근 전 모닝 커밋
  | "morning"       // 09~12 칼같은 업무시간
  | "lunch"         // 12~14 점심 먹고 슬쩍 한 커밋
  | "afternoon"     // 14~18 나른한 오후 코딩
  | "evening"       // 18~21 치킨 시키고 코딩
  | "night"         // 21~24 오늘의 마지막 커밋

export interface TimezoneResult {
  dominantSlot: TimeSlot
  percentages: Record<TimeSlot, number>
  hourlyDistribution: number[] // length 24
}

export interface WeekdayResult {
  topDay: number           // 0(일) ~ 6(토)
  distribution: number[]   // length 7
  weekdayRatio: number     // 주중 비율 0~1
}

export interface LanguageResult {
  topLanguage: string
  distribution: {
    lang: string
    count: number
    percentage: number        // 전체 커밋 대비 비율
    knownPercentage: number   // 언어 식별된 커밋 대비 비율 (Unknown 제외)
  }[]
}

export interface StreakResult {
  maxStreak: number
  maxStart: string
  maxEnd: string
  ongoingStreak: number
  activeDays: number
}

export interface MessageStyleResult {
  averageLength: number
  styleType: "concise" | "balanced" | "verbose"
  topPrefixes: { prefix: string; count: number }[]
}

export interface PersonaTag {
  tag: string
  emoji: string
  description: string
}

export interface DevPersonaResult {
  tags: PersonaTag[]
}

export interface AnalysisResult {
  totalCommits: number
  timezone: TimezoneResult
  weekday: WeekdayResult
  language: LanguageResult
  streak: StreakResult
  messageStyle: MessageStyleResult
  persona: DevPersonaResult
}
