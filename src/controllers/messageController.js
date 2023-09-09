
const messageService = require('../services/messageService');

app.post("/responderMensagem", messageService.responderMensagem);
