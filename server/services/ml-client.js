const { classifyComplaint, DEPARTMENT_BY_CATEGORY } = require('./classifier');
const { CATEGORIES } = require('../constants');

async function suggestCategory(text, config) {
  if (config && config.mlServiceUrl) {
    try {
      const response = await fetch(`${config.mlServiceUrl}/predict/text`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(2500),
      });
      if (response.ok) {
        const result = await response.json();
        if (CATEGORIES.includes(result.category)) {
          return {
            category: result.category,
            confidence: Number(result.confidence || 0),
            department: DEPARTMENT_BY_CATEGORY[result.category],
            source: 'python-ml-service',
            model: result.model || 'TF-IDF + Logistic Regression',
          };
        }
      }
    } catch (_error) {
      // A local rule-based fallback keeps complaint submission usable when Flask is down.
    }
  }
  return classifyComplaint(text);
}

module.exports = { suggestCategory };
