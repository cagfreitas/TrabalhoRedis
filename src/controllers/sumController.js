const sumService = require('../services/sumService');

exports.sumTwoNumbers = async (req, res) =>{
  const num1 = parseFloat(req.params.num1);
  const num2 = parseFloat(req.params.num2);


  try {
   const result = await sumService.sumNumbers(num1, num2)
      res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Ocorreu um erro ao processar a solicitação.");
  }
}

