import redisPoolFactory from 'redis-connection-pool';
const redisPool = await redisPoolFactory('myRedisPool', {
    max_clients: 5, // default
    redis: {
      url: 'redis://localhost:6379'
    }
  });


await redisPool.set('test-key', 'foobar');
const foo = await redisPool.get('test-key');
console.log(foo);
// returns 'foobar'
