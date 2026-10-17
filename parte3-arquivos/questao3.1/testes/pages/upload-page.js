// Page Object da tela de upload
class UploadPage {
  constructor(page) {
    this.page = page;
    this.campoArquivo = page.locator('#file-upload');
    this.botaoEnviar = page.locator('#file-submit');
    this.titulo = page.locator('h3');
    this.arquivosEnviados = page.locator('#uploaded-files');
    this.mensagemErro = page.locator('#upload-error');
  }

  async acessar() {
    await this.page.goto('https://the-internet.herokuapp.com/upload');
  }

  // Envia um arquivo criado em memória: não precisa salvar nada no disco
  async enviarArquivo(nome, conteudo) {
    await this.campoArquivo.setInputFiles({
      name: nome,
      mimeType: 'text/csv',
      buffer: Buffer.isBuffer(conteudo) ? conteudo : Buffer.from(conteudo, 'utf8'),
    });
    await this.botaoEnviar.click();
  }

  async enviarSemArquivo() {
    await this.botaoEnviar.click();
  }
}

module.exports = { UploadPage };