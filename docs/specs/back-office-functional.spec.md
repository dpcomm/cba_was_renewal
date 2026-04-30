## 0. 공통 운영 원칙

- 기본 조회 기준은 **현재 활성 수련회 / 현재 활성 학기**를 우선 사용하고, 필요 시 상단 드롭다운으로 다른 `retreat`, `term` 을 선택 가능하게 한다.
- 리스트 화면은 기존처럼 **검색 + 필터 + 페이지네이션 + 우측 상세/편집** 패턴을 유지한다.
- 삭제는 가능한 한 **실삭제보다 비활성/사용 중지 우선**으로 잡는다. 신청 데이터와 연결된 `retreat`, `survey`, `question`, `retreat_meal`, `retreat_transport` 는 RESTRICT 성격이 강하므로 운영에서도 “삭제”보다는 “노출 중지/수정 제한” 개념으로 가는 게 맞다.
- 저장은 신청/설문/식사/교통처럼 연관 데이터가 묶인 경우 **트랜잭션 단위**로 처리한다.

---

## 1. 대시보드

### 화면 유지 방향

지금 스크린샷의 상단 KPI 카드, 그룹별 원형 차트, 식수 현황 바 형태는 그대로 살린다.

### 목적

현재 활성 수련회 기준으로 신청/납부/체크인/식수 현황을 빠르게 확인하는 운영 대시보드.

### 필수 기능

- 전체 등록 비율
- 전체 납부 비율
- 전체 현장 등록(체크인) 비율
- 그룹별 등록/납부/체크인 비율
- 식사별 신청 인원 집계
- 엑셀 다운로드
- 수련회 선택 필터

### 스키마 기준 변경 포인트

- “현장 등록 여부”는 단순 불리언이 아니라 `application.status = CHECKED_IN` 및 `checked_in_at` 기반으로 계산한다.
- “회비 납부 여부”는 불리언이 아니라 `payment_status` enum(`PENDING/PAID/REFUNDED/EXEMPTED`) 기반으로 본다.
- 식수 집계는 `application_meal` 과 `retreat_meal(meal_day, meal_type)` 기준으로 산출한다.
- 그룹별 통계는 `user.group` 과 `application` 조인 기준으로 본다. `Dashboard summary`, `group-stats` API 는 이미 존재한다.

### 추가 결정 필요

- 등록률 분모를 “전체 계정”으로 볼지 “해당 수련회 대상자”로 볼지
- 납부율에서 `EXEMPTED` 를 포함할지 별도 처리할지

---

## 2. 전체 계정 정보

### 화면 유지 방향

지금처럼 유저 목록 테이블 + 검색 + 수정 모드 구조를 유지한다.

### 목적

사용자 기본 정보와 계정 상태를 조회/수정하는 관리자 화면.

### 필수 기능

- 사용자 목록 조회
- 이름/아이디/소속/전화번호 검색
- 등급(`rank`) 수정
- 그룹 수정
- 전화번호, 생년월일, 성별, 이메일 수정
- 이메일 인증 상태 조회
- 탈퇴/비활성 여부 조회
- 상세 편집 모드

### 스키마 기준 변경 포인트

- 유저는 현재 `user_id`, `name`, `group`, `phone`, `birth`, `gender`, `rank`, `email`, `email_verified_at`, `is_deleted` 를 가진다.
- `rank` 는 `A/M` 이고, `gender` 는 `male/female/미지정` 계열로 본다.
- 기존 화면에 없던 `이메일`, `이메일 인증 상태`, `비활성 여부` 컬럼/상세 항목은 추가하는 게 맞다.
- 관리자 화면에서 `password` 직접 초기화 허용

### 추가 결정 필요

- `isDeleted` 사용자를 목록 기본 제외할지 포함할지

---

## 3. 수련회 관리

### 신규 추가가 필요한 메뉴

이건 기존 스크린샷엔 거의 없지만, 현재 스키마 기준으로 반드시 있어야 하는 운영 메뉴야.

### 목적

수련회 마스터 데이터와 연결된 설문/식사/교통/유튜브의 기준 객체를 관리.

### 필수 기능

- 수련회 목록 조회
- 수련회 생성/수정
- 제목, 장소, 시작일시, 종료일시 관리
- 현재 활성 수련회 지정(SystemConfig 연동)
- 연결된 설문/식사/교통/유튜브 관리 화면으로 이동

### 스키마 기준

`retreat` 는 현재 `title`, `location`(필수), `retreat_start_at`, `retreat_end_at`(필수) 중심이고, 하나의 수련회 아래에 `survey`, `retreat_meal`, `retreat_transport`, `application`, `youtube` 가 연결된다. `SystemConfig.currentRetreatId` 로 현재 운영 대상을 지정할 수 있다. (기존 데이터의 NULL 값은 일괄 정규화되었으므로 관리자 화면에서도 필수값 처리 필요)

### 운영 정책

- 이미 신청 데이터가 있는 수련회는 삭제보다 종료/비활성 개념 권장
- 활성 수련회 전환 시 대시보드/신청 현황/유튜브 화면 기본값도 같이 바뀌게 함

---

## 4. 수련회 등록 현황

### 기존 “수련회 등록 현황” 화면 유지

### 목적

수련회 신청 row(`Application`) 단위로 신청 상태를 운영 관리.

### 필수 기능

- 신청자 목록 조회
- 수련회 필터
- 이름/아이디/소속 검색
- 결제 상태 필터
- 체크인 상태 필터
- 신청 상세 보기
- 체크인 처리
- 필요 시 회비 상태 수정
- QR 스캔 조회 연동
- 엑셀 다운로드

### 스키마 기준 변경 포인트

- 기존 체크박스 UI는 유지해도 되지만 의미는 바뀐다.
  - “현장 등록 여부” → `status=CHECKED_IN`, `checked_in_at != null`
  - “회비 납부 여부” → `payment_status` enum
- `application` 은 `status`, `payment_status`, `checked_in_at`, `event_result`, `event_participated_at`, `retreat_id`, `survey_id`, `user_id` 를 가진다.
- 신청은 한 유저/한 수련회 1건이라 테이블 row 기준은 `application` 이다.
- 관리자용 목록/체크인/QR 조회 API 는 이미 있다.

### 상세 패널에서 보여줄 것

- 기본 정보
- 설문 응답
- 식사 선택
- 교통 선택
- 체크인 시각
- 결제 상태
- 이벤트 참여 결과

---

## 5. 수련회 신청서 관리

### 신규 추가가 필요한 메뉴

### 목적

수련회에 연결된 설문(`Survey`) 과 질문(`Question`) 을 관리.

### 필수 기능

- 수련회별 설문 조회
- 설문 기간 설정(`survey_start_at`, `survey_end_at`)
- 질문 목록 조회
- 질문 생성/수정/순서 변경
- 답변 타입 설정
- 필수 여부 설정(`is_required`)
- 객관식 보기 추가/수정/정렬
- 설문 미리보기
- 응답 상세 보기

### 스키마 기준

- `survey` 는 `retreat_id`, `survey_start_at`, `survey_end_at`
- `question` 은 `survey_id`, `title`, `answer_type`, `order_no`, `is_required`
- `question_option` 은 `question_id`, `label`, `order_no`
- `answer` 는 `application_id`, `question_id`, `question_option_id`, `content`
- 답변 타입은 `SINGLE_SELECT`, `MULTI_SELECT`, `SUBJECTIVE` 만 지원한다.

### 핵심 운영 규칙

- `application.survey_id` 로 제출 당시 설문 버전이 고정된다. (최근 DB 정규화로 모든 신청서는 유효한 `survey_id`를 필수(`NOT NULL`)로 가짐)
- `SINGLE_SELECT` 는 질문당 1개만 허용
- `MULTI_SELECT` 는 중복 option 금지
- `SUBJECTIVE` 는 `content` 필수
- 질문/보기는 응답이 쌓인 뒤엔 삭제보다 비활성 또는 숨김이 안전하다.

---

## 6. 식사 옵션 관리

### 수련회 관리 하위 탭으로 추가 추천

### 목적

수련회별 식사 슬롯 마스터를 관리하고, 대시보드/신청서의 식수 집계 기준을 제공.

### 필수 기능

- 식사 슬롯 목록 조회
- 날짜 + 식사 유형(아침/점심/저녁) 생성 (기존 `day_number` 대신 `meal_day` 실제 날짜 사용)
- 식단표(`meal_table`, JSON 배열 배열) 입력
- 중복 방지
- 신청자 수 집계 보기

### 스키마 기준

`retreat_meal` 은 `(retreat_id, meal_day, meal_type)` 유니크이며, `meal_table` 은 JSON 배열 형태다. 신청자 선택은 `application_meal` 로 관리된다.

### 화면 방향

기존 대시보드의 식수 그래프와 연결되도록 관리자용 목록은 단순 테이블이면 충분함.

---

## 7. 교통 옵션 관리

### 수련회 관리 하위 탭으로 추가 추천

### 목적

수련회별 출발/복귀 교통 옵션 마스터를 관리.

### 필수 기능

- 교통 옵션 목록 조회
- 방향(`DEPARTURE/RETURN`) 선택
- 수단(`OWN_CAR/CARPOOL/BUS/PUBLIC/OTHER`) 선택
- 이름 입력
- 차량번호 필수 여부(`is_vehicle_required`)
- 비고 필수 여부(`is_remark_required`)
- 신청자 수 보기

### 스키마 기준

`retreat_transport` 는 `(retreat_id, direction, transport_type, name)` 유니크다. 실제 신청자 선택은 `application_transport` 에 저장되며, 한 신청자는 방향별로 최대 1개만 선택 가능하다. `direction` 은 클라이언트 입력을 신뢰하지 않고 서버가 `retreat_transport.direction` 기준으로 저장한다.

### 화면 방향

별도 대시보드까진 필요 없고, 목록 + 신청자 수 + 옵션 수정 정도면 충분.

---

## ~~8. 유튜브 실황 링크~~

### 기존 “유튜브 실황 링크” 화면 유지

→ 해당 기능 보류

### 목적

수련회별 실황/다시보기용 유튜브 링크를 관리.

### 필수 기능

- 수련회별 링크 목록 조회
- 링크 생성
- 제목 수정
- 링크 수정
- 삭제
- 복사 액션

### 스키마 기준

`Youtube` 는 현재 `retreatId`, `title`, `link`, `createdAt` 정도만 가진 단순 구조다. 그래서 v1은 **단순 링크 관리**만 하고, 라이브/다시보기 타입, 노출 순서, 숨김 여부는 다음 단계로 미루는 게 맞다.

### 화면 유지 포인트

현재 모달 생성 UI 그대로 써도 충분함.

---

## 9. 선택식 강의 관리

### 기존 화면 유지, 단 “수련회 기준”이 아니라 “Term 기준”으로 재정의

### 목적

학기/시즌(`Term`) 소속 강의를 관리하고 정원/상세정보를 수정.

### 필수 기능

- 학기 선택
- 강의 목록 조회
- 강의 생성
- 강의 수정
- 강의 삭제
- 정원/현재 신청 인원 확인
- 강사/강사 소개/장소/시간 관리
- 수강자 상세 보기

### 스키마 기준 변경 포인트

- 강의는 `Retreat` 에 직접 매달리는 게 아니라 `Term` 에 속한다.
- `Lecture` 는 `title`, `introduction`, `instructor`, `instructorBio`, `location`, `currentCount`, `maxCapacity`, `startTime`, `term_id`, `codeNumber` 를 가진다.
- `LectureEnrollment` 로 수강자 연결되고 `(lectureId, userId)` 유니크다.

### API 기준

강의 생성/수정/삭제/상세, term 조회, term별 lecture 조회 API가 이미 있다.

---

## 10. 선택식 강의 배정

### 기존 화면 유지

### 목적

최신 수련회 참석자 또는 현재 활성 수련회 참석자를 강의에 수동/자동 배정.

### 필수 기능

- 학기 선택
- 강의별 현재 신청 인원/정원 보기
- 미배정 사용자 검색
- 강의별 명단 보기
- 자동 배정
- 수동 추가/제거
- 최신 수련회 참석자 일괄 등록

### API 기준

이미 `eligible-users`, `auto-assign`, `enroll-eligible`, `lecture/detail/{id}` API가 있다. 즉 화면은 유지하고, 대상자 기준만 `currentRetreatId` 또는 “최신 수련회 참석자”로 명확히 정의하면 된다.

### 추가 결정 필요

- 자동 배정 기준을 선착순으로 할지
- 그룹 균형 분산이 필요한지
- 정원 초과 시 미배정 처리 규칙

---

## 11. 공지사항

### 기존 2컬럼 화면 유지

### 목적

앱/운영 공지를 작성, 수정, 삭제, 조회.

### 필수 기능

- 공지 목록 조회
- 검색
- 공지 상세 조회
- 작성
- 수정
- 삭제
- 작성팀 선택

### 스키마 기준

현재 `Notice` 는 `author`, `title`, `body`, `createdAt`, `updatedAt` 중심의 단순 구조고, `author` 는 `GENERAL_AFFAIRS`, `DEVELOPMENT` enum 이다. 즉 지금 화면처럼 **단순 공지 CRUD** 는 정확히 스키마와 맞는다.

### 이번 단계에서 빼는 것

- 공지 카테고리
- 상단 고정
- 예약 게시
- 수련회별 노출 대상
- 첨부파일
- 리치 에디터
  이건 현재 스키마엔 없어서 v2로 미루는 게 맞다.

---

## 12. Push 알림

### 기존 화면 유지, 다만 “DB 스키마보다 API 중심 기능”으로 정의

### 목적

일반 푸시 발송, 예약 발송, 공지 기반 푸시 발송을 운영자가 처리.

### 필수 기능

- 공지 기반 Push 발송
- 푸시만 보내기
- 즉시 발송 / 예약 발송
- 예약 목록 조회
- 예약 취소
- 제목/본문 구성
- 발송 타입 전환

### API 기준

`pushNotification`, `pushNotification/reserve`, `pushNotification/reservation`, `pushNotification/cancel/{id}`, `pushNotification/notice/{id}` API 는 이미 있다. 사용자 단말 토큰은 `FcmToken`, `ExpoPushToken` 으로 관리된다.

### 주의점

현재 업로드된 스키마 문서에는 **푸시 예약 작업 자체를 저장하는 테이블은 안 보이고 토큰 테이블만 보인다.**

그래서 기능명세엔 일단 화면을 살리되, 백엔드팀 확인 항목으로 아래를 넣는 게 좋아.

- 예약 작업 저장 위치
- 발송 결과 이력 저장 위치
- 공지 기반 푸시가 notice snapshot 기반인지 live read 기반인지

---

## 13. 이메일 등록 / 비밀번호 초기화

### 기존 “전체 계정 정보” 하위 액션으로 넣는 게 가장 자연스러움

### 목적

계정 복구와 이메일 인증 상태 운영 관리.

### 필수 기능

- 이메일 등록/변경
- 인증 여부 조회
- 인증 메일 재발송
- 비밀번호 재설정 트리거
- 필요 시 아이디 찾기 지원 안내

### 현재 구조

`User` 에는 `email`, `emailVerifiedAt` 가 있고, 인증 코드 발송/검증, 비밀번호 재설정, 이메일 변경 API 도 이미 있다. 그래서 별도 큰 메뉴보다 **유저 상세 액션** 으로 붙이는 게 좋다.

---

## 14. 시스템 설정

### 신규 추가 추천, 아주 작은 설정 화면이면 됨

### 목적

현재 운영 기준인 활성 수련회와 활성 학기를 지정.

### 필수 기능

- 현재 활성 수련회 선택
- 현재 활성 학기 선택
- 시스템 설정 조회/수정

### 기준

`SystemConfig` 는 단일 레코드이고 `currentRetreatId`, `currentTermId` 를 가진다. 백오피스 대부분의 기본 조회 기준을 여기서 가져오게 하면 화면 전환 시 UX가 훨씬 깔끔해진다. `GET /api/v2/system`, `PUT /api/v2/system/admin` 도 이미 있다.

---

## 15. 수련회 실황 (주석처리 상태)

### 방향

기존 메뉴를 완전히 없애기보다 **feature flag / 메뉴 숨김 상태** 로 두는 게 좋다.

### 이유

지금은 유튜브 링크 기능이 이미 있기 때문에, “실황” 전용 메뉴는 중복될 수 있다. 우선은 숨겨두고, 나중에 필요하면 `Youtube` 데이터를 재사용하는 상위 개념으로 확장하면 된다. `Retreat -> Youtube` 관계는 이미 있다.

---

# 화면별 최종 정리

## 기존 화면 그대로 유지해도 되는 것

- 대시보드
- 전체 계정 정보
- 유튜브 실황 링크
- 선택식 강의 관리
- 선택식 강의 배정
- 공지사항
- Push 알림

## 기존 화면은 유지하되 의미가 바뀌는 것

- 수련회 등록 현황
  → checkbox 중심이 아니라 `application.status`, `payment_status`, `checked_in_at` 중심 운영 화면으로 변경

## 새로 추가하는 게 좋은 것

- 수련회 관리
- 수련회 신청서 관리
- 식사 옵션 관리
- 교통 옵션 관리
- 시스템 설정

## 기존 화면의 하위 액션으로 넣는 게 좋은 것

- 이메일 등록
- 비밀번호 초기화
- 인증 메일 재발송
