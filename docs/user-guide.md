# Map Scheduler User Guide

## 화면 구성

- 왼쪽: appointment 생성/수정, route candidate 관리
- 가운데: appointment 목록
- 오른쪽: place 관리
- 하단: 선택된 route의 waypoint 확인

## 기본 사용 순서

1. place를 먼저 등록합니다.
2. origin place와 destination place를 선택해 appointment를 생성합니다.
3. 생성된 appointment를 선택합니다.
4. route candidate를 추가합니다.
5. 필요하면 route를 수정/삭제하거나 다른 route를 selected 상태로 바꿉니다.

## Route 입력 방식

route candidate 생성/수정 시 waypoint는 한 줄에 하나씩 입력합니다.

- `name|lat|lng`
- `lat|lng`

예시:

```text
Transfer stop|37.5142|127.0418
37.5290|127.0120
```

## Prisma Studio 사용

```powershell
npm.cmd --workspace server run db:studio
```

확인할 테이블:

- `User`
- `Place`
- `Appointment`
- `SavedRoute`
- `Waypoint`

## 샘플 데이터

- user: `demo-user`
- places: `home-place`, `office-place`
- appointment: `demo-appointment`

## 현재 MVP 범위

- place user scope 적용
- appointment별 다수 route candidate 지원
- route별 waypoint 저장 지원
- 프론트 에러를 field/form/page로 구분

## 레거시 참고

`todo` 파일은 참고용 레거시입니다. 현재 사용자 흐름은 scheduler 화면만 기준으로 보면 됩니다.
