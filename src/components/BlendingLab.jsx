import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FlaskConical, AlertCircle } from 'lucide-react';
import { speak } from '../utils/speech';
import { PINYIN_DATA, CHARACTER_MAP, TONE_MAP, SOUND_MAP } from '../constants/pinyinData';
import { getCombinationResult, MEDIALS } from '../utils/pinyinValidator';

const BlendingLab = () => {
    const [initial, setInitial] = useState(null);
    const [medial, setMedial] = useState(null);
    const [final, setFinal] = useState(null);
    const [resultBase, setResultBase] = useState(null); // Just the raw combination without tones
    const [error, setError] = useState(false);

    const getVowelForTone = (syllable) => {
        // Find the main vowel to put tone on
        if (syllable.includes('a')) return 'a';
        if (syllable.includes('o')) return 'o';
        if (syllable.includes('e')) return 'e';
        if (syllable.includes('i') && syllable.includes('u')) return 'u'; // iu/ui rule: last one
        if (syllable.includes('i')) return 'i';
        if (syllable.includes('u')) return 'u';
        if (syllable.includes('ü')) return 'ü';
        return null;
    };

    const getTonePinyin = (base, toneIndex) => {
        const vowel = getVowelForTone(base);
        if (!vowel || !TONE_MAP[vowel]) return base;
        return base.replace(vowel, TONE_MAP[vowel][toneIndex]);
    };

    const handleBlend = () => {
        if (initial && final) {
            const combined = getCombinationResult(initial, final, medial);
            if (combined) {
                // Convert back to base for character lookup (remove u rule if any)
                // Actually, the result from getCombinationResult is what we show
                // But character map uses the standard "ba", "miao" keys
                const charKey = (initial + (medial || '') + final).replace('ü', 'u');
                setResultBase(charKey);
                setError(false);
                speak(combined);
            } else {
                setResultBase(null);
                setError(true);
                setTimeout(() => setError(false), 1000);
            }
        }
    };

    const allFinals = [
        ...PINYIN_DATA.simpleFinals.map(f => f.char),
        ...PINYIN_DATA.compoundFinals.map(f => f.char)
    ];

    const characters = CHARACTER_MAP[resultBase] || [];

    return (
        <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <motion.div
                    animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
                    whileHover={{ scale: 1.05 }}
                    style={{...slotStyle, borderColor: initial ? '#ff7e5f' : '#dcdde1', background: initial ? '#fff9f8' : '#fff'}}
                    onClick={() => setInitial(null)}
                >
                    {initial || '声母'}
                </motion.div>

                <Plus size={24} color="#b2bec3" />

                <motion.div
                    animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
                    whileHover={{ scale: 1.05 }}
                    style={{...slotStyle, borderStyle: 'dotted', borderColor: medial ? '#ffb142' : '#dcdde1', background: medial ? '#fffdf0' : '#fff'}}
                    onClick={() => setMedial(null)}
                >
                    {medial || '介母'}
                </motion.div>

                <Plus size={24} color="#b2bec3" />

                <motion.div
                    animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
                    whileHover={{ scale: 1.05 }}
                    style={{...slotStyle, borderColor: final ? '#ff7e5f' : '#dcdde1', background: final ? '#fff9f8' : '#fff'}}
                    onClick={() => setFinal(null)}
                >
                    {final || '韵母'}
                </motion.div>

                <button
                    onClick={handleBlend}
                    disabled={!initial || !final}
                    style={{
                        ...btnStyle,
                        background: (initial && final) ? '#ff7e5f' : '#b2bec3',
                        marginLeft: '1rem'
                    }}
                >
                    <FlaskConical size={20} /> 融合！
                </button>
            </div>

            <div style={{ minHeight: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2rem' }}>
                <AnimatePresence mode="wait">
                    {resultBase && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{ width: '100%' }}
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem', maxWidth: '600px', margin: '0 auto' }}>
                                {[0, 1, 2, 3].map(toneIndex => {
                                    const pinyin = getTonePinyin(resultBase, toneIndex);
                                    const char = characters[toneIndex];
                                    return (
                                        <motion.div
                                            key={toneIndex}
                                            whileHover={{ scale: 1.05, y: -5 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => speak(pinyin)}
                                            style={{
                                                background: '#fff',
                                                padding: '1rem',
                                                borderRadius: '16px',
                                                textAlign: 'center',
                                                boxShadow: '0 4px 15px rgba(255, 126, 95, 0.1)',
                                                border: '2px solid #fff3f0',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <div style={{ fontSize: '1.2rem', color: '#ff7e5f', fontWeight: 'bold', marginBottom: '0.4rem' }}>{pinyin}</div>
                                            <div style={{ fontSize: '2.5rem', color: '#2d3436' }}>{char || '?'}</div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                    {error && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            style={{ color: '#ff7675', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <AlertCircle size={20} />
                            <span>咦？这两个字母宝宝合不到一起哦</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                <div className="glass-card" style={panelStyle}>
                    <h5 style={subHeaderStyle}>1. 选择声母</h5>
                    <div style={miniGridStyle}>
                        {PINYIN_DATA.initials.map(item => (
                            <button
                                key={item.char}
                                onClick={() => setInitial(item.char)}
                                style={{
                                    ...miniBtnStyle,
                                    background: initial === item.char ? '#ff7e5f' : '#fff',
                                    color: initial === item.char ? '#fff' : '#2d3436'
                                }}
                            >
                                {item.char}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="glass-card" style={panelStyle}>
                    <h5 style={subHeaderStyle}>2. 选择介母 (可选)</h5>
                    <div style={{...miniGridStyle, gridTemplateColumns: 'repeat(3, 1fr)', maxHeight: '100px'}}>
                        {MEDIALS.map(m => (
                            <button
                                key={m}
                                onClick={() => setMedial(m)}
                                style={{
                                    ...miniBtnStyle,
                                    background: medial === m ? '#ffb142' : '#fff',
                                    color: medial === m ? '#fff' : '#2d3436'
                                }}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="glass-card" style={panelStyle}>
                    <h5 style={subHeaderStyle}>3. 选择韵母</h5>
                    <div style={miniGridStyle}>
                        {allFinals.map(f => (
                            <button
                                key={f}
                                onClick={() => setFinal(f)}
                                style={{
                                    ...miniBtnStyle,
                                    background: final === f ? '#ff7e5f' : '#fff',
                                    color: final === f ? '#fff' : '#2d3436'
                                }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const slotStyle = {
    width: '80px',
    height: '80px',
    background: '#fff',
    border: '3px dashed #dcdde1',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#ff7e5f',
    cursor: 'pointer'
};

const btnStyle = {
    padding: '0.8rem 1.5rem',
    borderRadius: '15px',
    border: 'none',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s'
};

const miniGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.4rem',
    maxHeight: '300px',
    overflowY: 'auto',
    padding: '0.5rem'
};

const miniBtnStyle = {
    padding: '0.5rem',
    borderRadius: '10px',
    border: '1px solid #dcdde1',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.2s'
};

const subHeaderStyle = {
    fontSize: '0.9rem',
    color: '#636e72',
    marginBottom: '0.8rem',
    textAlign: 'center'
};

const panelStyle = {
    padding: '1rem',
    borderRadius: '16px'
};

export default BlendingLab;
