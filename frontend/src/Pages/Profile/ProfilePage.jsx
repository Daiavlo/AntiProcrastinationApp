import React, { useState } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import "./ProfilePage.css";

const ProfilePage = () => {
    const [user, setUser] = useState(() => {
        const stored = sessionStorage.getItem("currentUser");
        return stored ? JSON.parse(stored) : null;
    });

    if (!user) return null;

    const completedTasksCount = user.tasks?.filter(t => t.progress === 100).length || 0;

    const handleLogout = () => {
        sessionStorage.removeItem("currentUser");
        window.location.href = "/auth";
    };

    return (
        <div className="hp-layout">
            <Sidebar user={user} handleLogout={handleLogout} />
            <main className="hp-main-content">
                <div className="profile-container">
                    {/* Banner */}
                    <div className="profile-banner" style={{ background: user.banner_url || 'linear-gradient(135deg, var(--accent), #a21a1a)' }}>
                        <button className="edit-banner-btn">✎ Edit Banner</button>
                    </div>

                    {/* Profile Info Header */}
                    <div className="profile-header-info">
                        <div className="profile-avatar-wrapper">
                            <img src={user.avatar} alt="Avatar" className="profile-main-avatar" />
                            <label className="change-pfp-label">
                                ✎
                                <input type="file" style={{ display: 'none' }} />
                            </label>
                        </div>
                        <div className="profile-text-details">
                            <h1 className="profile-name">{user.username} <span className="profile-pronouns">{user.pronouns || '(he/him)'}</span></h1>
                            <p className="profile-bio">{user.bio || "No bio yet. Add one to let everyone know who you are."}</p>
                            <button className="edit-profile-action">Edit Profile</button>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="profile-simple-stats">
                        <div className="stat-card">
                            <span className="stat-value">{completedTasksCount}</span>
                            <span className="stat-label">Tasks Completed</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">{user.streak || 0}</span>
                            <span className="stat-label">Day Streak</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
