const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/login-page');
const { ProductsPage } = require('./pages/products-page');
const { CheckoutPage } = require('./pages/checkout-page');
const { gerarCliente, USUARIOS, PRODUTOS } = require('./fixtures/checkout-data');

test.describe('Checkout - Sauce Demo', () => {
  let login;
  let produtos;
  let checkout;

  // ANTES de cada teste: entra no site com o usuário padrão
  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    produtos = new ProductsPage(page);
    checkout = new CheckoutPage(page);

    await login.acessar();
    await login.entrar(USUARIOS.padrao.usuario, USUARIOS.padrao.senha);
    await expect(page).toHaveURL(/inventory\.html/);
  });

  // DEPOIS de cada teste: limpa cookies e armazenamento do navegador.
  // O Playwright já isola cada teste num contexto novo,
  // mas a limpeza explícita atende o enunciado e documenta a intenção.
  test.afterEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('CT01 - deve finalizar a compra de um produto com dados válidos', async ({ page }) => {
    const cliente = gerarCliente();

    await produtos.adicionarProduto(PRODUTOS.mochila);
    await expect(produtos.contadorCarrinho).toHaveText('1');

    await produtos.abrirCarrinho();
    await expect(checkout.itensCarrinho).toHaveCount(1);

    await checkout.iniciarCheckout();
    await checkout.preencherDados(cliente);
    await expect(page).toHaveURL(/checkout-step-two\.html/);

    await checkout.finalizar();
    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(checkout.tituloConfirmacao).toHaveText('Thank you for your order!');

    // Depois da compra, o carrinho deve ficar vazio
    await expect(produtos.contadorCarrinho).toHaveCount(0);
  });

  test('CT02 - deve calcular corretamente o total com múltiplos produtos', async ({ page }) => {
    await produtos.adicionarProduto(PRODUTOS.mochila);
    await produtos.adicionarProduto(PRODUTOS.lanterna);
    await produtos.adicionarProduto(PRODUTOS.camiseta);
    await expect(produtos.contadorCarrinho).toHaveText('3');

    await produtos.abrirCarrinho();
    await expect(checkout.itensCarrinho).toHaveCount(3);

    await checkout.iniciarCheckout();
    await checkout.preencherDados(gerarCliente());
    
    // Espera a tela de resumo carregar com os 3 preços antes de somar.
    // Sem isso, em navegadores mais lentos a soma era lida com a tela vazia (teste instável).
    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkout.precosItens).toHaveCount(3);
     
    const somaItens = await checkout.somarPrecosItens();
    const subtotal = await checkout.lerValor(checkout.subtotal);
    const taxa = await checkout.lerValor(checkout.taxa);
    const total = await checkout.lerValor(checkout.total);

    // Subtotal = soma dos itens; Total = subtotal + taxa
    expect(subtotal).toBeCloseTo(somaItens, 2);
    expect(total).toBeCloseTo(subtotal + taxa, 2);

    await checkout.finalizar();
    await expect(checkout.tituloConfirmacao).toHaveText('Thank you for your order!');
  });

  // CT03: o mesmo teste repetido para cada campo obrigatório
  const camposObrigatorios = [
    { campo: 'nome', mensagem: 'Error: First Name is required' },
    { campo: 'sobrenome', mensagem: 'Error: Last Name is required' },
    { campo: 'cep', mensagem: 'Error: Postal Code is required' },
  ];

  for (const { campo, mensagem } of camposObrigatorios) {
    test(`CT03 - deve bloquear o checkout sem ${campo}`, async ({ page }) => {
      const cliente = { ...gerarCliente(), [campo]: '' };

      await produtos.adicionarProduto(PRODUTOS.mochila);
      await produtos.abrirCarrinho();
      await checkout.iniciarCheckout();
      await checkout.preencherDados(cliente);

      await expect(checkout.mensagemErro).toHaveText(mensagem);
      await expect(page).toHaveURL(/checkout-step-one\.html/);
    });
  }

  test('CT04 - deve remover um produto do carrinho antes do checkout', async () => {
    await produtos.adicionarProduto(PRODUTOS.mochila);
    await produtos.adicionarProduto(PRODUTOS.lanterna);
    await produtos.abrirCarrinho();
    await expect(checkout.itensCarrinho).toHaveCount(2);

    await checkout.removerProduto(PRODUTOS.lanterna);

    await expect(checkout.itensCarrinho).toHaveCount(1);
    await expect(produtos.contadorCarrinho).toHaveText('1');
  });

  test('CT05 - deve manter os itens ao cancelar o checkout', async ({ page }) => {
    await produtos.adicionarProduto(PRODUTOS.mochila);
    await produtos.abrirCarrinho();
    await checkout.iniciarCheckout();

    await checkout.botaoCancelar.click();

    await expect(page).toHaveURL(/cart\.html/);
    await expect(checkout.itensCarrinho).toHaveCount(1);
  });

  test('CT07 - não deveria permitir checkout com carrinho vazio (defeito conhecido)', async ({ page }) => {
    // O Sauce Demo permite seguir para o checkout com o carrinho vazio.
    // Marcado como falha esperada: documenta o defeito sem quebrar a esteira.
    // Se um dia corrigirem, o Playwright avisa e esta marcação deve ser removida.
    test.fail();

    await produtos.abrirCarrinho();
    await expect(checkout.itensCarrinho).toHaveCount(0);
    await checkout.iniciarCheckout();

    await expect(page).toHaveURL(/cart\.html/, { timeout: 3000 });
  });
});

test.describe('Login - pré-condição do checkout', () => {
  test('CT06 - deve impedir o login de usuário bloqueado', async ({ page }) => {
    const login = new LoginPage(page);

    await login.acessar();
    await login.entrar(USUARIOS.bloqueado.usuario, USUARIOS.bloqueado.senha);

    await expect(login.mensagemErro).toContainText('locked out');
    await expect(page).not.toHaveURL(/inventory\.html/);
  });
});