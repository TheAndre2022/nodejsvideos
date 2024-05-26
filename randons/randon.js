const axios = require('axios');
const crypto = require('crypto');

async function getRandomNumbers(num) {
    try {
        const response = await axios.get(`https://www.random.org/integers/?num=${num}&min=1&max=100&col=1&base=10&format=plain&rnd=new`);
        const randomNumbers = response.data.trim().split('\n').map(Number);
        return randomNumbers;
    } catch (error) {
        console.error('Erro ao obter números aleatórios:', error);
        return null;
    }
}



function getRandomBytes(size) {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(size, (err, buffer) => {
            if (err) {
                reject(err);
            } else {
                resolve(buffer);
            }
        });
    });
}

(async () => {
    try {
        const randomBuffer = await getRandomBytes(16);  // Obtém 16 bytes de dados aleatórios
        console.log('Bytes aleatórios:', randomBuffer);
    } catch (error) {
        console.error('Erro ao obter bytes aleatórios:', error);
    }
})();

(async () => {
    const numbers = await getRandomNumbers(10);  // Obtém 10 números aleatórios
    if (numbers) {
        console.log('Números aleatórios:', numbers);
    }
})();

