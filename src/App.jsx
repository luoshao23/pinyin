import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, BookOpen, FlaskConical } from 'lucide-react';
import AlphabetChart from './components/AlphabetChart';
import ToneMagic from './components/ToneMagic';
import BlendingLab from './components/BlendingLab';
import PinyinGame from './components/PinyinGame';
import './index.css';

function App() {
  const [selected, setSelected] = useState({
    letter: '拼',
    mnemonic: '快来点击字母开始学习吧！',
    illustration: '🐼',
    isVowel: false
  });
  const [heroVisible, setHeroVisible] = useState(true);
  const labRef = useRef(null);

  const handleSelect = (letter, mnemonic, illustration, isVowel = false) => {
    setSelected({ letter, mnemonic, illustration, isVowel });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // If lab is visible, hide hero
        setHeroVisible(!entry.isIntersecting);
      },
      { threshold: 0.7 }
    );

    if (labRef.current) {
      observer.observe(labRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="title-gradient"
          style={{ fontSize: '3rem', marginBottom: '0.5rem' }}
        >
          🐼 拼音乐园 Paradise
        </motion.h1>
        <p style={{ color: '#636e72', fontSize: '1.2rem' }}>你好！罗庄齐小朋友，让我们和熊猫老师一起快乐学拼音</p>
      </header>

      <main>
        {/* Hero Section / AI Assistant */}
        <AnimatePresence>
          {heroVisible && (
            <motion.section
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className={`glass-card hero-section ${selected.isVowel ? 'compact' : ''}`}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selected.letter}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', damping: 12 }}
                    className="letter-display"
                    style={{
                      fontSize: selected.isVowel ? '5.5rem' : '8rem',
                      fontWeight: '900',
                      color: '#ff7e5f',
                      lineHeight: 1
                    }}
                  >
                    {selected.letter}
                  </motion.div>
                </AnimatePresence>

                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  style={{
                    fontSize: selected.isVowel ? '1.2rem' : '1.5rem',
                    marginTop: '0.5rem',
                    color: '#2d3436',
                    fontWeight: '500'
                  }}
                >
                  {selected.illustration} {selected.mnemonic}
                </motion.div>
              </div>

              {selected.isVowel && (
                <div style={{ flex: 1, width: '100%', maxWidth: '500px' }}>
                  <ToneMagic letter={selected.letter} />
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* Feature Sections */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2rem' }}>
          <section className="glass-card" style={{ borderRadius: '24px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <BookOpen color="#ff7e5f" />
              <h2 style={{ fontSize: '1.5rem' }}>字母森林</h2>
            </div>
            <AlphabetChart onSelect={handleSelect} />
          </section>

          <section ref={labRef} className="glass-card" style={{ borderRadius: '24px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <FlaskConical color="#ff7e5f" />
              <h2 style={{ fontSize: '1.5rem' }}>拼读实验室</h2>
            </div>
            <BlendingLab />
          </section>
        </div>
      </main>

      {/* Pinyin Game Section */}
      <section style={{ maxWidth: '1000px', margin: '4rem auto', padding: '0 2rem' }}>
        <h2 style={{
          fontSize: '2rem',
          marginBottom: '1.5rem',
          textAlign: 'center',
          color: '#2d3436'
        }}>
          🎮 拼音小测验 Pinyin Quiz
        </h2>
        <PinyinGame />
      </section>

      <footer style={{ textAlign: 'center', marginTop: '4rem', paddingBottom: '2rem', color: '#b2bec3' }}>
        <p>✨ 愿每个孩子都能在拼音的世界里自由翱翔 ✨</p>
      </footer>
    </div>
  );
}

export default App;
