const { test, expect } = require('@playwright/test');
const {
  GITHUB_URL,
  DUMMYJSON_URL,
  lerRateLimit,
  esgotarRateLimit,
  GerenciadorToken,
} = require('./utils/api-helper');

// ===================== GITHUB: LIMITE DE USO =====================

test.describe('GitHub API - Rate limiting', () => {
  // Em sequência: o teste de bloqueio gasta o limite
  test.describe.configure({ mode: 'serial' });

  test('CT01 - deve retornar os headers de rate limit', async ({ request }) => {
    const response = await request.get(`${GITHUB_URL}/users/github`);

    // 200 se ainda há limite; 403 ou 429 se já foi gasto numa execução anterior
    expect([200, 403, 429]).toContain(response.status());

    const rate = lerRateLimit(response);
    expect(rate.limite).toBe(60);
    expect(rate.restante).toBeGreaterThanOrEqual(0);
    expect(rate.restante).toBeLessThanOrEqual(rate.limite);
    // O horário de reset deve estar no futuro (em segundos Unix)
    expect(rate.reset).toBeGreaterThan(Math.floor(Date.now() / 1000));

    // Se a resposta veio com sucesso, confere também o conteúdo
    if (response.status() === 200) {
      const corpo = await response.json();
      expect(corpo.login).toBe('github');
    }
  });

  test('CT02 - deve bloquear quando o limite é excedido', async ({ request }) => {
    test.setTimeout(120000); // até 60 pedidos em sequência

    const bloqueada = await esgotarRateLimit(request, '/users/github');

    // O enunciado cita 403; a documentação do GitHub informa 403 ou 429
    expect([403, 429]).toContain(bloqueada.status());
    expect(lerRateLimit(bloqueada).restante).toBe(0);

    const corpo = await bloqueada.json();
    expect(corpo.message).toContain('rate limit exceeded');
  });
});

// ===================== DUMMYJSON: TOKEN =====================

test.describe('DummyJSON API - Autenticação com token', () => {
  test.describe.configure({ mode: 'serial' });

  let contexto;
  let gerenciador;

  // Cria UM gerenciador de token compartilhado entre os testes deste grupo
  test.beforeAll(async ({ playwright }) => {
    contexto = await playwright.request.newContext();
    gerenciador = new GerenciadorToken(contexto); // token válido por 30 minutos
  });

  test.afterAll(async () => {
    await contexto.dispose();
  });

  test('CT03 - deve fazer login e obter um token', async () => {
    const token = await gerenciador.obterToken();

    expect(token).toBeTruthy();
    expect(gerenciador.estaExpirado()).toBe(false);
    expect(gerenciador.totalLogins).toBe(1);
  });

  test('CT04 - deve reutilizar o token em uma requisição autenticada', async () => {
    const response = await gerenciador.getAutenticado('/auth/me');

    expect(response.status()).toBe(200);
    const corpo = await response.json();
    expect(corpo.username).toBe('emilys');

    // Continua 1: usou o token do CT03, sem fazer login de novo
    expect(gerenciador.totalLogins).toBe(1);
  });

  test('CT05 - deve detectar o token expirado e renovar automaticamente', async ({ playwright }) => {
    test.setTimeout(120000); // espera real de pouco mais de 1 minuto

    // Token de 1 minuto (o menor prazo que a API aceita)
    const contextoCurto = await playwright.request.newContext();
    const tokenCurto = new GerenciadorToken(contextoCurto, 1);

    const tokenAntigo = await tokenCurto.obterToken();
    expect(tokenCurto.estaExpirado()).toBe(false);

    // Espera o token vencer
    await new Promise((resolve) => setTimeout(resolve, 65000));

    // 1) O gerenciador detecta o vencimento lendo a data dentro do token
    expect(tokenCurto.estaExpirado()).toBe(true);

    // 2) A API confirma: o token antigo é recusado
    const recusada = await contextoCurto.get(`${DUMMYJSON_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${tokenAntigo}` },
    });
    expect(recusada.status()).toBe(401);
    expect((await recusada.json()).message).toBe('Token Expired!');

    // 3) O tratamento: o gerenciador faz novo login sozinho e o pedido funciona
    const response = await tokenCurto.getAutenticado('/auth/me');
    expect(response.status()).toBe(200);
    expect(tokenCurto.totalLogins).toBe(2);

    await contextoCurto.dispose();
  });

  test('CT06 - deve recusar login com senha incorreta', async ({ request }) => {
    const response = await request.post(`${DUMMYJSON_URL}/auth/login`, {
      data: { username: 'emilys', password: 'senha-errada' },
    });

    expect(response.status()).toBe(400);
    const corpo = await response.json();
    expect(corpo.message).toBe('Invalid credentials');
  });
});