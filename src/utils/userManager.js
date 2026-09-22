import { isPlayableQuizItem } from './pinyinParser';

const STORAGE_KEY = 'pinyin_paradise_users';
const AVATARS = ['😊', '🥳', '😎', '🤩', '🚀', '🌟', '🦄', '🐳'];

const DEFAULT_STORAGE = { users: {}, currentUser: null };

const getStorage = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return { ...DEFAULT_STORAGE };
        const parsed = JSON.parse(data);
        if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_STORAGE };
        return {
            users: parsed.users && typeof parsed.users === 'object' ? parsed.users : {},
            currentUser: parsed.currentUser ?? null,
        };
    } catch (err) {
        console.warn('Failed to read user storage, resetting.', err);
        return { ...DEFAULT_STORAGE };
    }
};

const saveStorage = (data) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (err) {
        console.warn('Failed to save user storage.', err);
        return false;
    }
};

const purgeBrokenMistakes = (user) => {
    if (!user?.mistakes) return false;

    const cleaned = user.mistakes.filter(
        (mistake) => mistake?.pinyin && isPlayableQuizItem(mistake.pinyin)
    );

    if (cleaned.length === user.mistakes.length) return false;
    user.mistakes = cleaned;
    return true;
};

export const userManager = {
    getCurrentUser: () => getStorage().currentUser,

    getUser: (username) => {
        const data = getStorage();
        return data.users[username];
    },

    getAllUsers: () => Object.keys(getStorage().users),

    getAvatars: () => AVATARS,

    login: (username, avatar) => {
        if (!username) return;
        const data = getStorage();
        if (!data.users[username]) {
            data.users[username] = {
                mistakes: [],
                score: 0,
                avatar: avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)],
            };
        }
        purgeBrokenMistakes(data.users[username]);
        data.currentUser = username;
        saveStorage(data);
        return data.users[username];
    },

    logout: () => {
        const data = getStorage();
        data.currentUser = null;
        saveStorage(data);
    },

    updateAvatar: (username, avatar) => {
        const data = getStorage();
        if (data.users[username]) {
            data.users[username].avatar = avatar;
            saveStorage(data);
        }
    },

    getMistakes: () => {
        const data = getStorage();
        if (!data.currentUser || !data.users[data.currentUser]) return [];

        const user = data.users[data.currentUser];
        if (purgeBrokenMistakes(user)) {
            saveStorage(data);
        }
        return user.mistakes || [];
    },

    recordMistake: (char, pinyin) => {
        if (!isPlayableQuizItem(pinyin)) return;

        const data = getStorage();
        if (!data.currentUser) return;

        const user = data.users[data.currentUser];
        if (!user.mistakes) user.mistakes = [];

        const exists = user.mistakes.some(m => m.char === char);
        if (!exists) {
            user.mistakes.push({ char, pinyin });
            saveStorage(data);
        }
    },

    resolveMistake: (char) => {
        const data = getStorage();
        if (!data.currentUser) return;

        const user = data.users[data.currentUser];
        if (!user.mistakes) return;

        const initialLength = user.mistakes.length;
        user.mistakes = user.mistakes.filter(m => m.char !== char);

        if (user.mistakes.length !== initialLength) {
            saveStorage(data);
        }
    },

    getScore: () => {
        const data = getStorage();
        if (!data.currentUser) return 0;
        return data.users[data.currentUser]?.score || 0;
    },

    addScore: (points) => {
        const data = getStorage();
        if (!data.currentUser) return;

        const user = data.users[data.currentUser];
        user.score = (user.score || 0) + points;
        saveStorage(data);
        return user.score;
    },
};
