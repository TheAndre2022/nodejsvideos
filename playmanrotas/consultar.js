const express = require('express');
const DatabaseOperations = require( '../databank/database.js');
const RedisClient = require('../redis-tools/redisClient');

const DatabaseLogin = require( '../databank/datalogin.js');
const dbLogin = new DatabaseLogin();

const dbOperations = new DatabaseOperations();

const redisClient = new RedisClient();
const playList = express.Router();
//const online = express.Router();

const Databasefavoritos = require('../databank/datafavoritos.js');
//const Redis = require('ioredis');
const DatabaseFavoritos = new Databasefavoritos();

const makeitequal = require ('../resources/playlist-libraries.js'); 


playList.get("/", async function (req, res) {
    redisClient.ensureRedisClient();

    const keys = req.chave || 'chaveerrada';
   // Trocar as nas outras ocorrencias
    const blococonsultado = req.query.bloco ?? 1;
    const termo = req.query.termo ?? 'Dengue';
   // const keys = chave || 'JjYmF-YyMGE2-E2MGY5ND-5NDhl';
    const pesquisa = redisClient.getRedisKey('pesquisa9', keys, termo);

    try {
        const id = await dbLogin.getIdFromKey(keys);
        if (!id || id === 9999) {
            resposta ['status'] = 'Acesso não autorizado';
            resposta['origem'] = 'consultar';


                res.setHeader('Content-Type', 'application/json');
                res.json(resposta);
        }

        const cachedData = await redisClient.getValue(redisClient.getRedisKey(id, pesquisa, termo));
        if (cachedData) {
            return res.json(JSON.parse(cachedData));
        }
        let resposta = {};
        const consultar = await dbOperations.searchPlaylist(termo, blococonsultado);
        resposta = makeitequal(consultar); 
        resposta['origem'] = 'consultar'; 
        resposta ['termopesquisado'] = termo; 

console.log (resposta['status']);  

        if (resposta['status'] === 'sem_resultados') { res.setHeader('Content-Type', 'application/json');
        res.json(resposta); return false;  }

         const unique_id = resposta['resultado'][0]['unique_id']; 
  
          const listar = await DatabaseFavoritos.insertPlaylist(id, 'aleatorios');
          // listar - cria a playlist aleatorios para o usuario, caso ela ainda não exista - Tem um jeito mais elegante de fazer isso?
          const adicionado = await DatabaseFavoritos.insertVideos(id, 'aleatorios', unique_id);
          if (!adicionado) { console.log("Unique_id já registrado " + unique_id ); }
          
        res.setHeader('Content-Type', 'application/json');
        await redisClient.setValue(redisClient.getRedisKey(id, pesquisa, termo), JSON.stringify(resposta));
        res.json(resposta);
    } catch (error) {
        console.error('Erro ao executar a consulta SQL:', error);
        res.status(500).send('Erro interno no servidor');
    }
});

module.exports = playList;
