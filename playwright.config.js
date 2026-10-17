// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // Roda os testes em paralelo
  fullyParallel: true,
  // Na esteira (CI), impede que um "test.only" esquecido pule os outros testes
  forbidOnly: !!process.env.CI,
  // Na esteira, tenta novamente 1 vez antes de considerar falha
  retries: process.env.CI ? 1 : 0,
  // Relatório em HTML e lista no terminal
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    // Guarda print e vídeo em casos de falhas
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      // Testes de API
      name: 'api',
      testMatch: '**/parte1-api/**/*.spec.js',
    },
    {
      // Testes de tela no navegador de computador
      name: 'desktop-chrome',
      testMatch: ['**/parte2-e2e/**/*.spec.js', '**/parte3-arquivos/**/*.spec.js'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Testes de tela simulando iPhone webkit
      name: 'mobile-safari',
      testMatch: ['**/parte2-e2e/**/*.spec.js', '**/parte3-arquivos/**/*.spec.js'],
      use: { ...devices['iPhone 13'] },
    },
  ],
});
