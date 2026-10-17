const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { UploadPage } = require('./pages/upload-page');
const { gerarCsv, validarCsv } = require('./utils/csv-generator');

// Lê um arquivo de exemplo da pasta fixtures, exatamente como está no disco
function lerFixture(nome) {
  return fs.readFileSync(path.join(__dirname, 'fixtures', nome));
}

const TAMANHOS = [10, 100, 1000];

const ARQUIVOS_INVALIDOS = [
  { arquivo: 'vazio.csv', motivo: 'Arquivo vazio' },
  { arquivo: 'formato-incorreto.csv', motivo: 'Cabeçalho inválido' },
  { arquivo: 'corrompido.csv', motivo: 'Arquivo corrompido ou com codificação inválida' },
];

// ===================== CONTEÚDO DO CSV (sem navegador) =====================

test.describe('Validação do conteúdo do CSV', () => {
  for (const quantidade of TAMANHOS) {
    test(`CT01 - deve gerar e validar CSV com ${quantidade} linhas`, () => {
      const resultado = validarCsv(gerarCsv(quantidade));

      // Todas as linhas processadas e válidas: nenhuma perdida, nenhuma com erro
      expect(resultado.totalLinhas).toBe(quantidade);
      expect(resultado.validas).toBe(quantidade);
      expect(resultado.erros).toEqual([]);
    });
  }

  test('CT02 - deve apontar cada erro do CSV malformado com o número da linha', () => {
    const resultado = validarCsv(lerFixture('malformado.csv').toString('utf8'));

    expect(resultado.totalLinhas).toBe(6);
    expect(resultado.validas).toBe(1);
    expect(resultado.erros).toEqual([
      { linha: 3, motivo: 'E-mail inválido' },
      { linha: 4, motivo: 'Idade inválida' },
      { linha: 5, motivo: 'Quantidade de colunas incorreta' },
      { linha: 6, motivo: 'E-mail duplicado' },
      { linha: 7, motivo: 'Nome vazio' },
    ]);
  });

  for (const { arquivo, motivo } of ARQUIVOS_INVALIDOS) {
    test(`CT03 - deve recusar ${arquivo}`, () => {
      const resultado = validarCsv(lerFixture(arquivo).toString('utf8'));

      expect(resultado.validas).toBe(0);
      expect(resultado.erros[0].motivo).toBe(motivo);
    });
  }
});

// ===================== UPLOAD NO SITE =====================

test.describe('Upload de CSV - the-internet', () => {
  let upload;

  test.beforeEach(async ({ page }) => {
    upload = new UploadPage(page);
    await upload.acessar();
  });

  for (const quantidade of TAMANHOS) {
    test(`CT04 - deve enviar CSV válido com ${quantidade} linhas`, async () => {
      const nomeArquivo = `clientes-${quantidade}.csv`;

      await upload.enviarArquivo(nomeArquivo, gerarCsv(quantidade));

      await expect(upload.titulo).toHaveText('File Uploaded!');
      await expect(upload.arquivosEnviados).toContainText(nomeArquivo);
    });
  }

  for (const arquivo of ['vazio.csv', 'formato-incorreto.csv', 'malformado.csv', 'corrompido.csv']) {
    test(`CT05 - o site aceita ${arquivo} sem validar o conteúdo`, async () => {
      // Comportamento real do site, verificado manualmente com curl:
      // ele só confere se existe um arquivo, não o conteúdo.
      // A recusa desses arquivos é feita pelo validador (CT02 e CT03).
      await upload.enviarArquivo(arquivo, lerFixture(arquivo));

      await expect(upload.titulo).toHaveText('File Uploaded!');
      await expect(upload.arquivosEnviados).toContainText(arquivo);
    });
  }

  test('CT06 - deve exibir erro ao enviar sem escolher arquivo', async () => {
    await upload.enviarSemArquivo();

    await expect(upload.titulo).toHaveText('Internal Server Error');
    await expect(upload.mensagemErro).toContainText('No file was chosen');
  });
});