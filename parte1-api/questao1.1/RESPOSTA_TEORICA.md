# Questão 1.1 - Rate Limiting e Autenticação com Token

## 1.1.a) Como validar o rate limiting e o comportamento quando o limite é excedido?

Divido em dois testes:

1. **Os headers estão corretos:** faço um pedido e confiro os headers `X-RateLimit-Limit` (limite total), `X-RateLimit-Remaining` (quanto sobra) e `X-RateLimit-Reset` (quando zera). Confiro que o limite é 60, que o restante está entre 0 e 60, e que o horário de reset está no futuro.
2. **O bloqueio funciona:** faço pedidos em sequência até a API bloquear e confiro que veio o status 403 (ou 429, que a documentação do GitHub também prevê), o restante igual a 0 e a mensagem de limite excedido.

Cuidados que tomei:
- Os dois testes rodam **em sequência**, porque o segundo gasta o limite.
- O teste funciona **mesmo se o limite já estiver zerado** por uma execução anterior: nesse caso, o primeiro pedido já volta bloqueado. O teste não pode depender do estado em que o ambiente está.

## 1.1.b) Como obter e reutilizar o token entre os testes, sem login a cada teste?

Criei um **gerenciador de token** (`utils/api-helper.js`) que:
- faz o login **só na primeira vez** e guarda o token e o horário em que foi obtido;
- nas próximas vezes, **devolve o mesmo token**, sem novo login.

O gerenciador é criado uma vez no `beforeAll` e compartilhado entre os testes do grupo. Um contador de logins (`totalLogins`) prova a reutilização: depois de dois testes, continua 1.

Isso importa na prática: o ReqRes permite 40 pedidos por dia. Fazer login a cada teste gastaria a cota e deixaria a suíte mais lenta.

## 1.1.c) Como detectar que o token expirou e tratar esse cenário?

O gerenciador guarda o horário do login e conhece a validade do token (padrão de 2 minutos). Antes de cada pedido, ele verifica se o tempo já passou:
- se o token **ainda vale**, usa o mesmo;
- se **venceu**, faz um novo login automaticamente e segue com o pedido.

No teste CT05, configurei a validade para 1 segundo, esperei vencer e confirmei que o gerenciador detectou e renovou o token (contador de logins passou de 1 para 2).

Num sistema real, além de verificar a validade antes, eu trataria também a resposta **401 (não autorizado)**: se a API recusar o token, o teste faz um novo login e repete o pedido uma única vez.