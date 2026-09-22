import { SOUND_MAP, TONE_MAP } from '../constants/pinyinData';

const AUDIO_BASE_URL = '/audio';

const PINYIN_FILE_MAP = {
    'b': 'bo1', 'p': 'po1', 'm': 'mo1', 'f': 'fo1',
    'd': 'de1', 't': 'te1', 'n': 'ne1', 'l': 'le1',
    'g': 'ge1', 'k': 'ke1', 'h': 'he1',
    'j': 'ji1', 'q': 'qi1', 'x': 'xi1',
    'zh': 'zhi1', 'ch': 'chi1', 'sh': 'shi1', 'r': 'ri1',
    'z': 'zi1', 'c': 'ci1', 's': 'si1',
    'y': 'yi1', 'w': 'wu1',
    'i': 'yi1', 'u': 'wu1', 'ü': 'yu1',
    'ui': 'wei1', 'iu': 'you1', 'un': 'wen1', 'ün': 'yun1',
    'ing': 'ying1', 'ong': 'ong1',
};

const getPinyinAudioUrl = (text) => {
    const raw = text.toLowerCase().trim();

    if (PINYIN_FILE_MAP[raw]) {
        return `${AUDIO_BASE_URL}/${PINYIN_FILE_MAP[raw]}.mp3`;
    }

    let base = raw;
    let tone = 5;
    let foundTone = false;

    for (const [vowel, accentedList] of Object.entries(TONE_MAP)) {
        for (let i = 0; i < accentedList.length; i++) {
            if (raw.includes(accentedList[i])) {
                base = raw.replace(accentedList[i], vowel);
                tone = i + 1;
                foundTone = true;
                break;
            }
        }
        if (foundTone) break;
    }

    if (!foundTone && !PINYIN_FILE_MAP[raw]) {
        tone = 1;
    }

    if (base.includes('ü')) {
        base = base.replace(/ü/g, 'v');
    }

    return `${AUDIO_BASE_URL}/${base}${tone}.mp3`;
};

let currentAudio = null;
let cachedChineseVoice = null;

const pickChineseVoice = (voices) =>
    voices.find(v => v.lang.includes('zh-CN') && v.name.includes('Google')) ||
    voices.find(v => v.lang.includes('zh-CN')) ||
    voices.find(v => v.lang.includes('zh')) ||
    null;

const refreshChineseVoice = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    cachedChineseVoice = pickChineseVoice(window.speechSynthesis.getVoices());
};

if (typeof window !== 'undefined' && window.speechSynthesis) {
    refreshChineseVoice();
    window.speechSynthesis.addEventListener('voiceschanged', refreshChineseVoice);
}

const stopCurrentAudio = () => {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
};

const speakTTS = (text) => {
    if (!window.speechSynthesis) return;

    stopCurrentAudio();
    window.speechSynthesis.cancel();

    const chineseVoice = cachedChineseVoice || pickChineseVoice(window.speechSynthesis.getVoices());
    const soundText = SOUND_MAP[text.toLowerCase()] || text;

    const utterance = new SpeechSynthesisUtterance(soundText);
    if (chineseVoice) utterance.voice = chineseVoice;
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
};

export const speak = async (text) => {
    if (!text) return;

    if (/[\u4e00-\u9fa5]/.test(text)) {
        stopCurrentAudio();
        speakTTS(text);
        return;
    }

    const audioUrl = getPinyinAudioUrl(text);
    stopCurrentAudio();

    try {
        const audio = new Audio(audioUrl);
        currentAudio = audio;

        audio.onended = () => {
            currentAudio = null;
        };

        audio.onerror = () => {
            console.warn(`Audio file not found for ${text} (${audioUrl}), falling back to TTS.`);
            currentAudio = null;
            speakTTS(text);
        };

        await audio.play();
    } catch (err) {
        console.warn('Audio playback failed', err);
        speakTTS(text);
    }
};
