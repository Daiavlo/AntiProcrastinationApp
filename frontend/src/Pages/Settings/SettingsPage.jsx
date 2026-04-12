import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { useTheme } from "../../context/ThemeContext";
import { API_URL } from "../../config";
import "./SettingsPage.css";

const SettingsPage = () => {
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            window.location.href = "/auth";
            return;
        }

        fetch(`${API_URL}/profile`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setUser(data))
        .catch(() => window.location.href = "/auth");
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        window.location.href = "/auth";
    };

    return (
        <div className="hp-layout">
            <Sidebar user={user} handleLogout={handleLogout} />
            <main className="hp-main-content">
                <header className="hp-header">
                    <h1>Settings</h1>
                </header>

                <div className="settings-container">
                    <section className="settings-section">
                        <h2>Appearance</h2>
                        <div className="setting-item">
                            <div className="setting-info">
                                <span className="setting-title">Dark Mode</span>
                                <span className="setting-desc">Switch between light and dark themes.</span>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={theme === 'dark'} 
                                    onChange={toggleTheme} 
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </section>

                    <section className="settings-section">
                        <h2>Personalization</h2>
                        <div className="presets-grid">
                            <div className={`preset-card light ${theme === 'light' ? 'active' : ''}`} onClick={() => theme === 'dark' && toggleTheme()}>
                                <div className="preset-preview"></div>
                                <span>Light Mode (Default)</span>
                            </div>
                            <div className={`preset-card dark ${theme === 'dark' ? 'active' : ''}`} onClick={() => theme === 'light' && toggleTheme()}>
                                <div className="preset-preview"></div>
                                <span>Obsidian Dark</span>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;
