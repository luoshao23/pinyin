import { TONE_MAP } from '../constants/pinyinData';

export const TONE_OPTIONS = [
    { value: 1, mark: 'ˉ', label: '一声' },
    { value: 2, mark: 'ˊ', label: '二声' },
    { value: 3, mark: 'ˇ', label: '三声' },
    { value: 4, mark: 'ˋ', label: '四声' },
    { value: 5, mark: '·', label: '轻声' },
];

export const getVowelForTone = (syllable) => {
    if (syllable.includes('a')) return 'a';
    if (syllable.includes('o')) return 'o';
    if (syllable.includes('e')) return 'e';
    if (syllable.includes('i') && syllable.includes('u')) return 'u';
    if (syllable.includes('i')) return 'i';
    if (syllable.includes('u')) return 'u';
    if (syllable.includes('ü')) return 'ü';
    return null;
};

export const buildSyllableBase = (initial, medial, final) =>
    `${initial || ''}${medial || ''}${final || ''}`;

export const applyToneToSyllable = (baseSyllable, toneNumber) => {
    if (!baseSyllable || !toneNumber || toneNumber === 5) return baseSyllable;

    const vowel = getVowelForTone(baseSyllable);
    if (!vowel || !TONE_MAP[vowel]) return baseSyllable;

    const toneIndex = toneNumber - 1;
    if (toneIndex < 0 || toneIndex > 3) return baseSyllable;

    return baseSyllable.replace(vowel, TONE_MAP[vowel][toneIndex]);
};

export const getToneDisplay = (toneNumber) => {
    const option = TONE_OPTIONS.find(o => o.value === toneNumber);
    return option ? option.mark : '?';
};
