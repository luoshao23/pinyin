import { useState, useEffect } from 'react';
import { NAV_ITEMS } from '../constants/navItems';

export const useActiveSection = (defaultId = 'section-home') => {
  const [activeId, setActiveId] = useState(defaultId);

  useEffect(() => {
    const sections = NAV_ITEMS
      .map(item => document.getElementById(item.id))
      .filter(Boolean);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        // Focus on the middle band of the viewport, above the bottom nav
        rootMargin: '-20% 0px -25% 0px',
        threshold: [0, 0.15, 0.3, 0.5, 0.75],
      }
    );

    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return activeId;
};
