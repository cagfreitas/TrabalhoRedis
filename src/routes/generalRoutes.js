const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const sumController = require('../controllers/sumController');
const fileController = require('../controllers/fileController');

router.post("/responderMensagem", messageController.answerMessages)
router.get("/sum/:num1/:num2", sumController.sumTwoNumbers);
router.post("/alterar-arquivo/:fileName", fileController.fileController);

module.exports = router;
