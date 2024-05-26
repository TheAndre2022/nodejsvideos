const fs = require('fs').promises;
const path = require('path');
const express = require("express");
const custom404 = require ('../404.public.js');
const imagem = express.Router();

imagem.use("/:imagem", async function (req, res) {

  try {
    let basePath = '';
    let fileName = req.params.imagem || 'poster.jpg';
    let contentType = '';

    // Verificar a extensão do arquivo
    const extension = path.extname(fileName).toLowerCase();

    // Definir o caminho base e o tipo de conteúdo com base na extensão do arquivo
    switch(extension) {
      case '.jpg':
      case '.jpeg':
        basePath = '/home/andre/andromeda/oliveira2022/imagens/jpg/';
        contentType = 'image/jpeg';
        break;
      case '.webp':
        basePath = '/home/andre/andromeda/oliveira2022/imagens/webp/';
        contentType = 'image/webp';
        break;
      case '.svg':
        basePath = '/home/andre/andromeda/oliveira2022/imagens/svg/';
        contentType = 'image/svg+xml';
        break;
      
      default:
        basePath = '/home/andre/andromeda/oliveira2022/imagens/jpg/'; // Defina o caminho base padrão ou uma mensagem de erro
        contentType = 'image/jpeg';
        fileName = 'erro5.jpg';
    }

    // Construir o caminho completo do arquivo
    const filePath = path.join(basePath, fileName);

    // Verificar se o arquivo existe
    await fs.access(filePath);

    // Enviar o arquivo com o tipo de conteúdo correto
    res.type(contentType).sendFile(filePath);
  } catch (error) {

        basePath = '/home/andre/andromeda/oliveira2022/imagens/jpg/'; // Defina o caminho base padrão ou uma mensagem de erro
        contentType = 'image/jpeg';
        fileName = 'erro5.jpg';
        const filePath2 = path.join(basePath, fileName);
        console.error('Erro ao processar a solicitação:', error);
        res.type(contentType).sendFile(filePath2);

  }
});

module.exports = imagem;

