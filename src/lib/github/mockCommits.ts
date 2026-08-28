import { CommitRecord } from "./fetchCommits"

function makeCommit(
  index: number,
  repoFullName: string,
  language: string | null,
  message: string,
  hour: number,
  dayOffset: number
): CommitRecord {
  const date = new Date()
  date.setDate(date.getDate() - dayOffset)
  date.setHours(hour, 0, 0, 0)

  return {
    sha: `mock-sha-${index}`,
    date: date.toISOString(),
    repoFullName,
    message,
    language,
  }
}

// TypeScript 마니아 + 이모지 커밋러 + 컨벤션 엄수파 + 레포 수집가 시나리오
export const MOCK_COMMITS: CommitRecord[] = [
  // TypeScript 레포 (75% 비중)
  makeCommit(1,  "mock/ts-project-1", "TypeScript", "✨ feat: 로그인 기능 추가",       11, 1),
  makeCommit(2,  "mock/ts-project-1", "TypeScript", "🐛 fix: 토큰 만료 처리",          11, 2),
  makeCommit(3,  "mock/ts-project-1", "TypeScript", "feat: 회원가입 API 연동",         10, 3),
  makeCommit(4,  "mock/ts-project-1", "TypeScript", "fix: 유효성 검사 오류 수정",      10, 4),
  makeCommit(5,  "mock/ts-project-1", "TypeScript", "🎉 feat: 대시보드 완성",          11, 5),
  makeCommit(6,  "mock/ts-project-2", "TypeScript", "feat: 차트 컴포넌트 추가",         9, 6),
  makeCommit(7,  "mock/ts-project-2", "TypeScript", "✨ refactor: 훅 분리",            10, 7),
  makeCommit(8,  "mock/ts-project-2", "TypeScript", "docs: README 업데이트",           11, 8),
  makeCommit(9,  "mock/ts-project-3", "TypeScript", "feat: 검색 기능 구현",            10, 9),
  makeCommit(10, "mock/ts-project-3", "TypeScript", "🔥 fix: 무한 렌더링 수정",        11, 10),
  makeCommit(11, "mock/ts-project-3", "TypeScript", "feat: 페이지네이션 추가",          9, 11),
  makeCommit(12, "mock/ts-project-4", "TypeScript", "✨ feat: 다크모드 지원",          10, 12),
  makeCommit(13, "mock/ts-project-4", "TypeScript", "chore: 패키지 업데이트",          11, 13),
  makeCommit(14, "mock/ts-project-4", "TypeScript", "feat: 알림 기능 추가",            10, 14),
  makeCommit(15, "mock/ts-project-5", "TypeScript", "🎉 init: 프로젝트 초기화",        11, 15),
  makeCommit(16, "mock/ts-project-5", "TypeScript", "feat: 기본 레이아웃 구성",         9, 16),
  makeCommit(17, "mock/ts-project-5", "TypeScript", "fix: 반응형 깨짐 수정",           10, 17),
  makeCommit(18, "mock/ts-project-6", "TypeScript", "✨ feat: API 클라이언트 작성",    11, 18),
  makeCommit(19, "mock/ts-project-6", "TypeScript", "refactor: 타입 정리",             10, 19),
  makeCommit(20, "mock/ts-project-6", "TypeScript", "feat: 에러 핸들링 추가",           9, 20),
  makeCommit(21, "mock/ts-project-7", "TypeScript", "🚀 feat: 배포 설정",             11, 21),
  makeCommit(22, "mock/ts-project-7", "TypeScript", "chore: CI/CD 구성",              10, 22),
  makeCommit(23, "mock/ts-project-7", "TypeScript", "fix: 환경변수 수정",               9, 23),
  makeCommit(24, "mock/ts-project-8", "TypeScript", "✨ feat: 소셜 로그인 추가",       11, 24),
  makeCommit(25, "mock/ts-project-8", "TypeScript", "feat: OAuth 콜백 처리",           10, 25),
  makeCommit(26, "mock/ts-project-8", "TypeScript", "fix: 세션 만료 버그",              9, 26),
  makeCommit(27, "mock/ts-project-9", "TypeScript", "🎉 feat: 결제 기능 연동",         11, 27),
  makeCommit(28, "mock/ts-project-9", "TypeScript", "feat: 주문 내역 조회",            10, 28),
  makeCommit(29, "mock/ts-project-10","TypeScript", "✨ feat: 마이페이지 구성",         9, 29),
  makeCommit(30, "mock/ts-project-10","TypeScript", "fix: 프로필 이미지 업로드 오류",   11, 30),

  // Python 레포 (13%)
  makeCommit(31, "mock/py-script-1", "Python", "feat: 데이터 수집 스크립트",           14, 31),
  makeCommit(32, "mock/py-script-1", "Python", "fix: 인코딩 오류 수정",               15, 32),
  makeCommit(33, "mock/py-script-2", "Python", "chore: 크롤러 스케줄 추가",           14, 33),
  makeCommit(34, "mock/py-script-2", "Python", "feat: 데이터 파싱 개선",              15, 34),

  // Shell 레포 (7%)
  makeCommit(35, "mock/scripts",     "Shell",  "chore: 배포 스크립트 작성",           11, 35),
  makeCommit(36, "mock/scripts",     "Shell",  "fix: 빌드 오류 수정",                 10, 36),

  // Unknown 레포 (5%)
  makeCommit(37, "mock/dotfiles",    null,     "chore: vim 설정 업데이트",            22, 37),
  makeCommit(38, "mock/dotfiles",    null,     "chore: zsh 플러그인 추가",            21, 38),
]
