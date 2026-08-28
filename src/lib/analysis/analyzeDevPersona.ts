import { CommitRecord } from "@/lib/github/fetchCommits"
import { DevPersonaResult, LanguageResult, MessageStyleResult, PersonaTag } from "@/types/analysis"

const EMOJI_REGEX = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u

export function analyzeDevPersona(
  commits: CommitRecord[],
  language: LanguageResult,
  messageStyle: MessageStyleResult
): DevPersonaResult {
  const tags: PersonaTag[] = []
  const total = commits.length
  if (total === 0) return { tags }

  // ── 언어 성향 ──────────────────────────────────────────────
  const knownLangs = language.distribution.filter(d => d.lang !== "Unknown" && d.lang !== "기타")

  const top = knownLangs[0]
  const second = knownLangs[1]
  const third = knownLangs[2]

  if (top && top.knownPercentage >= 70) {
    // 단일 언어 마니아
    tags.push({
      tag: `${top.lang} 마니아`,
      emoji: "💙",
      description: `식별된 커밋의 ${top.knownPercentage}%가 ${top.lang} 레포`,
    })
  } else if (
    top && second && third &&
    top.knownPercentage < 50 &&
    second.knownPercentage >= 15 &&
    third.knownPercentage >= 15
  ) {
    // 풀스택 유목민: 1위 50% 미만 + 상위 3개 모두 15% 이상
    tags.push({
      tag: "풀스택 유목민",
      emoji: "🗺️",
      description: `${[top, second, third].map(d => d.lang).join(" · ")} 골고루 사용 중`,
    })
  } else if (top && second && top.knownPercentage < 70) {
    // 2개 언어 주력
    tags.push({
      tag: `${top.lang} + ${second.lang} 개발자`,
      emoji: "⚡",
      description: `${top.lang} ${top.knownPercentage}% · ${second.lang} ${second.knownPercentage}%`,
    })
  }

  // ── 커밋 메시지 스타일 ──────────────────────────────────────
  // 이모지 커밋
  const emojiCount = commits.filter(c => EMOJI_REGEX.test(c.message)).length
  const emojiRatio = emojiCount / total
  if (emojiRatio >= 0.2) {
    tags.push({
      tag: "이모지 커밋러",
      emoji: "🎉",
      description: `커밋의 ${Math.round(emojiRatio * 100)}%에 이모지 포함`,
    })
  }

  // 컨벤션 엄수파
  const prefixTotal = messageStyle.topPrefixes.reduce((sum, p) => sum + p.count, 0)
  const conventionalRatio = prefixTotal / total
  if (conventionalRatio >= 0.6) {
    tags.push({
      tag: "컨벤션 엄수파",
      emoji: "📐",
      description: `커밋의 ${Math.round(conventionalRatio * 100)}%가 feat/fix/docs 형식`,
    })
  }

  // WIP 달인
  const wipCount = commits.filter(c => /\bwip\b/i.test(c.message)).length
  if (wipCount / total >= 0.1) {
    tags.push({
      tag: "WIP의 달인",
      emoji: "🚧",
      description: `커밋 ${wipCount}개가 WIP`,
    })
  }

  // 버그킬러
  const fixCount = messageStyle.topPrefixes.find(p => p.prefix === "fix")?.count ?? 0
  if (fixCount / total >= 0.3) {
    tags.push({
      tag: "버그킬러",
      emoji: "🐛",
      description: `커밋의 ${Math.round(fixCount / total * 100)}%가 버그 수정`,
    })
  }

  // 말 없는 커밋러 / 커밋 소설가
  if (messageStyle.averageLength <= 10) {
    tags.push({
      tag: "말 없는 커밋러",
      emoji: "🤐",
      description: `평균 메시지 길이 ${messageStyle.averageLength}자`,
    })
  } else if (messageStyle.averageLength >= 50) {
    tags.push({
      tag: "커밋 소설가",
      emoji: "📝",
      description: `평균 메시지 길이 ${messageStyle.averageLength}자`,
    })
  }

  // ── 활동 패턴 ──────────────────────────────────────────────
  const uniqueRepos = new Set(commits.map(c => c.repoFullName)).size

  if (uniqueRepos >= 10) {
    tags.push({
      tag: "레포 수집가",
      emoji: "📦",
      description: `${uniqueRepos}개 레포에서 활동 중`,
    })
  } else if (uniqueRepos <= 2 && total >= 10) {
    tags.push({
      tag: "한 우물 파기",
      emoji: "🎯",
      description: `${uniqueRepos}개 레포에 집중`,
    })
  }

  return { tags }
}
