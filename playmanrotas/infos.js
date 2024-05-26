const express = require('express');
const DatabaseOperations = require('../databank/database.js');
const RedisClient = require('../redis-tools/redisClient');
const makeitequal = require ('../resources/playlist-libraries.js'); 
const dbOperations = new DatabaseOperations();
const redisClient = new RedisClient();
const somente = express.Router();
const RedisExpiration = require('../redis-tools/redisExpiration');
const DatabaseLogin = require('../databank/datalogin.js');
const dbLogin = new DatabaseLogin();


const Databasefavoritos = require('../databank/datafavoritos.js');
//const Redis = require('ioredis');
const DatabaseFavoritos = new Databasefavoritos();


// Exemplo de uso em um script diferente
somente.get("/", async function (req, res) {
    redisClient.ensureRedisClient();

    const chave = req.chave ?? 'IxMWE-FlMzE0-E0YzRlYj-lYjhj';
    const unique_id= req.query.unique_id ?? 'Dengue';
    const keys = chave || 'JjYmF-YyMGE2-E2MGY5ND-5NDhl';
    const chavePrincipal = redisClient.getRedisKey('nada', keys, 'termo');
    const descarte = req.query.descartar ?? 'nada';

    try {

        const id = await dbLogin.getIdFromKey(chave);

        if (!id || id === 9999) {
            return res.status(401).send('const serializedData = JSON.stringify(data);Acesso não autorizado');
        }

        if (descarte=='nada') {

        const cachedData = await RedisExpiration.getWithExpiration(redisClient, chavePrincipal);
        if (cachedData) {
            return res.json(cachedData);     }
        }

        let  resposta = {};

        const consultar = await dbOperations.getInfos(unique_id);
      
        resposta = makeitequal(consultar); 
        resposta['origem'] = 'informations';
 
        res.setHeader('Content-Type', 'application/json');

        await RedisExpiration.setWithExpiration(redisClient, chavePrincipal, JSON.stringify(resposta), 60); // Definindo tempo de expiração para 60 segundos
      
        res.json(resposta);

    } catch (error) {
        console.error('Erro ao executar a consulta SQL:', error);
        res.status(500).send('Erro interno no servidor');
    }
});

module.exports = somente;
