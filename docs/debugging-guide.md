# Debugging Guide

## 빠른 진입점

- 프론트 실행: `npm.cmd run dev:client`
- 서버 실행: `npm.cmd run dev:server`
- 전체 실행: `npm.cmd run dev`

## 백엔드 확인 위치

- [app.ts](/D:/AI사업/web/cli/server/src/app.ts): 라우터 조립
- [request-context.ts](/D:/AI사업/web/cli/server/src/middlewares/request-context.ts): `requestId` 부여
- [error-handler.ts](/D:/AI사업/web/cli/server/src/middlewares/error-handler.ts): 공통 에러 응답
- [appointments.service.ts](/D:/AI사업/web/cli/server/src/modules/appointments/appointments.service.ts): appointment, route 로직
- [places.service.ts](/D:/AI사업/web/cli/server/src/modules/places/places.service.ts): place user scope 검증

## 프론트 확인 위치

- [client.ts](/D:/AI사업/web/cli/client/src/api/client.ts): API 요청, 응답, 에러 변환
- [SchedulerDashboardPage.tsx](/D:/AI사업/web/cli/client/src/pages/SchedulerDashboardPage.tsx): 메인 화면 로직
- [use-scheduler.ts](/D:/AI사업/web/cli/client/src/hooks/use-scheduler.ts): React Query query, mutation 연결

## 로그 확인 방법

- 브라우저 콘솔에서 `api:request`, `api:response`, `api:error` 확인
- 서버 콘솔에서 requestId 기준으로 같은 요청 추적
- 에러 응답의 `requestId`가 있으면 서버 로그와 같이 본다

## 자주 보는 문제

1. places, appointments가 비어 있거나 500이 발생함
   - `/api/health` 확인
   - `databaseUrl`이 `server/prisma/dev.db`를 가리키는지 확인
   - 서버 재시작
2. appointment 생성 실패
   - origin, destination place가 같은 user 소유인지 확인
3. route 생성 실패
   - appointment에 origin place가 있는지 확인
   - `distanceMeters`, `durationSeconds`가 0보다 큰지 확인
   - waypoint 형식이 `name|lat|lng` 또는 `lat|lng`인지 확인
4. route 선택이 반영되지 않음
   - `/api/appointments/:id/routes/:routeId/select` 응답 확인
   - appointments query invalidation 여부 확인
5. place 삭제가 실패함
   - appointment가 해당 place를 참조 중인지 확인
   - UI에서 form error가 표시되는지 확인

## 레거시 주의

`todo` 서비스와 문서는 현재 런타임에 연결되어 있지 않습니다. scheduler 문제를 볼 때는 `modules/appointments`, `modules/places`, `client/src/pages/SchedulerDashboardPage.tsx`를 우선 확인하면 됩니다.
