const express = require('express');
const DatabaseOperations = require('../databank/database.js');
const RedisClient = require('../redis-tools/redisClient');
const DatabaseLogin = require('../databank/datalogin.js');
const RedisExpiration = require('../redis-tools/redisExpiration'); // Adicionando a importação do módulo RedisExpiration
const dbLogin = new DatabaseLogin();
const dbOperations = new DatabaseOperations();
const redisClient = new RedisClient();
const online = express.Router();
const crypto = require('crypto');


// Função para calcular o hash SHA-512
function calcularHash(dados) {
    return crypto.createHash('sha512').update(JSON.stringify(dados)).digest('hex');
}

online.get("/", async function (req, res) {
    redisClient.ensureRedisClient();

    const keys = req.chave || 'chaveerrada';
    const blococonsultado = req.query.bloco ?? 1;

    try {
        const id = await dbLogin.getIdFromKey(keys);
        if (!id || id === 9999) {
            return res.status(401).send('Acesso não autorizado');
        }

        const termo = 'nada a se fazer por aqui';
        const pesquisa = "online:" + id + '-2024';

        const cachedData = await RedisExpiration.getWithExpiration(redisClient, pesquisa);
        console.log("Tipo de dado retornado:", typeof cachedData); // Verificar o tipo de dado retornado

        if (cachedData) {

            try {
                // Converter o objeto para JSON e depois analisá-lo
                const cachedJSON = JSON.parse(JSON.stringify(cachedData));
                return res.json(cachedJSON);
            } catch (error) {
                console.error('Erro ao fazer parse do JSON cacheado:', error);
                return res.status(500).send('Erro interno no servidor');
            }
        }

        const resposta = {};
        const consultar = await dbOperations.getOnline(id);

        resposta['resultado'] = consultar || [];

        const resposta2 = {
            amber: calcularHash(resposta['resultado']),
            origem: 'online',
            status: consultar ? 'sucesso' : 'sem_resultados',
            conteudo: resposta
        };

        res.setHeader('Content-Type', 'application/json');

        const respostaJSON = JSON.stringify(resposta2);

        await RedisExpiration.setWithExpiration(redisClient, pesquisa, respostaJSON, 60);

        return res.json(resposta2);
    } catch (error) {
        console.error('Erro ao executar a consulta SQL:', error);
        return res.status(500).send('Erro interno no servidor');
    }
});

module.exports = online;
