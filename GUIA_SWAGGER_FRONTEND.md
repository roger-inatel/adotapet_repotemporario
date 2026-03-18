# Guia Rápido de Swagger para o Frontend (AdotaPet)

Este guia é para Lucas e Lilyan conseguirem testar a API local e integrar o Front sem travar.

## 1. Onde acessar

Com o backend rodando (`npm run start:dev`), abra:

- `http://localhost:3000/docs`

> `http://localhost:3000` mostra apenas a resposta básica da API. A documentação real está em `/docs`.

## 2. Como ler o Swagger

Cada seção (Users, Auth, Pets, Organizations, Adoptions) contém:

- Endpoint
- Payload esperado
- Campos obrigatórios/opcionais
- Exemplo de resposta

Use sempre **Try it out** para testar localmente.

## 3. Fluxo mínimo para autenticar

### Passo 1: Criar usuário

- Seção `Users`
- Endpoint `POST /users`

Exemplo:

```json
{
  "fullName": "Frontend Local",
  "email": "frontend.local@adotapet.com",
  "password": "Str0ng@Pass123",
  "role": "ADOPTER"
}
```

### Passo 2: Fazer login

- Seção `Auth`
- Endpoint `POST /auth/login`

Exemplo:

```json
{
  "email": "frontend.local@adotapet.com",
  "password": "Str0ng@Pass123"
}
```

Copie o `access_token` retornado.

### Passo 3: Autorizar no Swagger

- Clique em **Authorize** (topo da página)
- Cole:

```text
Bearer SEU_ACCESS_TOKEN
```

- Clique em **Authorize** e depois **Close**

Pronto: o Swagger passa a enviar o token automaticamente nas rotas protegidas.

## 4. Rotas protegidas (cadeado)

Exemplos de rotas que exigem token:

- `POST /pets`
- `PATCH /pets/{id}`
- `DELETE /pets/{id}`
- Rotas de `Adoptions`

Se o token estiver ausente ou inválido, a API retorna `401 Unauthorized`.

## 5. Regras importantes para o Front

- Não envie `registeredById` ao criar pet; o backend define pelo usuário autenticado.
- Recursos com ownership só podem ser alterados pelo dono (`403 Forbidden` se não for dono).
- Campos enum devem respeitar exatamente os valores documentados no Swagger.

## 6. Checklist de integração local

1. Backend rodando (`npm run start:dev`)
2. Banco MySQL ativo no Docker
3. Migrações aplicadas (`npx prisma migrate dev`)
4. Token JWT configurado no Swagger (Authorize)
5. Teste manual da rota no Swagger antes de integrar no Front

## 7. Erros comuns

- **Cannot GET /docs**: backend não está na branch correta ou Swagger não foi configurado.
- **401 Unauthorized**: token ausente/expirado/formato incorreto.
- **403 Forbidden**: usuário logado não é dono do recurso.
- **400 Bad Request**: payload inválido para os DTOs.
