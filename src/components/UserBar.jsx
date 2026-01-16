import React, { useState, useEffect } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { userManager } from '../utils/userManager';

const UserBar = ({ onUserChange }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(userManager.getAvatars()[0]);
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        const username = userManager.getCurrentUser();
        if (username) {
            setCurrentUser({ name: username, ...userManager.getUser(username) });
        }
        fetchAllUsers();
    }, []);

    const fetchAllUsers = () => {
        const users = userManager.getAllUsers().map(name => ({
            name, ...userManager.getUser(name)
        }));
        setAllUsers(users);
    };

    const handleLogin = (name, avatar) => {
        if (!name.trim()) return;
        const user = userManager.login(name.trim(), avatar);
        setCurrentUser({ name: name.trim(), ...user });
        setIsLoginModalOpen(false);
        setNewUserName('');
        fetchAllUsers();
        if (onUserChange) onUserChange(name.trim());
    };

    const handleLogout = () => {
        userManager.logout();
        setCurrentUser(null);
        setIsMenuOpen(false);
        if (onUserChange) onUserChange(null);
    };

    const handleSwitchUser = () => {
        setIsMenuOpen(false);
        setIsLoginModalOpen(true);
    };

    const openLoginModal = () => {
        setSelectedAvatar(userManager.getAvatars()[0]);
        setIsLoginModalOpen(true);
    };

    return (
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 100 }}>
            {currentUser ? (
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="glass-card"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer',
                            fontSize: '0.9rem', fontWeight: 'bold', color: '#2d3436'
                        }}
                    >
                        <span style={{ fontSize: '1.2rem' }}>{currentUser.avatar}</span>
                        {currentUser.name}
                        <ChevronDown size={16} color="#636e72" />
                    </button>

                    {isMenuOpen && (
                        <div className="glass-card" style={{
                            position: 'absolute', top: '120%', right: 0,
                            padding: '0.5rem', borderRadius: '12px', minWidth: '120px',
                            display: 'flex', flexDirection: 'column', gap: '0.2rem'
                        }}>
                            <button onClick={handleSwitchUser} style={menuItemStyle}>
                                切换账号
                            </button>
                            <button onClick={handleLogout} style={{ ...menuItemStyle, color: '#ff7675' }}>
                                <LogOut size={14} /> 退出
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <button
                    onClick={openLoginModal}
                    className="glass-card"
                    style={{
                        padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer',
                        fontWeight: 'bold', color: '#ff7e5f', display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                >
                    <User size={18} /> 登录 / 注册
                </button>
            )}

            {isLoginModalOpen && (
                <div style={overlayStyle}>
                    <div className="glass-card" style={{ padding: '2rem', borderRadius: '20px', width: '320px', textAlign: 'center' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: '#2d3436' }}>👋 欢迎小朋友</h3>

                        <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#636e72' }}>你的名字？</label>
                            <input
                                type="text"
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                                placeholder="输入名字 (比如: 宝宝)"
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #dcdde1', fontSize: '1rem' }}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin(newUserName, selectedAvatar)}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                             <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.9rem', color: '#636e72' }}>选个头像吧！</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center' }}>
                                {userManager.getAvatars().map(avatar => (
                                    <button key={avatar} onClick={() => setSelectedAvatar(avatar)} style={{
                                        fontSize: '1.8rem',
                                        border: '2px solid transparent',
                                        background: selectedAvatar === avatar ? '#ff7e5f' : 'transparent',
                                        color: selectedAvatar === avatar ? '#fff' : 'inherit',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        padding: '0.2rem',
                                        borderRadius: '50%',
                                        width: '48px',
                                        height: '48px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: selectedAvatar === avatar ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                                    }}>
                                        {avatar}
                                    </button>
                                ))}
                            </div>
                        </div>


                        <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                            <p style={{ fontSize: '0.8rem', color: '#b2bec3' }}>历史用户:</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem', maxHeight: '100px', overflowY: 'auto' }}>
                                {allUsers.map(u => (
                                    <button
                                        key={u.name}
                                        onClick={() => handleLogin(u.name, u.avatar)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.8rem', borderRadius: '15px', border: '1px solid #dcdde1', background: '#fff', fontSize: '0.85rem', cursor: 'pointer' }}
                                    >
                                        <span style={{fontSize: '1rem'}}>{u.avatar}</span> {u.name}
                                    </button>
                                ))}
                                {allUsers.length === 0 && <span style={{fontSize:'0.8rem', color:'#dfe6e9'}}>暂无历史记录</span>}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setIsLoginModalOpen(false)} style={{ ...modalBtnStyle, background: '#f1f2f6', color: '#636e72' }}>取消</button>
                            <button onClick={() => handleLogin(newUserName, selectedAvatar)} style={{ ...modalBtnStyle, background: '#ff7e5f', color: '#fff' }}>开始！</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const menuItemStyle = {
    padding: '0.6rem',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#2d3436',
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    transition: 'background 0.2s'
};

const overlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(3px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200
};

const modalBtnStyle = {
    flex: 1, padding: '0.8rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold'
};

export default UserBar;
