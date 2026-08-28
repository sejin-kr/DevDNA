# 코딩 타입 분석 — 개발 기술 문서

> PROJECT.md의 기획을 바탕으로 한 기술 구현 참고 문서

---

## 1. 기술 스택

| 영역 | 선택 | 선택 이유 |
|------|------|-----------|
| 프레임워크 | Next.js 14 (App Router) | API 라우트 내장, SSR 지원, Vercel 배포 최적화 |
| 언어 | TypeScript | 타입 안전성, GitHub API 응답 타입 정의 편의성 |
| 스타일링 | Tailwind CSS | 유틸리티 클래스로 빠른 UI 구현, 별도 CSS 파일 관리 불필요 |
| 인증 | NextAuth.js v5 | GitHub OAuth 지원, 세션/JWT 관리 자동화 |
| API 클라이언트 | `fetch` 직접 사용 (또는 `@octokit/rest`) | 의존성 최소화, octokit 사용 시 타입 지원 편의성 |
| 차트/시각화 | Recharts | React 친화적, 커스터마이징 용이, 번들 크기 적당 |
| 이미지 캡처 | `html-to-image` | 특정 DOM 노드를 PNG로 변환, 사용법 단순 |
| 상태관리 | React 기본 (`useState`, `useContext`) | 앱 규모가 작으므로 별도 라이브러리 불필요 |
| 배포 | Vercel | Next.js 공식 지원, 무료 플랜으로 충분, 환경변수 설정 간편 |

---

## 2. 프로젝트 디렉토리 구조

```
coding-type-analyzer/
├── app/
│   ├── page.tsx                        # 랜딩 페이지 (/)
│   ├── analyze/
│   │   └── page.tsx                    # 로딩/분석 화면 (/analyze)
│   ├── report/
│   │   └── page.tsx                    # 리포트 화면 (/report)
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts            # NextAuth 핸들러 (OAuth 콜백 처리)
│       └── github/
│           ├── commits/
│           │   └── route.ts            # 커밋 데이터 수집 API
│           └── repos/
│               └── route.ts            # 저장소 언어 정보 API
│
├── components/
│   ├── cards/
│   │   ├── TimingCard.tsx              # 코딩 타임 유형 카드
│   │   ├── WeekdayCard.tsx             # 요일별 분포 카드
│   │   ├── LanguageCard.tsx            # 언어 비중 카드
│   │   ├── StreakCard.tsx              # 연속 커밋 스트릭 카드
│   │   └── SummaryCard.tsx             # 총평 카드
│   ├── ui/
│   │   ├── ProgressBar.tsx
│   │   ├── CardSlider.tsx
│   │   └── GitHubLoginButton.tsx
│   └── charts/
│       ├── HourlyBarChart.tsx          # 시간대별 막대 차트 (0~23시)
│       ├── WeekdayBarChart.tsx         # 요일별 막대 차트
│       └── LanguageDonutChart.tsx      # 언어 도넛 차트
│
├── lib/
│   ├── github/
│   │   ├── fetchCommits.ts             # 커밋 수집 + 페이지네이션
│   │   └── fetchRepoLanguages.ts       # 레포 언어 정보 수집 + 캐싱
│   └── analysis/
│       ├── analyzeTimezone.ts          # 시간대 분석
│       ├── analyzeWeekday.ts           # 요일 분석
│       ├── analyzeLanguage.ts          # 언어 비중 분석
│       ├── analyzeStreak.ts            # 스트릭 분석
│       └── analyzeMessageStyle.ts      # 커밋 메시지 스타일 분석
│
├── types/
│   ├── github.ts                       # GitHub API 응답 타입
│   └── analysis.ts                     # 분석 결과 타입 (AnalysisResult)
│
├── constants/
│   └── coderTypes.ts                   # 유형별 레이블, 설명 문구 텍스트
│
└── .env.local
    # GITHUB_ID=
    # GITHUB_SECRET=
    # NEXTAUTH_SECRET=
    # NEXTAUTH_URL=
```

**폴더 역할 요약**

| 폴더 | 역할 |
|------|------|
| `app/` | 화면(페이지) + 서버 API 라우트. Next.js App Router 기반 |
| `components/` | UI 컴포넌트. `cards/`(카드 레이아웃), `charts/`(차트만), `ui/`(공통 요소) |
| `lib/` | 비즈니스 로직. `github/`(API 통신), `analysis/`(데이터 계산) |
| `types/` | TypeScript 타입 정의 |
| `constants/` | 유형 레이블, 설명 문구 등 하드코딩 텍스트 상수 |

---

## 3. 데이터 흐름

```
[브라우저 - 사용자 클릭]
        ↓
GitHubLoginButton → /api/auth/signin/github
        ↓ OAuth 인증 완료
app/analyze/page.tsx
        ↓ 서버 API 호출
app/api/github/commits/route.ts
        ↓
lib/github/fetchCommits.ts        ← GitHub Search API 호출 (페이지네이션)
lib/github/fetchRepoLanguages.ts  ← GitHub Repo API 호출 (언어 정보)
        ↓ CommitRecord[] 반환
lib/analysis/analyze*.ts          ← 각 지표 계산
        ↓ AnalysisResult 반환
app/report/page.tsx
        ↓ props 전달
components/cards/[카드 컴포넌트]
components/charts/[차트 컴포넌트]
```

---

## 4. OAuth 인증 플로우

NextAuth.js v5 사용 기준.

```
1. 유저 → "GitHub으로 로그인" 클릭
   → /api/auth/signin/github 요청

2. NextAuth → GitHub OAuth 인증 URL 생성 후 리다이렉트
   https://github.com/login/oauth/authorize
     ?client_id=GITHUB_ID
     &redirect_uri=https://myapp.vercel.app/api/auth/callback/github
     &scope=read:user,public_repo

3. 유저 → GitHub에서 권한 승인

4. GitHub → 콜백 URL로 리다이렉트
   /api/auth/callback/github?code=AUTHORIZATION_CODE

5. NextAuth → 서버에서 code를 access_token으로 교환
   POST https://github.com/login/oauth/access_token
   Body: { client_id, client_secret, code }

6. access_token을 JWT 세션에 저장 → 클라이언트로 세션 반환
```

**NextAuth 설정 포인트**

```typescript
// app/api/auth/[...nextauth]/route.ts
export const { handlers, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: { params: { scope: 'read:user public_repo' } },
    }),
  ],
  callbacks: {
    jwt({ token, account }) {
      if (account) token.accessToken = account.access_token; // JWT에 토큰 저장
      return token;
    },
    session({ session, token }) {
      session.accessToken = token.accessToken; // 클라이언트에서 접근 가능하도록
      return session;
    },
  },
  session: { strategy: 'jwt' }, // DB 없이 동작
});
```

### OAuth 세팅 중 막혔을 때

로그인 버튼을 눌렀는데 인증이 안 된다면 아래 세 가지를 순서대로 확인한다. 에러 메시지가 모두 비슷하게 "인증 실패"로 나오기 때문에 체크리스트로 짚어가는 게 빠르다.

**1. 콜백 URL 오타**
GitHub OAuth App에 등록한 URL이 정확히 아래와 일치하는지 확인한다.
```
로컬:   http://localhost:3000/api/auth/callback/github
배포:   https://your-app.vercel.app/api/auth/callback/github
```
`/github` 뒤에 슬래시가 붙거나, `http`가 `https`로 되어 있거나, 경로 철자가 다르면 GitHub이 콜백을 거부한다. 가장 흔한 실패 원인이다.

**2. `NEXTAUTH_URL` 미설정**
`.env.local`에 아래 값이 없으면 NextAuth가 콜백 URL을 엉뚱하게 만들어서 로그인이 실패한다.
```
NEXTAUTH_URL=http://localhost:3000
```
Vercel 배포 시에는 자동으로 주입되지만, 로컬에서는 반드시 직접 지정해야 한다.

**3. Client ID / Client Secret 혼동**
GitHub OAuth App 페이지에서 위쪽에 보이는 짧은 문자열이 Client ID, "Generate a new client secret" 버튼으로 생성한 긴 문자열이 Secret이다. 두 값을 반대로 넣는 실수가 자주 발생한다.

---

## 5. GitHub API 연동

### 5.1 커밋 수집 (`fetchCommits.ts`)

```
1. GitHub Search API 호출
   GET /search/commits
     ?q=author:{username}+author-date:{since}..{now}
     &sort=author-date&order=desc
     &per_page=100&page=1

2. total_count 확인
   - 100개 이하: 1회 호출로 완료
   - 100개 초과: ceil(total_count / 100) 만큼 추가 페이지 호출
   - Search API 상한: 최대 1000개 (초과 시 기간 축소 필요)

3. 페이지별 결과 병합 → CommitRecord[] 추출
   {
     sha: string
     date: string          // commit.author.date
     repoFullName: string  // repository.full_name
     message: string       // commit.message 첫 줄
   }

4. 레포 언어 정보 추가 (아래 5.2 참고)
```

### 5.2 레포 언어 수집 (`fetchRepoLanguages.ts`)

```
1. CommitRecord[]에서 유니크한 repoFullName 목록 추출

2. 각 레포에 대해 GET /repos/{owner}/{repo} 호출
   → language 필드 (레포의 대표 언어)

3. { repoFullName: language } 맵 생성 (캐시 역할)
   - 이미 조회한 레포는 캐시에서 반환 (중복 호출 방지)

4. CommitRecord[]에 language 필드 추가
```

### 5.3 Rate Limit 대응

| API | 인증 시 제한 |
|-----|------------|
| Search API | 분당 30회 |
| Core API (일반) | 시간당 5,000회 |

```typescript
// 페이지 요청 사이 딜레이 삽입
await new Promise(resolve => setTimeout(resolve, 200));

// Rate Limit 초과 감지 후 대기
const remaining = res.headers.get('X-RateLimit-Remaining');
const reset = res.headers.get('X-RateLimit-Reset');
if (remaining === '0') {
  const waitMs = Number(reset) * 1000 - Date.now();
  await new Promise(resolve => setTimeout(resolve, waitMs + 1000));
}

// 레포 언어 조회: 5개씩 청크로 병렬 처리
const chunks = chunk(repos, 5);
for (const chunk of chunks) {
  await Promise.all(chunk.map(fetchLang));
}
```

---

## 6. 분석 로직

### 6.1 시간대 분석 (`analyzeTimezone.ts`)

```typescript
// 커밋 시각을 브라우저 로컬 타임존 기준으로 시간대 분류
// 타임존은 클라이언트에서 처리해야 정확함 (서버 처리 시 UTC 기준으로 틀어짐)

const slots = { dawn: 0, morning: 0, afternoon: 0, evening: 0 };
for (const commit of commits) {
  const hour = new Date(commit.date).getHours(); // 로컬 타임존
  if (hour < 6)        slots.dawn++;       // 00:00 ~ 05:59
  else if (hour < 12)  slots.morning++;    // 06:00 ~ 11:59
  else if (hour < 18)  slots.afternoon++;  // 12:00 ~ 17:59
  else                 slots.evening++;    // 18:00 ~ 23:59
}

// 비율이 가장 높은 구간 → 유형 결정
const dominantSlot = maxKey(slots);

// 24시간 막대 차트용 (index = 시간)
const hourlyDist = new Array(24).fill(0);
commits.forEach(c => hourlyDist[new Date(c.date).getHours()]++);
```

### 6.2 스트릭 분석 (`analyzeStreak.ts`)

```typescript
// 날짜(YYYY-MM-DD) 중복 제거 후 오름차순 정렬
const dates = [...new Set(commits.map(c => c.date.slice(0, 10)))].sort();

let maxStreak = 1, current = 1;
for (let i = 1; i < dates.length; i++) {
  const diff = dayDiff(dates[i - 1], dates[i]);
  if (diff === 1) { current++; maxStreak = Math.max(maxStreak, current); }
  else current = 1;
}

// 현재 진행 중인 스트릭: 마지막 날짜가 오늘 or 어제인지 확인
const lastDate = dates[dates.length - 1];
const today = toDateStr(new Date());
const yesterday = toDateStr(new Date(Date.now() - 86400000));
const isOngoing = lastDate === today || lastDate === yesterday;
```

### 6.3 언어 분석 (`analyzeLanguage.ts`)

```typescript
// 커밋별 레포 언어 집계
const langCounts: Record<string, number> = {};
commits.forEach(c => {
  const lang = c.language ?? 'Unknown';
  langCounts[lang] = (langCounts[lang] ?? 0) + 1;
});

// 상위 5개 + 기타 처리
const sorted = Object.entries(langCounts).sort(([, a], [, b]) => b - a);
const top5 = sorted.slice(0, 5);
const others = sorted.slice(5).reduce((sum, [, c]) => sum + c, 0);
```

### 6.4 커밋 메시지 스타일 (`analyzeMessageStyle.ts`)

```typescript
// 평균 메시지 길이 → 스타일 분류
const avg = commits.reduce((sum, c) => sum + c.message.length, 0) / commits.length;
const style = avg <= 15 ? 'concise' : avg <= 40 ? 'balanced' : 'verbose';
// concise: 간결파 / balanced: 균형파 / verbose: 설명충

// 커밋 메시지 접두어 추출 (feat:, fix:, docs: 등)
const prefixPattern = /^(feat|fix|docs|chore|refactor|style|test)[\s(:]/i;
```

---

## 7. 타입 정의

```typescript
// types/analysis.ts

interface CommitRecord {
  sha: string;
  date: string;           // ISO 8601
  repoFullName: string;
  message: string;        // 커밋 메시지 첫 줄
  language: string | null; // 레포 주 언어
}

interface AnalysisResult {
  user: {
    login: string;
    name: string;
    avatarUrl: string;
  };
  period: {
    since: string;
    until: string;
    totalCommits: number;
    activeDays: number;
  };
  timezone: {
    dominantSlot: 'dawn' | 'morning' | 'afternoon' | 'evening';
    percentages: Record<'dawn' | 'morning' | 'afternoon' | 'evening', number>;
    hourlyDistribution: number[]; // length 24, index = 시간
  };
  weekday: {
    topDay: number;           // 0(일) ~ 6(토)
    distribution: number[];   // length 7, index = 요일
    weekdayRatio: number;     // 주중 비율 0~1
  };
  language: {
    topLanguage: string;
    distribution: { lang: string; count: number; percentage: number }[];
  };
  streak: {
    maxStreak: number;
    maxStart: string;
    maxEnd: string;
    ongoingStreak: number;
  };
  messageStyle?: {
    averageLength: number;
    styleType: 'concise' | 'balanced' | 'verbose';
    topPrefixes: { prefix: string; count: number }[];
  };
}
```

---

## 8. API 라우트 설계

### `GET /api/github/commits`

```
요청
  - Headers: Authorization: Bearer {accessToken} (세션에서 전달)
  - Query: username, since (ISO date string)

처리 순서
  1. 세션에서 accessToken 검증
  2. GitHub Search API 페이지네이션 호출 (fetchCommits)
  3. 레포 언어 정보 병렬 수집 (fetchRepoLanguages)
  4. CommitRecord[] 반환

응답
  { commits: CommitRecord[], totalCount: number }

에러 코드
  401 — 인증 실패 또는 토큰 만료
  429 — Rate Limit 초과 (Retry-After 헤더 포함)
  500 — 서버 오류
```

---

## 9. 엣지 케이스 처리

| 상황 | 처리 방법 |
|------|-----------|
| 커밋 30개 미만 | "데이터가 충분하지 않아요" 안내 화면, 분석 기간 연장 제안 |
| 레포 언어 정보 없음 | `null` → `'Unknown'` 처리, 별도 회색으로 구분 |
| API 타임아웃/실패 | 최대 3회 재시도, 실패 시 에러 화면 + "다시 시도" 버튼 |
| 커밋 1000개 초과 (1년치) | 기간을 6개월로 축소하거나, GraphQL API cursor 기반 탐색으로 전환 |
| html-to-image 캡처 시 차트 누락 | 캡처 전 500ms delay 삽입, SVG 기반 차트 사용 |

---

## 10. 배포 가이드 (Vercel 기준)

### 사전 준비

**GitHub OAuth App 등록**
1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. 입력값:
   - Homepage URL: `https://your-app.vercel.app`
   - Authorization callback URL: `https://your-app.vercel.app/api/auth/callback/github`
3. Client ID / Client Secret 발급

**환경변수**
```
GITHUB_ID=발급받은_Client_ID
GITHUB_SECRET=발급받은_Client_Secret
NEXTAUTH_SECRET=<openssl rand -base64 32 으로 생성>
NEXTAUTH_URL=https://your-app.vercel.app
```

### 배포 절차

```
1. GitHub 레포지토리에 코드 푸시
2. vercel.com → New Project → GitHub 레포 연결
3. Framework Preset: Next.js (자동 감지)
4. Environment Variables 탭에서 위 4개 환경변수 입력
5. Deploy 클릭
6. 배포 완료 후 GitHub OAuth App의 callback URL을 실제 Vercel URL로 업데이트
```

> 로컬 개발 시에는 callback URL을 `http://localhost:3000/api/auth/callback/github`로 별도 등록하거나, 개발용 OAuth App을 하나 더 만드는 것을 권장.

---

## 11. 세팅 완료 후 다음 단계

로그인 버튼 → GitHub 인증 → 세션 정보 화면 출력까지 됐다면 환경 세팅은 끝난 것이다. 이후 개발은 아래 순서로 이어가면 된다.

### 1단계: 커밋 데이터 수집

`session.accessToken`을 이용해 GitHub Search API를 호출하는 로직을 작성한다.

```
작업 파일
  app/api/github/commits/route.ts   ← API 엔드포인트
  lib/github/fetchCommits.ts        ← 실제 수집 + 페이지네이션 로직

확인 기준
  /api/github/commits 호출 시 CommitRecord[] 가 응답으로 오면 완료
```

### 2단계: 지표 계산

수집된 `CommitRecord[]`를 분석 함수에 넘겨 `AnalysisResult` 객체를 만든다.

```
작업 파일
  lib/analysis/analyzeTimezone.ts   ← 시간대 유형 판별
  lib/analysis/analyzeWeekday.ts    ← 요일별 분포
  lib/analysis/analyzeLanguage.ts   ← 언어 비중
  lib/analysis/analyzeStreak.ts     ← 연속 커밋 스트릭

확인 기준
  console.log(analysisResult) 로 5개 지표가 모두 채워진 객체가 나오면 완료
```

### 3단계: 카드 UI

`AnalysisResult`를 각 카드 컴포넌트에 props로 넘겨 화면을 완성한다.

```
작업 파일
  components/cards/TimingCard.tsx   ← 코딩 타임 유형 카드
  components/cards/WeekdayCard.tsx  ← 요일별 분포 카드
  components/cards/LanguageCard.tsx ← 언어 비중 카드
  components/cards/StreakCard.tsx   ← 스트릭 카드
  components/cards/SummaryCard.tsx  ← 총평 카드
  components/charts/              ← Recharts 차트 연결

확인 기준
  /report 화면에서 실제 데이터로 카드 5장이 슬라이드되면 완료
```

### 4단계: 이미지 저장

`html-to-image`로 카드 영역을 PNG로 캡처하는 기능을 붙인다.

```
작업 위치
  app/report/page.tsx 의 "이미지로 저장" 버튼 핸들러

주의
  차트가 SVG 기반이면 캡처가 안정적으로 동작함
  캡처 직전에 500ms delay를 넣어야 차트 렌더링이 완료된 시점에 캡처됨
```
