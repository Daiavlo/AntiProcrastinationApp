import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import PageLoader from "../../Components/PageLoader/PageLoader";
import { API_URL } from "../../config";
import "./ProfilePage.css";

const ProfilePage = () => {
    const [user, setUser] = useState(() => {
        try { const cached = localStorage.getItem("hp_cached_user"); return cached ? JSON.parse(cached) : null; } catch { return null; }
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editBio, setEditBio] = useState(() => {
        try { const cached = localStorage.getItem("hp_cached_user"); return cached ? JSON.parse(cached).bio || "" : ""; } catch { return ""; }
    });
    const [activeTab, setActiveTab] = useState("overview");
    const [editPronouns, setEditPronouns] = useState(() => {
        try { const cached = localStorage.getItem("hp_cached_user"); return cached ? JSON.parse(cached).pronouns || "" : ""; } catch { return ""; }
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
        .then(res => {
            if (!res.ok) throw new Error("Failed to load profile");
            return res.json();
        })
        .then(data => {
            setUser(data);
            setEditBio(data.bio || "");
            setEditPronouns(data.pronouns || "");
            try { localStorage.setItem("hp_cached_user", JSON.stringify(data)); } catch {}
        })
        .catch(() => {
            localStorage.removeItem("token");
            window.location.href = "/auth";
        });
    }, []);

    if (!user) {
        return (
            <div className="hp-layout">
                <Sidebar handleLogout={handleLogout} />
                <main className="hp-main-content">
                    <PageLoader text="Loading Profile..." />
                </main>
            </div>
        );
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/auth";
    };

    const handleFileUpload = async (field, file) => {
        if (!file) return;
        const token = localStorage.getItem("token");
        if (!token) return;

        const formData = new FormData();
        formData.append(field, file);

        try {
            const response = await fetch(`${API_URL}/profile`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const resData = await response.json();
                setUser(prev => ({
                    ...prev,
                    avatar: resData.avatar || prev.avatar,
                    banner: resData.banner || prev.banner
                }));
            } else {
                console.error("Failed to upload image");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const handleSaveTextProfile = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const formData = new FormData();
        formData.append("bio", editBio);
        formData.append("pronouns", editPronouns);

        try {
            const response = await fetch(`${API_URL}/profile`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const resData = await response.json();
                setUser(prev => ({
                    ...prev,
                    bio: resData.bio || prev.bio,
                    pronouns: resData.pronouns || prev.pronouns
                }));
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Error saving text profile:", error);
        }
    };

    return (
        <div className="hp-layout">
            <Sidebar user={user} handleLogout={handleLogout} />
            <main className="hp-main-content">
                <div className="profile-container">
                    {/* Banner */}
                    <div className="profile-banner" style={{ background: user.banner ? `url(${user.banner}) center/cover` : 'linear-gradient(135deg, var(--accent), #a21a1a)' }}>
                        <label className="edit-banner-btn-label">
                            ✎ Edit Banner
                            <input 
                                type="file" 
                                accept="image/*" 
                                style={{ display: 'none' }} 
                                onChange={(e) => handleFileUpload('banner', e.target.files[0])}
                            />
                        </label>
                    </div>

                    {/* Profile Info Header */}
                    <div className="profile-header-info">
                        <div className="profile-avatar-wrapper">
                            <img src={user.avatar} alt="Avatar" className="profile-main-avatar" />
                            <label className="change-pfp-label">
                                ✎
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    style={{ display: 'none' }} 
                                    onChange={(e) => handleFileUpload('avatar', e.target.files[0])}
                                />
                            </label>
                        </div>
                        <div className="profile-text-details">
                            {isEditing ? (
                                <div className="profile-edit-mode">
                                    <h1 className="profile-name">
                                        {user.username} 
                                        <input 
                                            type="text" 
                                            className="profile-pronouns-input" 
                                            value={editPronouns} 
                                            onChange={(e) => setEditPronouns(e.target.value)} 
                                            placeholder="Pronouns (he/him)"
                                        />
                                    </h1>
                                    <textarea 
                                        className="profile-bio-input" 
                                        value={editBio} 
                                        onChange={(e) => setEditBio(e.target.value)} 
                                        placeholder="Add a bio..."
                                        rows="3"
                                    />
                                    <div className="profile-edit-actions">
                                        <button className="cancel-edit-action" onClick={() => setIsEditing(false)}>Cancel</button>
                                        <button className="save-edit-action" onClick={handleSaveTextProfile}>Save</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h1 className="profile-name">{user.username} <span className="profile-pronouns">{user.pronouns || ''}</span></h1>
                                    <p className="profile-bio">{user.bio || "No bio yet. Add one to let everyone know who you are."}</p>
                                    <button className="edit-profile-action" onClick={() => setIsEditing(true)}>Edit Profile</button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="profile-tabs">
                        <button className={`profile-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
                        <button className={`profile-tab ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>Weekly Summary</button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'overview' && (
                        <div className="profile-simple-stats">
                            <div className="stat-card">
                                <span className="stat-value">{user.points || 0}</span>
                                <span className="stat-label">Points (This Week)</span>
                            </div>
                        </div>
                    )}

                    {activeTab === 'summary' && (
                        <div className="profile-weekly-summary">
                            {(!user.weekly_summary || user.weekly_summary.length === 0) ? (
                                <p className="no-summary-msg">No completed assignments yet.</p>
                            ) : (
                                <div className="week-slider-container">
                                    {user.weekly_summary.map((week, idx) => {
                                        const weekDate = new Date(week.week_start);
                                        const formattedWeek = weekDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                                        return (
                                            <div key={idx} className="week-card">
                                                <h3 className="week-title">Week of {formattedWeek}</h3>
                                                <div className="week-total-points">
                                                    <span className="points-value">{week.points}</span>
                                                    <span className="points-label">Total Points</span>
                                                </div>
                                                <div className="week-class-breakdown">
                                                    {week.class_stats && week.class_stats.length > 0 ? (
                                                        week.class_stats.map((cStat, i) => (
                                                            <div key={i} className="class-stat-item">
                                                                <span className="class-color-dot" style={{ backgroundColor: cStat.color }}></span>
                                                                <span className="class-name">{cStat.class_name}</span>
                                                                <span className="class-points">{cStat.points}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="no-class-stats">No classes</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
