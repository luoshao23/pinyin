import { SOUND_MAP } from '../constants/pinyinData';

let chineseVoice = null;

const loadVoices = () => {
    return new Promise((resolve) => {
        let voices = window.speechSynthesis.getVoices();
        if (voices.length !== 0) {
            chineseVoice = voices.find(v => v.lang.includes('zh-CN') && v.name.includes('Google')) ||
                           voices.find(v => v.lang.includes('zh-CN')) ||
                           voices.find(v => v.lang.includes('zh'));
            resolve(chineseVoice);
        } else {
            window.speechSynthesis.onvoiceschanged = () => {
                voices = window.speechSynthesis.getVoices();
                chineseVoice = voices.find(v => v.lang.includes('zh-CN') && v.name.includes('Google')) ||
                               voices.find(v => v.lang.includes('zh-CN')) ||
                               voices.find(v => v.lang.includes('zh'));
                resolve(chineseVoice);
            };
        }
    });
};

export const speak = async (text) => {
    if (!window.speechSynthesis) return;

    if (!chineseVoice) {
        await loadVoices();
    }

    window.speechSynthesis.cancel();

    const soundText = SOUND_MAP[text.toLowerCase()] || text;
    const utterance = new SpeechSynthesisUtterance(soundText);

    if (chineseVoice) {
        utterance.voice = chineseVoice;
    }

    utterance.lang = 'zh-CN';
    utterance.rate = 0.5;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
};
