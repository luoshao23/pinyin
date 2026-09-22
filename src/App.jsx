import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FlaskConical } from 'lucide-react';
import AlphabetChart from './components/AlphabetChart';
import BlendingLab from './components/BlendingLab';
import PinyinGame from './components/PinyinGame';
import UserBar from './components/UserBar';
import FeatureNav from './components/FeatureNav';
import BottomNav from './components/BottomNav';
import { useActiveSection } from './hooks/useActiveSection';
import './index.css';

function App() {
  const activeSection = useActiveSection();
  const [userKey, setUserKey] = useState(0);

  return (
    <div className="app-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', position: 'relative' }}>
      <UserBar onUserChange={() => setUserKey(k => k + 1)} />
      <header id="section-home" className="feature-section" style={{ textAlign: 'center', marginBottom: '2rem' }}>
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

      <FeatureNav />

      <main>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2rem' }}>
          <section id="section-alphabet" className="glass-card feature-section" style={{ borderRadius: '24px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <BookOpen color="#ff7e5f" />
              <h2 style={{ fontSize: '1.5rem' }}>🌲 字母森林</h2>
            </div>
            <AlphabetChart />
          </section>

          <section id="section-blending" className="glass-card feature-section" style={{ borderRadius: '24px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <FlaskConical color="#ff7e5f" />
              <h2 style={{ fontSize: '1.5rem' }}>🧪 拼读实验室</h2>
            </div>
            <BlendingLab />
          </section>
        </div>
      </main>

      <section id="section-quiz" className="feature-section" style={{ maxWidth: '1000px', margin: '4rem auto', padding: '0 2rem' }}>
        <h2 style={{
          fontSize: '2rem',
          marginBottom: '1.5rem',
          textAlign: 'center',
          color: '#2d3436'
        }}>
          🎮 拼音小测验
        </h2>
        <PinyinGame key={userKey} />
      </section>

      <footer style={{ textAlign: 'center', marginTop: '4rem', paddingBottom: '1rem', color: '#b2bec3' }}>
        <p>✨ 愿每个孩子都能在拼音的世界里自由翱翔 ✨</p>
      </footer>

      <BottomNav activeId={activeSection} />
    </div>
  );
}

export default App;
