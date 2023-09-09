const fileService = require('../services/fileService');

exports.fileController = async (req, res) =>{
  
  const fileName = req.params.fileName;
  const newText = req.body.newText;
  try {
    const response = await fileService.modifyFile(fileName, newText)
    res.status(200).send(response)
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
}