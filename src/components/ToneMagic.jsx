import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { speak } from '../utils/speech';
import { TONE_MAP } from '../constants/pinyinData';

const ToneMagic = ({ letter }) => {
    const tones = TONE_MAP[letter] || [];
    const [selectedTone, setSelectedTone] = useState(null);

    if (tones.length === 0) return null;

    const trackPaths = [
        "M 10 50 L 90 50",      // 1st tone (flat)
        "M 10 80 L 90 20",      // 2nd tone (up)
        "M 10 30 L 50 80 L 90 30", // 3rd tone (valley)
        "M 10 20 L 90 80"       // 4th tone (down)
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.8rem', color: '#ff7e5f' }}>魔法调号轨道</h4>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem' }}>
                {tones.map((t, i) => (
                    <motion.div
                        key={t}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => {
                            setSelectedTone(i);
                            speak(t);
                        }}
                        style={{
                            width: '75px',
                            height: '75px',
                            background: selectedTone === i ? '#ff7e5f' : 'white',
                            color: selectedTone === i ? 'white' : '#ff7e5f',
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}
                    >
                        <span style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>{t}</span>
                        <svg width="45" height="25" viewBox="0 0 100 100">
                            <path d={trackPaths[i]} fill="none" stroke={selectedTone === i ? 'white' : '#ff7e5f'} strokeWidth="10" strokeLinecap="round" />
                        </svg>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ToneMagic;
