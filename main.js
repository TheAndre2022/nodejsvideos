const fs = require("fs");
const express = require("express");
var path    = require("path");
const cookieParser = require('cookie-parser');


const custom404 = require ('./404.public.js');

const videoRouter = require( __dirname + '/main-videos/videoRouter.js');
const imagem = require (__dirname + '/main-videos/image.js');
const jsimage = require (__dirname + '/main-videos/jspicker.js');
const cssdois = require (__dirname + '/main-videos/css.js');
const favico = require (__dirname + '/main-videos/favicon.js');


// Instância express
const app = express();
app.use(cookieParser());
// Middleware para log de acesso às rotas

// Importe o manipulador de cookies
const handleCookies = require(__dirname + '/cookies/cookieHandler');
// Use o manipulador de cookies como middleware
app.use(handleCookies);


// Rotas principais

app.use("/", videoRouter);
app.use("/css", cssdois);
app.use("/js", jsimage);
app.use("/img", imagem);
app.use("//favicon.ico", favico);

// Rota que está com problema
//app.use("/video", videoRouter);

// Repor depois de corrigir o errro !!
//app.use('/',function(req,res){
//    res.sendFile(path.join(__dirname+'/index.html'));
//  });

app.use((req, res, next) => {
    res.status(404).send(custom404('n'));
});

// Middleware para lidar com erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado!');
});


// Inicialização do servidor
app.listen(8009, () => console.log('server is running at  => https://oliveira2022.jumpingcrab.com/videos'));
console.log('Inicialização concluída!');
