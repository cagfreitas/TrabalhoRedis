const redis = require("redis");
const fs = require("fs");

let redisClient;

(async () => {
  redisClient = redis.createClient();
  redisClient.on("error", (error) => console.error(`Error : ${error}`));
  await redisClient.connect();
})();

exports.modifyFile = async(fileName, newText) => {
  try {
    await redisClient.set(fileName, newText);

    if (fs.existsSync(fileName)) {
      // Se o arquivo existir, sobrescreva seu conteúdo
      fs.writeFileSync(fileName, newText);
      return "Texto do arquivo atualizado com sucesso."
    } else {
      // Se o arquivo não existir, crie-o com o novo texto
      fs.writeFileSync(fileName, newText);
      return "Arquivo criado com sucesso." 
    }

  } catch (error) {
    throw("Ocorreu um erro ao atualizar o arquivo.");
  }
}