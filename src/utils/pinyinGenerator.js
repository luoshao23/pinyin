import { pinyin } from 'pinyin-pro';

export const parseTextToQuizItems = (text) => {
    if (!text) return [];

    // 1. Filter out only Chinese characters
    const chars = text.match(/[\u4e00-\u9fa5]/g);
    if (!chars) return [];

    const items = [];
    const uniqueChars = new Set();

    // 2. Convert each character
    chars.forEach(char => {
        // Avoid duplicates if desired, or keep them to represent frequency?
        // Let's allow duplicates if they are part of a sentence flow, or maybe unique set?
        // For a quiz pool, unique is probably better unless we want 'context' mode later.
        // Let's use unique for now to avoid repeatedly testing '的'.
        if (uniqueChars.has(char)) return;
        uniqueChars.add(char);

        // Get pinyin with tone number: e.g. "hao3"
        const pinyinStr = pinyin(char, { toneType: 'num', type: 'array' })[0];
        // pinyin-pro returns array of strings for each char input, we input 1 char.

        // pinyinStr might be 'hǎo' if toneType is default. We requested 'num'.
        // wait, pinyin-pro 'num' gives 'hao3'.
        // If polyphonic, it gives default reading.
        // Ideally we'd validite against our valid initials/finals but pinyin-pro is authoritative.

        // Extract tone
        const toneMatch = pinyinStr.match(/\d/);
        const tone = toneMatch ? parseInt(toneMatch[0], 10) : 5; // 5 for neutral

        // Remove tone number from string for base pinyin if needed,
        // BUT our existing logic uses full string like 'bo1' for audio?
        // No, CHARACTER_MAP keys are like 'bo', 'ba'. The audio file adds '1'.
        // However, PinyinGame `question.pinyin` typically holds 'ba' (base) or 'ba1'?
        // Let's check existing data.
        // CHARACTER_MAP: 'a': ['ā', 'á', 'ǎ', 'à'] -> keys are base.
        // PinyinGame `getQuizPool` constructs items: { char, pinyin: 'a', tone: 1 }

        // So we need base pinyin without tone number.
        const basePinyin = pinyinStr.replace(/\d/g, '');

        // Special handling for ü: pinyin-pro output?
        // test: lv -> lü? or lv?
        // pinyin-pro typically uses 'v' or 'ü'. We need to align with our system.
        // Our system uses 'ü' in pinyin string for data keys?
        // pinyinData.js: 'lü': ...
        // So we need to ensure 'v' converts to 'ü' if pinyin-pro outputs v.

        // Let's verify pinyin-pro output format for ü.
        // Usually it outputs 'lv' or 'lue' depends on options.
        // 'v' option is false by default -> 'ü'.
        // 'num' option might affect it.

        items.push({
            char: char,
            pinyin: basePinyin,
            tone: tone
        });
    });

    return items;
};
