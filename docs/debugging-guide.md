# Debugging Guide

## 빠른 진입점

- 프론트 실행: `npm.cmd run dev:client`
- 백엔드 실행: `npm.cmd run dev:server`
- 전체 실행: `npm.cmd run dev`

## 백엔드 디버깅 포인트

- [app.ts](/E:/min/job/ai/cli/server/src/app.ts): 라우트와 미들웨어 결합 지점
- [request-context.ts](/E:/min/job/ai/cli/server/src/middlewares/request-context.ts): 요청 시작/종료 로그와 `requestId`
- [todo-controller.ts](/E:/min/job/ai/cli/server/src/controllers/todo-controller.ts): HTTP 진입점
- [todo-service.ts](/E:/min/job/ai/cli/server/src/services/todo-service.ts): 검증과 도메인 로직
- [todo-repository.ts](/E:/min/job/ai/cli/server/src/repositories/todo-repository.ts): SQLite CRUD 쿼리
- [error-handler.ts](/E:/min/job/ai/cli/server/src/middlewares/error-handler.ts): 공통 오류 응답

## 프론트 디버깅 포인트

- [client.ts](/E:/min/job/ai/cli/client/src/api/client.ts): 요청/응답 로그
- [TodoDashboardPage.tsx](/E:/min/job/ai/cli/client/src/pages/TodoDashboardPage.tsx): CRUD 동작 흐름
- [TodoForm.tsx](/E:/min/job/ai/cli/client/src/components/TodoForm.tsx): 폼 제출과 프론트 검증
- [DebugPanel.tsx](/E:/min/job/ai/cli/client/src/components/DebugPanel.tsx): 현재 상태 스냅샷

## 로그 확인 방법

- 브라우저 개발자 도구 콘솔에서 `api:*`, `ui:*` 로그 확인
- 서버 콘솔에서 `request:start`, `request:end`, `todo-service:*` 로그 확인

## 대표 재현 시나리오

1. 제목 없이 생성 시도
2. 네트워크 탭에서 `/api/todos` 요청과 400 응답 확인
3. 서버 콘솔에서 동일한 `requestId` 추적
4. `error-handler` 응답 payload 확인
