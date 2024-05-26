// Importe as dependências necessárias
const express = require('express');
//const { pg_query } = require('./db.js');
const VideoStream = require('./streaming.js');
const DatabaseOperations = require('../databank/database.js'); // Importe a classe DatabaseOperations
//const crypto = require("crypto");
const DatabaseLogin = require('../databank/datalogin.js');
const dbLogin = new DatabaseLogin();

const DatabasetheOperations = require('../databank/datafavoritos.js');
const DatabaseFavoritos = new DatabasetheOperations();

// Crie um router para lidar com as rotas relacionadas a vídeos
const videoRouter = express.Router();
const dbOperations = new DatabaseOperations(); // Crie uma instância da classe DatabaseOperations

// Defina a rota para lidar com a solicitação de streaming de vídeo
videoRouter.get("/", async function (req, res) {

    const keys = req.chave || 'chaveerrada';
    // Trocar as nas outras ocorrencias


    const unique_id = req.query.unique_id || 'MTViN-iNzVj-YTU0Z-c5MTBlOTdmYz';
  
    
  try {
    const id = await dbLogin.getIdFromKey(keys); // Busca o ID associado à chave na tabela 'logged'
    
    if (!id) return res.status(401).send('Acesso não autorizado ');
    if (id == 9999) return res.status(401).send('Acesso não autorizado - Quem é você?');
    const videoFilePath = await dbOperations.getVideoAddress(unique_id); // Busca o endereço do vídeo na tabela 'datavideos'
 

    if (!videoFilePath) {
      console.log('Erro 404 - Video não encontrado - O Arquivo não existe, verifique o que aconteceu...' + unique_id );
      return res.status(404).send('Video não Encontrado');
    }
   
    const resultadoIncrement = await dbOperations.incrementScore(unique_id); // Insere o ID e o número do vídeo na tabela 'online'
    if (!resultadoIncrement) {
      console.log("Erro 500 - Erro ao aumentar o score do video");
      return res.status(500).send('Erro interno no servidor');
    }


    const inserido = await DatabaseFavoritos.insertPlaylist(id, 'online');
    const resultadoInsert = await DatabaseFavoritos.insertVideos(id, 'online', unique_id);

 //  const resultadoInsert = await dbOperations.insertOnline(id, unique_id); // Insere o ID e o número do vídeo na tabela 'online'
   if (!resultadoInsert) {
     console.log("Erro 500 - Erro ao inserir na tabela online");
   //  return res.status(500).send('Erro interno no servidor');
   }

      const videoStream = new VideoStream(videoFilePath);
      videoStream.streamVideo(req, res);
  
  } catch (error) {
    console.error('Erro ao executar a consulta SQL:', error);
    res.status(500).send('Erro interno no servidor');
  }
});

// Exporte o router para ser importado em outros arquivos
module.exports = videoRouter;
