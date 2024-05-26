const crypto = require('crypto');
const { Pool } = require('pg');
const ini = require('ini');
const fs = require('fs');
const Redis = require('ioredis');

// Conexão com o Redis
const redisClient = new Redis({
    host: '127.0.0.1',
    port: 6379,
});

let globalPool = null;

async function connectToPool() {
    if (globalPool) return globalPool;

    try {
        const configData = fs.readFileSync('/home/andre/andromeda/oliveira2022/global/global.ini', 'utf-8');
        const config = ini.parse(configData);

        const pool = new Pool({
            user: config.BD.username,
            host: config.BD.servername,
            database: config.BD.dbname,
            password: config.BD.password,
            port: config.BD.port,
        });

        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();

        globalPool = pool;
        return pool;
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
        throw error;
    }
}

async function generateRedisKey(sql, extra) {
    const hash = crypto.createHash('md5').update(sql + extra).digest('hex');
    return `VideosAleatorios:${hash}`;
}

async function pg_query(sql, extra) {
    try {
        const extra2 = 'A key to make me myselfs'; 
            const pool = await connectToPool();
            const client = await pool.connect();
            const res = await client.query(sql, extra);
            client.release();
            return res.rows;
     } catch (error) {
        console.error('Erro ao consultar o banco de dados ou Redis:', error);
        console.log('Veja o SQL gerado:', sql);
        throw error;
    }
}

async function pg_query_now(sql, extra) {
    try {
        const pool = await connectToPool();
        const client = await pool.connect();
        const res = await client.query(sql, extra);
        client.release();
        return res.rows;
    } catch (error) {
        console.error('Erro ao consultar o banco de dados:', error);
        console.log('Veja o SQL gerado:', sql);
        throw error;
    }
}

module.exports = {
    pg_query,
    generateRedisKey, 
    pg_query_now,

};
