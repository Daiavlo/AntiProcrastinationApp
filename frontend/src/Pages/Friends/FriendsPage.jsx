import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Components/Sidebar/Sidebar";
import ComparePointsModal from "../Profile/ComparePointsModal";
import "./FriendsPage.css";

import { API_URL as API } from "../../config";

const authHeaders = () => ({
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
});

const FriendsPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [actionLoading, setActionLoading] = useState({});   // { userId: true }
    const [compareTarget, setCompareTarget] = useState(null); // friend to compare with

    // ─── Load profile, friends and pending requests ───────────────────────
    // Drop-in replacement for the two loader functions in FriendsPage.jsx.
    // Wrap every fetch with a res.ok guard so a non-JSON error page
    // (404, 500, plain text) never reaches JSON.parse.

    const loadFriends = useCallback(async () => {
        const res = await fetch(`${API}/friends`, { headers: authHeaders() });
        if (!res.ok) { setFriends([]); return; }
        const data = await res.json();

        const enriched = await Promise.all(
            (data || []).map(async (c) => {
                const friendId = c.user_id !== user?.user_id ? c.user_id : c.friend_id;
                try {
                    const pr = await fetch(`${API}/profile/${friendId}`, { headers: authHeaders() });
                    if (!pr.ok) throw new Error();
                    const pd = await pr.json();
                    return {
                        id: friendId,
                        name: pd.username || `User #${friendId}`,
                        avatar: pd.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${friendId}`,
                        points: pd.points || 0,
                    };
                } catch {
                    return {
                        id: friendId,
                        name: `User #${friendId}`,
                        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${friendId}`,
                        points: 0,
                    };
                }
            })
        );
        setFriends(enriched);
    }, [user]);

    const leaderboard = useMemo(() => {
        if (!user) return [];
        const all = [
            { id: user.user_id, name: user.username, avatar: user.avatar, points: user.points || 0, isMe: true },
            ...friends.map(f => ({ ...f, isMe: false }))
        ];
        return all.sort((a, b) => b.points - a.points);
    }, [user, friends]);

    const loadPending = useCallback(async () => {
        const res = await fetch(`${API}/friends/pending`, { headers: authHeaders() });
        if (!res.ok) { setPendingRequests([]); return; }
        const data = await res.json();
        setPendingRequests(data || []);
    }, []);



    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { window.location.href = "/auth"; return; }

        fetch(`${API}/profile`, { headers: authHeaders() })
            .then(r => r.json())
            .then(data => setUser(data))
            .catch(() => (window.location.href = "/auth"));
    }, []);

    useEffect(() => {
        if (!user) return;
        loadFriends();
        loadPending();
    }, [user, loadFriends, loadPending]);


    // ─── Send friend request ──────────────────────────────────────────────
    const sendRequest = async (targetId) => {
        setActionLoading(prev => ({ ...prev, [targetId]: true }));
        try {
            await fetch(`${API}/friends/add`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ friend_id: targetId }),
            });
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(prev => ({ ...prev, [targetId]: false }));
        }
    };

    // ─── Accept friend request ────────────────────────────────────────────
    const acceptRequest = async (targetId) => {
        setActionLoading(prev => ({ ...prev, [targetId]: true }));
        try {
            await fetch(`${API}/friends/accept`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ friend_id: targetId }),
            });
            // Remove from pending list and reload friends
            setPendingRequests(prev => prev.filter(u => u.user_id !== targetId));
            await loadFriends();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(prev => ({ ...prev, [targetId]: false }));
        }
    };

    // ─── Helpers ──────────────────────────────────────────────────────────
    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/auth";
    };

    const navigateToProfile = (id) => navigate(`/profile/${id}`);

    if (!user) return null;

    return (
        <div className="hp-layout">
            <Sidebar user={user} handleLogout={handleLogout} />
            <main className="hp-main-content">
                <div className="friends-page-container">

                    {/* ── Header ── */}
                    <header className="friends-header">
                        <h1>Infinity Circle</h1>
                        <button
                            className="add-friends-cta-btn"
                            onClick={() => navigate("/friends/add")}
                        >
                            + Add Friends
                        </button>
                    </header>

                    <div className="friends-grid-view">

                        {/* ── Left column ── */}
                        <div className="friends-left-col">

                            {/* Pending requests */}
                            {pendingRequests.length > 0 && (
                                <section className="pending-section">
                                    <h2>
                                        Friend Requests
                                        <span className="pending-badge">{pendingRequests.length}</span>
                                    </h2>
                                    <div className="pending-list">
                                        {pendingRequests.map(req => (
                                            <div key={req.user_id} className="pending-item">
                                                <img
                                                    src={req.avatar}
                                                    alt={req.username}
                                                    className="pending-avatar"
                                                    onClick={() => navigateToProfile(req.user_id)}
                                                    style={{ cursor: "pointer" }}
                                                />
                                                <div className="pending-info">
                                                    <span
                                                        className="pending-name"
                                                        onClick={() => navigateToProfile(req.user_id)}
                                                        style={{ cursor: "pointer" }}
                                                    >
                                                        {req.username}
                                                    </span>
                                                    <span className="pending-sub">wants to be your Focus Partner</span>
                                                </div>
                                                <div className="pending-actions">
                                                    <button
                                                        className="accept-btn"
                                                        disabled={actionLoading[req.user_id]}
                                                        onClick={() => acceptRequest(req.user_id)}
                                                    >
                                                        {actionLoading[req.user_id] ? "..." : "Accept"}
                                                    </button>
                                                    <button
                                                        className="decline-btn"
                                                        onClick={() =>
                                                            setPendingRequests(prev =>
                                                                prev.filter(u => u.user_id !== req.user_id)
                                                            )
                                                        }
                                                    >
                                                        Decline
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* My Friends */}
                            <section className="friends-section-main">
                                <h2>My Friends</h2>
                                <div className="friends-cards">
                                    {friends.length === 0 && (
                                        <p className="empty-state">No friends yet — search for someone to add!</p>
                                    )}
                                    {friends.map((friend) => (
                                        <div
                                            key={friend.id}
                                            className="friend-compact-card"
                                            onClick={() => navigateToProfile(friend.id)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <div className="friend-card-top">
                                                <img src={friend.avatar} alt={friend.name} className="friend-card-avatar" />
                                                <div className="friend-card-info">
                                                    <h3 className="friend-card-name">{friend.name}</h3>
                                                    <span className="friend-card-status">Focus Partner</span>
                                                </div>
                                            </div>
                                            <div className="friend-card-actions">
                                                <button
                                                    className="compare-btn"
                                                    onClick={(e) => { e.stopPropagation(); setCompareTarget(friend); }}
                                                >
                                                    Compare Points
                                                </button>
                                                <button
                                                    className="view-profile-btn"
                                                    onClick={(e) => { e.stopPropagation(); navigateToProfile(friend.id); }}
                                                >
                                                    View Profile
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* ── Right column (Leaderboard) ── */}
                        <div className="friends-right-col">
                            <section className="leaderboard-section">
                                <h2>🏆 Leaderboard</h2>
                                <div className="leaderboard-list">
                                    {leaderboard.map((person, index) => (
                                        <div key={`lb-${person.id}`} className={`leaderboard-item ${person.isMe ? 'is-me' : ''}`}>
                                            <div className="lb-rank">
                                                {index === 0 ? '👑' : index + 1}
                                            </div>
                                            <img src={person.avatar} alt={person.name} className="lb-avatar" />
                                            <div className="lb-info">
                                                <span className="lb-name">{person.name} {person.isMe && '(You)'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                    </div>
                </div>
            </main>

            {compareTarget && (
                <ComparePointsModal
                    onClose={() => setCompareTarget(null)}
                    myUser={user}
                    alienUser={compareTarget}
                />
            )}
        </div>
    );
};

export default FriendsPage;
