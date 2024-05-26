const fs = require('fs');
const path = require('path');
const express = require('express');
const DatabaseOperations = require('../databank/database.js');
const DatabaseLogin = require('../databank/datalogin.js');
const dbLogin = new DatabaseLogin();
const dbOperations = new DatabaseOperations();
const fotos = express.Router();

// Função para alterar a extensão do arquivo
function changeExtension(filePath, newExtension) {
    const extname = path.extname(filePath);
    const newPath = filePath.replace(extname, `.${newExtension}`);
    return newPath;
}

// Função para verificar se o arquivo existe e retornar seu conteúdo
function getFileContent(filePath, callback) {
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            callback(err, null);
        } else {
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, data);
                }
            });
        }
    });
}

// Função para obter o tipo MIME com base na extensão do arquivo
function getContentType(extension) {
    switch (extension) {
        case 'gif':
            return 'image/gif';
        case 'png':
            return 'image/png';
        case 'webp':
            return 'image/webp';
        case 'jpeg':
        case 'jpg':
            return 'image/jpeg';
        case 'heic':
            return 'image/heic';
        default:
            return 'application/octet-stream';
    }
}

fotos.get("/", async function (req, res) {
    try {
        const unique_id = req.query.unique_id ?? 'MmQyN-5MDU0-MjZlN-U4NDZkMTM3Mj';
        const consultar = await dbOperations.getVideoAddress(unique_id);
        serveVideo(req, res, consultar);
    } catch (error) {
        console.error('Erro ao executar a consulta SQL:', error);
        res.status(500).send('Erro interno no servidor');
    }
});

// Função principal
function serveVideo(req, res, videoPath) {
    const extensions = ['gif', 'png', 'webp', 'jpeg', 'jpg', 'heic'];
    let fileFound = false;

    // Verifica cada extensão e tenta servir o arquivo
    extensions.forEach(ext => {
        const filePath = changeExtension(videoPath, ext);
        if (fs.existsSync(filePath)) {
            fileFound = true;
            const stream = fs.createReadStream(filePath);
            const contentType = getContentType(ext);
            res.setHeader('Content-Type', contentType);
            stream.pipe(res);
        }
    });

    // Se nenhum arquivo for encontrado, retorna um erro
    if (!fileFound) {
        const filePath2 = '/home/andre/andromeda/oliveira2022/imagens/jpg/erro5.jpg';
        const ext = 'jpg'; // Certifique-se de declarar 'ext' como constante
        fileFound = true;
        const stream = fs.createReadStream(filePath2);
        const contentType = getContentType(ext);
        res.setHeader('Content-Type', contentType);
        stream.pipe(res);
    }
}

module.exports = fotos;
