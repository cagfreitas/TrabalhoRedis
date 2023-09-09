const sumService = require('../services/sumService');

app.get("/sum/:num1/:num2", sumService.sumTwoNumbers);
