import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Check, Star, PartyPopper, AlertCircle } from 'lucide-react';
import { PINYIN_DATA, CHARACTER_MAP } from '../constants/pinyinData';
import { MEDIALS, isValidCombination, canHaveMedial } from '../utils/pinyinValidator';
import { speak } from '../utils/speech';
import confetti from 'canvas-confetti';

const PinyinGame = () => {
    const [question, setQuestion] = useState(null);
    const [initial, setInitial] = useState(null);
    const [medial, setMedial] = useState(null);
    const [final, setFinal] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, success, error
    const [activeTab, setActiveTab] = useState('initial');
    const [score, setScore] = useState(0);

    // Flatten data for quiz pool
    const getQuizPool = () => {
        const pool = [];
        Object.entries(CHARACTER_MAP).forEach(([pinyin, chars]) => {
            chars.forEach((char, index) => {
                if (char) {
                    pool.push({ char, pinyin, tone: index + 1 });
                }
            });
        });
        return pool;
    };

    const generateQuestion = () => {
        const pool = getQuizPool();
        const randomItem = pool[Math.floor(Math.random() * pool.length)];

        // Parse the answer components
        // Logic to split pinyin into initial, medial, final
        // This is a bit tricky, let's use a simpler approach:
        // We know the valid initials, medials, finals.
        // We can parse the string.
        let remaining = randomItem.pinyin;
        let ansInitial = null;
        let ansMedial = null;
        let ansFinal = null;

        // Find Initial
        // Sort initials by length desc to match 'zh' before 'z'
        const sortedInitials = [...PINYIN_DATA.initials].sort((a,b) => b.char.length - a.char.length);
        for (const init of sortedInitials) {
            if (remaining.startsWith(init.char)) {
                ansInitial = init.char;
                remaining = remaining.substring(init.char.length);
                break;
            }
        }
        // Special case: y, w, or no initial
        if (!ansInitial) {
            if (remaining.startsWith('y')) { ansInitial = 'y'; remaining = remaining.substring(1); }
            else if (remaining.startsWith('w')) { ansInitial = 'w'; remaining = remaining.substring(1); }
        }

        // Find Medial (i, u, ü) that is NOT the whole final
        // Check if remaining starts with a medial AND has more chars
        // But be careful: 'ian' -> i is medial? Yes. 'in' -> i is part of final.
        // Simplified parse logic based on known structure:
        // If remaining is just a final, then no medial.
        // If remaining starts with i/u/ü and rest is a valid final, then medial.

        // Actually, our UI allows picking Medial separately.
        // Let's brute force valid combinations from validator logic or just pre-calc
        // For simplicity in this game:
        // We expect the user to reproduce the structure.
        // 'jia' -> j + i + a? Or j + ia?
        // In BlendingLab, valid finals list includes 'ia', 'ian' etc?
        // Let's check PINYIN_DATA.
        // simpleFinals: a, o, e, i, u, ü
        // compoundFinals: ai, ei, ... iang, iong?
        // Wait, PINYIN_DATA has 'ia', 'ua'? No.
        // It has 'a', 'o', 'e'... and 'an', 'ang'.
        // So 'jia' is j + i + a.

        // Let's use a robust parser or simple heuristic.
        // Most robust: match against all known finals first.
        const allFinals = [
            ...PINYIN_DATA.simpleFinals.map(f => f.char),
            ...PINYIN_DATA.compoundFinals.map(f => f.char)
        ];

        // Try to match medial + final
        let found = false;
        for (const m of MEDIALS) {
            if (remaining.startsWith(m)) {
                const potentialFinal = remaining.substring(m.length);
                // CRITICAL FIX: Only accept medial split if it forms a valid combination
                // e.g. 'tie' -> medial 'i' + final 'e' is INVALID. Valid is final 'ie'.
                if (allFinals.includes(potentialFinal) && isValidCombination(ansInitial, potentialFinal, m)) {
                    ansMedial = m;
                    ansFinal = potentialFinal;
                    found = true;
                    break;
                }
            }
        }

        if (!found) {
            // No medial, remaining must be final (or initial was missing / y/w stuff)
            ansFinal = remaining;
        }

        setQuestion({
            ...randomItem,
            ansInitial,
            ansMedial,
            ansFinal
        });

        setInitial(null);
        setMedial(null);
        setFinal(null);
        setStatus('idle');
        setActiveTab('initial');
    };

    useEffect(() => {
        generateQuestion();
    }, []);

    const handleCheck = () => {
        if (!question) return;

        // Basic check: combine logic or direct string match?
        // Direct match of components is safest for this game
        // Handling nulls: user might not pick medial.
        const userI = initial || '';
        const userM = medial || '';
        const userF = final || '';

        const correctI = question.ansInitial || '';
        const correctM = question.ansMedial || '';
        const correctF = question.ansFinal || '';

        // Special handling:
        // j/q/x + ü -> user picks ü, system usually treats as u in visual, but logic uses ü.
        // In this game, let's correspond to what BlendingLab expects.
        // If target is 'ju', ansInitial='j', ansFinal='u' (because parser saw u).
        // But strictly it IS ü.
        // Let's tolerate both for ü/u after j/q/x/y?

        // Actually, let's construct the visual pinyin from user selection and match it against target pinyin.
        // But simple component match is better for educational feedback.

        const isCorrect = (userI === correctI) && (userM === correctM) && ((userF === correctF) || (userF === 'ü' && correctF === 'u' && ['j','q','x','y'].includes(userI)));

        if (isCorrect) {
            setStatus('success');
            speak('答对了！' + question.char);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            setTimeout(() => {
                setScore(s => s + 1);
                generateQuestion();
            }, 2000);
        } else {
            setStatus('error');
            speak('再试一次');
            setTimeout(() => setStatus('idle'), 1000);
        }
    };

    const allFinals = [
        ...PINYIN_DATA.simpleFinals.map(f => f.char),
        ...PINYIN_DATA.compoundFinals.map(f => f.char)
    ];

    // -- Shared Styles (copied from BlendingLab for consistency) --
    const slotStyle = {
        width: '60px', height: '60px',
        background: '#fff', border: '2px dashed #dcdde1',
        borderRadius: '15px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold',
        color: '#ff7e5f', cursor: 'pointer', transition: 'all 0.3s'
    };

    const panelStyle = { padding: '1rem', borderRadius: '16px' };
    const miniGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', maxHeight: '300px', overflowY: 'auto', padding: '0.5rem' };
    const miniBtnStyle = { padding: '0.5rem', borderRadius: '10px', border: '1px solid #dcdde1', cursor: 'pointer', fontSize: '1rem', transition: 'all 0.2s', background: '#fff' };

    return (
        <div style={{ padding: '1rem' }}>
            {/* Quiz Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '20px' }}>
                        <Star fill="#f1c40f" color="#f1c40f" size={20} />
                        <span style={{ fontWeight: 'bold', color: '#2d3436' }}>得分: {score}</span>
                    </div>
                    <button
                        onClick={generateQuestion}
                        style={{ background: '#fff', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    >
                        <RefreshCw size={20} color="#636e72" />
                    </button>
                </div>

                <motion.div
                    key={question?.char}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card"
                    style={{
                        width: '120px', height: '120px', margin: '0 auto',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '4rem', fontWeight: 'bold', color: '#2d3436',
                        borderRadius: '30px', boxShadow: '0 8px 32px rgba(255, 126, 95, 0.15)',
                        border: '4px solid #fff'
                    }}
                >
                    {question ? question.char : '?'}
                </motion.div>
                <div style={{ marginTop: '0.5rem', color: '#636e72', fontSize: '0.9rem' }}>
                    猜猜它的拼音是什么？
                </div>
            </div>

            {/* Input Slots */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <motion.div
                    animate={status === 'error' ? { x: [-5, 5, -5, 5, 0] } : {}}
                    whileHover={{ scale: 1.05 }}
                    className={activeTab === 'initial' ? 'active-slot' : ''}
                    style={{ ...slotStyle, borderColor: initial ? '#ff7e5f' : '#dcdde1', background: initial ? '#fff9f8' : '#fff' }}
                    onClick={() => setActiveTab('initial')}
                >
                    {initial || '声母'}
                </motion.div>

                <motion.div
                    animate={status === 'error' ? { x: [-5, 5, -5, 5, 0] } : {}}
                    whileHover={{ scale: 1.05 }}
                    className={activeTab === 'medial' ? 'active-slot' : ''}
                    style={{ ...slotStyle, borderStyle: 'dotted', borderColor: medial ? '#ffb142' : '#dcdde1', background: medial ? '#fffdf0' : '#fff' }}
                    onClick={() => {
                        if (activeTab === 'medial' && medial) {
                            setMedial(null);
                        } else {
                            setActiveTab('medial');
                        }
                    }}
                >
                    {medial || '介母'}
                </motion.div>

                <motion.div
                    animate={status === 'error' ? { x: [-5, 5, -5, 5, 0] } : {}}
                    whileHover={{ scale: 1.05 }}
                    className={activeTab === 'final' ? 'active-slot' : ''}
                    style={{ ...slotStyle, borderColor: final ? '#ff7e5f' : '#dcdde1', background: final ? '#fff9f8' : '#fff' }}
                    onClick={() => setActiveTab('final')}
                >
                    {final || '韵母'}
                </motion.div>
            </div>

            {/* Check Button */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCheck}
                    disabled={!initial || !final}
                    style={{
                        padding: '0.8rem 3rem', borderRadius: '50px', border: 'none',
                        background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)',
                        color: 'white', fontSize: '1.2rem', fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(255, 126, 95, 0.3)', cursor: 'pointer',
                        opacity: (!initial || !final) ? 0.6 : 1
                    }}
                >
                    {status === 'success' ? '✌️ 真棒！' : '提交答案'}
                </motion.button>
            </div>

            {/* Selection Panels (Copied logic from BlendingLab) */}
            <div className="selection-container">
                 {/* Initial Panel */}
                 <div style={{ display: (activeTab === 'initial' || window.innerWidth > 768) ? 'block' : 'none' }}>
                    <div className="glass-card" style={panelStyle}>
                        <div style={miniGridStyle}>
                            {PINYIN_DATA.initials.map(item => (
                                <button
                                    key={item.char}
                                    onClick={() => {
                                        setInitial(item.char);
                                        setResultBase(null);
                                        if (window.innerWidth <= 768) {
                                            // Smart navigation: Skip medial if not applicable
                                            if (canHaveMedial(item.char)) {
                                                setActiveTab('medial');
                                            } else {
                                                setActiveTab('final');
                                            }
                                        }
                                    }}
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
                        <div style={{ ...miniGridStyle, gridTemplateColumns: 'repeat(3, 1fr)', maxHeight: '100px' }}>
                            {MEDIALS.map(m => (
                                <button
                                    key={m}
                                    onClick={() => {
                                        setMedial(medial === m ? null : m);
                                        if (window.innerWidth <= 768 && medial !== m) setActiveTab('final');
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
                    <div className="glass-card" style={panelStyle}>
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
        </div>
    );
};

export default PinyinGame;
