export const NAV_ITEMS = [
  {
    id: 'section-home',
    emoji: '🏠',
    title: '首页',
    subtitle: '熊猫老师',
    shortTitle: '首页',
    bg: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
    activeColor: '#e17055',
  },
  {
    id: 'section-alphabet',
    emoji: '🌲',
    title: '字母森林',
    subtitle: '认识拼音字母',
    shortTitle: '字母',
    bg: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
    activeColor: '#6c5ce7',
  },
  {
    id: 'section-blending',
    emoji: '🧪',
    title: '拼读实验室',
    subtitle: '动手拼一拼',
    shortTitle: '拼读',
    bg: 'linear-gradient(135deg, #55efc4 0%, #00b894 100%)',
    activeColor: '#00b894',
  },
  {
    id: 'section-quiz',
    emoji: '🎮',
    title: '拼音小测验',
    subtitle: '来挑战吧',
    shortTitle: '测验',
    bg: 'linear-gradient(135deg, #fab1a0 0%, #e17055 100%)',
    activeColor: '#e17055',
  },
];

export const FEATURE_NAV_ITEMS = NAV_ITEMS.filter(item => item.id !== 'section-home');

export const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};
