const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const sumController = require('../controllers/sumController');
const fileController = require('../controllers/fileController');
const queue = require('../wsServer/app-ws')

router.post("/responderMensagem", messageController.answerMessages)
router.get("/sum/:num1/:num2", sumController.sumTwoNumbers);
router.post("/alterar-arquivo/:fileName", fileController.fileController);
router.post('/websocket/message', messageController.handleWebSocketMessage)
router.post('/channel1', (req, res) => {
  queue.publish("canalMensagens", req.body.message);
  res.json({ message: 'Your request will be processed by Channel 1!' });
});

router.post('/channel2', (req, res) => {
  queue.publish("channel2", req.body);
  res.json({ message: 'Your request will be processed by Channel 2!' });
});

module.exports = router;
