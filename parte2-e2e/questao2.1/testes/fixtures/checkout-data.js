// Dados de teste do checkout.
// O gerador cria um cliente diferente a cada execução,
// para os testes não dependerem de dados fixos.

const NOMES = ['Ana', 'Bruno', 'Carla', 'Diego', 'Eduarda', 'Felipe', 'Gabriela', 'Henrique', 'Isabela', 'Joao'];
const SOBRENOMES = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa', 'Rodrigues', 'Almeida', 'Lima', 'Nascimento'];

// Escolhe um item aleatório de uma lista
function aleatorio(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

// Gera um CEP no formato 00000-000
function gerarCep() {
  const numeros = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
  return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
}

// Gera um cliente novo a cada chamada
function gerarCliente() {
  return {
    nome: aleatorio(NOMES),
    sobrenome: aleatorio(SOBRENOMES),
    cep: gerarCep(),
  };
}

// Credenciais públicas do site de demonstração.
// Podem ser sobrescritas por variáveis de ambiente, sem alterar o código.
const SENHA = process.env.SAUCE_PASSWORD || 'secret_sauce';
const USUARIOS = {
  padrao: { usuario: process.env.SAUCE_USERNAME || 'standard_user', senha: SENHA },
  bloqueado: { usuario: 'locked_out_user', senha: SENHA },
};

// Identificadores dos produtos usados nos testes
const PRODUTOS = {
  mochila: 'sauce-labs-backpack',
  lanterna: 'sauce-labs-bike-light',
  camiseta: 'sauce-labs-bolt-t-shirt',
};

module.exports = { gerarCliente, USUARIOS, PRODUTOS };