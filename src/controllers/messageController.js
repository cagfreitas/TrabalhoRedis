
const messageService = require('../services/messageService');

exports.answerMessages = async (req, res) => {
    const receivedMessage = req.body.mensagem;
    try {
      await messageService.getMessage(receivedMessage)
      if (resposta) {
        res.status(200).send({ resposta });
      } else {
        res.status(200).send({ resposta: "Não entendemos a pergunta. Aguarde, alguém entrará em contato." });
      }
  
      // Publicar a mensagem recebida no canal de mensagens
      await messageService.publishMessage(receivedMessage);
    } catch (error) {
      console.error(error);
      res.status(500).send("Ocorreu um erro ao processar a solicitação.");
    }
}