import React from 'react';
import { motion } from 'framer-motion';
import { speak } from '../utils/speech';

const PinyinCard = ({ letter, mnemonic, illustration, type, onSelect }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className={`pinyin-card ${type}`}
            onClick={() => {
                speak(letter);
                if (onSelect) onSelect(letter, mnemonic, illustration);
            }}
            style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '1.5rem 1rem',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                border: '2px solid transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'border-color 0.3s'
            }}
        >
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff7e5f' }}>{letter}</span>
            {illustration && <span style={{ fontSize: '1.2rem' }}>{illustration}</span>}
        </motion.div>
    );
};

export default PinyinCard;
