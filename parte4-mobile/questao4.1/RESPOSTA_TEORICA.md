# Questão 4.1 - Automação Mobile

> Não tenho experiência prática com automação mobile. As respostas abaixo são a abordagem que eu seguiria, construída com pesquisa e apoio de IA, aplicando os mesmos conceitos que usei nas partes práticas deste teste.

## 4.1.a) Qual ferramenta e por quê?

**Appium**, comparando com o Maestro:

- **Appium:** funciona com qualquer tipo de app e permite controlar o aparelho (GPS, rede, permissões). Mais completo, porém mais trabalhoso de configurar.
- **Maestro:** testes simples de escrever, bom para fluxos rápidos. Mas tem menos controle sobre o aparelho.

Como o app usa GPS, câmera, notificações e modo offline, preciso controlar o aparelho. Por isso escolho o **Appium**. O Maestro poderia ser usado para testes rápidos dos fluxos principais.

(O Detox seria uma opção só se o app fosse feito em React Native.)

## 4.1.b) Como simular geolocalização, câmera e notificações?

- **Geolocalização:** o emulador aceita uma localização definida pelo teste. Não preciso estar no lugar.
- **Câmera:** uma versão de teste do app usa uma câmera falsa, que devolve sempre a mesma imagem.
- **Notificações:** envio a notificação direto para o emulador e confiro como o app reage, sem depender do serviço real da Apple ou do Google.

Em todos: testar também quando o usuário **nega a permissão**.

## 4.1.c) Como usar os mesmos testes no iOS e no Android?

- **Page Objects:** os testes chamam ações como `fazerLogin()`, sem saber em qual sistema estão.
- **Mesmos identificadores nos dois sistemas:** combino com o desenvolvimento que cada botão tenha o mesmo identificador no iOS e no Android, como o `data-test` da Parte 2.
- **Uma configuração por sistema:** o mesmo teste roda duas vezes, mudando só o aparelho. Igual aos perfis desktop e mobile que configurei neste projeto.

## 4.1.d) Como montar o ambiente local e na esteira?

**Local:** instalar Node.js e Appium, um emulador Android (Android Studio) e, para iOS, um Mac com Xcode.

**Esteira:** gerar o app de teste, subir o emulador, rodar os testes e guardar relatório e vídeos. Android roda em servidor Linux; iOS precisa de macOS. Alternativa: serviços de aparelhos na nuvem, como BrowserStack.

**Estratégia:** testes rápidos a cada mudança e a suíte completa uma vez por dia, porque testes mobile são lentos.

## 4.1.e) Como testar modo offline e sincronização sem backend real?

1. O app de teste aponta para um **servidor falso**, que responde o que eu quiser e registra o que recebeu.
2. **Desligo a rede**, uso o app e confiro que os dados ficaram salvos no aparelho.
3. **Religo a rede** e confiro no servidor falso que os dados foram enviados **uma vez só e corretos**.
4. Faço o servidor falso **dar erro** e confiro que o app não perde os dados.