# mail-blog — Gmail 뉴스레터 파서 (백엔드 API)

Gmail API로 머니레터 등 특정 메일을 가져와 파싱하고, JSON API로 제공합니다. 프론트엔드는 별도 프로젝트에서 이 API를 호출합니다.

## 설치

```bash
npm install
cp .env.example .env   # 필요 시 PORT, CORS_ORIGIN 수정
```

## 실행

### 백엔드 + 프론트 동시 실행 (권장)

```bash
./script/dev.sh
# 또는
npm run dev:all
```

- 백엔드: http://localhost:3001
- 프론트: http://localhost:5173
- `Ctrl+C` 로 둘 다 종료

### API 서버만

```bash
npm run dev
# http://localhost:3001
```

### CLI (터미널에 JSON 출력)

```bash
npm run dev:cli
```

### 프로덕션 빌드

```bash
npm run build
npm start
```

## 수신 대상 뉴스레터

기본적으로 아래 **두 발신자만** Gmail에서 가져옵니다.

| 표시 이름 | 이메일 |
|-----------|--------|
| UPPITY | `moneyletter@uppity.co.kr` |
| DAILY_BYTE | `byteteam365@mydailybyte.com` |

설정: `src/config/newsletters.ts` — 다른 메일은 검색 결과에서도 제외됩니다.

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/health` | 서버 상태 |
| GET | `/api/auth/status` | Gmail OAuth 설정·토큰 상태 |
| GET | `/api/emails?q=&limit=` | Gmail 검색 + 파싱 |
| POST | `/api/emails/sync` | 동일 (body: `{ "q", "limit" }`) |

### 예시

```bash
curl http://localhost:3001/health

curl "http://localhost:3001/api/emails?limit=3"

curl -X POST http://localhost:3001/api/emails/sync \
  -H "Content-Type: application/json" \
  -d '{"q":"from:moneyletter@uppity.co.kr newer_than:7d","limit":5}'
```

### 응답 형식

```json
{
  "success": true,
  "data": [ { "gmailMessageId", "subject", "parsed", ... } ],
  "meta": { "count": 3, "query": "...", "limit": 3 }
}
```

## 폴더 구조

```
src/
├── server.ts              # HTTP 서버 진입점
├── app.ts                 # Express 앱 설정
├── routes/                # URL 라우팅
├── controllers/           # 요청/응답 처리
├── services/              # Gmail·동기화 비즈니스 로직
├── parsers/               # HTML·뉴스레터 파싱
├── middleware/            # 에러 핸들러
├── config/
├── types/
└── cli/sync-emails.ts     # CLI 전용
```

## credentials.json

Google Cloud **OAuth 클라이언트 JSON**을 프로젝트 루트에 `credentials.json`으로 둡니다. `token.json`은 최초 인증 후 생성됩니다. **둘 다 Git에 올리지 마세요.**

### redirect_uri_mismatch

`credentials.json`이 `"web"`만 있으면 Console에 `http://localhost:3000/oauth2callback` 등록이 필요합니다. **데스크톱 앱** JSON(`"installed"`) 사용을 권장합니다.

## 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `PORT` | `3001` | API 포트 |
| `CORS_ORIGIN` | `http://localhost:5173` | 프론트 origin (쉼표 구분) |
| `GMAIL_QUERY` | (기본 검색어) | CLI/API 공통 |
| `GMAIL_MAX_RESULTS` | `10` | 최대 건수 |

## 프론트엔드 (NewsBrief UI)

Pencil 디자인(`../pencil/news_blog.pen`) 기반 React 앱입니다.

```bash
cd frontend
npm install
npm run dev    # http://localhost:5173
```

**기본은 목업 데이터**로 동작합니다 (`VITE_USE_MOCK=true`). 백엔드 API를 쓰려면 `frontend/.env`에 `VITE_USE_MOCK=false`를 설정하세요.

```bash
# frontend/.env
VITE_USE_MOCK=false
```

목업 모드에서는 프론트만 단독 실행해도 됩니다. API 연동 시 백엔드가 함께 떠 있어야 하며, Vite proxy가 `/api`를 `localhost:3001`로 전달합니다.

### 페이지

| 경로 | 화면 |
|------|------|
| `/` | 메인 |
| `/article/:id` | 글 상세 |
| `/category/:slug` | 카테고리 |
| `/search` | 검색 |
| `/about` | 소개 |
| `/contact` | 문의 |
| `/subscribe` | 구독 |
| `/privacy` | 개인정보처리방침 |
| `/terms` | 이용약관 |

## 다음 단계

- `repositories/` + Supabase 저장
- `GET /api/emails/:id` (DB 조회)
