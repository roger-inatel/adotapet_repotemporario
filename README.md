# AdotaPet Backend

API backend do projeto AdotaPet (S204 / INATEL), construida com NestJS, Prisma e MySQL.

## Stack

- NestJS 11
- TypeScript
- Prisma ORM
- MySQL 8
- Docker (para subir banco local)

## Guia Rapido

### 1. Pre-requisitos

- Node.js LTS
- Docker

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar ambiente

```powershell
Copy-Item .env.example .env
```

Variaveis esperadas:

```env
PORT=3000
DATABASE_URL="mysql://root:root@localhost:3306/adotapet"
JWT_SECRET="trocar_em_producao"
```

### 4. Subir MySQL local

```bash
docker run --name adotapet-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=adotapet -p 3306:3306 -d mysql:8.0
```

### 5. Aplicar migracoes

```bash
npx prisma migrate dev
```

### 6. Rodar API

```bash
npm run start:dev
```

API: `http://localhost:3000`  
Swagger: `http://localhost:3000/docs`

## Como Rodar os Testes

### Comandos

```bash
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e
```

### O que cada um faz

- `npm run test`: roda todos os `*.spec.ts` dentro de `src` (testes unitarios).
- `npm run test:watch`: modo observacao para desenvolvimento.
- `npm run test:cov`: igual ao `test`, mas gera cobertura em `coverage/`.
- `npm run test:e2e`: roda os arquivos `*.e2e-spec.ts` na pasta `test`.

### Pre-requisito para E2E

Os testes E2E usam `AppModule` real e acessam banco via Prisma.  
Antes de rodar `npm run test:e2e`, garanta:

- MySQL em execucao.
- `.env` configurado.
- Migracoes aplicadas.

## Estado Atual dos Testes (verificado localmente)

- `npm run test:e2e`: passando.
- `npm run test`: falhando em specs de `auth` por dependencias do Nest nao mockadas (`AuthService` e `UsersService` nos modulos de teste).

## Scripts Uteis

```bash
npm run build
npm run lint
<<<<<<< Updated upstream
=======
npm run test:report
npm run test:integration:report
npm run test:e2e:report
>>>>>>> Stashed changes
npx prisma generate
npx prisma studio
```
