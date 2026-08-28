import { StreakResult } from "@/types/analysis"

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

interface Props {
  data: StreakResult
  totalCommits: number
}

export default function StreakCard({ data, totalCommits }: Props) {
  const streakEmoji =
    data.maxStreak >= 30 ? "🔥" :
    data.maxStreak >= 14 ? "⚡" :
    data.maxStreak >= 7  ? "✨" : "💧"

  const streakLabel =
    data.maxStreak >= 30 ? "전설급 연속 커밋러" :
    data.maxStreak >= 14 ? "2주 연속의 강자" :
    data.maxStreak >= 7  ? "1주 완주 클럽" : "꾸준히 시작 중"

  return (
    <div className="flex h-full flex-col justify-between p-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">활동 스트릭</p>
        <h2 className="mt-3 text-5xl">{streakEmoji}</h2>
        <h3 className="mt-3 text-2xl font-bold text-black dark:text-white">{streakLabel}</h3>
        {data.maxStreak > 0 && (
          <p className="mb-4 mt-1 text-sm text-zinc-400">
            {formatDate(data.maxStart)} ~ {formatDate(data.maxEnd)} 최장 연속
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { value: data.maxStreak,     unit: "일", label: "최장 연속 커밋" },
          { value: data.ongoingStreak, unit: "일", label: "현재 진행 중" },
          { value: data.activeDays,    unit: "일", label: "총 활동일" },
          { value: totalCommits,       unit: "개", label: "총 커밋" },
        ].map((item, i) => (
          <div
            key={item.label}
            className="rounded-2xl bg-zinc-100 p-5 dark:bg-zinc-800"
          >
            <p className="text-3xl font-bold text-black dark:text-white">
              {item.value}<span className="text-base font-normal text-zinc-400">{item.unit}</span>
            </p>
            <p className="mt-1 text-xs text-zinc-400">{item.label}</p>
          </div>
        ))}
      </div>

      {data.ongoingStreak > 0 && (
        <div className="mt-4 rounded-2xl border border-black/10 p-4 dark:border-white/10">
          <p className="text-sm font-medium text-black dark:text-white">
            🔥 지금 {data.ongoingStreak}일째 연속 중!
          </p>
          <p className="mt-0.5 text-xs text-zinc-400">오늘도 커밋하면 기록 경신</p>
        </div>
      )}
    </div>
  )
}
