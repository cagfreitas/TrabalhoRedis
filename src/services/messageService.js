
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

exports.publishMessage = (channel, value) =>{
  redisPubClient.publish(channel, value);
}

exports.subscribe = (channelSubscribed, callback) => {
  redisClient.subscribe(channelSubscribed, (channel, message)=>{
    console.log('Message arrived')
    console.log('serv'+ message)
    callback(message)
  })
}

// async function cacheMessage(req, res) { 
 
//   try {
//   const mensagemRecebida = req.body.mensagem;

//     const resposta = await redisClient.get(mensagemRecebida);

//     if (resposta) {
//       res.status(200).send({ resposta });
//     } else {
//       res.status(200).send({ resposta: "Não entendemos a pergunta." });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Ocorreu um erro ao processar a solicitação.");
//   }
// };