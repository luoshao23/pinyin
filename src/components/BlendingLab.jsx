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
                const isJQX = ['j', 'q', 'x'].includes(initial);
                const charKey = (initial + (medial || '') + final).replace('ü', isJQX ? 'u' : 'ü');
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

    const [activeTab, setActiveTab] = useState('initial'); // 'initial', 'medial', 'final'

    const characters = CHARACTER_MAP[resultBase] || [];

    const tabs = [
        { id: 'initial', label: '1. 声母' },
        { id: 'medial', label: '2. 介母' },
        { id: 'final', label: '3. 韵母' }
    ];

    return (
        <div style={{ padding: '1rem' }}>
            <div className="sticky-lab-header">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <motion.div
                        animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
                        whileHover={{ scale: 1.05 }}
                        className={activeTab === 'initial' ? 'active-slot' : ''}
                        style={{ ...slotStyle, borderColor: initial ? '#ff7e5f' : '#dcdde1', background: initial ? '#fff9f8' : '#fff', transition: 'all 0.3s' }}
                        onClick={() => { setInitial(null); setResultBase(null); setActiveTab('initial'); }}
                    >
                        {initial || '声母'}
                    </motion.div>

                    <Plus size={20} color="#b2bec3" />

                    <motion.div
                        animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
                        whileHover={{ scale: 1.05 }}
                        className={activeTab === 'medial' ? 'active-slot' : ''}
                        style={{ ...slotStyle, borderStyle: 'dotted', borderColor: medial ? '#ffb142' : '#dcdde1', background: medial ? '#fffdf0' : '#fff', transition: 'all 0.3s' }}
                        onClick={() => {
                            if (activeTab === 'medial' && medial) {
                                setMedial(null);
                                setResultBase(null);
                            } else {
                                setActiveTab('medial');
                            }
                        }}
                    >
                        {medial || '介母'}
                    </motion.div>

                    <Plus size={20} color="#b2bec3" />

                    <motion.div
                        animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
                        whileHover={{ scale: 1.05 }}
                        className={activeTab === 'final' ? 'active-slot' : ''}
                        style={{ ...slotStyle, borderColor: final ? '#ff7e5f' : '#dcdde1', background: final ? '#fff9f8' : '#fff', transition: 'all 0.3s' }}
                        onClick={() => { setFinal(null); setResultBase(null); setActiveTab('final'); }}
                    >
                        {final || '韵母'}
                    </motion.div>

                    <button
                        onClick={handleBlend}
                        disabled={!initial || !final}
                        style={{
                            ...btnStyle,
                            background: (initial && final) ? '#ff7e5f' : '#b2bec3',
                            padding: '0.6rem 1.2rem'
                        }}
                    >
                        <FlaskConical size={18} /> 融合！
                    </button>
                </div>

                <div style={{ minHeight: resultBase ? '120px' : '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <AnimatePresence mode="wait">
                        {resultBase && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                style={{ width: '100%' }}
                            >
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', maxWidth: '600px', margin: '0 auto' }}>
                                    {[0, 1, 2, 3].map(toneIndex => {
                                        const pinyin = getTonePinyin(resultBase, toneIndex);
                                        const char = characters[toneIndex];
                                        return (
                                            <motion.div
                                                key={toneIndex}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => speak(pinyin)}
                                                style={{
                                                    background: '#fff',
                                                    padding: '0.6rem 0.2rem',
                                                    borderRadius: '12px',
                                                    textAlign: 'center',
                                                    boxShadow: '0 2px 10px rgba(255, 126, 95, 0.1)',
                                                    border: '1px solid #fff3f0',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <div style={{ fontSize: '0.9rem', color: '#ff7e5f', fontWeight: 'bold' }}>{pinyin}</div>
                                                <div style={{ fontSize: '1.8rem', color: '#2d3436' }}>{char || '?'}</div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                        {error && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{ color: '#ff7675', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                                <AlertCircle size={18} />
                                <span>😭 几个字母合不到一起哦</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Selection Area */}

            <div className="selection-container" style={{ position: 'relative' }}>
                {/* Initial Panel */}
                <div style={{ display: (activeTab === 'initial' || window.innerWidth > 768) ? 'block' : 'none' }}>
                    <div className="glass-card" style={panelStyle}>
                        <h5 style={subHeaderStyle}>1. 选择声母</h5>
                        <div style={miniGridStyle}>
                            {PINYIN_DATA.initials.map(item => (
                                <button
                                    key={item.char}
                                    onClick={() => { setInitial(item.char); setResultBase(null); if (window.innerWidth <= 768) setActiveTab('medial'); }}
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
                </div>

                {/* Medial Panel */}
                <div style={{ display: (activeTab === 'medial' || window.innerWidth > 768) ? 'block' : 'none', marginTop: window.innerWidth > 768 ? '1.5rem' : '0' }}>
                    <div className="glass-card" style={panelStyle}>
                        <h5 style={subHeaderStyle}>2. 选择介母 (可选)</h5>
                        <div style={{ ...miniGridStyle, gridTemplateColumns: 'repeat(3, 1fr)', maxHeight: '100px' }}>
                            {MEDIALS.map(m => (
                                <button
                                    key={m}
                                    onClick={() => {
                                        // Toggle logic
                                        if (medial === m) {
                                            setMedial(null);
                                        } else {
                                            setMedial(m);
                                            if (window.innerWidth <= 768) setActiveTab('final');
                                        }
                                        setResultBase(null);
                                    }}
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
                </div>

                {/* Final Panel */}
                <div style={{ display: (activeTab === 'final' || window.innerWidth > 768) ? 'block' : 'none', marginTop: window.innerWidth > 768 ? '1.5rem' : '0' }}>
                    <div className="glass-card" style={panelStyle} id="final-panel">
                        <h5 style={subHeaderStyle}>3. 选择韵母</h5>
                        <div style={miniGridStyle}>
                            {allFinals.map(f => (
                                <button
                                    key={f}
                                    onClick={() => { setFinal(f); setResultBase(null); }}
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

            {/* PC Layout overrides via CSS Grid - simplified approach using the divs above */}
            <style>{`
                @media (min-width: 769px) {
                    .selection-container {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 1.5rem;
                    }
                    .selection-container > div {
                        display: block !important;
                        margin-top: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
};

const slotStyle = {
    width: '60px',
    height: '60px',
    background: '#fff',
    border: '2px dashed #dcdde1',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
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
