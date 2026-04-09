import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Components/Sidebar/Sidebar";
import "./FriendsPage.css";

const FriendsPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [friends, setFriends] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            window.location.href = "/auth";
            return;
        }

        const headers = { "Authorization": `Bearer ${token}` };

        // Fetch Profile
        fetch("http://localhost:8080/api/profile", { headers })
            .then(res => res.json())
            .then(data => setUser(data))
            .catch(() => window.location.href = "/auth");

        // Fetch Friends
        fetch("http://localhost:8080/api/friends", { headers })
            .then(res => res.json())
            .then(data => {
                const mappedFriends = (data || []).map(f => {
                    const isOther = f.user_id !== user?.user_id;
                    const friendId = isOther ? f.user_id : f.friend_id;
                    return {
                        id: friendId,
                        name: `User #${friendId}`, // Ideally fetch names in a joined query
                        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${friendId}`,
                        points: 0
                    };
                });
                setFriends(mappedFriends);
            })
            .catch(console.error);

    }, []);

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        const token = sessionStorage.getItem("token");
        fetch(`http://localhost:8080/api/users/search?q=${query}`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setSearchResults(data || []))
        .catch(console.error);
    };

    const navigateToProfile = (id) => {
        navigate(`/profile/${id}`);
    };

    if (!user) return null;

    const handleLogout = () => {
        sessionStorage.removeItem("token");
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
                                onChange={handleSearch}
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
                                        <div className="friend-card-top" onClick={() => navigateToProfile(friend.id)} style={{ cursor: 'pointer' }}>
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
                                            <button className="compare-btn" onClick={() => navigateToProfile(friend.id)}>Compare Points</button>
                                            <button className="view-profile-btn" onClick={() => navigateToProfile(friend.id)}>View Profile</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="suggested-friends-section">
                            <h2>Search Results</h2>
                            <div className="suggested-list">
                                {searchResults.length > 0 ? (
                                    searchResults.map(result => (
                                        <div key={result.user_id} className="suggested-friend-item" onClick={() => navigateToProfile(result.user_id)} style={{ cursor: 'pointer' }}>
                                            <img src={result.avatar} alt={result.username} className="suggested-avatar" />
                                            <div className="suggested-info">
                                                <span className="suggested-name">{result.username}</span>
                                                <button className="add-friend-mini">View</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-suggestions">
                                        <p>{searchQuery ? "No users found." : "Search for a username to add friends!"}</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FriendsPage;
