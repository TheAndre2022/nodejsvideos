const express = require('express');
const crypto = require("crypto");
const DatabaseOperations = require('../databank/datafavoritos.js');
const DatabaseFavoritos = new DatabaseOperations();
const favoritos = express.Router();
const  redisClient = require ('../redis-tools/redisClient.js');
const DatabaseLogin = require('../databank/datalogin.js');
const dbLogin = new DatabaseLogin();
// Função para calcular o hash SHA-512
function calcularHash(dados) {
    return crypto.createHash('sha512').update(JSON.stringify(dados)).digest('hex');
}

favoritos.get("/", async function (req, res) {
    const chave = req.chave ?? 'IxMWE-FlMzE0-E0YzRlYj-lYjhj'; // Chave recebemos através de cookie na rotina principal
    const action_id = req.query.acao ?? 'adicionar';
    const playlist_id = req.query.playlist ?? 'aleatorios';
    const unique_id = req.query.unique_id ?? 'secreto';
    const termo = req.query.termo ?? 'Dengue';
   let  offset = parseInt(req.query.offset) ?? 1;
    if (isNaN(offset)) {
offset = 0; 
    }
   

   
    try {
         const id = await dbLogin.getIdFromKey(chave);

        if (!id || id === 9999) {

            let resposta7 = {}; 
            resposta7['origem'] = "favoritos";
            resposta7['status'] = 'Erro - Acesso não autorizado!';
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(resposta7));

            return false;   //   rn res.status(401).send('Acesso não autorizado');
        }

        let resposta = {};
        let resultado ={};
        let origem;
        origem = 'indefinida';

        //DatabaseFavoritos;
        switch (action_id) {

            case 'criar':
                const inserido = await DatabaseFavoritos.insertPlaylist(id, playlist_id);
                resposta['resultado'] = inserido ? 'Favorito adicionado com sucesso' : 'Erro ao adicionar favorito';
                origem = 'criar';
                break;

          case 'adicionar':
                const adicionado = await DatabaseFavoritos.insertVideos(id, playlist_id, unique_id);
                resposta['resultado'] = adicionado ? 'Adicionado a sua lista de preferência' : 'Erro ao adicionar favorito - talvez o vídeo já exista em sua lista?';
                origem = 'adicionar';
                break;

        case 'selecionar':
                                             const procuraparcial = await DatabaseFavoritos.sqlparcialVideos(id, playlist_id, offset);
                                             resposta = procuraparcial;
                                             origem = 'selecionar';
            break;

        case 'excluir':

            const excluaparmim = await DatabaseFavoritos.sqlDeleteregister (id, playlist_id, unique_id);

                                                   resposta = excluaparmim;
                                                   origem = 'excluir';
                                                   break;

        case 'listar':

                 const listeforme = await DatabaseFavoritos.sqlList (id, playlist_id);
                                                   resposta = listeforme;
                                                   origem ='listar';

            break;

            default:
                resposta['resultado'] = 'Ação inválida. Use "criar", "adicionar", "adicionar" ou "remover"';
                origem ='tutorial de uso da rota';
                break;
        }

        let resposta3 = {};
        resposta3 ['amber'] = calcularHash(resposta);
        resposta3['origem'] = origem;
        resposta3['status'] = resposta ? 'sucesso' : 'Erro - Algo não saiu de acordo com os seus planos, revisar o comando?';
        resultado ['resultado'] = resposta;
        resposta3['conteudo'] = resultado;


        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(resposta3));
    } catch (error) {
        console.error('Erro ao executar a consulta SQL:', error);
        res.status(500).send('Erro interno no servidor');
    }
});

module.exports = favoritos;
