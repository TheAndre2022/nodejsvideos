const fs = require('fs').promises;
const path = require('path');
const express = require("express");

const cssdois = express.Router();

cssdois.use("/:cssdois", async function (req, res) {
console.log ("not here"); 
  try {
    let basePath = '';
    const fileName = req.params.cssdois || 'poster.jpg';
    let contentType = '';

    // Verificar a extensão do arquivo
    const extension = path.extname(fileName).toLowerCase();

    // Definir o caminho base e o tipo de conteúdo com base na extensão do arquivo
    switch(extension) {
    
      case '.css':
        basePath = '/home/andre/andromeda/oliveira2022/css/';
        contentType = 'text/css';
        break;
      default:
        basePath = '/home/andre/andromeda/oliveira2022/imagens/jpg/'; // Defina o caminho base padrão ou uma mensagem de erro
        contentType = 'image/jpeg';
        fileName = 'erro5.png';
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

module.exports = cssdois;

