// dados-site.js

function DadosSite(pagina) {
    console.log ("Minha pagina é " +  pagina);
    const horaAtual = new Date().getHours();
let dados = {};
dados = { subject: 'Nada encontrado aqui' ,    name: 'site de testes',
    link: 'https://oliveira2022.jumpingcrab.com'};

if (pagina == 'about')

    {
     dados ={
    subject: 'Testes com ejs',
    name: 'My Beloved place for doing nothing',
    link: 'https://oliveira2022.jumpingcrab.com'
};
    }

if (pagina == 'login') {
  dados ={
    subject: 'Visite o meu site de testes',
    name: 'site de testes',
    link: 'https://oliveira2022.jumpingcrab.com'
};
}

console.log ("algum dado aqui " + dados ['name']);

return dados; 

return false; 
}
module.exports = DadosSite;
