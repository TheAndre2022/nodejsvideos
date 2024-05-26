const crypto = require('crypto'); // Importando o módulo crypto para calcular o hash

// Função para calcular o hash SHA-512
function calcularHash(dados) {
    return crypto.createHash('sha512').update(JSON.stringify(dados)).digest('hex');
}

// Exemplo de uso em um script diferente
function makeitequal(consultar)

{
    let resposta = {};

//    console.log (consultar);

        try {

        resposta['amber'] = calcularHash(consultar);
        resposta['status'] = consultar ? 'sucesso' : 'sem_resultados';
        resposta ['resultado'] = consultar;
        return resposta;

}
// E se consultar vier com mais de um registro?
  catch (error) {
        console.error('Erro ao executar ao efetuar a parametrização da resposta consulta SQL:', error);
        return false;
    }
}

module.exports = makeitequal;

