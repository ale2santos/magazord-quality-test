# Questão 3.1 - Importação de CSV

## Observação sobre o site de teste

Antes de automatizar, testei o site manualmente com curl. Ele aceita qualquer arquivo, inclusive vazio, e só recusa o envio quando nenhum arquivo é escolhido. Por isso separei os testes em duas camadas: o upload no site e a validação do conteúdo, feita por um validador (`utils/csv-generator.js`) que representa o que o sistema real deveria fazer ao importar.

## 3.1.a) Como validar que todas as 1000 linhas foram processadas corretamente?

Comparo o que foi enviado com o que foi processado:
- a quantidade de linhas processadas deve ser igual à quantidade enviada (nenhuma linha perdida);
- a quantidade de linhas válidas deve ser igual ao total (nenhuma linha com erro);
- a lista de erros deve estar vazia.

No teste CT01, faço isso com 10, 100 e 1000 linhas geradas automaticamente, com e-mails únicos.

Num sistema real, também conferiria no banco ou pela API: total de registros criados, uma amostra de linhas comparada campo a campo, e que nenhum registro foi duplicado.

## 3.1.b) Como testar cenários de erro (arquivo corrompido, dados inválidos)?

Criei arquivos de exemplo na pasta `fixtures`, cada um com um tipo de problema:
- `vazio.csv`: arquivo sem conteúdo;
- `formato-incorreto.csv`: cabeçalho em inglês e separador `;`;
- `malformado.csv`: uma linha válida e cinco com erros diferentes (e-mail inválido, idade não numérica, coluna faltando, e-mail duplicado, nome vazio);
- `corrompido.csv`: bytes de uma imagem PNG renomeada para `.csv`.

O validador recusa cada um com o motivo correto e, no malformado, aponta o número de cada linha com erro. Um bom sistema de importação deve dizer ao usuário exatamente qual linha corrigir, em vez de recusar o arquivo inteiro sem explicação.