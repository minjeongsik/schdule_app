# Map Scheduler User Guide

## 한눈에 보기

이 프로젝트는 약속 일정과 장소를 함께 관리하는 간단한 웹 도구다.

- 왼쪽: 약속 생성 및 수정
- 가운데: 등록된 약속 목록
- 오른쪽: 장소 등록 및 장소 목록

## 기본 사용 흐름

1. 서버와 클라이언트를 실행한다.
2. 처음에는 오른쪽 `장소 관리`에서 집, 회사, 미팅 장소를 등록한다.
3. 왼쪽 `새 약속 만들기`에서 제목, 시간, 이동 방식, 도착 장소를 입력한다.
4. 가운데 목록에서 약속을 클릭하면 수정 모드로 바뀐다.
5. 수정이 끝나면 `약속 수정하기`, 삭제하려면 `삭제`를 누른다.

## DB를 쉽게 관리하는 방법

개발용 DB 관리는 Prisma Studio를 쓰는 것이 가장 쉽다.

```powershell
npm.cmd --workspace server run db:studio
```

열리면 아래 테이블을 화면에서 바로 확인할 수 있다.

- `User`
- `Place`
- `Appointment`
- `SavedRoute`
- `Tag`
- `AppointmentTag`

초기 MVP에서는 주로 `Place`, `Appointment`만 보면 된다.

## seed 데이터

아래 기본 데이터가 준비되어 있다.

- 사용자: `demo-user`
- 장소: `home-place`, `office-place`
- 샘플 약속: `demo-appointment`

## 구조 설명

- `server/prisma/schema.prisma`
  Prisma DB 구조 정의
- `server/src/modules/appointments`
  약속 CRUD API
- `server/src/modules/places`
  장소 조회/생성 API
- `client/src/pages/SchedulerDashboardPage.tsx`
  실제 사용자 화면
- `client/src/hooks/use-scheduler.ts`
  API 호출과 캐시 갱신 처리

## 추천 작업 순서

1. 장소를 먼저 등록한다.
2. 약속을 등록한다.
3. 목록에서 수정과 삭제를 반복한다.
4. 필요할 때 Prisma Studio로 DB 상태를 직접 확인한다.
