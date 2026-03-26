# QA Checklist

## 실행 전 확인

- `npm.cmd install` 완료
- `server/.env` 준비 완료
- `4000`, `5173` 포트 사용 가능

## 기본 동작

- `npm.cmd run dev`로 서버와 클라이언트가 함께 실행된다
- 브라우저에서 `http://127.0.0.1:5173` 접속이 가능하다
- 초기 일정 목록과 장소 목록이 로드된다

## 장소 관리

- 새 place 생성이 가능하다
- 기존 place 수정이 가능하다
- 사용 중이 아닌 place 삭제가 가능하다
- 다른 user 소유 place에는 접근하지 못한다

## 일정 관리

- 새 appointment 생성이 가능하다
- 기존 appointment 수정이 가능하다
- appointment 삭제가 가능하다
- origin/destination place 검증이 동작한다

## Route Candidate

- appointment 선택 후 route candidate 생성이 가능하다
- waypoint를 함께 저장할 수 있다
- route candidate 수정이 가능하다
- route candidate 삭제가 가능하다
- 선택 route 변경이 가능하다
- 선택된 route를 삭제하면 남은 route 중 하나가 fallback selected 처리된다

## 오류 처리

- 잘못된 입력 시 field error가 표시된다
- submit 실패 시 form error가 표시된다
- 초기 로딩 실패 시 page error가 표시된다

## 검증 명령

- `npm.cmd --workspace server run lint`
- `npm.cmd --workspace server run build`
- `npm.cmd --workspace client run lint`
- `npm.cmd --workspace client run test`
- `npm.cmd --workspace client run build`

## 레거시 참고

- `todo` 관련 체크리스트와 E2E는 현재 scheduler 기준 검증과 분리된 레거시 항목이다
