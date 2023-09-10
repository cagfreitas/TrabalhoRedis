
const messageService = require('../services/messageService');

exports.answerMessages = async (req, res) => {
    const receivedMessage = req.body.message;
    try {
      const resposta = await messageService.getMessage(receivedMessage)
      if (resposta) {
        res.status(200).send({ resposta });
      } else {
        messageService.publishMessage('canalMensagens', receivedMessage);
        res.status(200).send({ resposta: "Não entendemos a pergunta. Aguarde, alguém entrará em contato." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Ocorreu um erro ao processar a solicitação.");
    }
}

exports.handleWebSocketMessage = async (req, res) => {
  try{
  messageService.connectToWSServer()
  }
  catch (error){
    res.status(500).send("Ocorreu um erro ao processar a solicitação.");

  }
}