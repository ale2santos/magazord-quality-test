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

  // DEPOIS de cada teste: limpa cookies e armazenamento do navegador
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
});