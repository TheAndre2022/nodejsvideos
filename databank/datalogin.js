// Importe as dependências necessárias
const { pg_query, pg_query_now, generateRedisKey } = require('./db.js'); // Importe a função pg_query do arquivo db.js
const Redis = require('ioredis');

// Conexão com o Redis
const redisClient = new Redis({
    host: '127.0.0.1',
    port: 6379,
});

// Defina a classe para operações no banco de dados
class DatabaseLogin {
    // Método para buscar o ID associado à chave na tabela 'logged'
    // ok - funciona a contento
    async getIdFromKey(keys) {
        try {
            const sqlId = "SELECT sid FROM session WHERE chave = $1 LIMIT 1";
            const resultadoId = await pg_query_now(sqlId, [keys]);
            return resultadoId && resultadoId.length > 0 ? resultadoId[0].sid : 9999;
        } catch (error) {
            console.error('Erro ao buscar ID associado à chave:', error);
            const erroshappen = 'INSERT INTO errosacontecem (tipoerro) VALUES ($1)'; 
            await pg_query_now(erroshappen, [error]);
            throw error;
        }
    }



}

// Exporte a classe para ser utilizada em outros arquivos
module.exports =DatabaseLogin;
