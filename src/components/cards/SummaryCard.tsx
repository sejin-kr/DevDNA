import { AnalysisResult, TimeSlot } from "@/types/analysis"

const SLOT_LABELS: Record<TimeSlot, { label: string; emoji: string }> = {
  midnight:     { label: "심야 코딩형",      emoji: "🦉" },
  predawn:      { label: "새벽 커밋형",      emoji: "🌅" },
  earlyMorning: { label: "모닝 루틴형",      emoji: "☀️" },
  morning:      { label: "업무시간형",       emoji: "💼" },
  lunch:        { label: "점심시간 슬쩍형",  emoji: "🍱" },
  afternoon:    { label: "오후 코딩형",      emoji: "☕" },
  evening:      { label: "치킨 코딩형",      emoji: "🍗" },
  night:        { label: "야밤 커밋형",      emoji: "🌙" },
}

const DAYS = ["일", "월", "화", "수", "목", "금", "토"]

const LANG_COLORS = ["#18181b", "#52525b", "#a1a1aa", "#d4d4d8", "#e4e4e7"]

interface Props {
  data: AnalysisResult
  username?: string
}

export default function SummaryCard({ data, username }: Props) {
  const slot = SLOT_LABELS[data.timezone.dominantSlot]
  const knownLangs = data.language.distribution.filter(d => d.lang !== "Unknown")
  const topLang = knownLangs[0]
  const topDay = DAYS[data.weekday.topDay]
  const weekdayPct = Math.round(data.weekday.weekdayRatio * 100)
  const tags = data.persona.tags
  const prefixes = data.messageStyle.topPrefixes.slice(0, 3)

  return (
    <div className="flex h-full flex-col gap-4 bg-white p-7 dark:bg-zinc-900">

      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">DevDNA Report</p>
          {username && (
            <p className="mt-0.5 text-lg font-bold text-black dark:text-white">@{username}</p>
          )}
        </div>
        <span className="text-3xl">🧬</span>
      </div>

      <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

      {/* 언어 분포 */}
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">언어 분포</p>
        {/* 비율 바 */}
        <div className="flex h-2.5 w-full overflow-hidden rounded-full">
          {knownLangs.slice(0, 5).map((d, i) => (
            <div
              key={d.lang}
              style={{ width: `${d.knownPercentage}%`, backgroundColor: LANG_COLORS[i] }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {knownLangs.slice(0, 4).map((d, i) => (
            <div key={d.lang} className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-sm" style={{ backgroundColor: LANG_COLORS[i] }} />
              <span className="text-xs text-black dark:text-white">{d.lang}</span>
              <span className="text-xs text-zinc-400">{d.knownPercentage}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

      {/* 활동 패턴 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800">
          <p className="text-[10px] text-zinc-400">코딩 타이밍</p>
          <p className="mt-1 text-sm font-bold text-black dark:text-white">{slot.emoji} {slot.label}</p>
        </div>
        <div className="rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800">
          <p className="text-[10px] text-zinc-400">주 활동 요일</p>
          <p className="mt-1 text-sm font-bold text-black dark:text-white">{topDay}요일</p>
          <p className="text-[10px] text-zinc-400">평일 {weekdayPct}% · 주말 {100 - weekdayPct}%</p>
        </div>
        <div className="rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800">
          <p className="text-[10px] text-zinc-400">최장 스트릭</p>
          <p className="mt-1 text-sm font-bold text-black dark:text-white">{data.streak.maxStreak}일 연속</p>
          <p className="text-[10px] text-zinc-400">현재 {data.streak.ongoingStreak}일 진행 중</p>
        </div>
        <div className="rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800">
          <p className="text-[10px] text-zinc-400">총 커밋</p>
          <p className="mt-1 text-sm font-bold text-black dark:text-white">{data.totalCommits}개</p>
          <p className="text-[10px] text-zinc-400">활동일 {data.streak.activeDays}일</p>
        </div>
      </div>

      <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

      {/* 커밋 스타일 */}
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">커밋 메시지</p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500">평균 {data.messageStyle.averageLength}자</span>
          {prefixes.length > 0 && (
            <div className="flex gap-1.5">
              {prefixes.map(({ prefix, count }) => (
                <span key={prefix} className="rounded-full bg-black px-2.5 py-0.5 text-[11px] text-white dark:bg-white dark:text-black">
                  {prefix} {count}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DNA 태그 */}
      {tags.length > 0 && (
        <>
          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">개발자 DNA</p>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag.tag}
                  className="rounded-full bg-black px-3 py-1 text-[11px] font-medium text-white dark:bg-white dark:text-black"
                >
                  {tag.emoji} {tag.tag}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 푸터 */}
      <p className="mt-auto text-center text-[10px] text-zinc-300 dark:text-zinc-600">
        devdna.vercel.app
      </p>
    </div>
  )
}
