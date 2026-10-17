# Questão 2.1 - Fluxo de Checkout

## 2.1.a) Como garantir que cada execução use um cupom válido diferente?

Se o teste usar sempre o mesmo cupom de uso único, a segunda execução falha com "cupom já utilizado", mesmo o sistema estando correto.

Para evitar isso, cada execução cria o próprio cupom antes do teste, com um código único (por exemplo, usando data e hora), e apaga o cupom ao final. Se o sistema não permitir criar cupons por API, uso um lote de cupons de teste e reservo um por execução.

O Sauce Demo não tem cupom, mas apliquei a mesma ideia aos dados do cliente: o arquivo `testes/fixtures/checkout-data.js` gera nome, sobrenome e CEP diferentes a cada execução.

## 2.1.b) Como validar a confirmação do pedido sem depender de e-mail real?

Separo em duas verificações:

1. **O pedido foi criado:** confiro na tela de confirmação, como no teste CT01. Num sistema real, também conferiria pela API ou banco de teste se o pedido existe com os dados corretos.
2. **O e-mail foi enviado:** no ambiente de teste, o sistema envia para uma caixa de e-mail de teste (como Mailpit ou MailHog), que guarda as mensagens sem entregar a ninguém. O teste consulta essa caixa e confere se a mensagem do pedido chegou.

Assim o teste não envia e-mail para pessoas reais e não fica instável por atraso na entrega.