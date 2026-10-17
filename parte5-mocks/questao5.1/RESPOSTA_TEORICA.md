# Questão 5.1 - Mocks de APIs Externas

> Não tenho experiência prática com integração de marketplaces. As respostas abaixo são a abordagem que eu seguiria, construída com pesquisa e apoio de IA, ligada ao que vivi neste teste e à minha experiência com integrações em infraestrutura.

## 5.1.a) Como testar sem afetar os marketplaces reais?

- **Nunca usar conta de produção em teste.** Um produto publicado por engano aparece para clientes reais.
- **Ambientes de teste dos marketplaces:** Mercado Livre e Amazon oferecem usuários e ambientes de teste (sandbox). Uso para validar a integração de verdade, poucas vezes.
- **Mocks nos testes automáticos do dia a dia:** um servidor falso imita o marketplace. Rápido, sem custo e sem risco.
- **Credenciais separadas por ambiente**, guardadas como segredo na esteira, nunca no código.

## 5.1.b) Qual ferramenta de mock e por quê?

- **WireMock:** servidor falso independente. Simula erros, demora e limite de uso, e registra tudo o que recebeu.
- **MSW:** intercepta as chamadas dentro de um app JavaScript. Bom para testar telas.
- **JSON Server:** cria uma API falsa simples rapidamente, mas não simula erros com facilidade.

**Escolho o WireMock**, porque:
1. A integração é entre o **nosso servidor e o marketplace**, não na tela.
2. Preciso simular **erro, demora e limite de uso**.
3. Ele **registra o que o sistema enviou**, então consigo conferir se mandamos os dados certos.
4. Roda em **Docker**, fácil de subir na esteira.

## 5.1.c) Como simular erro 500, timeout e 429, e o que validar?

| Cenário | Como simular | O que o nosso sistema deve fazer |
|---|---|---|
| **Erro 500** | O mock responde erro | Não perder o pedido ou a atualização; tentar de novo algumas vezes; registrar log e alertar |
| **Timeout** | O mock demora mais que o limite | Não travar; desistir após o tempo limite e tentar de novo; **não duplicar** produto ou pedido se o primeiro envio tiver funcionado |
| **429 (limite)** | O mock responde 429 com o tempo de espera | Esperar o tempo informado e tentar de novo, sem insistir em sequência |

O 429 é o mesmo comportamento que testei na Parte 1 com o limite do GitHub.

## 5.1.d) Como validar o formato dos dados (schema)?

- O formato esperado é descrito num arquivo de **schema** (JSON Schema): quais campos existem, de que tipo e quais são obrigatórios.
- Valido **o que enviamos** (ex.: publicação de produto) e **o que recebemos** (ex.: pedido do marketplace).
- **Na esteira:** roda nos testes de integração a cada mudança, antes dos testes de tela. Se o formato quebrar, a esteira para antes do problema chegar à produção.

## 5.1.e) Diferença entre teste com mock e teste de contrato

- **Mock:** testa o **nosso sistema** contra uma imitação. É rápido e permite simular erros. O risco: se o marketplace mudar, o mock continua igual e os testes continuam passando.
- **Teste de contrato:** confere se o que **esperamos** do marketplace continua batendo com o que ele **realmente faz**.

**Exemplo real deste teste:** o ReqRes mudou em 2025 e passou a recusar o token de demonstração. Um mock antigo continuaria passando, e o problema só apareceria quando o sistema real falhasse. Descobri a mudança porque testei contra a API real.

**Como eu usaria:**
- **Mocks** nos testes do dia a dia, a cada mudança.
- **Verificação periódica** (por exemplo, uma vez por dia) no ambiente de teste do marketplace e contra a documentação oficial da API, para descobrir mudanças antes dos clientes.