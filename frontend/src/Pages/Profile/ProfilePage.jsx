import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import "./ProfilePage.css";

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editBio, setEditBio] = useState("");
    const [editPronouns, setEditPronouns] = useState("");

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            window.location.href = "/auth";
            return;
        }

        fetch("http://localhost:8080/api/profile", {
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
        })
        .catch(() => {
            sessionStorage.removeItem("token");
            window.location.href = "/auth";
        });
    }, []);

    if (!user) return null;

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        window.location.href = "/auth";
    };

    const handleFileUpload = async (field, file) => {
        if (!file) return;
        const token = sessionStorage.getItem("token");
        if (!token) return;

        const formData = new FormData();
        formData.append(field, file);

        try {
            const response = await fetch("http://localhost:8080/api/profile", {
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
        const token = sessionStorage.getItem("token");
        if (!token) return;

        const formData = new FormData();
        formData.append("bio", editBio);
        formData.append("pronouns", editPronouns);

        try {
            const response = await fetch("http://localhost:8080/api/profile", {
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

                    {/* Stats Summary */}
                    <div className="profile-simple-stats">
                        <div className="stat-card">
                            <span className="stat-value">{user.points || 0}</span>
                            <span className="stat-label">Points</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
