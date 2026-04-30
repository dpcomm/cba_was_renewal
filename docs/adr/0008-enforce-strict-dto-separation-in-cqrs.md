# ADR 0008: Enforce Strict DTO Separation in CQRS

## Date
2026-05-01

## Status
Accepted

## Context
최근 프로젝트에 UseCase와 Query 패턴을 도입하여 CQRS와 유사한 구조를 적용(`ADR 0007`)했습니다. 하지만 이 과정에서 웹 프레임워크(NestJS)의 유효성 검사 및 스웨거 문서화를 위한 DTO 클래스(`@ApiProperty`, `@IsString` 등이 포함된 클래스)가 Application 계층(UseCase) 내부까지 침투하는 문제가 발생했습니다.
기존에는 편의성을 위해 Controller가 받은 DTO를 UseCase에 그대로 파라미터로 전달(`execute(dto: UpdateUserDto)`)하는 방식을 사용했습니다. 이는 Application 계층이 외부 인터페이스(HTTP, Swagger) 기술에 종속되게 만들어 클린 아키텍처 원칙을 위배합니다.

## Decision
Application 계층과 Presentation 계층 간의 결합도를 낮추기 위해 **엄격한 DTO 분리 원칙**을 도입합니다.

1. **DTO 소유권 제한**: `@ApiProperty`, `class-validator` 등의 데코레이터를 포함하는 모든 웹 통신용 DTO는 **반드시 `presentation/dto` 폴더에만 존재**해야 합니다. `application/dto` 폴더는 사용하지 않습니다.
2. **UseCase 서명(Signature) 정화**: UseCase와 Query 클래스는 DTO 클래스를 의존성으로 가져오지(import) 않습니다. 오직 원시 타입, 순수 인라인 타입(`{ name: string; age: number }`), 혹은 데코레이터가 없는 순수 Command/Query 인터페이스만 파라미터로 받습니다.
3. **Controller의 책임 강화**: Controller는 클라이언트로부터 DTO를 받아 유효성을 검증(ValidationPipe)한 뒤, DTO의 데이터를 순수 파라미터로 "매핑(Mapping) 혹은 언패킹(Unpacking)"하여 UseCase에 전달하는 중개자 역할을 책임집니다.

### Example
**[기존 안티 패턴]**
```typescript
// Application Layer (UseCase가 DTO를 직접 참조함)
import { UpdateUserDto } from '../dto/update-user.dto';

async execute(dto: UpdateUserDto) { ... }
```

**[수정된 패턴]**
```typescript
// Application Layer (웹 프레임워크 요소 제거)
async execute(userId: number, command: { name?: string; phone?: string }) { ... }

// Presentation Layer (Controller가 언패킹 후 전달)
async updateUser(@Req() req, @Body() dto: UpdateUserDto) {
  return this.useCase.execute(req.user.id, {
    name: dto.name,
    phone: dto.phone
  });
}
```

## Consequences
### Positive
* **아키텍처의 순수성 보장**: 비즈니스 로직(UseCase)이 웹 프레임워크나 문서화 도구에 종속되지 않습니다. HTTP가 아닌 gRPC나 CLI 환경에서도 UseCase를 재사용할 수 있습니다.
* **유닛 테스트 용이성**: UseCase를 테스트할 때 무거운 DTO 객체를 생성할 필요 없이, 순수 객체(Plain Object)만 넘겨서 쉽게 테스트할 수 있습니다.

### Negative
* **보일러플레이트 증가**: Controller에서 DTO의 값을 꺼내어 UseCase의 파라미터 구조체로 다시 묶어주는 수작업(매핑 코드)이 늘어납니다.

## Notes
* 프로젝트 내의 모든 기능(특히 `src/modules/user` 모듈)은 본 ADR의 원칙에 따라 Application 계층에서 DTO 의존성을 제거하는 리팩토링을 완료했습니다.
* 향후 AI 에이전트 및 팀원들은 신규 UseCase 개발 시 이 규칙을 엄격히 준수해야 합니다 (`SPEC_CODER_SOP.md` 명문화 완료).
