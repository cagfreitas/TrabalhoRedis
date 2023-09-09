const fileService = require('../services/fileService');

app.post("/alterar-arquivo/:nomeDoArquivo", fileService.modifyFile);
