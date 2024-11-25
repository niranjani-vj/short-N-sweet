const dotenv = require('dotenv');  // Load environment variables
const redis = require('redis');
dotenv.config();

// Replace these values with your Redis Cloud connection details
const redisClient = redis.createClient({
    url: process.env.REDIS_URL, // Example: 'redis://:password@hostname:port'
});

redisClient.on('connect', () => {
    console.log('Connected to Redis Cloud');
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

(async () => {
    await redisClient.connect(); // Connect to the Redis cloud instance
})();

module.exports = redisClient;
