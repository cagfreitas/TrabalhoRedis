const redis = require("redis");

let redisClient;

(async () => {
  redisClient = redis.createClient();

  redisClient.on("error", (error) => console.error(`Error : ${error}`));
  await redisClient.connect();
})();

exports.sumNumbers = async (num1, num2) => {
  if (isNaN(num1) || isNaN(num2)) {
    throw "Números inválidos. Por favor, insira números válidos.";
  }
  
  const cacheKey = `${num1}_${num2}`;
  let result, fromCache
  
  try{
    const cacheResults = await redisClient.get(cacheKey);
    if(cacheResults){
      result = JSON.parse(cacheResults);
      fromCache = true;
    } else {
      result = num1 + num2;
      fromCache = false;
      await redisClient.set(cacheKey, JSON.stringify(result), {
        EX: 180,
        NX: true,
      });
    }

    const response = {
      fromCache: fromCache,
      result: result,
    }

    return response;

  }catch(error){
    throw error;
  }

}