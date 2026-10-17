# Teste QA Sênior - Alexandre dos Santos

Teste técnico para a vaga de Coordenador de Qualidade na Magazord.

## Tecnologias Utilizadas

- Node.js 20 ou superior (desenvolvido com Node.js 24)
- Playwright 1.64 (JavaScript)
- GitHub Actions (esteira de CI)

## Instalação

```bash
npm install
npx playwright install chromium webkit
```

O segundo comando baixa os navegadores usados nos testes (Chrome e WebKit, o motor do Safari).

## Execução dos Testes

### Todos os testes
```bash
npm test
```

### Por parte
```bash
npm run test:parte1
npm run test:parte2
npm run test:parte3
# Partes 4 e 5 são teóricas, sem script de execução
```

### Relatório
```bash
npm run report
```

## Estrutura do Projeto

├── .github/workflows/playwright.yml Esteira de CI: roda os testes a cada push
├── playwright.config.js Perfis de execução: api, desktop-chrome e mobile-safari
├── casos-de-teste.txt Casos de teste das partes 1, 2 e 3
├── parte1-api/questao1.1/
│ ├── RESPOSTA_TEORICA.md
│ └── testes/
│ ├── api.spec.js
│ └── utils/api-helper.js Leitura do rate limit e gerenciador de token
├── parte2-e2e/questao2.1/
│ ├── RESPOSTA_TEORICA.md
│ └── testes/
│ ├── checkout-flow.spec.js
│ ├── pages/ Page Objects: login, produtos e checkout
│ └── fixtures/checkout-data.js Gerador de dados do cliente
├── parte3-arquivos/questao3.1/
│ ├── RESPOSTA_TEORICA.md
│ └── testes/
│ ├── csv-upload.spec.js
│ ├── pages/upload-page.js
│ ├── utils/csv-generator.js Gerador e validador de CSV
│ └── fixtures/ CSVs de exemplo: válido, vazio, formato incorreto, malformado e corrompido
├── parte4-mobile/questao4.1/RESPOSTA_TEORICA.md
└── parte5-mocks/questao5.1/RESPOSTA_TEORICA.md


**Perfis de execução:**
- `api`: testes da Parte 1, sem navegador. Rodam uma vez só para não gastar o limite de 60 pedidos por hora da API do GitHub.
- `desktop-chrome` e `mobile-safari`: testes das Partes 2 e 3, em computador e em iPhone simulado. A plataforma é Mobile First, e o WebKit representa o Safari.

## Observações

### Sobre mim e o uso de IA

Minha trajetória é em infraestrutura, deploy, monitoramento e gestão de times, sem experiência anterior como QA ou com programação de testes automatizados.

- **Infraestrutura, Git, esteira de CI e a definição dos cenários de teste:** feitos com base na minha experiência, pesquisando alguns comandos para relembrar.
- **Programação dos testes em JavaScript e uso do Playwright:** aprendidos durante este desafio com apoio de IA, passo a passo. Estudei cada linha e consigo explicar o que cada parte faz e por que foi feita assim.
- **Partes 4 e 5:** abordagem teórica, sem experiência prática em automação mobile ou integração com marketplaces.

### Decisões técnicas

- **Playwright:** uma única ferramenta para API, navegador e upload de arquivos, com suporte ao WebKit (Safari).
- **Page Objects e seletores `data-test`:** cada tela concentra seus seletores, e os atributos `data-test` não mudam com alterações visuais.
- **Dados dinâmicos:** clientes e CSVs são gerados a cada execução, sem depender de dados fixos.
- **Esteira com versões fixas:** Node.js 24 e Ubuntu 24.04 fixados, para a esteira não mudar sozinha com atualizações do GitHub.

### Problemas encontrados e como resolvi

1. **ReqRes mudou a autenticação (Parte 1).** Ao testar manualmente com curl, o ReqRes passou a exigir chave de acesso e a recusar o token de demonstração no header `Authorization` (erro 401). Como o enunciado permite outras APIs públicas, usei o **DummyJSON**, que emite token JWT real com validade e retorna 401 quando ele vence.
2. **Teste instável no cálculo do total (Parte 2, CT02).** Passou no Chrome e falhou no WebKit: os preços eram lidos antes da tela carregar. Corrigi esperando a tela e os itens aparecerem, e validei com 10 execuções seguidas.
3. **Defeito encontrado no Sauce Demo (Parte 2, CT07).** O site permite ir ao checkout com o carrinho vazio. Marquei o teste com `test.fail()` para registrar o defeito sem quebrar a esteira.
4. **O site de upload não valida o conteúdo (Parte 3).** Verifiquei com curl que ele aceita qualquer arquivo, inclusive vazio. Separei os testes em duas camadas: upload no site e validação do conteúdo pelo validador.

### Pontos de atenção na execução

- O **CT02 da Parte 1** gasta todo o limite da API do GitHub. Depois dele, o limite fica zerado por até 1 hora; os testes foram feitos para passar mesmo assim.
- O **CT05 da Parte 1** leva pouco mais de 1 minuto, porque espera o token vencer de verdade.
- Os testes dependem de sites públicos (GitHub, DummyJSON, Sauce Demo, the-internet). Se algum estiver fora do ar, os testes daquele site falham por motivo externo.