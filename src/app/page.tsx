"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import Image from "next/image"

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white">
          DevDNA
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          나의 코딩 DNA를 시각화해주는 웹앱
        </p>

        {session ? (
          <div className="flex flex-col items-center gap-4">
            {session.user?.image && (
              <Image
                src={session.user.image}
                alt="avatar"
                width={64}
                height={64}
                className="rounded-full"
              />
            )}
            <p className="text-lg font-medium text-black dark:text-white">
              @{session.user?.name}
            </p>
            <p className="text-sm text-zinc-500">로그인 완료</p>
            <button
              onClick={() => signOut()}
              className="rounded-full border border-black/10 px-6 py-2 text-sm font-medium transition-colors hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn("github")}
            className="flex items-center gap-3 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub으로 로그인
          </button>
        )}
      </main>
    </div>
  )
}
