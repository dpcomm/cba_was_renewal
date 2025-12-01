# CBA Web Application Server

## 0. 환경 설정

### Node Version
- v20.18.0 (권장)

### 패키지 설치
```bash
npm i
```

### 환경 변수 파일 설정 (`.env`)
이 프로젝트는 실행 환경에 따라 다른 환경 변수 파일을 로드합니다.

1. **로컬 개발용 (`.env.dev`)**
   - `npm run dev` 실행 시 자동으로 로드됩니다.
   - 로컬(`127.0.0.1`)에 있는 DB와 Redis에 연결합니다.
   ```env
   SERVER_PORT=3000
   
   MYSQL_DATABASE=cbaapp
   MYSQL_DATABASE_SHADOW=cbaapp_shadow
   MYSQL_ROOT_PASSWORD=1234
   
   # Localhost connection
   DATABASE_URL=mysql://root:1234@127.0.0.1:3306/cbaapp
   SHADOW_DATABASE_URL=mysql://root:1234@127.0.0.1:3306/cbaapp_shadow
   REDIS_URL=redis://127.0.0.1:6379
   
   JWT_SECRET=cbaJwtSecret
   JWT_ISSUER=cbaSuperSecret
   JWT_EXPIRENTTIME=1800
   JWT_REFRESH_EXPIRENTTIME=604800
   ```

2. **프로덕션/Docker용 (`.env.prod`)**
   - `npm start` 실행 시 자동으로 로드됩니다.
   - Docker 컨테이너 이름(`mysql`, `redis`)으로 연결합니다.
   ```env
   # ... (기본 설정 동일)
   
   # Docker Container connection
   DATABASE_URL=mysql://root:1234@mysql:3306/cbaapp
   SHADOW_DATABASE_URL=mysql://root:1234@mysql:3306/cbaapp_shadow
   REDIS_URL=redis://redis:6379
   ```

---

## 1. Local 개발 테스트 실행

로컬에서 개발할 때는 DB와 Redis만 Docker로 띄우고, 앱은 로컬에서 실행합니다.

```bash
# 1. DB(MySQL)와 Redis 컨테이너 실행
docker-compose up -d mysql redis

# 2. 개발 서버 실행 (자동으로 .env.dev 로드)
npm run dev
```

### 📚 API 문서 (Swagger)
서버 실행 후 아래 주소로 접속하여 API 문서를 확인할 수 있습니다.
- [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 2. Production 배포 / Docker 전체 실행

프로덕션 환경이나 Docker Compose로 전체 서비스를 실행할 때 사용합니다.

```bash
# 전체 서비스 실행 (App + MySQL + Redis)
docker-compose up -d --build
```

또는 빌드된 앱만 로컬에서 실행할 경우:
```bash
# 프로덕션 모드로 실행 (자동으로 .env.prod 로드)
npm run build
npm start
```

---

## 3. Prisma 마이그레이션

### 마이그레이션 파일 생성
```bash
# .env.dev 환경에서 실행됨
npx prisma migrate dev --name [마이그레이션_이름]
```

### 마이그레이션 적용 (Deploy)
```bash
npx prisma migrate deploy
```

### Prisma Client 생성 (동기화)
```bash
npx prisma generate
```

---

## 4. Firebase 서비스 계정 키 설정 (`serviceAccountKey.json`)

Firebase Admin SDK를 사용하기 위해서는 **서비스 계정 키 파일**이 필요합니다.

1. [Firebase 콘솔](https://console.firebase.google.com/) > 프로젝트 설정 > 서비스 계정
2. `새 비공개 키 생성` 클릭하여 JSON 다운로드
3. 프로젝트 루트에 `serviceAccountKey.json` 이름으로 저장

> 🔒 **보안 주의사항**: `serviceAccountKey.json`과 `.env*` 파일들은 절대 Git에 커밋하지 마세요. (`.gitignore`에 포함됨)

---

## 5. Docker 정리 명령어 (참고)

```bash
# 컨테이너 중지 및 삭제
docker-compose down

# 사용하지 않는 이미지, 컨테이너, 네트워크 등 모두 삭제
docker system prune -a

# 기존 볼륨(데이터베이스 포함)도 삭제하고 싶을 경우
docker volume prune
```
