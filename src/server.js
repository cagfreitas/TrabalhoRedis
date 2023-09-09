const express = require("express");
const redis = require("redis");
const fs = require("fs");
const http = require("http");
const socketIo = require("socket.io");
const messageService = require("./services/messageService")
const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app); // Criar um servidor HTTP a partir do Express
const io = socketIo(server);

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const initialMessages = messageService.initialMessages();

let redisClient;

(async () => {
  redisClient = redis.createClient();

  redisClient.on("error", (error) => console.error(`Error : ${error}`));
  await redisClient.connect();
})();

initialMessages.forEach((item) => {
  redisClient.set(item.mensagem, item.resposta, (err, reply) => {
    if (err) {
      console.error(`Erro ao salvar a mensagem: ${err}`);
    } else {
      console.log(`Mensagem salva com sucesso: ${item.mensagem}`);
    }
  });
});


app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
