// Gerador e validador de CSV para os testes de importação.

const CABECALHO = 'nome,email,idade,cidade';

const NOMES = ['Ana', 'Bruno', 'Carla', 'Diego', 'Eduarda', 'Felipe', 'Gabriela', 'Henrique', 'Isabela', 'Joao'];
const SOBRENOMES = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa', 'Lima', 'Almeida'];
const CIDADES = ['Sao Paulo', 'Rio de Janeiro', 'Florianopolis', 'Curitiba', 'Blumenau', 'Rio do Sul'];

function aleatorio(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

// ===================== GERADOR =====================

// Gera um CSV com o cabeçalho e "quantidade" linhas de dados.
// O número da linha entra no e-mail para garantir que nenhum se repita.
function gerarCsv(quantidade) {
  const linhas = [CABECALHO];
  for (let i = 1; i <= quantidade; i++) {
    const nome = aleatorio(NOMES);
    const sobrenome = aleatorio(SOBRENOMES);
    const email = `${nome}.${sobrenome}.${i}@email.com`.toLowerCase();
    const idade = 18 + Math.floor(Math.random() * 63); // entre 18 e 80
    linhas.push(`${nome} ${sobrenome},${email},${idade},${aleatorio(CIDADES)}`);
  }
  return linhas.join('\n') + '\n';
}

// ===================== VALIDADOR =====================

// Lê o conteúdo de um CSV e devolve quantas linhas são válidas e a lista de erros.
// O número da linha segue o arquivo: a linha 1 é o cabeçalho.
function validarCsv(conteudo) {
  const resultado = { totalLinhas: 0, validas: 0, erros: [] };
  const texto = conteudo.replace(/^\uFEFF/, ''); // remove marca invisível (BOM) que alguns editores colocam

  // Arquivo corrompido: bytes que não são texto válido
  if (texto.includes('\uFFFD') || texto.includes('\u0000')) {
    resultado.erros.push({ linha: 0, motivo: 'Arquivo corrompido ou com codificação inválida' });
    return resultado;
  }

  // Arquivo vazio
  if (texto.trim() === '') {
    resultado.erros.push({ linha: 0, motivo: 'Arquivo vazio' });
    return resultado;
  }

  const linhas = texto.split(/\r?\n/);
  if (linhas[linhas.length - 1] === '') {
    linhas.pop(); // ignora a quebra de linha no final do arquivo
  }

  // Formato: o cabeçalho precisa ser exatamente o esperado
  if (linhas[0].trim() !== CABECALHO) {
    resultado.erros.push({ linha: 1, motivo: 'Cabeçalho inválido' });
    return resultado;
  }

  const emailsVistos = new Set();

  for (let i = 1; i < linhas.length; i++) {
    const numeroLinha = i + 1;
    resultado.totalLinhas++;

    const colunas = linhas[i].split(',').map((coluna) => coluna.trim());
    const [nome, email, idade] = colunas;

    if (colunas.length !== 4) {
      resultado.erros.push({ linha: numeroLinha, motivo: 'Quantidade de colunas incorreta' });
    } else if (!nome) {
      resultado.erros.push({ linha: numeroLinha, motivo: 'Nome vazio' });
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      resultado.erros.push({ linha: numeroLinha, motivo: 'E-mail inválido' });
    } else if (!/^\d+$/.test(idade) || Number(idade) > 120) {
      resultado.erros.push({ linha: numeroLinha, motivo: 'Idade inválida' });
    } else if (emailsVistos.has(email)) {
      resultado.erros.push({ linha: numeroLinha, motivo: 'E-mail duplicado' });
    } else {
      emailsVistos.add(email);
      resultado.validas++;
    }
  }

  return resultado;
}

module.exports = { CABECALHO, gerarCsv, validarCsv };