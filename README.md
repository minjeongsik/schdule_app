# Map Scheduler MVP

지도 기반 일정/장소 관리 MVP입니다. 현재 앱은 `Place`, `Appointment`, `Route candidate`, `Waypoint` 흐름을 중심으로 동작합니다.

## 포함 기능

- 장소 등록, 수정, 삭제
- 일정 등록, 수정, 삭제
- 일정별 route candidate 조회, 생성, 수정, 삭제
- 선택 route 변경
- waypoint 저장
- Express + Prisma + SQLite 기반 API

## 프로젝트 구조

```text
client/  React + Vite 프론트엔드
server/  Express + Prisma 백엔드
docs/    운영/사용 문서
e2e/     E2E 테스트
```

## 실행 방법

### 1. 의존성 설치

```powershell
npm.cmd install
```

### 2. 서버 환경 파일 준비

```powershell
Copy-Item server/.env.example server/.env
```

기본값:

```env
DATABASE_URL="file:./prisma/dev.db"
```

### 3. DB 준비

```powershell
npm.cmd --workspace server run prisma:generate
npm.cmd --workspace server run db:push
npm.cmd --workspace server run db:seed
```

### 4. 개발 서버 실행

```powershell
npm.cmd run dev
```

접속 주소:

- 프론트엔드: `http://127.0.0.1:5173`
- API: `http://127.0.0.1:4000`
- Health Check: `http://127.0.0.1:4000/api/health`

## 기본 사용 흐름

1. 장소를 먼저 등록합니다.
2. origin/destination을 포함한 일정을 생성합니다.
3. 선택한 일정 아래에서 route candidate를 추가합니다.
4. 필요하면 route candidate를 수정하거나 삭제합니다.
5. 가장 적절한 route candidate를 선택합니다.

## 주요 API

```http
GET    /api/appointments?userId=demo-user
POST   /api/appointments
PATCH  /api/appointments/:id
DELETE /api/appointments/:id

POST   /api/appointments/:id/routes
PATCH  /api/appointments/:id/routes/:routeId
PATCH  /api/appointments/:id/routes/:routeId/select
DELETE /api/appointments/:id/routes/:routeId

GET    /api/places?userId=demo-user
POST   /api/places
PATCH  /api/places/:id
DELETE /api/places/:id?userId=demo-user
```

## 샘플 데이터

seed 실행 시 아래 데이터가 생성됩니다.

- `userId`: `demo-user`
- `originPlaceId`: `home-place`
- `destinationPlaceId`: `office-place`
- `appointmentId`: `demo-appointment`

## 레거시 참고

`todo` 관련 파일은 현재 런타임 경로에 연결되어 있지 않은 레거시 코드입니다. 현재 앱 동작은 scheduler 모듈 기준으로 보시면 됩니다.
