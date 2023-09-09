export async function modifyFile(req, res) {
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