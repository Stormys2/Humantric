// ─── HABIT DEFINITIONS ───────────────────────────────────────────────────────
export const CATEGORIES = [
  {
    id: 'physical',
    icon: '🏃',
    weight: 0.35,
    habits: [
      { id: 'sleep',     icon: '😴', points: 20 },
      { id: 'exercise',  icon: '💪', points: 18 },
      { id: 'water',     icon: '💧', points: 12 },
      { id: 'nutrition', icon: '🥗', points: 14 },
      { id: 'sunlight',  icon: '☀️', points: 12 },
      { id: 'no_alcohol',icon: '🚫', points: 12 },
      { id: 'no_substances', icon: '✋', points: 12 },
    ],
  },
  {
    id: 'mental',
    icon: '🧠',
    weight: 0.25,
    habits: [
      { id: 'meditation', icon: '🧘', points: 22 },
      { id: 'reading',    icon: '📚', points: 20 },
      { id: 'no_screens', icon: '📵', points: 18 },
      { id: 'learning',   icon: '🎓', points: 20 },
      { id: 'journaling', icon: '📝', points: 20 },
    ],
  },
  {
    id: 'social',
    icon: '🤝',
    weight: 0.25,
    habits: [
      { id: 'conversation',  icon: '💬', points: 28 },
      { id: 'quality_time',  icon: '❤️', points: 28 },
      { id: 'helped_someone',icon: '🙌', points: 22 },
      { id: 'no_conflicts',  icon: '☮️', points: 22 },
    ],
  },
  {
    id: 'environment',
    icon: '☀️',
    weight: 0.10,
    habits: [
      { id: 'tidiness',  icon: '🧹', points: 34 },
      { id: 'nature',    icon: '🌿', points: 33 },
      { id: 'calm_env',  icon: '🕊️', points: 33 },
    ],
  },
  {
    id: 'purpose',
    icon: '🎯',
    weight: 0.05,
    habits: [
      { id: 'goal_progress', icon: '📈', points: 34 },
      { id: 'creativity',    icon: '🎨', points: 33 },
      { id: 'productive',    icon: '⚡', points: 33 },
    ],
  },
];

export const ALL_HABITS = CATEGORIES.flatMap(c =>
  c.habits.map(h => ({ ...h, category: c.id, categoryWeight: c.weight }))
);

// ─── SCORING ALGORITHM ───────────────────────────────────────────────────────
export function calcScore(checks) {
  let total = 0;
  for (const cat of CATEGORIES) {
    const catTotal = cat.habits.reduce((a, h) => a + h.points, 0);
    const catDone  = cat.habits.reduce((a, h) => a + (checks[h.id] ? h.points : 0), 0);
    const catScore = catTotal > 0 ? (catDone / catTotal) : 0;
    total += catScore * cat.weight;
  }
  return Math.round(total * 100);
}

export function scoreColor(score) {
  if (score >= 65) return 'var(--score-high)';
  if (score >= 35) return 'var(--score-mid)';
  return 'var(--score-low)';
}

export function scoreLabel(score, t) {
  if (score >= 75) return t('score_great');
  if (score >= 55) return t('score_good');
  if (score >= 35) return t('score_fair');
  if (score >= 20) return t('score_low');
  return t('score_risk');
}

export function categoryScore(catId, checks) {
  const cat = CATEGORIES.find(c => c.id === catId);
  if (!cat) return 0;
  const total = cat.habits.reduce((a, h) => a + h.points, 0);
  const done  = cat.habits.reduce((a, h) => a + (checks[h.id] ? h.points : 0), 0);
  return total > 0 ? Math.round((done / total) * 100) : 0;
}
