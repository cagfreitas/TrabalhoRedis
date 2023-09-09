const express = require("express");
const redis = require("redis");
const fs = require("fs");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app); // Criar um servidor HTTP a partir do Express
const io = socketIo(server);

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

let redisClient;

(async () => {
  redisClient = redis.createClient();

  redisClient.on("error", (error) => console.error(`Error : ${error}`));
  await redisClient.connect();
})();

const mensagens = [
  { mensagem: "Olá", resposta: "Olá! Como posso ajudar você?" },
  { mensagem: "Como está o tempo hoje?", resposta: "Eu não sei, desculpe!" },
  { mensagem: "Qual é o meu saldo?", resposta: "Seu saldo é de $1000." },
];

mensagens.forEach((item) => {
  redisClient.set(item.mensagem, item.resposta, (err, reply) => {
    if (err) {
      console.error(`Erro ao salvar a mensagem: ${err}`);
    } else {
      console.log(`Mensagem salva com sucesso: ${item.mensagem}`);
    }
  });
});

async function cacheSumData(req, res, next) {
  const num1 = parseFloat(req.params.num1);
  const num2 = parseFloat(req.params.num2);

  let results;

  if (isNaN(num1) || isNaN(num2)) {
    res.status(400).send("Números inválidos. Por favor, insira números válidos.");
    return;
  }
  
  const cacheKey = `${num1}_${num2}`;

  try {
    const cacheResults = await redisClient.get(cacheKey);
    if (cacheResults) {
      results = JSON.parse(cacheResults);
      res.send({
        fromCache: true,
        data: results,
      });
    } else {
      // Calculate the sum
      const sum = num1 + num2;

      // Store the sum in the cache
      await redisClient.set(cacheKey, JSON.stringify(sum), {
        EX: 180,
        NX: true,
      });

      res.send({
        fromCache: false,
        data: sum,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Ocorreu um erro ao processar a solicitação.");
  }
}

async function alterarTexto(req, res) {
  const nomeDoArquivo = req.params.nomeDoArquivo;
  const novoTexto = req.body.novoTexto;

  try {
    await redisClient.set(nomeDoArquivo, novoTexto);

    if (fs.existsSync(nomeDoArquivo)) {
      // Se o arquivo existir, sobrescreva seu conteúdo
      fs.writeFileSync(nomeDoArquivo, novoTexto);
      res.status(200).send("Texto do arquivo atualizado com sucesso.");  
    } else {
      // Se o arquivo não existir, crie-o com o novo texto
      fs.writeFileSync(nomeDoArquivo, novoTexto);
      res.status(200).send("Arquivo criado com sucesso.");  
    }

  } catch (error) {
    console.error(error);
    res.status(500).send("Ocorreu um erro ao atualizar o arquivo.");
  }
}

async function cacheMessage(req, res) { 
 
  try {
  const mensagemRecebida = req.body.mensagem;

    const resposta = await redisClient.get(mensagemRecebida);

    if (resposta) {
      res.status(200).send({ resposta });
    } else {
      res.status(200).send({ resposta: "Não entendemos a pergunta." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Ocorreu um erro ao processar a solicitação.");
  }
};

async function alterarTexto(req, res) {
    const nomeDoArquivo = req.params.nomeDoArquivo;
    const novoTexto = req.body.novoTexto;
  
    try {
      await redisClient.set(nomeDoArquivo, novoTexto);
  
      fs.writeFileSync(nomeDoArquivo, novoTexto);
  
      res.status(200).send("Texto do arquivo atualizado com sucesso.");
    } catch (error) {
      console.error(error);
      res.status(500).send("Ocorreu um erro ao atualizar o arquivo.");
    }
}

async function publicarMensagem(mensagem) {
  try {
    await redisClient.publish("canalMensagens", mensagem);
  } catch (error) {
    console.error("Erro ao publicar mensagem:", error);
  }
}

async function responderMensagem(req,res){
    const mensagemRecebida = req.body.mensagem;
    try {
      const resposta = await redisClient.get(mensagemRecebida);
  
      if (resposta) {
        res.status(200).send({ resposta });
      } else {
        res.status(200).send({ resposta: "Não entendemos a pergunta. Aguarde, alguém entrará em contato." });
      }
  
      // Publicar a mensagem recebida no canal de mensagens
      await publicarMensagem(mensagemRecebida);
    } catch (error) {
      console.error(error);
      res.status(500).send("Ocorreu um erro ao processar a solicitação.");
    }
}


io.on("connection", (socket) => {
  const redisSubscriber = redis.createClient();

  redisSubscriber.on("error", (error) => console.error(`Error: ${error}`));

  // Inscrever-se no canal de mensagens
  redisSubscriber.subscribe("canalMensagens");

  // Quando uma mensagem é recebida no canal, envie-a para o cliente via Socket.io
  redisSubscriber.on("message", (channel, message) => {
    socket.emit("mensagem", { canal: channel, mensagem: message });
  });

  socket.on("disconnect", () => {
    // Desinscrever-se do canal e fechar a conexão do cliente de subscrição quando o cliente se desconectar
    redisSubscriber.unsubscribe();
    redisSubscriber.quit();
  });
});


app.get("/sum/:num1/:num2", cacheSumData);
app.post("/alterar-arquivo/:nomeDoArquivo", alterarTexto);
app.post("/responderMensagem", responderMensagem);



app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
