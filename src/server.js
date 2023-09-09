const express = require("express");
const redis = require("redis");
const http = require("http");
const socketIo = require("socket.io");
const generalRoutes = require('./routes/generalRoutes');

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app); // Criar um servidor HTTP a partir do Express
const io = socketIo(server);
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/', generalRoutes)

const initialMessages = [
  { mensagem: "Olá", resposta: "Olá! Como posso ajudar você?" },
  { mensagem: "Como está o tempo hoje?", resposta: "Eu não sei, desculpe!" },
  { mensagem: "Qual é o meu saldo?", resposta: "Seu saldo é de $1000." },
];

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
