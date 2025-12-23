import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Check, Star, PartyPopper, AlertCircle } from 'lucide-react';
import { PINYIN_DATA, CHARACTER_MAP } from '../constants/pinyinData';
import { MEDIALS, isValidCombination, canHaveMedial } from '../utils/pinyinValidator';
import { speak } from '../utils/speech';
import confetti from 'canvas-confetti';

import { userManager } from '../utils/userManager';

import { GRADE_DATA } from '../constants/gradeData';
import { parseTextToQuizItems } from '../utils/pinyinGenerator';

const PinyinGame = () => {
    const [question, setQuestion] = useState(null);
    const [initial, setInitial] = useState(null);
    const [medial, setMedial] = useState(null);
    const [final, setFinal] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, success, error
    const [activeTab, setActiveTab] = useState('initial');
    const [score, setScore] = useState(0);

    // New state for User & Review Mode
    const [currentUser, setCurrentUser] = useState(userManager.getCurrentUser());
    const [mode, setMode] = useState('random'); // 'random' or 'review'
    const [mistakes, setMistakes] = useState([]);

    // Grade Filter State
    const [selectedGrade, setSelectedGrade] = useState('all');

    // Custom Mode State
    const [customText, setCustomText] = useState('');
    const [customPool, setCustomPool] = useState([]);

    useEffect(() => {
        // Sync user state occasionally or rely on props if we lifted state up.
        // For simplicity, we check on mount and interval, or just re-read on actions.
        const checkUser = () => {
            const user = userManager.getCurrentUser();
            setCurrentUser(user);
            if (user) {
                setMistakes(userManager.getMistakes());
                setScore(userManager.getScore());
            } else {
                setMode('random'); // Reset to random if logged out
            }
        };

        checkUser();
        const interval = setInterval(checkUser, 1000); // Simple polling for sync
        return () => clearInterval(interval);
    }, []);

    // Flatten data for quiz pool
    const getQuizPool = () => {
        // 1. Custom Mode
        if (selectedGrade === 'custom') {
            return customPool.length > 0 ? customPool : [];
        }

        // 2. Standard Modes (G1, G3, G6, All)
        // We now use pinyin-pro (parseTextToQuizItems) for these too!
        let sourceChars = [];

        if (selectedGrade !== 'all') {
            // Specific Grade
            sourceChars = GRADE_DATA[selectedGrade] || [];
        } else {
            // "All" - Accumulate all characters we know
            // We can still use CHARACTER_MAP as a "Dictionary of Characters"
            // ignoring its hardcoded pinyin keys.
            Object.values(CHARACTER_MAP).forEach(chars => {
                sourceChars.push(...chars.filter(c => c)); // filter empty strings
            });
            // Or use GRADE_DATA if we think it's cleaner?
            // CHARACTER_MAP covers more ground likely. Let's strictly use CHARACTER_MAP chars as source.
        }

        // Convert the list of chars into quiz items using pinyin-pro engine
        // Join them to pass as a block of text (or keep array, helper handles text)
        // Our helper expects a string text.
        const textToParse = sourceChars.join('');
        return parseTextToQuizItems(textToParse);
    };

    const handleCustomSubmit = () => {
        if (!customText.trim()) return;
        const items = parseTextToQuizItems(customText);
        if (items.length > 0) {
            setCustomPool(items);
            speak(`已加载 ${items.length} 个字`);
            setMode('random');
            // Removed setTimeout. useEffect [customPool] will trigger generateQuestion.
        } else {
            speak('没有识别到汉字哦');
        }
    };

    const generateQuestion = () => {
        // If in custom mode and no pool, don't generate (show input UI)
        if (selectedGrade === 'custom' && customPool.length === 0) {
            setQuestion(null);
            return;
        }

        const pool = getQuizPool();
        if (!pool || pool.length === 0) {
            // Should not happen if logic is correct, but safety net
            console.warn("Empty pool in generateQuestion");
            return;
        }

        let targetItem;

        if (mode === 'review' && currentUser) {
            const currentMistakes = userManager.getMistakes();
            setMistakes(currentMistakes);

            if (currentMistakes.length > 0) {
                // Pick random from mistakes
                const mistake = currentMistakes[Math.floor(Math.random() * currentMistakes.length)];
        // Construct item. Note: mistake stores {char, pinyin}
        // We need to find tone if not stored, or simplified mistake record.
        // Our userManager stores object {char, pinyin}
        // We can infer tone or just use as is if we have enough info.
        // Let's assume mistake item has char/pinyin.
        // We need tone for playback logic if possible, or extract from pinyin.
        // Simpler: Find matching item in pool to get full details (tone).
                const pool = getQuizPool();
                targetItem = pool.find(i => i.char === mistake.char);
                if (!targetItem) {
                    // Fallback if char not found in map (rare)
                    targetItem = { ...mistake, tone: 1 };
                }
            } else {
                // Mistake list empty! Support fallback or notify.
                speak('错题本空空如也！真棒！');
                setMode('random');
                return; // Will re-run in random mode next call or explicit
            }
        }

        if (!targetItem) {
            // Random mode or fallback
            const pool = getQuizPool();
            targetItem = pool[Math.floor(Math.random() * pool.length)];
        }

        const randomItem = targetItem;

        // Parse the answer components
        let remaining = randomItem.pinyin;
        let ansInitial = null;
        let ansMedial = null;
        let ansFinal = null;

        // Find Initial
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

        // Find Medial
        const allFinals = [
            ...PINYIN_DATA.simpleFinals.map(f => f.char),
            ...PINYIN_DATA.compoundFinals.map(f => f.char)
        ];

        let found = false;
        for (const m of MEDIALS) {
            if (remaining.startsWith(m)) {
                const potentialFinal = remaining.substring(m.length);
                if (allFinals.includes(potentialFinal) && isValidCombination(ansInitial, potentialFinal, m)) {
                    ansMedial = m;
                    ansFinal = potentialFinal;
                    found = true;
                    break;
                }
            }
        }

        if (!found) {
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
    }, [mode, selectedGrade, customPool]); // Re-gen when mode, grade, or customPool changes

    const handleCheck = () => {
        if (!question) return;

        const userI = initial || '';
        const userM = medial || '';
        const userF = final || '';

        const correctI = question.ansInitial || '';
        const correctM = question.ansMedial || '';
        const correctF = question.ansFinal || '';

        const isCorrect = (userI === correctI) && (userM === correctM) && ((userF === correctF) || (userF === 'ü' && correctF === 'u' && ['j','q','x','y'].includes(userI)));

        if (isCorrect) {
            setStatus('success');
            speak('答对了！' + question.char);

            // Resolve mistake if in review mode (or always resolve if fixed?)
            // Logic: If user gets it right, remove from mistakes anyway.
            if (currentUser) {
                userManager.resolveMistake(question.char);
                const newScore = userManager.addScore(10);
                setScore(newScore);
            } else {
                setScore(s => s + 10);
            }

            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            setTimeout(generateQuestion, 2000);
        } else {
            setStatus('error');
            speak('再试一次');

            // Record mistake
            if (currentUser) {
                userManager.recordMistake(question.char, question.pinyin);
            }

            setTimeout(() => setStatus('idle'), 1000);
        }
    };

    const allFinals = [
        ...PINYIN_DATA.simpleFinals.map(f => f.char),
        ...PINYIN_DATA.compoundFinals.map(f => f.char)
    ];

    // -- Shared Styles --
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

                    {/* Mode Toggle for Logged In Users */}
                    {currentUser && (
                        <div className="glass-card" style={{ padding: '0.3rem', borderRadius: '25px', display: 'flex', background: '#f1f2f6' }}>
                            <button
                                onClick={() => setMode('random')}
                                style={{
                                    padding: '0.4rem 1rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
                                    background: mode === 'random' ? '#ff7e5f' : 'transparent',
                                    color: mode === 'random' ? '#fff' : '#636e72', fontWeight: 'bold'
                                }}
                            >
                                🎲 随机
                            </button>
                            <button
                                onClick={() => {
                                    if (userManager.getMistakes().length === 0) {
                                        speak('没有错题哦，太棒了！');
                                    } else {
                                        setMode('review');
                                    }
                                }}
                                style={{
                                    padding: '0.4rem 1rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
                                    background: mode === 'review' ? '#ff7e5f' : 'transparent',
                                    color: mode === 'review' ? '#fff' : '#636e72', fontWeight: 'bold'
                                }}
                            >
                                📕 错题 ({userManager.getMistakes().length})
                            </button>
                        </div>
                    )}

                    {/* Grade Selector */}
                    <div className="glass-card" style={{ padding: '0.3rem', borderRadius: '15px', background: '#fff' }}>
                        <select
                            value={selectedGrade}
                            onChange={(e) => {
                                setSelectedGrade(e.target.value);
                                setMode('random'); // Reset to random when changing grade
                            }}
                            style={{
                                border: 'none', background: 'transparent', fontSize: '0.9rem',
                                fontWeight: 'bold', color: '#636e72', padding: '0.2rem', cursor: 'pointer', outline: 'none'
                            }}
                        >
                            <option value="all">全部年级</option>
                            <option value="1">一年级</option>
                            <option value="3">三年级</option>
                            <option value="6">六年级</option>
                            <option value="custom">📝 自定义</option>
                        </select>
                    </div>

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

                {/* Custom Input Panel */}
                {selectedGrade === 'custom' && customPool.length === 0 && (
                    <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '20px', marginBottom: '2rem' }}>
                        <h3 style={{ color: '#2d3436', marginBottom: '1rem' }}>📝 自定义测试内容</h3>
                        <textarea
                            value={customText}
                            onChange={(e) => setCustomText(e.target.value)}
                            placeholder="请粘贴一段文字（例如：白日依山尽...）"
                            style={{
                                width: '100%', height: '100px', padding: '1rem',
                                borderRadius: '15px', border: '2px dashed #dcdde1',
                                fontSize: '1rem', marginBottom: '1rem', outline: 'none'
                            }}
                        />
                        <button
                            onClick={handleCustomSubmit}
                            style={{
                                padding: '0.8rem 2rem', borderRadius: '50px', border: 'none',
                                background: '#ff7e5f', color: '#fff', fontWeight: 'bold', cursor: 'pointer'
                            }}
                        >
                            开始测试
                        </button>
                    </div>
                )}

                {/* Reset Custom Button (if playing custom) */}
                {selectedGrade === 'custom' && customPool.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                        <button
                            onClick={() => { setCustomPool([]); setCustomText(''); setQuestion(null); }}
                            style={{ fontSize: '0.8rem', color: '#ff7675', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            重新输入内容
                        </button>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {question ? (
                        <motion.div
                            key={question.char}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="glass-card"
                            style={{
                                width: '120px', height: '120px', margin: '0 auto',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '4rem', fontWeight: 'bold', color: '#2d3436',
                                borderRadius: '30px', boxShadow: '0 8px 32px rgba(255, 126, 95, 0.15)',
                                border: '4px solid #fff'
                            }}
                        >
                            {question.char}
                        </motion.div>
                    ) : (selectedGrade !== 'custom' || customPool.length > 0 ? null : (
                        // If no question and not waiting for input (Wait, if custom & no pool, we show input panel above. If custom & pool, we show question?)
                        // If we have no question but expected one, assume loading or error.
                        // But if custom and pool exists, question should be generated.
                        null
                    ))}
                </AnimatePresence>
                <div style={{ marginTop: '0.5rem', color: '#636e72', fontSize: '0.9rem' }}>
                    {mode === 'review' ? '📕 复习错题中...' : '猜猜它的拼音是什么？'}
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
                                        // Smart navigation: Skip medial if not applicable
                                        if (canHaveMedial(item.char)) {
                                            setActiveTab('medial');
                                        } else {
                                            setActiveTab('final');
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
