import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { useTheme } from "../../context/ThemeContext";
import PageLoader from "../../Components/PageLoader/PageLoader";
import { API_URL } from "../../config";
import "./SettingsPage.css";

const SettingsPage = () => {
    const { theme, changeTheme } = useTheme();
    const [user, setUser] = useState(() => {
        try { const cached = localStorage.getItem("hp_cached_user"); return cached ? JSON.parse(cached) : null; } catch { return null; }
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/auth";
            return;
        }

        fetch(`${API_URL}/profile`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            setUser(data);
            try { localStorage.setItem("hp_cached_user", JSON.stringify(data)); } catch {}
        })
        .catch(() => window.location.href = "/auth");
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/auth";
    };

    if (!user) {
        return (
            <div className="hp-layout">
                <Sidebar handleLogout={handleLogout} />
                <main className="hp-main-content">
                    <PageLoader text="Loading Settings..." />
                </main>
            </div>
        );
    }

    return (
        <div className="hp-layout">
            <Sidebar user={user} handleLogout={handleLogout} />
            <main className="hp-main-content">
                <header className="hp-header">
                    <h1>Settings</h1>
                </header>

                <div className="settings-container">
                    <section className="settings-section">
                        <h2>Personalization</h2>
                        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>Choose a theme that fits your vibe.</p>
                        <div className="presets-grid">
                            <div className={`preset-card ${theme === 'light' ? 'active' : ''}`} onClick={() => changeTheme('light')}>
                                <div className="preset-preview" style={{background: '#ffffff', border: '2px solid #f0f0f0'}}>
                                    <div style={{width: '100%', height: '4px', background: '#cc2929'}}></div>
                                </div>
                                <span>Light (Default)</span>
                            </div>
                            <div className={`preset-card ${theme === 'dark' ? 'active' : ''}`} onClick={() => changeTheme('dark')}>
                                <div className="preset-preview" style={{background: '#121212', border: '2px solid #2a2222'}}>
                                    <div style={{width: '100%', height: '4px', background: '#cc2929'}}></div>
                                </div>
                                <span>Obsidian Dark</span>
                            </div>
                            <div className={`preset-card ${theme === 'ocean' ? 'active' : ''}`} onClick={() => changeTheme('ocean')}>
                                <div className="preset-preview" style={{background: '#1e293b', border: '2px solid #334155'}}>
                                    <div style={{width: '100%', height: '4px', background: '#38bdf8'}}></div>
                                </div>
                                <span>Ocean Deep</span>
                            </div>
                            <div className={`preset-card ${theme === 'cherry' ? 'active' : ''}`} onClick={() => changeTheme('cherry')}>
                                <div className="preset-preview" style={{background: '#ffffff', border: '2px solid #ffd1dc'}}>
                                    <div style={{width: '100%', height: '4px', background: '#ff4d6d'}}></div>
                                </div>
                                <span>Cherry Blossom</span>
                            </div>
                            <div className={`preset-card ${theme === 'forest' ? 'active' : ''}`} onClick={() => changeTheme('forest')}>
                                <div className="preset-preview" style={{background: '#0f2e21', border: '2px solid #064e3b'}}>
                                    <div style={{width: '100%', height: '4px', background: '#10b981'}}></div>
                                </div>
                                <span>Forest Night</span>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;
