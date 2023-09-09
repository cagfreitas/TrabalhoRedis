const redis = require("redis");

let redisClient;

(async () => {
  redisClient = redis.createClient();

  redisClient.on("error", (error) => console.error(`Error : ${error}`));
  await redisClient.connect();
})();

exports.getMessage = async (receivedMessage) => {
  try {
    const response = await redisClient.get(receivedMessage);
    return response
  } catch (error) {
    console.error("Erro ao recuperar mensagem:", error);
  }
}

exports.publishMessage = async (mensagem) => {
  try {
    await redisClient.publish("canalMensagens", mensagem);
  } catch (error) {
    console.error("Erro ao publicar mensagem:", error);
  }
}


// io.on("connection", (socket) => {
//   const redisSubscriber = redis.createClient();

//   redisSubscriber.on("error", (error) => console.error(`Error: ${error}`));

//   // Inscrever-se no canal de mensagens
//   redisSubscriber.subscribe("canalMensagens");

//   // Quando uma mensagem é recebida no canal, envie-a para o cliente via Socket.io
//   redisSubscriber.on("message", (channel, message) => {
//     socket.emit("mensagem", { canal: channel, mensagem: message });
//   });

//   socket.on("disconnect", () => {
//     // Desinscrever-se do canal e fechar a conexão do cliente de subscrição quando o cliente se desconectar
//     redisSubscriber.unsubscribe();
//     redisSubscriber.quit();
//   });
// });

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