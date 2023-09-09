export async function sumTwoNumbers(req, res, next) {
  const num1 = parseFloat(req.params.num1);
  const num2 = parseFloat(req.params.num2);

  let results;

  if (isNaN(num1) || isNaN(num2)) {
    res.status(400).send("Números inválidos. Por favor, insira números válidos.");
    return;
  }
  
  const cacheKey = `${num1}_${num2}`;

  try {
    const cacheResults = await redisClient.get(cacheKey);
    if (cacheResults) {
      results = JSON.parse(cacheResults);
      res.send({
        fromCache: true,
        data: results,
      });
    } else {
      // Calculate the sum
      const sum = num1 + num2;

      // Store the sum in the cache
      await redisClient.set(cacheKey, JSON.stringify(sum), {
        EX: 180,
        NX: true,
      });

      res.send({
        fromCache: false,
        data: sum,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Ocorreu um erro ao processar a solicitação.");
  }
}
