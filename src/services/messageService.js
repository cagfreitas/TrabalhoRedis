
export function initialMessages () {
  const messages = [
    { mensagem: "Olá", resposta: "Olá! Como posso ajudar você?" },
    { mensagem: "Como está o tempo hoje?", resposta: "Eu não sei, desculpe!" },
    { mensagem: "Qual é o meu saldo?", resposta: "Seu saldo é de $1000." },
  ];
   return messages
}

export async function publicarMensagem(mensagem) {
  try {
    await redisClient.publish("canalMensagens", mensagem);
  } catch (error) {
    console.error("Erro ao publicar mensagem:", error);
  }
}

export async function responderMensagem(req,res){
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