const express = require('express');
const { suggestCategory } = require('../services/ml-client');

function createAiRouter(config) {
  const router = express.Router();
  router.post('/classify', async (req, res) => {
    const text = String(req.body.text || '').trim();
    if (text.length < 10 || text.length > 2500) {
      return res.status(400).json({ success: false, message: 'Enter between 10 and 2,500 characters to classify.' });
    }
    const suggestion = await suggestCategory(text, config);
    return res.json({ success: true, data: suggestion });
  });
  return router;
}

module.exports = createAiRouter;
