import { TimezoneResult, TimeSlot } from "@/types/analysis"

const SLOT_LABELS: Record<TimeSlot, { label: string; emoji: string; time: string }> = {
  midnight:     { label: "이 시간에 왜 깨어있지형",  emoji: "🦉", time: "00~03시" },
  predawn:      { label: "해 뜨기 전 커밋형",        emoji: "🌅", time: "03~06시" },
  earlyMorning: { label: "모닝 루틴 커밋형",         emoji: "☀️", time: "06~09시" },
  morning:      { label: "칼같은 업무시간형",         emoji: "💼", time: "09~12시" },
  lunch:        { label: "점심시간 슬쩍형",           emoji: "🍱", time: "12~14시" },
  afternoon:    { label: "나른한 오후 코딩형",        emoji: "☕", time: "14~18시" },
  evening:      { label: "치킨 시키고 코딩형",        emoji: "🍗", time: "18~21시" },
  night:        { label: "오늘의 마지막 커밋형",      emoji: "🌙", time: "21~24시" },
}

interface Props {
  data: TimezoneResult
}

export default function TimingCard({ data }: Props) {
  const slot = SLOT_LABELS[data.dominantSlot]
  const maxCount = Math.max(...data.hourlyDistribution, 1)

  return (
    <div className="flex h-full flex-col justify-between p-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">코딩 타이밍</p>
        <h2 className="mt-3 text-5xl">{slot.emoji}</h2>
        <h3 className="mt-3 text-2xl font-bold text-black dark:text-white">{slot.label}</h3>
        <p className="mt-1 text-sm text-zinc-400">{slot.time} 커밋 집중</p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-zinc-400">시간대별 커밋 분포</p>
        <div className="flex items-end gap-0.5 h-16">
          {data.hourlyDistribution.map((count, hour) => {
            const height = Math.round((count / maxCount) * 100)
            const isActive = hour >= getSlotStart(data.dominantSlot) && hour < getSlotEnd(data.dominantSlot)
            return (
              <div
                key={hour}
                title={`${hour}시: ${count}개`}
                className={`animate-bar-rise flex-1 rounded-t ${isActive ? "bg-black dark:bg-white" : "bg-zinc-200 dark:bg-zinc-700"}`}
                style={{ height: `${Math.max(height, 4)}%` }}
              />
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-zinc-400">
          <span>00</span>
          <span>06</span>
          <span>12</span>
          <span>18</span>
          <span>23</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(Object.entries(data.percentages) as [TimeSlot, number][])
          .filter(([, pct]) => pct > 0)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([slot, pct]) => (
            <span key={slot} className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {SLOT_LABELS[slot].emoji} {SLOT_LABELS[slot].time} {pct}%
            </span>
          ))}
      </div>
    </div>
  )
}

function getSlotStart(slot: TimeSlot): number {
  const map: Record<TimeSlot, number> = {
    midnight: 0, predawn: 3, earlyMorning: 6, morning: 9,
    lunch: 12, afternoon: 14, evening: 18, night: 21,
  }
  return map[slot]
}

function getSlotEnd(slot: TimeSlot): number {
  const map: Record<TimeSlot, number> = {
    midnight: 3, predawn: 6, earlyMorning: 9, morning: 12,
    lunch: 14, afternoon: 18, evening: 21, night: 24,
  }
  return map[slot]
}
