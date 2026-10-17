// Page Object do carrinho e das etapas do checkout
class CheckoutPage {
  constructor(page) {
    this.page = page;

    // Carrinho
    this.itensCarrinho = page.locator('.cart_item');
    this.botaoCheckout = page.locator('[data-test="checkout"]');

    // Etapa 1: dados do cliente
    this.campoNome = page.locator('[data-test="firstName"]');
    this.campoSobrenome = page.locator('[data-test="lastName"]');
    this.campoCep = page.locator('[data-test="postalCode"]');
    this.botaoContinuar = page.locator('[data-test="continue"]');
    this.botaoCancelar = page.locator('[data-test="cancel"]');
    this.mensagemErro = page.locator('[data-test="error"]');

    // Etapa 2: resumo do pedido
    this.precosItens = page.locator('.inventory_item_price');
    this.subtotal = page.locator('.summary_subtotal_label');
    this.taxa = page.locator('.summary_tax_label');
    this.total = page.locator('.summary_total_label');
    this.botaoFinalizar = page.locator('[data-test="finish"]');

    // Confirmação
    this.tituloConfirmacao = page.locator('.complete-header');
  }

  async removerProduto(idProduto) {
    await this.page.locator(`[data-test="remove-${idProduto}"]`).click();
  }

  async iniciarCheckout() {
    await this.botaoCheckout.click();
  }

  async preencherDados({ nome, sobrenome, cep }) {
    await this.campoNome.fill(nome);
    await this.campoSobrenome.fill(sobrenome);
    await this.campoCep.fill(cep);
    await this.botaoContinuar.click();
  }

  async finalizar() {
    await this.botaoFinalizar.click();
  }

  // Converte um texto como "Item total: $39.98" no número 39.98
  async lerValor(locator) {
    const texto = await locator.textContent();
    return parseFloat(texto.replace(/[^0-9.]/g, ''));
  }

  // Soma os preços de todos os itens exibidos no resumo
  async somarPrecosItens() {
    const textos = await this.precosItens.allTextContents();
    return textos.reduce((soma, texto) => soma + parseFloat(texto.replace('$', '')), 0);
  }
}

module.exports = { CheckoutPage };