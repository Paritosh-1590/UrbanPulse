const KEYWORDS = [
  { category: 'Roads', words: ['pothole', 'road', 'pavement', 'footpath', 'manhole', 'traffic', 'asphalt', 'crater', 'speed breaker'] },
  { category: 'Sanitation', words: ['garbage', 'waste', 'trash', 'rubbish', 'dump', 'bin', 'litter', 'smell', 'collection', 'sweeping'] },
  { category: 'Water', words: ['water', 'tap', 'supply', 'leak', 'pipeline', 'pipe', 'pressure', 'contaminated', 'drinking'] },
  { category: 'Electricity', words: ['streetlight', 'street light', 'lamp', 'electricity', 'power', 'light pole', 'bulb', 'flicker', 'dark'] },
  { category: 'Drainage', words: ['drain', 'sewage', 'sewer', 'blocked', 'overflow', 'stagnant', 'flood', 'waterlogging', 'manhole cover'] },
];

const DEPARTMENT_BY_CATEGORY = {
  Roads: 'Roads & Infrastructure',
  Sanitation: 'Sanitation',
  Water: 'Water Supply',
  Electricity: 'Electrical',
  Drainage: 'Drainage',
  Other: 'General Services',
};

function classifyComplaint(text) {
  const normalized = String(text || '').toLowerCase();
  const scores = KEYWORDS.map(({ category, words }) => ({
    category,
    score: words.reduce((total, word) => total + (normalized.includes(word) ? (word.includes(' ') ? 2 : 1) : 0), 0),
  })).sort((a, b) => b.score - a.score);
  const top = scores[0];
  if (!top || top.score === 0) {
    return { category: 'Other', confidence: 0.35, department: DEPARTMENT_BY_CATEGORY.Other, source: 'keyword-fallback' };
  }
  const total = scores.reduce((sum, item) => sum + item.score, 0);
  const confidence = Math.min(0.94, 0.55 + (top.score / Math.max(total, 1)) * 0.35 + Math.min(top.score, 3) * 0.025);
  return {
    category: top.category,
    confidence: Number(confidence.toFixed(2)),
    department: DEPARTMENT_BY_CATEGORY[top.category],
    source: 'keyword-fallback',
  };
}

function inferPriority(text) {
  const normalized = String(text || '').toLowerCase();
  if (/danger|accident|injur|exposed wire|electric shock|collapse|fire|contaminat|overflowing sewage|flood|hospital|school/.test(normalized)) return 'High';
  if (/urgent|severe|major|heavy|blocked|not working for days|weeks/.test(normalized)) return 'Medium';
  return 'Low';
}

function slaDays(category, priority) {
  const categoryDays = { Roads: 5, Sanitation: 2, Water: 2, Electricity: 2, Drainage: 2, Other: 5 };
  const base = categoryDays[category] || 5;
  return priority === 'High' ? Math.max(1, base - 1) : base;
}

module.exports = { classifyComplaint, inferPriority, slaDays, DEPARTMENT_BY_CATEGORY };
