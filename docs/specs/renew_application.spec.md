# CBA Connect 수련회 신청서 DB 명세

## 1. 설계 목적

이 구조는 수련회 신청 기능에서 아래를 지원하기 위한 것이다.

- 수련회별 신청 관리
- 수련회별 설문 문항 관리
- 수련회별 식사 선택 관리
- 수련회별 교통편 선택 관리
- 신청자의 답변, 식사, 교통 선택 저장
- 신청 상태 / 결제 상태 / 체크인 상태 관리

---

# 2. ENUM 정의

## 2.1 application.status

```
SUBMITTED
CANCELED
CHECKED_IN
```

## 2.2 application.payment_status

```
PENDING
PAID
REFUNDED
EXEMPTED
```

## 2.3 application.event_result

```
WIN
LOSE
```

## 2.4 question.answer_type

```
SINGLE_SELECT
MULTI_SELECT
SUBJECTIVE
```

## 2.5 retreat_transport.direction

```
DEPARTURE
RETURN
```

## 2.6 retreat_transport.transport_type

```
OWN_CAR
CARPOOL
BUS
PUBLIC
OTHER
```

## 2.7 retreat_meal.meal_type

```
BREAKFAST
LUNCH
DINNER
```

---

# 3. 테이블 명세

---

## 3.1 retreat

수련회 기본 정보 테이블

### 컬럼

- `id` bigint PK
- `title` varchar not null
- `location` varchar not null
- `retreat_start_at` timestamp not null
- `retreat_end_at` timestamp not null

### 설명

- 하나의 수련회는 설문, 식사 옵션, 교통 옵션, 신청 데이터를 가진다.

---

## 3.2 survey

수련회에 연결된 신청 설문 정보 테이블

### 컬럼

- `id` bigint PK
- `retreat_id` bigint FK not null
- `survey_start_at` timestamp not null
- `survey_end_at` timestamp not null
- `created_at` timestamp not null
- `updated_at` timestamp not null

### FK

- `retreat_id -> retreat.id`

### 인덱스

- `INDEX idx_survey_retreat_id (retreat_id)`

### 설명

- 수련회별 설문 메타 정보
- `application` 은 제출 당시 어떤 `survey` 기준인지 `survey_id` 로 고정한다

### 삭제 정책

- `retreat` 삭제 시 survey는 **RESTRICT**
- 이미 신청 데이터가 있는 survey는 삭제하지 않고 유지 권장

## 3.3 question

설문 문항 테이블

### 컬럼

- `id` bigint PK
- `survey_id` bigint FK not null
- `title` varchar not null
- `answer_type` enum not null
- `order_no` int not null
- `is_required` boolean not null default false
- `created_at` timestamp not null
- `updated_at` timestamp not null

### FK

- `survey_id -> survey.id`

### 제약

- `UNIQUE (survey_id, order_no)`

### 설명

- 설문에 속한 문항
- `is_required` 로 필수 문항 여부를 관리

### 삭제 정책

- `survey` 삭제 시 question은 **RESTRICT**
- 이미 응답이 있는 문항은 삭제보다 유지 권장

---

## 3.4 question_option

객관식 문항의 보기 테이블

### 컬럼

- `id` bigint PK
- `question_id` bigint FK not null
- `label` varchar not null
- `order_no` int not null
- `created_at` timestamp not null
- `updated_at` timestamp not null

### FK

- `question_id -> question.id`

### 제약

- `UNIQUE (question_id, order_no)`

### 인덱스

- `INDEX idx_question_option_question_id (question_id)`

### 설명

- `SINGLE_SELECT`, `MULTI_SELECT` 문항의 선택지
- `SUBJECTIVE` 문항에서는 사용하지 않음

### 삭제 정책

- `question` 삭제 시 question_option은 **RESTRICT**
- 이미 응답이 있는 보기는 삭제보다 유지 권장

---

## 3.5 retreat_meal

수련회별 식사 슬롯 마스터 테이블

### 컬럼

- `id` bigint PK
- `retreat_id` bigint FK not null
- `meal_day` date not null
- `meal_type` enum not null
- `meal_table` json null
- `created_at` timestamp not null
- `updated_at` timestamp not null

### FK

- `retreat_id -> retreat.id`

### 제약

- `UNIQUE (retreat_id, meal_day, meal_type)`

### 설명

예시:

- 2025-08-14 아침 (['사과', '요거트'])
- 2025-08-14 점심 (['돈가스', '수프'])
- 2025-08-15 저녁 (['삼겹살', '된장찌개'])

### 삭제 정책

- `retreat` 삭제 시 retreat_meal은 **RESTRICT**
- 이미 신청자가 선택한 식사 슬롯은 삭제 금지 권장

---

## 3.6 retreat_transport

수련회별 교통편 옵션 마스터 테이블

### 컬럼

- `id` bigint PK
- `retreat_id` bigint FK not null
- `direction` enum not null
- `transport_type` enum not null
- `name` varchar not null
- `is_remark_required` boolean not null default false
- `is_vehicle_required` boolean not null default false
- `created_at` timestamp not null
- `updated_at` timestamp not null

### FK

- `retreat_id -> retreat.id`

### 제약

- `UNIQUE (retreat_id, direction, transport_type, name)`

### 설명

예시:

- 출발 / 자차 / 자차
- 출발 / 대중교통 / 대중교통
- 출발 / 기타 / 새벽열차
- 복귀 / 버스 / 셔틀버스

### 비즈니스 규칙

- `is_vehicle_required = true` 이면 신청자가 차량번호 입력 필수
- `is_remark_required = true` 이면 신청자가 비고 입력 필수

### 삭제 정책

- `retreat` 삭제 시 retreat_transport는 **RESTRICT**
- 이미 신청자가 선택한 교통 옵션은 삭제 금지 권장

## 3.7 application

신청 본체 테이블

### 컬럼

- `id` int PK
- `retreat_id` int FK not null
- `survey_id` int FK not null
- `user_id` varchar(191) FK not null
- `status` enum not null
- `payment_status` enum not null default PENDING
- `checked_in_at` timestamp null
- `event_result` enum null
- `event_participated_at` timestamp null
- `created_at` timestamp not null
- `updated_at` timestamp not null

### FK

- `retreat_id -> retreat.id`
- `survey_id -> survey.id`
- `user_id -> user.userId`

### 제약

- `UNIQUE (user_id, retreat_id)`

### 인덱스

- `INDEX idx_application_retreat_status (retreat_id, status)`
- `INDEX idx_application_survey_id (survey_id)`
- `INDEX idx_application_user_id (user_id)`
- `INDEX idx_application_retreat_payment (retreat_id, payment_status)`
- `INDEX idx_application_retreat_checkedin (retreat_id, checked_in_at)`

### 설명

- 한 유저는 한 수련회에 대해 하나의 신청 row만 가진다
- 취소 후 재신청은 새 row 생성이 아니라 기존 row의 상태 변경으로 처리한다

### 상태 규칙

- `status = CHECKED_IN` 이면 `checked_in_at` 은 반드시 NOT NULL
- `status != CHECKED_IN` 이면 `checked_in_at` 은 NULL

### 권장 CHECK 개념

```
status = CHECKED_IN  -> checked_in_at IS NOT NULL
status != CHECKED_IN -> checked_in_at IS NULL
```

### 삭제 정책

- `application` 삭제 시 하위 선택/응답 데이터는 CASCADE

---

## 3.8 application_meal

신청자의 식사 선택 테이블

### 컬럼

- `id` bigint PK
- `application_id` bigint FK not null
- `retreat_meal_id` bigint FK not null
- `created_at` timestamp not null
- `updated_at` timestamp not null

### FK

- `application_id -> application.id`
- `retreat_meal_id -> retreat_meal.id`

### 제약

- `UNIQUE (application_id, retreat_meal_id)`

### 인덱스

- `INDEX idx_application_meal_retreat_meal_id (retreat_meal_id)`

### 설명

- 신청자가 어떤 식사 슬롯을 선택했는지 저장
- 식사별 인원 집계 시 사용

### 삭제 정책

- `application` 삭제 시 **CASCADE**
- `retreat_meal` 삭제 시 **RESTRICT**

---

## 3.9 application_transport

신청자의 교통 선택 테이블

### 컬럼

- `id` bigint PK
- `application_id` bigint FK not null
- `retreat_transport_id` bigint FK not null
- `vehicle_number` varchar null
- `remark` varchar null
- `direction` enum not null
- `created_at` timestamp not null
- `updated_at` timestamp not null

### FK

- `application_id -> application.id`
- `retreat_transport_id -> retreat_transport.id`

### 제약

- `UNIQUE (application_id, retreat_transport_id)`
- `UNIQUE (application_id, direction)`

### 인덱스

- `INDEX idx_application_transport_retreat_transport_id (retreat_transport_id)`

### 설명

- 신청자는 출발/복귀 방향별로 최대 1개 교통 수단만 선택 가능
- `direction` 은 중복 선택 방지용 컬럼
- 클라이언트가 direction을 보내는 게 아니라, 서버가 `retreat_transport.direction` 을 조회해 그대로 저장하는 방식을 사용한다

### 비즈니스 규칙

- `is_vehicle_required = true` 이면 `vehicle_number` 필수
- `is_remark_required = true` 이면 `remark` 필수

### 삭제 정책

- `application` 삭제 시 **CASCADE**
- `retreat_transport` 삭제 시 **RESTRICT**

---

## 3.10 answer

신청자의 설문 답변 테이블

### 컬럼

- `id` bigint PK
- `question_id` bigint FK not null
- `application_id` bigint FK not null
- `question_option_id` bigint FK null
- `content` text null
- `created_at` timestamp not null
- `updated_at` timestamp not null

### FK

- `question_id -> question.id`
- `application_id -> application.id`
- `question_option_id -> question_option.id`

### 제약

- `UNIQUE (application_id, question_id, question_option_id)`

### 인덱스

- `INDEX idx_answer_question_id (question_id)`
- `INDEX idx_answer_question_option_id (question_option_id)`
- `INDEX idx_answer_application_question (application_id, question_id)`

### nullability 규칙

- `content` 는 **nullable**
- `question_option_id` 는 **nullable**

### answer_type별 규칙

### SUBJECTIVE

- `content` 필수
- `question_option_id = null`

### SINGLE_SELECT

- `content = null`
- `question_option_id` 필수
- 한 질문당 한 row만 허용

### MULTI_SELECT

- `content = null`
- `question_option_id` 필수
- 한 질문당 여러 row 허용
- 같은 option 중복 선택 금지

### 삭제 정책

- `application` 삭제 시 **CASCADE**
- `question` / `question_option` 삭제 시 **RESTRICT**

---

# 4. 관계 정리

## 핵심 관계

- `retreat 1 : N survey`
- `survey 1 : N question`
- `question 1 : N question_option`
- `retreat 1 : N retreat_meal`
- `retreat 1 : N retreat_transport`
- `retreat 1 : N application`
- `survey 1 : N application`
- `application 1 : N answer`
- `application 1 : N application_meal`
- `application 1 : N application_transport`

---

# 5. 삭제 정책 정리

## CASCADE

아래는 부모 삭제 시 자식 자동 삭제 허용

- `application -> answer`
- `application -> application_meal`
- `application -> application_transport`

## RESTRICT

아래는 삭제 금지 또는 운영상 비활성화 권장

- `retreat -> survey`
- `retreat -> retreat_meal`
- `retreat -> retreat_transport`
- `retreat -> application`
- `survey -> question`
- `question -> question_option`
- `question -> answer`
- `question_option -> answer`
- `retreat_meal -> application_meal`
- `retreat_transport -> application_transport`

---

# 6. 서비스 레벨 검증 규칙

이 부분은 DB만으로 완전 강제하기 어렵기 때문에 서비스 레이어에서 반드시 검증한다.

## 6.1 application 저장 시

- `application.retreat_id === survey.retreat_id`
- 동일 유저의 동일 수련회 신청은 기존 row 재사용
- 취소 후 재신청 시 새 row 생성하지 않고 기존 row 상태 갱신
- `status = CHECKED_IN` 인 경우에만 `checked_in_at` 허용

## 6.2 application_transport 저장 시

- `retreat_transport.retreat_id === application.retreat_id`
- `direction` 은 요청값 신뢰하지 않고 `retreat_transport.direction` 을 서버가 조회 후 저장
- `is_vehicle_required = true` 이면 `vehicle_number` 필수
- `is_remark_required = true` 이면 `remark` 필수

## 6.3 answer 저장 시

- `question_id` 가 `application.survey_id` 소속 질문인지 검증
- `question_option_id` 가 해당 `question_id` 소속인지 검증
- `answer_type` 에 따라 입력 형식 검증
- `SINGLE_SELECT` 는 질문당 1개만 허용
- `MULTI_SELECT` 는 같은 option 중복 저장 금지

---

# 7. 신청 수정/저장 트랜잭션 권장 방식

신청서 제출/수정은 하나의 트랜잭션으로 처리한다.

## 권장 순서

1. `application` 조회 또는 생성
2. `survey`, `retreat` 정합성 검증
3. `application` 저장
4. 기존 `answer`, `application_meal`, `application_transport` 삭제
5. 새로운 답변/식사/교통 선택 일괄 insert
6. commit

## 이유

- 신청 수정 시 구조가 단순해짐
- 일부만 반영되는 상태를 방지할 수 있음
- 교통/식사/설문 응답이 항상 같은 제출 시점 기준으로 정합성 유지 가능

---

# 8. 신청 화면 옵션 조회 API

수련회 신청 화면에서 소속 중그룹, 식사 슬롯, 출발/복귀 교통 옵션을 한 번에 조회한다.

## API

- `GET /application/options/:retreatId`
- 로그인 사용자만 호출할 수 있다.
- `retreatId`는 명시적으로 전달하며, 현재 수련회 ID는 `GET /system`의 `currentRetreatId`를 사용한다.
- 수련회가 존재하지 않으면 `RETREAT_NOT_FOUND`를 반환한다.

## 응답 항목

- `retreat`: 수련회 ID, 제목, 시작/종료 일시
- `groups`: `UserGroup` enum 기반 중그룹 선택지
- `meals`: 해당 수련회의 식사 슬롯 ID, 날짜, 식사 유형
- `transports.departure`: 출발 교통 옵션
- `transports.return`: 복귀 교통 옵션
- 교통 옵션은 ID, 수단, 이름, 차량번호/비고 필수 여부를 반환한다.
- 관리자용 신청 인원, 생성일, 수정일은 신청 화면 응답에서 제외한다.

## 정렬

- 식사: 날짜 오름차순, `BREAKFAST -> LUNCH -> DINNER`
- 교통: 방향별 옵션 ID 오름차순

---

# 9. 최종 요약

- 신청 본체는 `application`
- 설문 버전 고정은 `application.survey_id`
- 식사/교통은 마스터 + 신청 선택 테이블로 분리
- 교통은 `application_transport.direction` 으로 출발/복귀 중복 방지
- 답변은 `answer` 단일 테이블로 관리하되, 유형별 검증은 서비스 레벨에서 강하게 수행
- 마스터 데이터는 삭제보다 유지/비활성화 우선
- 신청 저장/수정은 트랜잭션으로 처리
