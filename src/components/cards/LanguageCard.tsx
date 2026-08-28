"use client"

import { useEffect, useState } from "react"
import { LanguageResult } from "@/types/analysis"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

const LIGHT_COLORS = ["#18181b", "#52525b", "#a1a1aa", "#d4d4d8", "#e4e4e7"]
const DARK_COLORS  = ["#ffffff", "#a1a1aa", "#71717a", "#52525b", "#3f3f46"]

interface Props {
  data: LanguageResult
}

export default function LanguageCard({ data }: Props) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    setIsDark(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const known = data.distribution.filter(d => d.lang !== "Unknown")
  const top = known[0]
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS

  const chartData = known.slice(0, 5).map(d => ({
    name: d.lang,
    value: d.count,
    pct: d.knownPercentage,
  }))

  return (
    <div className="flex h-full flex-col justify-between p-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">주력 언어</p>
        <h3 className="mt-3 text-2xl font-bold text-black dark:text-white">
          {top ? `${top.lang} 개발자` : "다양한 언어 사용자"}
        </h3>
        {top && (
          <p className="mt-1 text-sm text-zinc-400">
            식별된 커밋의 {top.knownPercentage}%가 {top.lang}
          </p>
        )}
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value}개`, String(name)]}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-2">
        {known.slice(0, 5).map((d, i) => (
          <div key={d.lang} className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
            <span className="flex-1 text-sm text-black dark:text-white">{d.lang}</span>
            <span className="text-sm font-medium text-zinc-500">{d.knownPercentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
