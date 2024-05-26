handleRangeRequest(range, headers, res, userAgent) {
    const parts = range.replace(/bytes=/, '').split('-');
    const partialStart = parseInt(parts[0], 10);
    const partialEnd = parts[1] ? parseInt(parts[1], 10) : this.size - 1;

    let start;

    // Verifica se o agente do usuário indica um dispositivo iOS
    if (userAgent && userAgent.toLowerCase().includes('iphone')) {
        // Ajusta o início do intervalo para 0 para dispositivos iOS
        start = 0;
    } else {
        // Usa o início do intervalo normalmente para outros dispositivos
        start = Math.max(0, partialStart);
    }

    const end = Math.min(this.size - 1, partialEnd);

    headers['Content-Range'] = `bytes ${start}-${end}/${this.size}`;
    headers['Content-Length'] = end - start + 1;
    headers['Accept-Ranges'] = 'bytes';

    res.writeHead(206, headers);
    const fileStream = fs.createReadStream(this.path, { start, end, highWaterMark: this.buffer });
    fileStream.pipe(res);
}

app.use((req, res, next) => {
    const originalUrl = req.originalUrl || req.url;
    let chave;

    // Verifica se o cookie está presente na requisição
    if (req.cookies.login) {
        const cookieData = req.cookies.login;
        const parsedCookie = JSON.parse(cookieData);
        chave = parsedCookie.chave;

        // Renova o cookie por mais 3 horas
        const expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + (3 * 60 * 60 * 1000)); // Adiciona 3 horas
        res.cookie('login', JSON.stringify({ chave: chave }), { expires: expirationDate, httpOnly: true });

    } else {
        // Verifica se a chave está presente na URL
        const { chave: chaveURL } = req.query;
        if (chaveURL) {
            chave = chaveURL;

            // Cria um novo cookie com a chave e define o tempo de expiração para 3 horas
            const expirationDate = new Date();
            expirationDate.setTime(expirationDate.getTime() + (3 * 60 * 60 * 1000)); // Adiciona 3 horas
            res.cookie('login', JSON.stringify({ chave: chave }), { expires: expirationDate, httpOnly: true });
        }
    }

    // Se uma chave foi encontrada, adiciona ao objeto de solicitação para ser usado nas rotas
    if (chave) {
        req.chave = chave;
    }

    next();
});

