"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

const STEPS = [
  "커밋 히스토리 불러오는 중...",
  "언어 분포 분석 중...",
  "활동 패턴 계산 중...",
  "커밋 메시지 스타일 파악 중...",
  "DNA 조합 중...",
]

export default function AnalyzePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [stepIndex, setStepIndex] = useState(0)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const apiReady = useRef(false)
  const stepsReady = useRef(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/")
      return
    }
    if (status !== "authenticated") return

    const interval = setInterval(() => {
      setStepIndex((prev) => {
        const next = prev + 1
        if (next >= STEPS.length - 1) {
          clearInterval(interval)
          stepsReady.current = true
          if (apiReady.current) setDone(true)
        }
        return Math.min(next, STEPS.length - 1)
      })
    }, 900)

    const useMock = process.env.NODE_ENV === "development" && new URLSearchParams(window.location.search).get("mock") === "true"
    const url = useMock ? "/api/github/commits?mock=true" : "/api/github/commits"

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("API error")
        return res.json()
      })
      .then((data) => {
        localStorage.setItem("devdna_result", JSON.stringify(data))
        apiReady.current = true
        if (stepsReady.current) setDone(true)
      })
      .catch(() => {
        clearInterval(interval)
        setError("분석 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.")
      })

    return () => clearInterval(interval)
  }, [status, router])

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-xl font-medium text-black dark:text-white">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="cursor-pointer rounded-full bg-black px-6 py-2 text-sm text-white dark:bg-white dark:text-black"
          >
            홈으로
          </button>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="animate-pop-in">
            <div
              className="animate-spin-slow flex h-20 w-20 items-center justify-center rounded-full p-[3px]"
              style={{ background: "conic-gradient(from 0deg, #6366f1, #8b5cf6, #ec4899, #6366f1)" }}
            >
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-zinc-900">
                <span className="animate-pop-in text-3xl">🧬</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-2xl font-bold text-black dark:text-white">
              분석이 완료됐어요!
            </p>
            <p className="text-sm text-zinc-400">
              {session?.user?.name}님의 코딩 DNA가 준비됐어요
            </p>
          </div>
          <button
            onClick={() => router.push("/report")}
            className="cursor-pointer rounded-full bg-black px-10 py-3.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            내 DNA 카드 확인하기 →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="flex flex-col items-center gap-8 text-center">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-zinc-200 border-t-black dark:border-zinc-700 dark:border-t-white" />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-lg font-medium text-black dark:text-white">
            {session?.user?.name}님의 DNA 분석 중
          </p>
          <p className="text-sm text-zinc-400 transition-all duration-500">
            {STEPS[stepIndex]}
          </p>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                i <= stepIndex ? "bg-black dark:bg-white" : "bg-zinc-300 dark:bg-zinc-700"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
