# QA Checklist

## 사전 확인

- `npm.cmd install` 완료
- `server/.env` 설정 완료
- `DATABASE_URL="file:./prisma/dev.db"` 확인
- `4000`, `5173` 포트 사용 가능

## 기본 동작

- `npm.cmd run dev`로 서버와 클라이언트가 함께 실행된다
- 브라우저에서 `http://127.0.0.1:5173` 접속이 가능하다
- 초기 화면에서 appointments, places가 모두 로드된다
- `/api/health` 응답이 200이고 `databaseUrl`이 `server/prisma/dev.db`를 가리킨다

## Place 관리

- 새 place 생성이 가능하다
- 기존 place 수정이 가능하다
- 사용 중이 아닌 place 삭제가 가능하다
- 다른 user 소유 place는 조회하거나 수정할 수 없다
- appointment에서 참조 중인 place 삭제 시 form error가 표시된다

## Appointment 관리

- 새 appointment 생성이 가능하다
- 기존 appointment 수정이 가능하다
- appointment 삭제가 가능하다
- origin/destination place 검증이 동작한다
- 초기 로딩 실패 시 page error가 표시된다

## Route Candidate

- appointment 선택 후 route candidate 생성이 가능하다
- waypoint를 함께 저장할 수 있다
- route candidate 수정이 가능하다
- route candidate 삭제가 가능하다
- 다른 candidate를 selected 상태로 변경할 수 있다
- selected route 삭제 시 다른 route 하나가 fallback selected 처리된다

## 에러 처리

- 잘못된 입력 시 field error가 입력 옆에 표시된다
- submit 실패 시 form error가 섹션 내부에 표시된다
- route 선택 실패 시 route 섹션에 form error가 표시된다
- appointments 또는 places 로딩 실패 시 page error가 어떤 리소스 실패인지 드러난다

## 수동 QA 순서

1. place 생성
2. appointment 생성
3. route candidate 생성
4. route candidate 선택 변경
5. route candidate 수정
6. selected route 삭제 후 fallback 확인
7. place 삭제 충돌 확인

## 검증 명령

- `npm.cmd --workspace server run lint`
- `npm.cmd --workspace server run build`
- `npm.cmd --workspace server run test`
- `npm.cmd --workspace client run lint`
- `npm.cmd --workspace client run test`
- `npm.cmd --workspace client run build`

## 레거시 참고

- `todo` 관련 체크리스트와 E2E는 현재 scheduler 검증과 분리된 레거시 영역이다
- 이번 QA 범위는 `places`, `appointments`, `route candidates`, `waypoints`에 한정한다
