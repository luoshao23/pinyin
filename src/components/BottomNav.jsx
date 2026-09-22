import React from 'react';
import { motion } from 'framer-motion';
import { NAV_ITEMS, scrollToSection } from '../constants/navItems';

const BottomNav = ({ activeId }) => {
  return (
    <nav className="bottom-nav" aria-label="底部功能导航">
      <div className="bottom-nav-inner">
        {NAV_ITEMS.map((item) => {
          const isActive = activeId === item.id;
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => scrollToSection(item.id)}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              style={isActive ? { '--nav-active-color': item.activeColor } : undefined}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="bottom-nav-emoji">{item.emoji}</span>
              <span className="bottom-nav-label">{item.shortTitle}</span>
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-indicator"
                  className="bottom-nav-indicator"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
