// redisExpiration.js
// redisExpiration.js

const RedisExpiration = {
    async setWithExpiration(redisClient, key, value, expirationSeconds) {
        await redisClient.setValue(key, value);
        const expirationUnix = Math.floor(Date.now() / 1000) + expirationSeconds;
        await redisClient.setValue(key + '.expire', expirationUnix.toString());
    },

    async getWithExpiration(redisClient, key) {
        const value = await redisClient.getValue(key);
        if (!value) return null;

        const expirationUnix = await redisClient.getValue(key + '.expire');
        if (!expirationUnix) return null;

        const expirationTime = parseInt(expirationUnix, 10);
        const currentTime = Math.floor(Date.now() / 1000);

        if (currentTime > expirationTime) {
            console.log ("Achave venceu!!"); 
            // Chave expirada, retornar null
            return null;
        }

        // Chave válida, retornar o valor
       
        return JSON.parse(value);
    }
};


module.exports = RedisExpiration;
