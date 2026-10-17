// Page Object da tela de login
class LoginPage {
  constructor(page) {
    this.page = page;
    this.campoUsuario = page.locator('[data-test="username"]');
    this.campoSenha = page.locator('[data-test="password"]');
    this.botaoEntrar = page.locator('[data-test="login-button"]');
    this.mensagemErro = page.locator('[data-test="error"]');
  }

  async acessar() {
    await this.page.goto('https://www.saucedemo.com/');
  }

  async entrar(usuario, senha) {
    await this.campoUsuario.fill(usuario);
    await this.campoSenha.fill(senha);
    await this.botaoEntrar.click();
  }
}

module.exports = { LoginPage };