import React from 'react';
import PinyinCard from './PinyinCard';
import { PINYIN_DATA } from '../constants/pinyinData';

const AlphabetChart = ({ onSelect }) => {
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
                            onSelect={(l, m, i) => onSelect(l, m, i, true)}
                        />
                    ))}
                </div>
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
                            onSelect={(l, m, i) => onSelect(l, m, i, false)}
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
                            onSelect={(l, m, i) => onSelect(l, m, i, false)}
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
