import { WeekdayResult } from "@/types/analysis"

const DAYS = ["일", "월", "화", "수", "목", "금", "토"]

const DAY_DESC: Record<number, { emoji: string; label: string }> = {
  0: { emoji: "😴", label: "쉬는 날에도 코딩" },
  1: { emoji: "💪", label: "월요일부터 풀파워" },
  2: { emoji: "🔥", label: "화요일 집중 모드" },
  3: { emoji: "⚡", label: "수요일 중간 점검" },
  4: { emoji: "🚀", label: "목요일 피크타임" },
  5: { emoji: "🎉", label: "불금엔 역시 코딩" },
  6: { emoji: "🛋️", label: "토요일도 손 못 놓아" },
}

interface Props {
  data: WeekdayResult
}

export default function WeekdayCard({ data }: Props) {
  const topDay = DAY_DESC[data.topDay]
  const maxCount = Math.max(...data.distribution, 1)
  const weekdayPct = Math.round(data.weekdayRatio * 100)

  return (
    <div className="flex h-full flex-col justify-between p-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">활동 요일</p>
        <h2 className="mt-3 text-5xl">{topDay.emoji}</h2>
        <h3 className="mt-3 text-2xl font-bold text-black dark:text-white">
          {DAYS[data.topDay]}요일이 제일 바빠
        </h3>
        <p className="mb-4 mt-1 text-sm text-zinc-400">{topDay.label}</p>
      </div>

      <div className="flex flex-col gap-3">
        {data.distribution.map((count, day) => {
          const pct = Math.round((count / maxCount) * 100)
          const isTop = day === data.topDay
          return (
            <div key={day} className="flex items-center gap-3">
              <span className={`w-6 text-center text-sm font-medium ${isTop ? "text-black dark:text-white" : "text-zinc-400"}`}>
                {DAYS[day]}
              </span>
              <div className="flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={`animate-bar-grow h-2 rounded-full ${isTop ? "bg-black dark:bg-white" : "bg-zinc-300 dark:bg-zinc-600"}`}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs text-zinc-400">{count}</span>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex gap-3">
        <div className="flex-1 rounded-2xl bg-zinc-100 p-4 text-center dark:bg-zinc-800">
          <p className="text-2xl font-bold text-black dark:text-white">{weekdayPct}%</p>
          <p className="mt-1 text-xs text-zinc-400">평일 커밋</p>
        </div>
        <div className="flex-1 rounded-2xl bg-zinc-100 p-4 text-center dark:bg-zinc-800">
          <p className="text-2xl font-bold text-black dark:text-white">{100 - weekdayPct}%</p>
          <p className="mt-1 text-xs text-zinc-400">주말 커밋</p>
        </div>
      </div>
    </div>
  )
}
