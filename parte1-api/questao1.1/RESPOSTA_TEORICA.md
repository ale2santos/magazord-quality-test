# Questão 1.1 - Rate Limiting e Autenticação com Token

## Observação sobre a API de token

O enunciado sugere o ReqRes. Ao testar manualmente com curl, verifiquei que o ReqRes mudou em 2025: passou a exigir uma chave de acesso e recusa o token de demonstração do login quando enviado no header `Authorization` (retorna 401). Como o enunciado permite usar outras APIs públicas, usei o **DummyJSON**, que tem login com token real (JWT), com validade configurável e que retorna 401 quando o token vence.

## 1.1.a) Como validar o rate limiting e o comportamento quando o limite é excedido?

Dois testes, executados em sequência:

1. **Headers corretos (CT01):** confiro `X-RateLimit-Limit` (60), `X-RateLimit-Remaining` (entre 0 e 60) e `X-RateLimit-Reset` (horário no futuro).
2. **Bloqueio (CT02):** faço pedidos até a API bloquear e confiro o status 403 (ou 429, também previsto na documentação do GitHub), o restante igual a 0 e a mensagem de limite excedido.

O teste funciona mesmo se o limite já estiver zerado por uma execução anterior: nesse caso, o primeiro pedido já volta bloqueado. O teste não pode depender do estado do ambiente.

## 1.1.b) Como obter e reutilizar o token entre os testes?

Criei um gerenciador de token (`utils/api-helper.js`) que faz login só na primeira vez e guarda o token. Nas próximas vezes, devolve o mesmo token sem novo login.

O gerenciador é criado uma vez no `beforeAll` e compartilhado entre os testes. Um contador de logins prova a reutilização: depois do CT03 e do CT04, continua 1.

Isso economiza tempo e evita estourar limites de uso de APIs.

## 1.1.c) Como detectar que o token expirou e tratar esse cenário?

O token é um JWT, e dentro dele existe a data de vencimento (`exp`). O gerenciador lê essa data no login e, antes de cada pedido, verifica se já passou. Se venceu, faz um novo login automaticamente.

No CT05, peço um token de 1 minuto, espero vencer e confirmo três coisas:
1. o gerenciador detecta que o token venceu;
2. a API recusa o token antigo com 401 e a mensagem "Token Expired!";
3. o gerenciador renova o token e o pedido volta a funcionar.

Num sistema real, eu também trataria a resposta 401 diretamente: se a API recusar o token por outro motivo, faz novo login e repete o pedido uma única vez.