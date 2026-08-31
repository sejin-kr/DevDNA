"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import html2canvas from "html2canvas"
import { AnalysisResult } from "@/types/analysis"
import TimingCard from "@/components/cards/TimingCard"
import WeekdayCard from "@/components/cards/WeekdayCard"
import LanguageCard from "@/components/cards/LanguageCard"
import StreakCard from "@/components/cards/StreakCard"
import MessageCard from "@/components/cards/MessageCard"
import PersonaCard from "@/components/cards/PersonaCard"
import SummaryCard from "@/components/cards/SummaryCard"

const CARD_TITLES = ["코딩 타이밍", "활동 요일", "주력 언어", "활동 스트릭", "커밋 스타일", "개발자 DNA"]

const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

export default function ReportPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [current, setCurrent] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [saving, setSaving] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem("devdna_result")
    if (!raw) { router.replace("/"); return }
    try { setResult(JSON.parse(raw)) } catch { router.replace("/") }
  }, [router])

  if (!result) return null

  const totalCards = 6
  const isLast = current === totalCards - 1
  const username = session?.login ?? undefined

  const cards = [
    <TimingCard key="timing" data={result.timezone} />,
    <WeekdayCard key="weekday" data={result.weekday} />,
    <LanguageCard key="language" data={result.language} />,
    <StreakCard key="streak" data={result.streak} totalCommits={result.totalCommits} />,
    <MessageCard key="message" data={result.messageStyle} />,
    <PersonaCard key="persona" data={result.persona} username={session?.user?.name ?? undefined} />,
  ]

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(delta) < 50) return
    if (delta > 0) {
      if (isLast) setShowSummary(true)
      else setCurrent((c) => Math.min(c + 1, totalCards - 1))
    } else {
      setCurrent((c) => Math.max(c - 1, 0))
    }
    touchStartX.current = null
  }

  async function saveCard() {
    if (!cardRef.current) return
    setSaving(true)
    try {
      const filename = `devdna-${username ?? "me"}.png`
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      })

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      )
      if (!blob) throw new Error("blob failed")

      const file = new File([blob], filename, { type: "image/png" })

      if (isMobile() && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] })
      } else {
        const dataUrl = canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.download = filename
        link.href = dataUrl
        link.click()
      }
    } finally {
      setSaving(false)
    }
  }

  // ── 요약 카드 뷰 ──────────────────────────────────────────────
  if (showSummary) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-4 dark:bg-black">
        <div
          ref={cardRef}
          className="w-full max-w-[400px] overflow-hidden rounded-3xl bg-white shadow-xl dark:bg-zinc-900"
        >
          <SummaryCard data={result} username={username} />
        </div>

        <button
          onClick={saveCard}
          disabled={saving}
          className="group w-full max-w-[400px] cursor-pointer overflow-hidden rounded-3xl disabled:cursor-not-allowed disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)" }}
        >
          <div className="flex items-center justify-between px-6 py-5 transition-opacity group-hover:opacity-90">
            <div className="text-left">
              <p className="text-base font-bold text-white">
                {saving ? "저장 중..." : "이미지로 저장하기"}
              </p>
              <p className="mt-0.5 text-xs text-white/70">
                devdna-{username ?? "me"}.png
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
          </div>
        </button>

        <button
          onClick={() => setShowSummary(false)}
          className="w-full max-w-[400px] rounded-full border border-zinc-200 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          ← 돌아가기
        </button>

        <div className="flex gap-4 text-xs text-zinc-400">
          <button onClick={() => router.push("/")} className="cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-200">홈으로</button>
          <span>·</span>
          <button onClick={() => { localStorage.removeItem("devdna_result"); router.push("/analyze") }} className="cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-200">재분석</button>
        </div>
      </div>
    )
  }

  // ── 카드 슬라이더 뷰 ─────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-4 dark:bg-black">
      <div
        ref={cardRef}
        className="w-full max-w-[400px] overflow-hidden rounded-3xl bg-white shadow-xl dark:bg-zinc-900"
        style={{ minHeight: 540 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {cards[current]}
      </div>

      <div className="flex gap-2">
        {Array.from({ length: totalCards }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 cursor-pointer rounded-full transition-all duration-300 ${
              i === current ? "w-6 bg-black dark:bg-white" : "w-2 bg-zinc-300 dark:bg-zinc-600"
            }`}
            aria-label={CARD_TITLES[i]}
          />
        ))}
      </div>

      <div className="flex w-full max-w-[400px] gap-3">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="flex-1 rounded-full border border-zinc-200 py-3 text-sm font-medium text-zinc-600 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-300"
        >
          이전
        </button>
        <button
          onClick={isLast ? () => setShowSummary(true) : () => setCurrent((c) => c + 1)}
          className="flex-1 rounded-full bg-black py-3 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          {isLast ? "나의 DNA 카드 만들기" : "다음"}
        </button>
      </div>

      <div className="flex gap-4 text-xs text-zinc-400">
        <button onClick={() => router.push("/")} className="cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-200">홈으로</button>
        <span>·</span>
        <button onClick={() => { localStorage.removeItem("devdna_result"); router.push("/analyze") }} className="cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-200">재분석</button>
        <span>·</span>
        <button onClick={saveCard} className="cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-200">현재 카드 저장</button>
      </div>
    </div>
  )
}
