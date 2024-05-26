const express = require('express');
const DatabaseOperations = require( '../databank/database.js');
const RedisClient = require('../redis-tools/redisClient');

const dbOperations = new DatabaseOperations();
const redisClient = new RedisClient();
const albuns = express.Router();
const RedisExpiration = require('../redis-tools/redisExpiration');
const makeitequal = require ('../resources/playlist-libraries.js'); 


// Exemplo de uso em um script diferente
albuns.get("/", async function (req, res) {
    redisClient.ensureRedisClient();

    const chave = req.chave ?? 'IxMWE-FlMzE0-E0YzRlYj-lYjhj';
    const keys = chave || 'JjYmF-YyMGE2-E2MGY5ND-5NDhl';
    const chavePrincipal = redisClient.getRedisKey('kefren', keys, 'albuns');
    try {
        let cachedData = {}; 
        cachedData = await RedisExpiration.getWithExpiration(redisClient, chavePrincipal);
        if (cachedData) {
         if (!cachedData['amber'] == 'b25b294cb4deb69ea00a4c3cf3113904801b6015e5956bd019a8570b1fe1d6040e944ef3cdee16d0a46503ca6e659a25f21cf9ceddc13f352a3c98138c15d6af')  { return res.json(cachedData);} 
         }

        let  resposta = {};
        const consultar = await dbOperations.getAlbumAleatorio();
        resposta = makeitequal(consultar); 
                if (resposta ['status'] == 'sem_resultados') {
            res.setHeader('Content-Type', 'application/json');
            res.json(resposta);
        }
   
        await RedisExpiration.setWithExpiration(redisClient, chavePrincipal, JSON.stringify(resposta), 60); 
        res.setHeader('Content-Type', 'application/json');
        res.json(resposta);

    } catch (error) {
        console.error('Erro ao executar a consulta SQL:', error);
        res.status(500).send('Erro interno no servidor');
    }
});

module.exports = albuns;


