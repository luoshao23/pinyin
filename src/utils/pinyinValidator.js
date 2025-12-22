/**
 * Pinyin Validation Logic
 */

export const INITIALS = ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'];
export const FINALS = ['a', 'o', 'e', 'i', 'u', 'ü', 'ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'üe', 'er', 'an', 'en', 'in', 'un', 'ün', 'ang', 'eng', 'ing', 'ong'];
export const MEDIALS = ['i', 'u', 'ü'];

const VALID_COMBOS = {
    'b': ['a', 'o', 'i', 'u', 'ai', 'ei', 'ie', 'ao', 'an', 'en', 'in', 'ang', 'eng', 'ing'],
    'p': ['a', 'o', 'i', 'u', 'ai', 'ei', 'ie', 'ao', 'ou', 'an', 'en', 'in', 'ang', 'eng', 'ing'],
    'm': ['a', 'o', 'e', 'i', 'u', 'ai', 'ei', 'ie', 'ao', 'ou', 'an', 'en', 'in', 'ang', 'eng', 'ing'],
    'f': ['a', 'o', 'u', 'ei', 'ou', 'an', 'en', 'ang', 'eng'],
    'd': ['a', 'e', 'i', 'u', 'ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'an', 'en', 'un', 'ang', 'eng', 'ing', 'ong'],
    't': ['a', 'e', 'i', 'u', 'ai', 'ei', 'ui', 'ao', 'ou', 'ie', 'an', 'un', 'ang', 'eng', 'ing', 'ong'],
    'n': ['a', 'e', 'i', 'u', 'ü', 'ai', 'ei', 'ao', 'ou', 'iu', 'ie', 'üe', 'an', 'en', 'in', 'un', 'ang', 'eng', 'ing', 'ong'],
    'l': ['a', 'e', 'i', 'u', 'ü', 'ai', 'ei', 'ao', 'ou', 'iu', 'ie', 'üe', 'an', 'in', 'un', 'ang', 'eng', 'ing', 'ong'],
    'g': ['a', 'e', 'u', 'ai', 'ei', 'ui', 'ao', 'ou', 'an', 'en', 'un', 'ang', 'eng', 'ong'],
    'k': ['a', 'e', 'u', 'ai', 'ui', 'ao', 'ou', 'an', 'en', 'un', 'ang', 'eng', 'ong'],
    'h': ['a', 'e', 'u', 'ai', 'ei', 'ui', 'ao', 'ou', 'an', 'en', 'un', 'ang', 'eng', 'ong'],
    'j': ['i', 'u', 'ü', 'ie', 'üe', 'in', 'un', 'ün', 'ing', 'iong'],
    'q': ['i', 'u', 'ü', 'ie', 'üe', 'in', 'un', 'ün', 'ing', 'iong'],
    'x': ['i', 'u', 'ü', 'ie', 'üe', 'in', 'un', 'ün', 'ing', 'iong'],
    'zh': ['a', 'e', 'u', 'ai', 'ei', 'ui', 'ao', 'ou', 'an', 'en', 'un', 'ang', 'eng', 'ong'],
    'ch': ['a', 'e', 'u', 'ai', 'ei', 'ui', 'ao', 'ou', 'an', 'en', 'un', 'ang', 'eng', 'ong'],
    'sh': ['a', 'e', 'u', 'ai', 'ei', 'ui', 'ao', 'ou', 'an', 'en', 'un', 'ang', 'eng'],
    'r': ['e', 'u', 'ui', 'ao', 'ou', 'an', 'en', 'un', 'ang', 'eng', 'ong'],
    'z': ['a', 'e', 'u', 'ai', 'ei', 'ui', 'ao', 'ou', 'an', 'en', 'un', 'ang', 'eng', 'ong'],
    'c': ['a', 'e', 'u', 'ai', 'ei', 'ui', 'ao', 'ou', 'an', 'en', 'un', 'ang', 'eng', 'ong'],
    's': ['a', 'e', 'u', 'ai', 'ei', 'ui', 'ao', 'ou', 'an', 'en', 'un', 'ang', 'eng', 'ong'],
    'y': ['a', 'o', 'e', 'i', 'u', 'ü', 'ai', 'ao', 'ou', 'ie', 'üe', 'an', 'en', 'in', 'un', 'ün', 'ang', 'eng', 'ing', 'ong'],
    'w': ['a', 'o', 'e', 'i', 'ai', 'ei', 'an', 'en', 'ang', 'eng']
};

/**
 * Valid Triple Pinyin Rules
 * Medials: i, u, ü
 */
const VALID_TRIPLES = {
    'i': { // i-medial
        'a': ['d', 'l', 'n', 'j', 'q', 'x'],
        'ao': ['b', 'p', 'm', 'd', 't', 'l', 'n', 'j', 'q', 'x'],
        'an': ['b', 'p', 'm', 'd', 't', 'l', 'n', 'j', 'q', 'x'],
        'ang': ['l', 'n', 'j', 'q', 'x'],
        'ong': ['j', 'q', 'x'] // iong
    },
    'u': { // u-medial
        'a': ['g', 'k', 'h', 'zh', 'ch', 'sh'],
        'o': ['g', 'k', 'h', 'd', 't', 'l', 'n', 'zh', 'ch', 'sh', 'r'],
        'ai': ['g', 'k', 'h', 'zh', 'ch', 'sh'],
        'an': ['g', 'k', 'h', 'd', 't', 'l', 'n', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's'],
        'ang': ['g', 'k', 'h', 'zh', 'ch', 'sh']
    },
    'ü': { // ü-medial
        'an': ['j', 'q', 'x', 'l', 'n']
    }
};

export const canHaveMedial = (initial) => {
    if (!initial) return false;
    // Check if this initial appears in any of the valid lists for i, u, ü medials
    for (const medialRules of Object.values(VALID_TRIPLES)) {
        for (const validInitials of Object.values(medialRules)) {
            if (validInitials.includes(initial)) return true;
        }
    }
    return false;
};

export const isValidCombination = (initial, final, medial = null) => {
    if (!initial || !final) return false;

    if (medial) {
        const medialRules = VALID_TRIPLES[medial];
        if (!medialRules) return false;
        const validInitials = medialRules[final];
        return validInitials ? validInitials.includes(initial) : false;
    }

    const valids = VALID_COMBOS[initial];
    return valids ? valids.includes(final) : false;
};

export const getCombinationResult = (initial, final, medial = null) => {
    if (!isValidCombination(initial, final, medial)) return null;

    if (medial) {
        let resFinal = final;
        // Special rule for j/q/x + ü
        if (['j', 'q', 'x'].includes(initial) && medial === 'ü') {
            return initial + 'u' + resFinal;
        }
        return initial + medial + resFinal;
    }

    // Special rule for j, q, x + ü
    if (['j', 'q', 'x'].includes(initial) && (final === 'ü' || final === 'üe' || final === 'ün')) {
        return initial + final.replace('ü', 'u');
    }

    return initial + final;
};
