const express = require("express");
const axios = require("axios");
const redis = require("redis");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

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
    res.status(400).send("Invalid input. Please provide valid numbers.");
    return;
  }
  
  // Create a unique cache key for this sum
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
    res.status(500).send("Internal Server Error");
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


app.get("/sum/:num1/:num2", cacheSumData);
app.post("/responderMensagem", cacheMessage);
app.post("/alterar-arquivo/:nomeDoArquivo", alterarTexto);



app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
