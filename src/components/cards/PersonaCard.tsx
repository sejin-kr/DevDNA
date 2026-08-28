import { DevPersonaResult } from "@/types/analysis"

interface Props {
  data: DevPersonaResult
  username?: string
}

export default function PersonaCard({ data, username }: Props) {
  const tags = data.tags

  return (
    <div className="flex h-full flex-col justify-between p-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">개발자 DNA</p>
        <h3 className="mt-3 text-2xl font-bold text-black dark:text-white">
          {username ? `@${username}의 코딩 정체성` : "나의 코딩 정체성"}
        </h3>
        <p className="mb-4 mt-1 text-sm text-zinc-400">
          커밋 패턴으로 분석한 DNA 태그
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {tags.length === 0 ? (
          <p className="text-sm text-zinc-400">아직 태그를 뽑기엔 커밋이 부족해요</p>
        ) : (
          tags.map((tag) => (
            <div
              key={tag.tag}
              className="flex items-start gap-4 rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-800"
            >
              <span className="text-2xl">{tag.emoji}</span>
              <div>
                <p className="font-semibold text-black dark:text-white">{tag.tag}</p>
                <p className="mt-0.5 text-xs text-zinc-400">{tag.description}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.tag}
              className="rounded-full border border-black/10 px-3 py-1 text-xs text-zinc-600 dark:border-white/10 dark:text-zinc-300"
            >
              {tag.emoji} {tag.tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
