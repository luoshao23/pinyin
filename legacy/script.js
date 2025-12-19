const PINYIN_DATA = {
    initials: ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'],
    simpleFinals: [
        { char: 'a', mnemonic: '圆圆脸蛋扎小辫，张大嘴巴 aaa' },
        { char: 'o', mnemonic: '太阳出来红通通，公鸡唱歌 ooo' },
        { char: 'e', mnemonic: '清清池塘一只鹅，水中倒影 eee' },
        { char: 'i', mnemonic: '穿件衣服戴顶帽，牙齿对齐 iii' },
        { char: 'u', mnemonic: '嘴巴突出像火车，呜呜呜呜 uuu' },
        { char: 'ü', mnemonic: '小鱼吐泡真可爱，吹起口哨 üüü' }
    ],
    compoundFinals: ['ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'üe', 'er', 'an', 'en', 'in', 'un', 'ün', 'ang', 'eng', 'ing', 'ong'],
    wholeSyllables: ['zhi', 'chi', 'shi', 'ri', 'zi', 'ci', 'si', 'yi', 'wu', 'yu', 'ye', 'yue', 'yuan', 'yin', 'yun', 'ying']
};

const TONES = ['', 'ā', 'á', 'ǎ', 'à']; // Simple representation for demonstration

const PINYIN_SOUND_MAP = {
    // 声母
    'b': '波', 'p': '坡', 'm': '摸', 'f': '佛',
    'd': '得', 't': '特', 'n': '讷', 'l': '勒',
    'g': '哥', 'k': '科', 'h': '喝',
    'j': '鸡', 'q': '七', 'x': '西',
    'zh': '知', 'ch': '吃', 'sh': '狮', 'r': '日',
    'z': '滋', 'c': '刺', 's': '丝',
    'y': '衣', 'w': '乌',
    // 韵母 (单韵母)
    'a': '阿', 'o': '喔', 'e': '厄', 'i': '衣', 'u': '屋', 'ü': '迂',
    // a 系列
    'ā': '阿', 'á': '啊', 'ǎ': '啊', 'à': '啊',
    // o 系列
    'ō': '喔', 'ó': '喔', 'ǒ': '喔', 'ò': '喔',
    // e 系列
    'ē': '婀', 'é': '额', 'ě': '恶', 'è': '饿',
    // i 系列
    'ī': '衣', 'í': '移', 'ǐ': '椅', 'ì': '意',
    // u 系列
    'ū': '屋', 'ú': '无', 'ǔ': '五', 'ù': '物',
    // ü 系列
    'ǖ': '迂', 'ǘ': '鱼', 'ǚ': '雨', 'ǜ': '玉',
    // 复韵母 & 鼻韵母
    'ai': '哎', 'ei': '诶', 'ui': '威', 'ao': '熬', 'ou': '欧', 'iu': '优',
    'ie': '耶', 'üe': '约', 'er': '儿',
    'an': '安', 'en': '恩', 'in': '因', 'un': '温', 'ün': '晕',
    'ang': '昂', 'eng': '鞥', 'ing': '英', 'ong': '翁'
};

let chineseVoice = null;

function loadVoices() {
    const voices = window.speechSynthesis.getVoices();
    // Prefer "Google 普通话" or "Microsoft Hiuga" or any zh-CN voice
    chineseVoice = voices.find(v => v.lang.includes('zh-CN') && v.name.includes('Google')) ||
                   voices.find(v => v.lang.includes('zh-CN')) ||
                   voices.find(v => v.lang.includes('zh'));
}

if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
}

function speak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        // If it's a single character with a tone (e.g., ā, á), use it directly with Chinese lang
        // Otherwise use the map for better Pinyin phonemes
        const soundText = PINYIN_SOUND_MAP[text.toLowerCase()] || text;
        const utterance = new SpeechSynthesisUtterance(soundText);

        if (chineseVoice) {
            utterance.voice = chineseVoice;
        }

        utterance.lang = 'zh-CN';
        utterance.rate = 0.5; // Slightly slower for children to hear clearly
        utterance.pitch = 1.0; // Slightly higher pitch for a friendlier "teaching" tone
        window.speechSynthesis.speak(utterance);
    }
}

function createCard(char, type, mnemonic = '') {
    const card = document.createElement('div');
    card.className = `pinyin-card ${type}`;
    card.innerHTML = `<span class="pinyin-text">${char}</span>`;

    card.addEventListener('click', () => {
        updateDisplay(char, mnemonic);
        speak(char);
    });

    return card;
}

function updateDisplay(char, mnemonic) {
    const bigPinyin = document.getElementById('big-pinyin');
    const pinyinMnemonic = document.getElementById('pinyin-mnemonic');
    const tonesBar = document.getElementById('tones-bar');

    bigPinyin.innerText = char;
    pinyinMnemonic.innerText = mnemonic;

    // Generate tones buttons for vowels
    tonesBar.innerHTML = '';
    if (char.length === 1 && 'aoeiuü'.includes(char)) {
        const toneChars = getToneChars(char);
        toneChars.forEach((t, index) => {
            const btn = document.createElement('button');
            btn.className = 'tone-btn';
            btn.innerText = t;
            btn.onclick = (e) => {
                e.stopPropagation();
                speak(t);
                bigPinyin.innerText = t;
            };
            tonesBar.appendChild(btn);
        });
    }
}

function getToneChars(char) {
    const toneMap = {
        'a': ['ā', 'á', 'ǎ', 'à'],
        'o': ['ō', 'ó', 'ǒ', 'ò'],
        'e': ['ē', 'é', 'ě', 'è'],
        'i': ['ī', 'í', 'ǐ', 'ì'],
        'u': ['ū', 'ú', 'ǔ', 'ù'],
        'ü': ['ǖ', 'ǘ', 'ǚ', 'ǜ']
    };
    return toneMap[char] || [];
}

function init() {
    const initialGrid = document.getElementById('initials');
    const simpleFinalGrid = document.getElementById('simple-finals');
    const compoundFinalGrid = document.getElementById('compound-finals');
    const wholeGrid = document.getElementById('whole-syllables');

    PINYIN_DATA.initials.forEach(c => initialGrid.appendChild(createCard(c, 'initial')));
    PINYIN_DATA.simpleFinals.forEach(item => simpleFinalGrid.appendChild(createCard(item.char, 'final', item.mnemonic)));
    PINYIN_DATA.compoundFinals.forEach(c => compoundFinalGrid.appendChild(createCard(c, 'final')));
    PINYIN_DATA.wholeSyllables.forEach(c => wholeGrid.appendChild(createCard(c, 'whole')));

    // Default display
    updateDisplay('拼', '点击下方拼音听读音');
}

document.addEventListener('DOMContentLoaded', init);
