import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PinyinCard from './PinyinCard';
import ToneMagic from './ToneMagic';
import { PINYIN_DATA } from '../constants/pinyinData';

const AlphabetChart = () => {
    const [selectedVowel, setSelectedVowel] = useState(null);

    return (
        <div className="alphabet-chart" style={{ padding: '1rem' }}>
            <section style={{ marginBottom: '2rem' }}>
                <h3 style={sectionHeaderStyle}>单韵母</h3>
                <div style={gridStyle}>
                    {PINYIN_DATA.simpleFinals.map(item => (
                        <PinyinCard
                            key={item.char}
                            letter={item.char}
                            mnemonic={item.mnemonic}
                            illustration={item.illustration}
                            type="final"
                            onSelect={() => setSelectedVowel(item.char)}
                        />
                    ))}
                </div>
                <AnimatePresence>
                    {selectedVowel && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ overflow: 'hidden', marginTop: '1.5rem' }}
                        >
                            <div className="glass-card" style={{ padding: '1.2rem', borderRadius: '16px' }}>
                                <ToneMagic key={selectedVowel} letter={selectedVowel} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={sectionHeaderStyle}>声母</h3>
                <div style={gridStyle}>
                    {PINYIN_DATA.initials.map(item => (
                        <PinyinCard
                            key={item.char}
                            letter={item.char}
                            mnemonic={item.mnemonic}
                            illustration={item.illustration}
                            type="initial"
                        />
                    ))}
                </div>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={sectionHeaderStyle}>复韵母 & 鼻韵母</h3>
                <div style={gridStyle}>
                    {PINYIN_DATA.compoundFinals.map(item => (
                        <PinyinCard
                            key={item.char}
                            letter={item.char}
                            mnemonic={item.mnemonic}
                            illustration={item.illustration}
                            type="final"
                        />
                    ))}
                </div>
            </section>
        </div>
    );
};

const sectionHeaderStyle = {
    marginBottom: '1rem',
    fontSize: '1.2rem',
    color: '#2d3436',
    borderLeft: '4px solid #6c5ce7',
    paddingLeft: '0.8rem'
};

const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '1rem'
};

export default AlphabetChart;
