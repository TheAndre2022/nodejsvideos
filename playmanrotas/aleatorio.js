const express = require('express');
const DatabaseOperations = require('../databank/database.js');
const RedisClient = require('../redis-tools/redisClient');

const dbOperations = new DatabaseOperations();
const redisClient = new RedisClient();
const aleatorios = express.Router();
const RedisExpiration = require('../redis-tools/redisExpiration');

const Databasefavoritos = require('../databank/datafavoritos.js');
//const Redis = require('ioredis');
const DatabaseFavoritos = new Databasefavoritos();
const DatabaseLogin = require('../databank/datalogin.js');
const dbLogin = new DatabaseLogin();
const makeitequal = require ('../resources/playlist-libraries.js'); 

// Exemplo de uso em um script diferente
aleatorios.get("/", async function (req, res) {
    redisClient.ensureRedisClient();

    const chave = req.chave ?? 'IxMWE-FlMzE0-E0YzRlYj-lYjhj';
    const keys = chave || 'JjYmF-YyMGE2-E2MGY5ND-5NDhl';
    const chavePrincipal = redisClient.getRedisKey('conqueritall', keys, 'aleatorios');
    const descarte = req.query.descartar ?? 'nada';

    try {

        const id = await dbLogin.getIdFromKey(chave);

        if (!id || id === 9999) {
            return res.status(401).send('Acesso não autorizado');
        }


        if (descarte=='nada') {

        const cachedData = await RedisExpiration.getWithExpiration(redisClient, chavePrincipal);
        if (cachedData) {
            return res.json(cachedData);     }
        }

        let resposta = {};
        const consultar = await dbOperations.getAleatorios();
      

        resposta = makeitequal(consultar); 

        resposta['origem'] = 'aleatorios'; 
      //  console.log(resposta); 
      const unique_id = resposta['resultado'][0]['unique_id']; 

        const listar = await DatabaseFavoritos.insertPlaylist(id, 'aleatorios');
        // listar - cria a playlist aleatorios para o usuario, caso ela ainda não exista - Tem um jeito mais elegante de fazer isso?
        const adicionado = await DatabaseFavoritos.insertVideos(id, 'aleatorios', unique_id);
        if (!adicionado) { console.log("Unique_id já registrado " + unique_id ); }

        res.setHeader('Content-Type', 'application/json');

        await RedisExpiration.setWithExpiration(redisClient, chavePrincipal, JSON.stringify(resposta), 60); // Definindo tempo de expiração para 60 segundos
        res.json(resposta);
    } catch (error) {
        console.error('Erro ao executar a consulta SQL:', error);
        res.status(500).send('Erro interno no servidor');
    }
});

module.exports = aleatorios;
