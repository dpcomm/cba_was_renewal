# CBA WAS Renewal Project

## 아키텍처 (DDD 구조)

각 기능 모듈(`src/modules/<feature>`)은 독립적인 도메인으로 관리되며, 내부는 철저하게 **3가지 계층**으로 분리됩니다.  
코드를 작성할 때 내가 지금 **어떤 계층**을 건드리고 있는지 인지하는 것이 가장 중요합니다.

### 1. Presentation Layer (표현 계층)
- **위치**: `src/modules/<name>/presentation`
- **역할**: 클라이언트(앱/웹)와의 연결부
- **하는 일**:
  - HTTP 요청을 받아서 검증(`Validation`)합니다.
  - 애플리케이션 계층(Service)에 작업을 시킵니다.
  - 결과를 표준 포맷으로 포장해서 응답합니다.
- **주요 파일**: `Controller`, `DTO (Request/Response)`

### 2. Application Layer (응용 계층)
- **위치**: `src/modules/<name>/application`
- **역할**: 실제 **비즈니스 로직**이 수행되는 곳
- **하는 일**:
  - 도메인 객체(Entity)를 불러오거나 저장합니다.
  - 여러 도메인 로직을 조합하여 하나의 유즈케이스(기능)를 완성합니다.
  - **주의**: 여기서는 HTTP 관련 객체(Req, Res 등)를 직접 다루지 않습니다.
- **주요 파일**: `Service`, `Mapper`

### 3. Domain Layer (도메인 계층)
- **위치**: `src/modules/<name>/domain`
- **역할**: 핵심 **데이터와 규칙**을 정의
- **하는 일**:
  - 데이터베이스 테이블과 매핑되는 엔티티를 정의합니다.
  - 핵심 비즈니스 규칙이나 상태 변경 로직을 포함할 수 있습니다.
- **주요 파일**: `Entity`

---

## 폴더 구조 예시 (Consent 모듈)

```
src/modules/consent/
├── domain/
│   └── entities/          # DB 테이블 정의 (Consent Entity)
├── application/
│   ├── services/          # 비즈니스 로직 (ConsentService)
│   └── mappers/           # 매퍼 (Entity ↔ DTO)
└── presentation/
    ├── controllers/       # API 엔드포인트 (ConsentController)
    └── dto/               # Request/Response DTO
```

---

## 개발 온보딩

새로운 기능을 만들 때, 데이터의 흐름인 **Domain → Presentation → Application** 순서(또는 역순)로 구현

### Step 1. 도메인 정의 (`domain`)
가장 먼저 "무엇을 저장하고 관리할지" 정의합니다.
- `entities/` 폴더에 TypeORM 엔티티 클래스를 생성합니다.

### Step 2. 데이터 명세 정의 (`presentation/dto`)
클라이언트와 주고받을 데이터 모양을 결정합니다.
- **Request DTO**: 받을 데이터. `class-validator`로 유효성 검사 규칙을 넣습니다.
- **Response DTO**: 줄 데이터. 엔티티의 모든 필드를 주지 말고, 필요한 것만 추려서 정의합니다.
- `Swagger` 데코레이터(`@ApiProperty`)를 붙여 문서화를 자동화합니다.

### Step 3. 비즈니스 로직 구현 (`application`)
실제 기능을 구현합니다.
- `Service`를 만들고 `Repository`를 주입받습니다.
- 입력은 `Request DTO`로 받고, 출력은 `Response DTO` (또는 Entity)로 반환합니다.
- 필요하다면 `Mapper`를 만들어 "Entity → Response DTO" 변환 코드를 분리합니다.

### Step 4. API 연결 (`presentation`)
외부에서 접근할 수 있게 길을 틉니다.
- `Controller`를 만들고 `Service`를 연결합니다.
- 응답할 때는 반드시 `@shared/responses/api-response`의 `ok()` 함수를 사용해 통일된 포맷을 맞춥니다.


## 환경 설정 및 실행

### 설치
```bash
npm install
```
- Node.js 22 LTS 이상 권장
- `.env.dev`, `.env.prod`, `serviceAccountKey.json` 체크

### 실행
```bash
# 개발 모드
npm run start:dev

# 프로덕션 모드
npm run start:prod
```

---

## ✅ 주요 개발 규칙

1. DTO 사용
2. Swagger 문서 반영을 위한 Request DTO에는 반드시 Validation 데코레이터 삽입 (`@IsString()`, `@IsOptional()` 등)
3. **API Response interface 사용**:
   - 성공 시: `return ok(data)`
   - 실패 시: `throw new NotFoundException()` (Nest 내장 에러 사용 시 필터가 자동 처리)
4. **Swagger 확인**: 개발하면서 `http://localhost:3000/api/docs` 에서 문서가 잘 나오는지 체크

## 참고
- **Swagger UI**: [http://localhost:3000/api/docs](http://localhost:3000/docs)
- **레거시 코드**: `_LEGACY/` 폴더 (참고용)
