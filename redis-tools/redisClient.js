const Redis = require('ioredis');
const crypto = require('crypto');

class RedisClient {
    constructor() {
        this.client = this.createClient();
        this.client.on('error', (error) => {
            console.error('Erro na conexão Redis:', error);
        });
    }

    createClient() {
        return new Redis({
            port: 6379,
            host: '127.0.0.1'
        });
    }

    async ensureRedisClient() {
        // Não há necessidade de verificar a conexão, pois estamos usando apenas um nó Redis
        return this.client;
    }

    async close() {
        // Fechar o cliente quando necessário
        this.client.quit();
    }

    getRedisKey(id, playlist_id, unique_id) {
        const redisKeys = id + '&' + playlist_id + '&' + unique_id;
        return 'play' + crypto.createHash("md5").update(redisKeys).digest("hex");
    }

    async getValue(key) {
        return new Promise((resolve, reject) => {
            this.client.get(key, (err, value) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(value);
                }
            });
        });
    }

    async setValue(key, value, expire = 180) {
        return new Promise((resolve, reject) => {
            this.client.set(key, value, 'EX', expire, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

module.exports = RedisClient;

