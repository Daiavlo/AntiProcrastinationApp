import React, { useState } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import "./FriendsPage.css";

const FriendsPage = () => {
    const [user, setUser] = useState(() => {
        const stored = sessionStorage.getItem("currentUser");
        return stored ? JSON.parse(stored) : null;
    });

    const [searchQuery, setSearchQuery] = useState("");

    // Mock points for comparison
    const friends = user?.friends?.map(f => ({
        ...f,
        points: Math.floor(Math.random() * 5000) + 1000
    })) || [];

    if (!user) return null;

    const handleLogout = () => {
        sessionStorage.removeItem("currentUser");
        window.location.href = "/auth";
    };

    return (
        <div className="hp-layout">
            <Sidebar user={user} handleLogout={handleLogout} />
            <main className="hp-main-content">
                <div className="friends-page-container">
                    <header className="friends-header">
                        <h1>Infinity Circle</h1>
                        <div className="search-bar-wrap">
                            <input
                                type="text"
                                placeholder="Find users to add..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="friend-search-input"
                            />
                            <button className="search-icon-btn">🔍</button>
                        </div>
                    </header>

                    <div className="friends-grid-view">
                        <section className="friends-section-main">
                            <h2>My Friends</h2>
                            <div className="friends-cards">
                                {friends.map((friend) => (
                                    <div key={friend.id} className="friend-compact-card">
                                        <div className="friend-card-top">
                                            <img src={friend.avatar} alt={friend.name} className="friend-card-avatar" />
                                            <div className="friend-card-info">
                                                <h3 className="friend-card-name">{friend.name}</h3>
                                                <span className="friend-card-status">Focus Partner</span>
                                            </div>
                                        </div>
                                        <div className="friend-card-stats">
                                            <div className="stat-mini">
                                                <span className="stat-mini-val">{friend.points}</span>
                                                <span className="stat-mini-label">Points</span>
                                            </div>
                                        </div>
                                        <div className="friend-card-actions">
                                            <button className="compare-btn">Compare Points</button>
                                            <button className="view-profile-btn">View Profile</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="suggested-friends-section">
                            <h2>Add Friends</h2>
                            <div className="suggested-list">
                                <div className="suggested-item">
                                    <div className="suggested-avatar"></div>
                                    <div className="suggested-info">
                                        <span className="suggested-name">KineticWizard</span>
                                        <span className="suggested-mutual">4 mutual friends</span>
                                    </div>
                                    <button className="add-friend-btn-small">Add</button>
                                </div>
                                <div className="suggested-item">
                                    <div className="suggested-avatar"></div>
                                    <div className="suggested-info">
                                        <span className="suggested-name">FocusFlowMaster</span>
                                        <span className="suggested-mutual">2 mutual friends</span>
                                    </div>
                                    <button className="add-friend-btn-small">Add</button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FriendsPage;
