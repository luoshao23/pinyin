import { SOUND_MAP, TONE_MAP } from '../constants/pinyinData';

const AUDIO_BASE_URL = '/audio';

// Map standalone initials/finals to their "teaching" pronunciation file
// Initials usually add 'o', 'e', or 'i' sound
// Finals usually add 'y', 'w' if they start with i/u/ü
const PINYIN_FILE_MAP = {
    // Initials
    'b': 'bo1', 'p': 'po1', 'm': 'mo1', 'f': 'fo1',
    'd': 'de1', 't': 'te1', 'n': 'ne1', 'l': 'le1',
    'g': 'ge1', 'k': 'ke1', 'h': 'he1',
    'j': 'ji1', 'q': 'qi1', 'x': 'xi1',
    'zh': 'zhi1', 'ch': 'chi1', 'sh': 'shi1', 'r': 'ri1',
    'z': 'zi1', 'c': 'ci1', 's': 'si1',
    'y': 'yi1', 'w': 'wu1',

    // Special Finals (Standalone)
    'i': 'yi1', 'u': 'wu1', 'ü': 'yu1',
    'ui': 'wei1', 'iu': 'you1', 'un': 'wen1', 'ün': 'yun1',
    'ing': 'ying1', 'ong': 'weng1'
};

/**
 * Convert pinyin text to filename
 * e.g. "bā" -> "ba1", "b" -> "bo1", "ang" -> "ang1"
 */
const getPinyinAudioUrl = (text) => {
    const raw = text.toLowerCase().trim();

    // 1. Direct Map (Initials/Special Finals)
    if (PINYIN_FILE_MAP[raw]) {
        return `${AUDIO_BASE_URL}/${PINYIN_FILE_MAP[raw]}.mp3`;
    }

    // 2. Parse Tone
    let base = raw;
    let tone = 5; // Default to neutral (or 1 if no mark found? usually 1 for teaching)

    // Check for accented chars
    let foundTone = false;
    for (const [vowel, accentedList] of Object.entries(TONE_MAP)) {
        for (let i = 0; i < accentedList.length; i++) {
            if (raw.includes(accentedList[i])) {
                base = raw.replace(accentedList[i], vowel);
                tone = i + 1; // 1-based tone
                foundTone = true;
                break;
            }
        }
        if (foundTone) break;
    }

    // If no tone mark was found but it's not in the map, assume Tone 1 for teaching
    // e.g. "ang" -> "ang1"
    if (!foundTone && !PINYIN_FILE_MAP[raw]) {
        tone = 1;
    }

    // Handle ü -> v mapping for filenames
    // rules: lü -> lv, nü -> nv.
    // BUT j, q, x + ü is spelled ju, qu, xu in pinyin (u implies ü)
    // The davinfifield repo follows standard pinyin spelling usually.
    // However, lü and nü retain the dots. File system usually maps ü to v.
    if (base.includes('ü')) {
        base = base.replace('ü', 'v');
    }

    return `${AUDIO_BASE_URL}/${base}${tone}.mp3`;
};

// Keep track of current audio to allow cancellation
let currentAudio = null;

const speakTTS = (text) => {
    if (!window.speechSynthesis) return;

    // Fallback: Use Google Chinese Voice if available
    const voices = window.speechSynthesis.getVoices();
    const chineseVoice = voices.find(v => v.lang.includes('zh-CN') && v.name.includes('Google')) ||
        voices.find(v => v.lang.includes('zh-CN')) ||
        voices.find(v => v.lang.includes('zh'));

    window.speechSynthesis.cancel();

    // Use SOUND_MAP for character reading (e.g. 'b' -> '波') logic is preserved
    // essentially by the caller passing text. But here we fallback for non-pinyin text.
    const soundText = SOUND_MAP[text.toLowerCase()] || text;

    const utterance = new SpeechSynthesisUtterance(soundText);
    if (chineseVoice) utterance.voice = chineseVoice;
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8; // Slightly slower for clarity
    window.speechSynthesis.speak(utterance);
};

export const speak = async (text) => {
    if (!text) return;

    // Check if it contains Chinese characters (including punctuation range roughly)
    // If it has Chinese, use TTS
    if (/[\u4e00-\u9fa5]/.test(text)) {
        speakTTS(text);
        return;
    }

    const audioUrl = getPinyinAudioUrl(text);

    // Stop previous audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }

    try {
        const audio = new Audio(audioUrl);
        currentAudio = audio;

        // Optimistic playback
        await audio.play();

        audio.onended = () => {
            currentAudio = null;
        };

        audio.onerror = () => {
            console.warn(`Audio file not found for ${text} (${audioUrl}), falling back to TTS.`);
            speakTTS(text);
        };
    } catch (err) {
        console.warn('Audio playback failed', err);
        speakTTS(text);
    }
};
