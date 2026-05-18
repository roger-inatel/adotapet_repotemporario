# Historias de Usuario

## US-01 - Criar Conta De Usuario

Como visitante,  
eu quero criar uma conta no AdotaPet,  
para que eu possa acessar funcionalidades como cadastrar pets, solicitar adocao e acompanhar minhas solicitacoes.

| Issue/Card | Back - Testes E2E |
| Commit | `edfd2e4` |
| Teste | `src/modules/users/users.service.spec.ts`<br>`test/integration/users.service.integration-spec.ts`<br>`test/adoption-flow.e2e-spec.ts` |

### Criterios de aceitacao

#### Cenario 1 - Criar conta com dados validos

Dado que o visitante informa nome, email e senha validos  
Quando ele enviar a requisicao de cadastro  
Entao o sistema deve criar o usuario no banco  
E a senha deve ser armazenada com hash  
E a senha nao deve ser retornada na resposta.

#### Cenario 2 - Nao criar conta com email duplicado

Dado que ja existe um usuario com o mesmo email  
Quando o visitante tentar criar uma nova conta com esse email  
Entao o sistema deve rejeitar a criacao  
E deve retornar uma mensagem informando que o email ja esta em uso.

## US-02 - Autenticar Usuario

Como usuario cadastrado,  
eu quero fazer login com email e senha,  
para que eu receba um token JWT e possa acessar rotas protegidas.

| Issue/Card | Back - Testes Unitarios |
| Commit | `edfd2e4` |
| Teste | `src/modules/auth/auth.service.spec.ts`<br>`src/modules/auth/dto/login.dto.spec.ts`<br>`test/adoption-flow.e2e-spec.ts` |

### Criterios de aceitacao

#### Cenario 1 - Login com credenciais validas

Dado que o usuario possui uma conta cadastrada  
E informa email e senha corretos  
Quando ele enviar a requisicao de login  
Entao o sistema deve retornar um `access_token` JWT  
E o token deve identificar o usuario e seu papel.

#### Cenario 2 - Nao autenticar com credenciais invalidas

Dado que o usuario informa email inexistente ou senha incorreta  
Quando ele enviar a requisicao de login  
Entao o sistema deve rejeitar a autenticacao  
E nao deve gerar token JWT.

## US-03 - Cadastrar Pet

Como usuario autenticado,  
eu quero cadastrar um pet para adocao,  
para que outras pessoas possam visualizar o animal e solicitar sua adocao.

| Issue/Card | Back - Reforco de testes |
| Commit | `f986561` |
| Teste | `src/modules/pets/pets.service.spec.ts`<br>`src/modules/pets/dto/create-pet.dto.spec.ts`<br>`test/adoption-flow.e2e-spec.ts`<br>`test/critical-flows.e2e-spec.ts` |

### Criterios de aceitacao

#### Cenario 1 - Cadastrar pet autenticado

Dado que o usuario esta autenticado com JWT valido  
E informa dados validos do pet  
Quando ele enviar a requisicao de cadastro do pet  
Entao o sistema deve criar o pet  
E deve vincular o pet ao usuario autenticado.

#### Cenario 2 - Nao cadastrar pet sem token

Dado que a requisicao nao possui token JWT valido  
Quando for enviada a tentativa de cadastrar um pet  
Entao o sistema deve bloquear a requisicao  
E deve retornar erro de nao autorizado.

## US-04 - Solicitar Adocao

Como usuario autenticado,  
eu quero solicitar a adocao de um pet disponivel,  
para que o responsavel pelo pet possa avaliar meu interesse.

| Issue/Card | Back - Reforco de testes |
| Commit | `edfd2e4` |
| Teste | `src/modules/adoptions/adoptions.service.spec.ts`<br>`test/integration/core-services.integration-spec.ts`<br>`test/critical-flows.e2e-spec.ts` |

### Criterios de aceitacao

#### Cenario 1 - Solicitar adocao de pet disponivel

Dado que o usuario esta autenticado  
E o pet existe  
E o pet esta com status `AVAILABLE`  
Quando o usuario solicitar a adocao  
Entao o sistema deve criar uma solicitacao com status `PENDING`  
E deve vincular a solicitacao ao pet e ao usuario solicitante.

#### Cenario 2 - Nao solicitar adocao de pet indisponivel

Dado que o pet nao esta com status `AVAILABLE`  
Quando o usuario tentar solicitar a adocao  
Entao o sistema deve rejeitar a solicitacao  
E deve informar que o pet nao esta disponivel para adocao.

## US-05 - Aprovar Ou Rejeitar Solicitacao De Adocao

Como responsavel pelo pet,  
eu quero aprovar ou rejeitar uma solicitacao de adocao recebida,  
para que eu possa controlar o andamento da adocao do animal.

| Issue/Card | Back inicial - Teste de Integracao |
| Commit | `edfd2e4` |
| Teste | `src/modules/adoptions/adoptions.service.spec.ts`<br>`test/integration/core-services.integration-spec.ts`<br>`test/critical-flows.e2e-spec.ts` |

### Criterios de aceitacao

#### Cenario 1 - Aprovar solicitacao como responsavel pelo pet

Dado que existe uma solicitacao de adocao para um pet cadastrado pelo usuario autenticado  
Quando o responsavel aprovar a solicitacao  
Entao o sistema deve alterar a solicitacao para `APPROVED`  
E deve alterar o pet para `PENDING_ADOPTION`.

#### Cenario 2 - Nao alterar solicitacao de pet de outro usuario

Dado que a solicitacao pertence a um pet cadastrado por outro usuario  
Quando o usuario autenticado tentar alterar o status da solicitacao  
Entao o sistema deve bloquear a operacao  
E deve retornar erro de permissao.

## US-06 - Assinar Termo De Responsabilidade

Como adotante,  
eu quero assinar o termo de responsabilidade de uma adocao aprovada,  
para que a adocao seja concluida e o pet seja marcado como adotado.

| Issue/Card | Back - Reforco de testes |
| Commit | `f986561` |
| Teste | `src/modules/responsibility-terms/responsibility-terms.service.spec.ts`<br>`test/integration/core-services.integration-spec.ts`<br>`test/critical-flows.e2e-spec.ts` |

### Criterios de aceitacao

#### Cenario 1 - Assinar termo de solicitacao aprovada

Dado que a solicitacao de adocao esta com status `APPROVED`  
E o usuario autenticado e o solicitante da adocao  
Quando ele assinar o termo de responsabilidade  
Entao o sistema deve registrar o termo com IP e User-Agent  
E deve alterar o pet para `ADOPTED`.

#### Cenario 2 - Nao assinar termo fora das regras

Dado que a solicitacao nao esta aprovada, ja possui termo assinado ou pertence a outro solicitante  
Quando o usuario tentar assinar o termo  
Entao o sistema deve rejeitar a assinatura  
E nao deve alterar o status do pet para `ADOPTED`.
