// Page Object da vitrine de produtos e do ícone do carrinho
class ProductsPage {
  constructor(page) {
    this.page = page;
    this.iconeCarrinho = page.locator('.shopping_cart_link');
    this.contadorCarrinho = page.locator('.shopping_cart_badge');
  }

  async adicionarProduto(idProduto) {
    await this.page.locator(`[data-test="add-to-cart-${idProduto}"]`).click();
  }

  async abrirCarrinho() {
    await this.iconeCarrinho.click();
  }
}

module.exports = { ProductsPage };