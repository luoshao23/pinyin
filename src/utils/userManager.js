const STORAGE_KEY = 'pinyin_paradise_users';
const AVATARS = ['😊', '🥳', '😎', '🤩', '🚀', '🌟', '🦄', '🐳'];

const getStorage = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { users: {}, currentUser: null };
};

const saveStorage = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const userManager = {
    // Get current logged in user name
    getCurrentUser: () => {
        const data = getStorage();
        return data.currentUser;
    },

    // Get a specific user's data
    getUser: (username) => {
        const data = getStorage();
        return data.users[username];
    },

    // Get list of all users
    getAllUsers: () => {
        const data = getStorage();
        return Object.keys(data.users);
    },

    // Get all available avatars
    getAvatars: () => AVATARS,

    // Login (create if not exists)
    login: (username, avatar) => {
        if (!username) return;
        const data = getStorage();
        if (!data.users[username]) {
            data.users[username] = {
                mistakes: [],
                score: 0,
                avatar: avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)]
            };
        }
        data.currentUser = username;
        saveStorage(data);
        return data.users[username];
    },

    // Logout
    logout: () => {
        const data = getStorage();
        data.currentUser = null;
        saveStorage(data);
    },

    // Update avatar
    updateAvatar: (username, avatar) => {
        const data = getStorage();
        if (data.users[username]) {
            data.users[username].avatar = avatar;
            saveStorage(data);
        }
    },

    // Get mistakes for current user
    getMistakes: () => {
        const data = getStorage();
        if (!data.currentUser || !data.users[data.currentUser]) return [];
        return data.users[data.currentUser].mistakes || [];
    },

    // Record a mistake (avoid duplicates)
    recordMistake: (char, pinyin) => {
        const data = getStorage();
        if (!data.currentUser) return; // Guest mode: no recording

        const user = data.users[data.currentUser];
        if (!user.mistakes) {
            user.mistakes = [];
        }
        const mistakeItem = { char, pinyin };

        // Check if already exists
        const exists = user.mistakes.some(m => m.char === char);
        if (!exists) {
            user.mistakes.push(mistakeItem);
            saveStorage(data);
        }
    },

    // Resolve a mistake (remove from list)
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

    // Get score
    getScore: () => {
        const data = getStorage();
        if (!data.currentUser) return 0;
        return data.users[data.currentUser]?.score || 0;
    },

    // Add score
    addScore: (points) => {
        const data = getStorage();
        if (!data.currentUser) return;

        const user = data.users[data.currentUser];
        user.score = (user.score || 0) + points;
        saveStorage(data);
        return user.score;
    }
};
