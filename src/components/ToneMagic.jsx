import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { speak } from '../utils/speech';
import { TONE_MAP } from '../constants/pinyinData';

const ToneMagic = ({ letter }) => {
    const tones = TONE_MAP[letter] || [];
    const [selectedTone, setSelectedTone] = useState(null);

    if (tones.length === 0) return null;

    return (
        <div className="tone-container">
            <h4 style={{ fontSize: '1rem', marginBottom: '0.8rem', color: '#ff7e5f' }}>魔法调号轨道</h4>
            <div className="tone-grid">
                {tones.map((t, i) => (
                    <motion.div
                        key={t}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => {
                            setSelectedTone(i);
                            speak(t);
                        }}
                        className="tone-button"
                        style={{
                            background: selectedTone === i ? '#ff7e5f' : 'white',
                            color: selectedTone === i ? 'white' : '#ff7e5f',
                        }}
                    >
                        <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{t}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ToneMagic;
