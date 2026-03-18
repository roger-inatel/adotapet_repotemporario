# Guia Interno de Arquitetura e Erros (AdotaPet)

Este documento é um guia de estudos rápido sobre as decisões arquiteturais tomadas até agora no backend.

## 1. Tratamento de Erros e Validações

Nossa API não retorna erros crus de banco para o Frontend. Temos camadas de proteção:

### A) Erros de Má Formatação (HTTP 400 - Bad Request)
- **Onde acontece:** `main.ts` com `ValidationPipe` global.
- **Como funciona:** Lê os decorators dos DTOs (`@IsEmail()`, `@MinLength(8)`, etc.).
- **O que o Front recebe:** Mensagens claras por campo inválido.

### B) Erros de Integridade do Banco (HTTP 400 customizado)
- **Onde acontece:** Services (ex: Users, Organizations).
- **Como funciona:** Prisma lança códigos como `P2002` (unique violation); convertemos para `BadRequestException`.
- **O que o Front recebe:** Mensagens amigáveis de negócio.

### C) Recurso Não Encontrado (HTTP 404)
- **Onde acontece:** Busca, update e delete por ID.
- **Como funciona:** Methods como `ensurePetExists`/`ensureOrganizationExists` validam existência antes de alterar.
- **O que o Front recebe:** `NotFoundException` com mensagem clara.

### D) Autorização por Ownership e RBAC (HTTP 403)
- **Onde acontece:** Módulo de Pets e rotas protegidas por JWT.
- **Como funciona:** `JwtAuthGuard` + `CurrentUser` extraem usuário logado e validam dono do recurso.
- **RBAC:** O `RolesGuard` + `@Roles()` garante que apenas o papel correto (ex: ADOPTER para assinar termo, ADMIN para apagar ONG) acesse a rota.
- **O que o Front recebe:** `ForbiddenException` quando tentar alterar recurso de outro usuário.

## 2. Estado Atual por Módulo

1. **Users:** CRUD base + proteção para não retornar senha.
2. **Auth:** Login JWT + hash de senha com bcrypt.
3. **Pets:** CRUD com filtros, guard, ownership e upload estático de fotos.
4. **Organizations:** CRUD base com validações de e-mail, CNPJ e telefone, protegido por Roles.
5. **Adoptions + Responsibility Terms:** Fluxo de solicitação com regras de negócio, transação Prisma na aprovação e Assinatura Digital de Termo de Responsabilidade (captura de IP/User-Agent).

## 3. Próximos Passos

1. **Resgates/Denúncias:** Upload de mídia e geolocalização.
2. **Termos de responsabilidade:** Evoluir assinatura e trilha de auditoria.
3. **Observabilidade:** Padronizar logs e métricas por endpoint crítico.
4. **Política de autorização:** Refinar papéis (ADMIN/ONG_ADMIN/ADOPTER) em todas as rotas.
