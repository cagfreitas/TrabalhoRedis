
const redis = require("redis");
const WebSocket = require('ws');

const redisClient = redis.createClient();
const redisPubClient = redis.createClient();
redisClient.connect();
redisPubClient.connect();

exports.getMessage = async (receivedMessage) => {
  try {
    const response = await redisClient.get(receivedMessage);
    return response
  } catch (error) {
    console.error("Erro ao recuperar mensagem:", error);
  }
}