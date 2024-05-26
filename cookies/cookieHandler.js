// cookieHandler.js
const handleCookies = (req, res, next) => {
     
    let chave;

    if (req.cookies.login) {
        const cookieData = req.cookies.login;
        const parsedCookie = JSON.parse(cookieData);
        chave = parsedCookie.chave;

        // Renova o cookie por mais 3 horas
        const expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + (3 * 60 * 60 * 1000)); // Adiciona 3 horas
        res.cookie('login', JSON.stringify({ chave: chave }), { 
            expires: expirationDate, 
            httpOnly: true,
            sameSite: 'None', // Define o SameSite como None para permitir em contextos de terceiros
            secure: true // O cookie só será enviado em conexões HTTPS
        });

    } else {
        // Verifica se a chave está presente na URL
        const { chave: chaveURL } = req.query;
        if (chaveURL) {
            chave = chaveURL;

            // Cria um novo cookie com a chave e define o tempo de expiração para 3 horas
            const expirationDate = new Date();
            expirationDate.setTime(expirationDate.getTime() + (3 * 60 * 60 * 1000)); // Adiciona 3 horas
            res.cookie('login', JSON.stringify({ chave: chave }), { 
                expires: expirationDate, 
                httpOnly: true,
                sameSite: 'None', // Define o SameSite como None para permitir em contextos de terceiros
                secure: true // O cookie só será enviado em conexões HTTPS
            });
        }
    }

    // Se uma chave foi encontrada, adiciona ao objeto de solicitação para ser usado nas rotas
    if (chave) {
        req.chave = chave;
    }

    next();
};

module.exports = handleCookies;
 
