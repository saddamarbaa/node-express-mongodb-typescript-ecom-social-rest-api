const Response = require('../utils/response');
const express = require('express');
const router = express.Router();

// GET home page.
router.get('/', (req, res) => {
  const message = `Welcome to Rest API`;
  const response = Response({}, true, false, message, 200);

  return res.status(response.status).send(response);
});

module.exports = router;
