<div align="center">
  <img src="public/BYBAEK_icon.svg" alt="BYBAEK" width="96" height="96" />

  # BYBAEK — Frontend

  > 바버샵 AI 마케팅 자동화 에이전트 — Next.js 프론트엔드
</div>

---

## 🔗 배포 URL

| 서비스 | URL |
|---|---|
| **Website** | https://www.bybaekofficial.com |
| **Backend API** | https://api2.bybaekofficial.com |

---

## Tech Stack

| 구분 | 기술 |
|---|---|
| Framework | Next.js 16 (App Router, standalone output) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| HTTP 클라이언트 | Axios |
| 런타임 | Node.js 22.x |
| 배포 | Azure App Service (standalone) · GitHub Actions (`main` push → 자동 배포) |

---

## 역할 분담

| 팀원 | 담당 | 주요 작업 |
|---|---|---|
| 차명근 ([@Etchroot](https://github.com/Etchroot)) | 레거시 | 초기 프론트엔드 구조 및 화면 구현 (레거시), Blob/Cosmos 연결 |
| 이지현 ([@lifeiscabaret](https://github.com/lifeiscabaret)) | UI/UX · 프론트엔드 | UI/UX 개선 및 개선안 설계 |

---

## 폴더 구조

```
bybaek-frontend/
├── src/
│   ├── app/                       # Next.js App Router 페이지
│   │   ├── layout.tsx             # 공통 레이아웃
│   │   ├── page.tsx               # 루트 → 로그인/대시보드 분기
│   │   ├── login/page.tsx         # 로그인 (언어→MS→OneDrive→Instagram)
│   │   ├── auth/callback/page.tsx # OAuth 콜백 핸들러
│   │   ├── onboarding/            # 온보딩 (intro + 설문)
│   │   ├── dashboard/             # 메인 (posts / ai-upload / auto-upload / analytics / settings)
│   │   ├── preview/page.tsx       # AI 게시물 생성/검토
│   │   ├── review/page.tsx        # 이메일 기반 게시물 검토
│   │   ├── photos/ · album/       # 사진 브라우저 / 앨범
│   │   └── setting/ · mypage/     # 설정 / 마이페이지
│   ├── components/                # 재사용 UI 컴포넌트
│   ├── hooks/                     # 커스텀 React Hooks (useTranslation 등)
│   ├── api/
│   │   ├── index.ts               # axios 기본 설정 (baseURL, withCredentials)
│   │   └── agent.ts               # AI 에이전트 파이프라인 API
│   └── locales/
│       └── translations.ts        # 다국어(i18n) 번역 키
└── public/                        # 정적 파일 (로고 등)
```

---

## 로컬 세팅 방법

### 0. Node.js 버전 확인 (22.x 고정)

```bash
node --version  # v22.x.x 이어야 함
```

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_INSTAGRAM_CLIENT_ID=2203308117098677
```

> `NEXT_PUBLIC_*` 값은 **빌드 시점에 코드로 인라인**됩니다. CI(GitHub Actions) 빌드에서는 동일 값을 repo의 Variables/Secrets에 등록해야 합니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 열기

---

## 백엔드 연동

모든 API 요청은 `src/api/` 폴더에서 관리. 프로덕션 백엔드는 `https://api2.bybaekofficial.com` 이며,
로컬 개발 시에는 `.env.local`의 `NEXT_PUBLIC_API_BASE_URL`로 로컬 서버(`http://localhost:8000`)를 가리키도록 재정의한다.

```typescript
// src/api/index.ts - axios 기본 설정
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api2.bybaekofficial.com/api",
  withCredentials: true,
});

export default apiClient;
```

---

## 주요 화면

| 화면 | URL | 설명 |
|---|---|---|
| 로그인 | `/login` | 언어 선택 → MS → OneDrive QR → Instagram |
| 온보딩 | `/onboarding` | 스무고개(20문항) 개인화 설문 |
| 대시보드 | `/dashboard` | 게시물 목록·생성 (`/posts`, `/ai-upload`, `/auto-upload`, `/analytics`, `/settings`) |
| 미리보기 | `/preview` | AI 생성 게시물 검토 (OK/수정/취소) |
| 검토 | `/review` | 이메일 기반 게시물 검토 |
| 사진/앨범 | `/photos`, `/album` | OneDrive 동기화 사진 브라우저·앨범 관리 |
| 설정 | `/setting` | 개인화·계정 연결·업로드 스케줄 |

---

## 배포 (CI/CD)

`main` 브랜치에 push되면 GitHub Actions가 자동으로 빌드하여 Azure App Service(`bybaek-frontend`, `rg-bybaek`)에 배포한다.

- **워크플로:** `.github/workflows/deploy.yml`
- **런타임:** Node 22, standalone 빌드 → 시작 명령 `node server.js`
- **패키징:** `next build` 후 `.next/static`·`public`을 `.next/standalone/` 안으로 복사하여 그 폴더를 배포

### 필요한 GitHub 설정 (repo → Settings → Secrets and variables → Actions)

**Variables**
| Name | Value |
|---|---|
| `AZURE_WEBAPP_NAME` | `bybaek-frontend` |
| `NEXT_PUBLIC_INSTAGRAM_CLIENT_ID` | Instagram(Meta) 앱 ID |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api2.bybaekofficial.com/api` |

**Secrets**
| Name | Value |
|---|---|
| `AZURE_WEBAPP_PUBLISH_PROFILE` | App Service 게시 프로필 XML 전체 |

> ⚠️ `NEXT_PUBLIC_*`는 **빌드 시점에 인라인**되므로 CI 빌드 스텝의 env에 반드시 존재해야 한다. 없으면 빈 값이 박혀 인스타 연동 등이 깨진다.

### 배포 대상 전환 / 되돌리기 (파일 수정 0)

배포 대상은 워크플로에서 GitHub Variables/Secrets로 파라미터화되어 있다. 다른 App Service로 옮기거나 되돌릴 때는 값만 교체하면 된다.

- `AZURE_WEBAPP_NAME` → 대상 App Service 이름
- `AZURE_WEBAPP_PUBLISH_PROFILE` → 해당 App Service 게시 프로필
- 필요 시 `NEXT_PUBLIC_*` 값도 함께 교체

---

## Branch 전략

```
main     → 최종 배포 (직접 push 금지, PR만)
dev      → 개발 통합 (모든 feature는 여기로 PR)
feature/ → 개인 작업 브랜치
```

작업 시작 전 반드시:
```bash
git checkout dev
git pull origin dev
git checkout -b feature/내작업이름
```

---

## Commit Message Convention

| Type | 설명 |
|---|---|
| `[FEAT]` | 새 기능 추가 |
| `[FIX]` | 버그 수정 |
| `[REFACTOR]` | 리팩토링 |
| `[DOCS]` | 문서 수정 |
| `[STYLE]` | 스타일/포맷 변경 |
| `[CHORE]` | 설정/패키지 변경 |

예시:
```
[FEAT] Add dashboard screen with post generation trigger
[FIX] Fix preview image not loading from blob URL
[STYLE] Update onboarding UI layout
```

---

## 주의사항

- `.env.local` 파일 절대 GitHub에 올리지 않기
- `node_modules/` 절대 GitHub에 올리지 않기
- API 키는 반드시 팀 채널을 통해서만 공유
- 작업 시작 전 항상 `git pull origin dev` 먼저
- `main` 브랜치에 직접 push 금지
- PR은 최소 1명 리뷰 후 merge
