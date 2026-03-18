# AdotaPet - API Backend

![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)

Backend oficial do **AdotaPet**, uma solução digital para adoção consciente de animais.

Projeto acadêmico da disciplina de construção de produtos digitais (**S204 / INATEL**).

## Visão Geral

O AdotaPet nasce com o objetivo de estruturar e centralizar o processo de adoção responsável, oferecendo uma base tecnológica para conectar pessoas, ONGs/abrigos e demandas de proteção animal.

## Stack Tecnológico

- **NestJS** (framework backend)
- **TypeScript** (tipagem forte e organização)
- **Prisma ORM** (acesso seguro ao banco)
- **MySQL** (banco de dados relacional)
- **Docker** (provisionamento local do banco)

## Status Atual do Desenvolvimento

- Setup inicial do backend concluído
- Prisma configurado e conectado ao MySQL
- Modelagem relacional inicial implementada com entidades principais:
  - Usuários
  - ONGs/Abrigos
  - Pets
  - Solicitações de Adoção
  - Denúncias
  - Pedidos de Resgate
  - Termos de Responsabilidade
- Módulos implementados e ativos:
  - Users
  - Auth (JWT + bcrypt)
  - Pets (com ownership e guards)
  - Organizations
  - Adoptions

## Getting Started

### 1. Pré-requisitos

Antes de começar, garanta que você tenha instalado:

- **Node.js** (LTS recomendado)
- **Docker**

### 2. Clone o repositório e instale dependências

```bash
git clone <URL_DO_REPOSITORIO>
cd adotapet-backend
npm install
```

### 3. Configure variáveis de ambiente

Copie o arquivo de exemplo e ajuste os valores, se necessário:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

### 4. Suba o banco MySQL via Docker

Use o comando abaixo exatamente como definido no projeto:

```bash
docker run --name adotapet-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=adotapet -p 3306:3306 -d mysql:8.0
```

### 5. Execute as migrações do Prisma

Com o banco em execução e `.env` configurado:

```bash
npx prisma migrate dev
```

### 6. Inicie o servidor em desenvolvimento

```bash
npm run start:dev
```

A API estará disponível em `http://localhost:3000`.

Se você abrir `http://localhost:3000`, verá apenas uma resposta de prova de vida da aplicação.

## ?? Como usar a API (Frontend + Swagger)

A documentação interativa da API fica em:

?? `http://localhost:3000/docs`

É no Swagger que Frontend e Backend alinham contrato de payloads, respostas e autenticação.

### Fluxo recomendado para o Front testar rotas protegidas

1. Criar usuário em `Users -> POST /users`
2. Fazer login em `Auth -> POST /auth/login`
3. Copiar o `access_token` retornado
4. Clicar em **Authorize** no topo do Swagger
5. Colar o token no formato:
   - `Bearer SEU_TOKEN`
6. Executar rotas protegidas (ex.: `POST /pets`, `PATCH /pets/:id`, `POST /adoptions`)

### Importante

- O backend identifica o usuário pelo token JWT.
- Em rotas com ownership, o usuário só pode alterar os próprios recursos.
- O Frontend **não precisa enviar `registeredById`** ao criar pet; esse campo é preenchido no backend.

## Scripts Úteis

```bash
npm run build
npm run lint
npm run test
npm run test:e2e
npx prisma generate
npx prisma studio
```

## Organização da Equipe

- Backend: Roger e Rodrigo
- Frontend: Lucas e Lilyan
- DevOps: Breno
- Gestão de tarefas: Trello (Sprints)

## Licença

Projeto acadêmico para fins educacionais.
