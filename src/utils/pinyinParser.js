import { PINYIN_DATA } from '../constants/pinyinData';
import { MEDIALS, isValidCombination } from './pinyinValidator';

export const getAllFinals = () => [
    ...PINYIN_DATA.simpleFinals.map(f => f.char),
    ...PINYIN_DATA.compoundFinals.map(f => f.char),
];

const normalizeFinal = (initial, remaining) => {
    if (['y', 'j', 'q', 'x'].includes(initial)) {
        if (remaining === 'ue') return 'üe';
        if (remaining === 'un') return 'ün';
        if (remaining === 'u' && initial !== 'y') return 'ü';
    }
    return remaining;
};

/**
 * Decompose base pinyin (no tone number) into quiz components.
 */
export const parsePinyinComponents = (basePinyin) => {
    let remaining = basePinyin;
    let ansInitial = null;

    const allFinals = getAllFinals();
    const sortedInitials = [...PINYIN_DATA.initials].sort((a, b) => b.char.length - a.char.length);

    for (const init of sortedInitials) {
        if (remaining.startsWith(init.char)) {
            ansInitial = init.char;
            remaining = remaining.substring(init.char.length);
            break;
        }
    }

    if (!ansInitial) {
        if (remaining.startsWith('y')) {
            ansInitial = 'y';
            remaining = remaining.substring(1);
        } else if (remaining.startsWith('w')) {
            ansInitial = 'w';
            remaining = remaining.substring(1);
        }
    }

    remaining = normalizeFinal(ansInitial, remaining);

    for (const medial of MEDIALS) {
        if (!remaining.startsWith(medial)) continue;

        const potentialFinal = normalizeFinal(ansInitial, remaining.substring(medial.length));
        if (allFinals.includes(potentialFinal) && isValidCombination(ansInitial, potentialFinal, medial)) {
            return { ansInitial, ansMedial: medial, ansFinal: potentialFinal };
        }
    }

    if (allFinals.includes(remaining)) {
        return { ansInitial, ansMedial: null, ansFinal: remaining };
    }

    return { ansInitial, ansMedial: null, ansFinal: remaining };
};

export const isPlayableQuizItem = (basePinyin) => {
    const { ansInitial, ansMedial, ansFinal } = parsePinyinComponents(basePinyin);
    const allFinals = getAllFinals();

    if (!allFinals.includes(ansFinal)) return false;

    if (ansMedial) {
        return isValidCombination(ansInitial, ansFinal, ansMedial);
    }

    if (ansInitial) {
        return isValidCombination(ansInitial, ansFinal);
    }

    return true;
};
