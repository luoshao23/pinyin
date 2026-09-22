import React from 'react';
import { motion } from 'framer-motion';
import { FEATURE_NAV_ITEMS, scrollToSection } from '../constants/navItems';

const FeatureNav = () => {
  return (
    <nav className="feature-nav" aria-label="功能导航">
      <p className="feature-nav-hint">👇 点这里，直接去你想玩的地方！</p>
      <div className="feature-nav-grid">
        {FEATURE_NAV_ITEMS.map((item, i) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: 'spring', damping: 14 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToSection(item.id)}
            className="feature-nav-card"
            style={{ background: item.bg }}
          >
            <span className="feature-nav-emoji">{item.emoji}</span>
            <span className="feature-nav-title">{item.title}</span>
            <span className="feature-nav-subtitle">{item.subtitle}</span>
          </motion.button>
        ))}
      </div>
    </nav>
  );
};

export default FeatureNav;
