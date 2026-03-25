# Map Scheduler MVP

지도 기반 약속 스케줄러의 MVP다. 지금은 웹 사용자 UI와 Express + Prisma API가 연결되어 있어서 장소와 약속을 브라우저에서 직접 관리할 수 있다.

## 포함된 기능

- 웹 사용자 UI
  약속 등록, 수정, 삭제
- 장소 관리 UI
  장소 등록과 목록 확인
- DB 관리 UI
  Prisma Studio로 테이블 직접 확인
- 백엔드 API
  `appointments` CRUD, `places` 조회/생성
- SQLite + Prisma
  로컬 실행용 단순 구조

## 프로젝트 구조

```text
client/  사용자 웹 화면
server/  Express + Prisma API
docs/    사용자 가이드
```

## 실행 방법

### 1. 전체 의존성 설치

```powershell
npm.cmd install
```

### 2. 서버 환경 변수 준비

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

- 웹 UI: `http://127.0.0.1:5173`
- API: `http://127.0.0.1:4000`
- Health Check: `http://127.0.0.1:4000/api/health`

## DB 관리 UI

Prisma Studio로 DB를 직접 확인할 수 있다.

```powershell
npm.cmd --workspace server run db:studio
```

여기서 `User`, `Place`, `Appointment` 테이블을 바로 확인하고 수정할 수 있다.

## 기본 사용자 흐름

1. 웹 화면에 접속한다.
2. 오른쪽 `장소 관리`에서 장소를 먼저 등록한다.
3. 왼쪽 `새 약속 만들기`에서 제목, 시간, 이동 방식, 장소를 선택한다.
4. 가운데 목록에서 약속을 눌러 수정한다.
5. 필요하면 Prisma Studio로 DB 상태를 직접 확인한다.

## 샘플 데이터

seed 실행 후 바로 사용할 수 있는 기본 데이터:

- `userId`: `demo-user`
- `originPlaceId`: `home-place`
- `destinationPlaceId`: `office-place`
- `appointmentId`: `demo-appointment`

## 주요 API

```http
GET    /api/appointments?userId=demo-user
POST   /api/appointments
PATCH  /api/appointments/:id
DELETE /api/appointments/:id
GET    /api/places
POST   /api/places
```

## 문서

상세 사용 설명은 [user-guide.md](/D:/AI사업/web/cli/docs/user-guide.md)에 정리했다.
