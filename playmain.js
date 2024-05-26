// Módulos principais
const express = require("express");
const cookieParser = require('cookie-parser');
//const dayjs = require('dayjs');

// Rotas do Playman
const playList = require(__dirname + '/playmanrotas/consultar.js');
const aleatorios = require(__dirname + '/playmanrotas/aleatorio.js');
const incscore = require(__dirname + '/playmanrotas/increment.js');
const albuns = require(__dirname + '/playmanrotas/albuns.js');
const online = require(__dirname + '/playmanrotas/online.js');
const fotos = require(__dirname + '/playmanrotas/fotos.js');
const somente = require(__dirname + '/playmanrotas/somenteum.js');
const handleCookies = require(__dirname + '/cookies/cookieHandler');
const infos = require(__dirname + '/playmanrotas/infos.js');

// Outros módulos
const custom404 = require(__dirname + '/404.public.js');
const DadosSite = require(__dirname + '/merge/montarsite.js'); // Importe a função DadosSite
const favoritos = require (__dirname + '/favoritos/listastocar.js');
const path = require("path");


// Instância express
const app = express();
app.use(cookieParser());

// Middleware para log de acesso às rotas
// Seu arquivo principal (app.js ou server.js)

// Importe o manipulador de cookies

// Use o manipulador de cookies como middleware
app.use(handleCookies);

// Montagem dos middleware e rotas no nível raiz
app.use("/favoritos", favoritos);
app.use('/consultar', playList);
app.use('/aleatorio', aleatorios);
app.use('/somenteum', somente);
app.use('/infos', infos);
app.use('/album', albuns);
app.use('/online', online);
app.use('/score', incscore)
app.use('/fotos', fotos)
// Middleware para lidar com erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado!');
});

// Middleware para lidar com rotas não encontradas
app.use((req, res, next) => {
    res.status(404).send(custom404('n'));
});

// Inicialização do servidor
app.listen(7500, () => console.log('This server is running at  => https://oliveira2022.jumpingcrab.com/list'));
console.log('Inicialização concluída!');

