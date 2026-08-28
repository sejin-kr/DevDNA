# DevDNA

> GitHub 로그인 한 번으로 내 코딩 습관을 시각화된 리포트로 받아보는 셀프 분석 웹앱

---

## 소개

GitHub 커밋 데이터를 분석해서 나의 코딩 DNA를 시각화해주는 웹앱입니다.

Spotify Wrapped처럼 내 데이터를 재미있게 시각화합니다.

---

## 주요 기능

- **GitHub OAuth 로그인** — 버튼 한 번으로 인증
- **커밋 데이터 분석** — 최근 1년치 커밋 자동 수집
- **5가지 지표 리포트**
  - 코딩 타임 유형 (🌙 이 시간에 왜 깨어있지 / 🌅 해 뜨기 전에 한 커밋 / ☕ 출근 전 모닝 커밋 / 💼 칼같은 업무시간 / 🍱 점심 먹고 슬쩍 한 커밋 / 😴 나른한 오후 코딩 / 🍕 치킨 시키고 코딩 / 🌃 오늘의 마지막 커밋)
  - 요일별 커밋 분포
  - 주력 언어 비중
  - 최장 연속 커밋 스트릭
  - 커밋 메시지 스타일
- **이미지 저장** — 리포트 카드를 PNG로 다운로드

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS |
| 인증 | NextAuth.js |
| 차트 | Recharts |
| 이미지 캡처 | html-to-image |
| 배포 | Vercel |

---

## 로컬 실행

### 1. 클론

```bash
git clone https://github.com/sejin-kr/DevDNA.git
cd DevDNA
yarn install
```

### 2. 환경변수 설정

`.env.local` 파일을 루트에 생성합니다.

```
GITHUB_ID=발급받은_Client_ID
GITHUB_SECRET=발급받은_Client_Secret
NEXTAUTH_SECRET=랜덤_시크릿_키
NEXTAUTH_URL=http://localhost:3000
```

> `NEXTAUTH_SECRET`은 아래 명령으로 생성합니다.
> ```bash
> openssl rand -base64 32
> ```

### 3. 실행

```bash
yarn dev
```

`http://localhost:3000` 접속

---

## GitHub OAuth App 설정

1. [GitHub Developer Settings](https://github.com/settings/developers) 접속
2. New OAuth App 생성
3. 아래 값 입력:
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Client ID / Client Secret 발급 후 `.env.local`에 입력

---

## 라이선스

MIT
