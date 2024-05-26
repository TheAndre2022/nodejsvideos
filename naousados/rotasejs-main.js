const express = require("express");
const custom404 = require(__dirname + '/404.public.js');
const cookieParser = require('cookie-parser');
const DadosSite = require(__dirname + '/merge/montarsite.js'); // Importe a função DadosSite
const favoritos = require (__dirname + '/favoritos/listastocar.js');

// Instância express
const app = express();
app.use(cookieParser());

// Middleware para log de acesso às rotas
app.use((req, res, next) => {
    const originalUrl = req.originalUrl || req.url;
    let chave;

    // Verifica se a chave está presente no cookie
    if (req.cookies.login) {
        const cookieData = req.cookies.login;
        const parsedCookie = JSON.parse(cookieData);
        chave = parsedCookie.chave;
        console.log('Chave do cookie:', chave);
    } else {
        // Verifica se a chave está presente na URL
        const { chave: chaveURL } = req.query;
        if (chaveURL) {
            chave = chaveURL;
            console.log('Chave da URL:', chave);
        }
    }

    // Se uma chave foi encontrada, adiciona ao objeto de solicitação para ser usado nas rotas
    if (chave) {
        req.chave = chave;
    }

    console.log('Rota acessada:', originalUrl);
    next();
});

// Middleware para configurar o mecanismo de visualização EJS
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Rota para renderizar o template EJS e passar os dados dinâmicos
app.get('/about', function(req, res) {
    res.render('pages/about', { dadosSite: DadosSite('about')});
    });

app.use("/favoritos", favoritos);

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
app.listen(7600, () => console.log('The server is listening at https://oliveira2022.jumpingcrab.com/sites/'));
console.log('Inicialização concluída!');

// Middleware para configurar o mecanismo de visualização EJS

//app.set("view engine", "ejs");
//app.set("views", path.join(__dirname, "views"));

// Rota para renderizar o template EJS e passar os dados dinâmicos
//app.get('/about', function(req, res) {
 //   res.render('pages/about', { dadosSite: DadosSite('about')});
 //   });

 