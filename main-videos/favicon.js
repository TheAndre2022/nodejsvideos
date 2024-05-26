// Importe as dependências necessárias
const express = require('express');
const fs = require('fs');

// Crie um router para lidar com as rotas relacionadas a vídeos
const favico = express.Router();


// Função assíncrona para verificar se o arquivo existe e é um arquivo válido
async function check_file(filePath) {
  try {
    const stat = await fs.promises.stat(filePath);
    if (!stat.isFile()) {
      throw new Error('O arquivo não existe ou não é um arquivo válido.');
    }
  } catch (error) {
    throw new Error('Erro ao verificar o arquivo:', error);
  }
}

// Defina a rota para lidar com a solicitação de streaming de favico
favico.use("/", async function (req, res) {
  try {
    const file_path = '/home/gigante/oliveira2022/imagens/favicon.ico';
    // acertar o endereço acima mais tarde...
   
       // Checar se o arquivo existe
    await check_file(file_path);
   
    // Enviar o conteúdo do arquivo como resposta
    res.sendFile(file_path);
  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

module.exports = favico;
