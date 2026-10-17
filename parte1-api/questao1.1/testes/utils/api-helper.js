// Ferramentas da Parte 1: limite de uso (GitHub) e token (DummyJSON)

const GITHUB_URL = 'https://api.github.com';
const DUMMYJSON_URL = 'https://dummyjson.com';

// Usuário público de demonstração do DummyJSON.
// Pode ser trocado por variável de ambiente, sem alterar o código.
const DUMMYJSON_LOGIN = {
  username: process.env.DUMMYJSON_USER || 'emilys',
  password: process.env.DUMMYJSON_PASSWORD || 'emilyspass',
};

// ===================== GITHUB: LIMITE DE USO =====================

// Lê os headers de limite da resposta e devolve como números
function lerRateLimit(response) {
  const headers = response.headers();
  return {
    limite: Number(headers['x-ratelimit-limit']),
    restante: Number(headers['x-ratelimit-remaining']),
    reset: Number(headers['x-ratelimit-reset']),
  };
}

// Faz pedidos até o GitHub bloquear e devolve a resposta bloqueada.
// Se o limite já estiver zerado (ex.: execução anterior), o primeiro pedido já volta bloqueado.
async function esgotarRateLimit(request, endpoint, maxTentativas = 70) {
  for (let i = 0; i < maxTentativas; i++) {
    const response = await request.get(`${GITHUB_URL}${endpoint}`);
    if (response.status() === 403 || response.status() === 429) {
      return response;
    }
  }
  throw new Error(`O limite não foi atingido após ${maxTentativas} pedidos`);
}

// ===================== DUMMYJSON: GERENCIADOR DE TOKEN =====================

// Lê a data de vencimento ("exp") escrita dentro do token JWT.
// O JWT tem 3 partes separadas por ponto; a do meio traz os dados do token.
function lerVencimentoJwt(token) {
  const conteudo = token.split('.')[1];
  const json = Buffer.from(conteudo, 'base64url').toString('utf8');
  return JSON.parse(json).exp * 1000; // segundos Unix -> milissegundos
}

class GerenciadorToken {
  // validadeMinutos: por quanto tempo a API deve emitir o token
  constructor(request, validadeMinutos = 30) {
    this.request = request;
    this.validadeMinutos = validadeMinutos;
    this.token = null;
    this.venceEm = null;
    this.totalLogins = 0; // contador para provar que o token foi reutilizado
  }

  // Faz login, guarda o token e lê dentro dele quando vence
  async login() {
    const response = await this.request.post(`${DUMMYJSON_URL}/auth/login`, {
      data: { ...DUMMYJSON_LOGIN, expiresInMins: this.validadeMinutos },
    });
    if (!response.ok()) {
      throw new Error(`Falha no login: status ${response.status()}`);
    }
    const corpo = await response.json();
    this.token = corpo.accessToken;
    this.venceEm = lerVencimentoJwt(this.token);
    this.totalLogins++;
    return this.token;
  }

  // O token venceu? (ou ainda não existe)
  estaExpirado() {
    return !this.token || Date.now() >= this.venceEm;
  }

  // Devolve o token guardado. Só faz novo login se não existir ou se venceu.
  async obterToken() {
    if (this.estaExpirado()) {
      await this.login();
    }
    return this.token;
  }

  // Faz um pedido autenticado, usando o token guardado
  async getAutenticado(endpoint) {
    const token = await this.obterToken();
    return this.request.get(`${DUMMYJSON_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}

module.exports = {
  GITHUB_URL,
  DUMMYJSON_URL,
  lerRateLimit,
  esgotarRateLimit,
  lerVencimentoJwt,
  GerenciadorToken,
};