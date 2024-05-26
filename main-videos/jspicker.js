const fs = require('fs').promises;
const path = require('path');
const express = require("express");

const jsimage = express.Router();

jsimage.use("/:jsimage", async function (req, res) {

  try {
    let basePath = '';
    const fileName = req.params.jsimage || 'poster.jpg';
    let contentType = '';

    // Verificar a extensão do arquivo
    const extension = path.extname(fileName).toLowerCase();

    // Definir o caminho base e o tipo de conteúdo com base na extensão do arquivo
    switch(extension) {
  
      case'.js':
        basePath = '/home/gigante/oliveira2022/js/';
        contentType = 'text/javascript';
        break; 
    
      default:
        basePath = '/home/gigante/oliveira2022/imagens/jpg/'; // Defina o caminho base padrão ou uma mensagem de erro
        contentType = 'image/jpeg';
        fileName = '404.jpg'; 
    }

    // Construir o caminho completo do arquivo
    const filePath = path.join(basePath, fileName);

    // Verificar se o arquivo existe
    await fs.access(filePath);

    // Enviar o arquivo com o tipo de conteúdo correto
    res.type(contentType).sendFile(filePath);
  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);
    
    res.status(500).send('Erro interno do servidor');
  }
});

module.exports = jsimage;

