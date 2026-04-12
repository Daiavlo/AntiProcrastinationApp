import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../Components/Sidebar/Sidebar";
import ComparePointsModal from "./ComparePointsModal";
import "./ProfilePage.css";

const AlienProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [myUser, setMyUser] = useState(null);
    const [alienUser, setAlienUser] = useState(null);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [isFriend, setIsFriend] = useState(false);

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            navigate("/auth");
            return;
        }

        const headers = { "Authorization": `Bearer ${token}` };

        // Fetch My Profile
        fetch("http://localhost:8080/api/profile", { headers })
            .then(res => res.json())
            .then(data => setMyUser(data))
            .catch(() => navigate("/auth"));

        // Fetch Alien Profile
        fetch(`http://localhost:8080/api/profile/${id}`, { headers })
            .then(res => {
                if (!res.ok) throw new Error("User not found");
                return res.json();
            })
            .then(data => setAlienUser(data))
            .catch(err => {
                console.error(err);
                navigate("/home"); 
            });

        // Check friendship status
        fetch("http://localhost:8080/api/friends", { headers })
            .then(res => res.ok ? res.json() : [])
            .then(list => {
                const numId = Number(id);
                const found = (list || []).some(
                    c => c.user_id === numId || c.friend_id === numId
                );
                setIsFriend(found);
            })
            .catch(() => setIsFriend(false));

    }, [id, navigate]);

    if (!myUser || !alienUser) return null;

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        navigate("/auth");
    };

    return (
        <div className="hp-layout">
            <Sidebar user={myUser} handleLogout={handleLogout} />
            <main className="hp-main-content">
                <div className="profile-container">
                    {/* Banner */}
                    <div className="profile-banner" style={{ background: alienUser.banner ? `url(${alienUser.banner}) center/cover` : 'linear-gradient(135deg, var(--accent), #a21a1a)' }}>
                    </div>

                    {/* Profile Info Header */}
                    <div className="profile-header-info">
                        <div className="profile-avatar-wrapper">
                            <img src={alienUser.avatar} alt="Avatar" className="profile-main-avatar" />
                        </div>
                        <div className="profile-text-details">
                            <h1 className="profile-name">{alienUser.username} <span className="profile-pronouns">{alienUser.pronouns || ''}</span></h1>
                            <p className="profile-bio">{alienUser.bio || "This user is a mystery..."}</p>
                            
                            <div className="alien-actions">
                                <button className="edit-profile-action">Add Friend</button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="profile-simple-stats">
                        <div className="stat-card">
                            <span className="stat-value">{alienUser.points || 0}</span>
                            <span className="stat-label">Points</span>
                        </div>
                    </div>

                    {/* Compare Points — friends only */}
                    {isFriend && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                            <button
                                className="compare-points-hero-btn"
                                onClick={() => setShowCompareModal(true)}
                            >
                                ⚔️ Compare Points
                            </button>
                        </div>
                    )}
                </div>

                {showCompareModal && (
                    <ComparePointsModal 
                        onClose={() => setShowCompareModal(false)} 
                        myUser={myUser} 
                        alienUser={alienUser} 
                    />
                )}
            </main>
        </div>
    );
};

export default AlienProfilePage;
