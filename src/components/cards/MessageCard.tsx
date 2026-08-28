import { MessageStyleResult } from "@/types/analysis"

const STYLE_INFO = {
  concise:  { emoji: "🤐", label: "간결 그 자체", desc: "군더더기 없는 커밋 메시지" },
  balanced: { emoji: "✍️", label: "딱 적당해",    desc: "누가 봐도 이해하는 메시지" },
  verbose:  { emoji: "📝", label: "커밋 소설가",  desc: "설명충의 경지에 오름" },
}

interface Props {
  data: MessageStyleResult
}

export default function MessageCard({ data }: Props) {
  const style = STYLE_INFO[data.styleType]

  return (
    <div className="flex h-full flex-col justify-between p-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">커밋 메시지 스타일</p>
        <h2 className="mt-3 text-5xl">{style.emoji}</h2>
        <h3 className="mt-3 text-2xl font-bold text-black dark:text-white">{style.label}</h3>
        <p className="mb-4 mt-1 text-sm text-zinc-400">{style.desc}</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-800">
          <p className="text-xs text-zinc-400">평균 메시지 길이</p>
          <p className="mt-1 text-2xl font-bold text-black dark:text-white">
            {data.averageLength}<span className="text-sm font-normal text-zinc-400">자</span>
          </p>
        </div>

        {data.topPrefixes.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-zinc-400">자주 쓰는 커밋 타입</p>
            {data.topPrefixes.slice(0, 4).map(({ prefix, count }, i) => (
              <div key={prefix} className="flex items-center gap-3">
                <span className="w-16 rounded-full bg-black px-2 py-0.5 text-center text-xs text-white dark:bg-white dark:text-black">
                  {prefix}
                </span>
                <div className="flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="animate-bar-grow h-2 rounded-full bg-zinc-400 dark:bg-zinc-500"
                    style={{ width: `${Math.min(count * 10, 100)}%`, animationDelay: `${i * 60}ms` }}
                  />
                </div>
                <span className="w-8 text-right text-xs text-zinc-400">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-black/10 p-4 dark:border-white/10">
        <p className="text-xs text-zinc-400">
          {data.styleType === "concise" && "짧고 굵게 — 읽는 사람도 감사합니다 🙏"}
          {data.styleType === "balanced" && "콘텍스트도 살리고 간결함도 살리고 💯"}
          {data.styleType === "verbose" && "미래의 나에게 감사할 상세한 기록 📚"}
        </p>
      </div>
    </div>
  )
}
