import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Components/Sidebar/Sidebar";
import "./AddFriendsPage.css";

const API = "http://localhost:8080/api";

const authHeaders = () => ({
    "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
    "Content-Type": "application/json",
});

const AddFriendsPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [actionLoading, setActionLoading] = useState({});
    const [searchStatus, setSearchStatus] = useState("idle"); // idle | searching | done

    // ─── Load current user ─────────────────────────────────────────────
    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if (!token) { window.location.href = "/auth"; return; }

        fetch(`${API}/profile`, { headers: authHeaders() })
            .then(r => r.json())
            .then(data => setUser(data))
            .catch(() => (window.location.href = "/auth"));
    }, []);

    // ─── Load pending requests (to show accepted/sent state) ───────────
    const loadPending = useCallback(async () => {
        const res = await fetch(`${API}/friends/pending`, { headers: authHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        setPendingRequests(data || []);
    }, []);

    useEffect(() => {
        if (user) loadPending();
    }, [user, loadPending]);

    // ─── Search ────────────────────────────────────────────────────────
    const handleSearch = (e) => {
        const q = e.target.value;
        setSearchQuery(q);
        if (q.length < 2) {
            setSearchResults([]);
            setSearchStatus("idle");
            return;
        }

        setSearchStatus("searching");
        fetch(`${API}/users/search?q=${encodeURIComponent(q)}`, { headers: authHeaders() })
            .then(res => {
                if (!res.ok) return [];
                return res.json();
            })
            .then(data => {
                setSearchResults(data || []);
                setSearchStatus("done");
            })
            .catch(err => {
                console.error(err);
                setSearchStatus("done");
            });
    };

    // ─── Send friend request ───────────────────────────────────────────
    const sendRequest = async (targetId) => {
        setActionLoading(prev => ({ ...prev, [targetId]: true }));
        try {
            const res = await fetch(`${API}/friends/add`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ friend_id: targetId }),
            });

            if (res.ok || res.status === 409) {
                setSearchResults(prev =>
                    prev.map(u =>
                        u.user_id === targetId
                            ? { ...u, connection_status: "sent" }
                            : u
                    )
                );
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(prev => ({ ...prev, [targetId]: false }));
        }
    };

    // ─── Accept friend request ─────────────────────────────────────────
    const acceptRequest = async (targetId) => {
        setActionLoading(prev => ({ ...prev, [targetId]: true }));
        try {
            await fetch(`${API}/friends/accept`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ friend_id: targetId }),
            });
            setSearchResults(prev =>
                prev.map(u =>
                    u.user_id === targetId
                        ? { ...u, connection_status: "accepted" }
                        : u
                )
            );
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(prev => ({ ...prev, [targetId]: false }));
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        window.location.href = "/auth";
    };

    const navigateToProfile = (id) => navigate(`/profile/${id}`);

    // ─── Button renderer ───────────────────────────────────────────────
    const renderAddButton = (result) => {
        const loading = actionLoading[result.user_id];
        switch (result.connection_status) {
            case "accepted":
                return (
                    <button className="af-action-btn af-status-accepted" disabled>
                        <span className="af-btn-icon">✓</span> Friends
                    </button>
                );
            case "sent":
                return (
                    <button className="af-action-btn af-status-sent" disabled>
                        <span className="af-btn-icon">⏳</span> Requested
                    </button>
                );
            case "received":
                return (
                    <button
                        className="af-action-btn af-status-received"
                        disabled={loading}
                        onClick={(e) => { e.stopPropagation(); acceptRequest(result.user_id); }}
                    >
                        {loading ? <span className="af-loading-dots" /> : <><span className="af-btn-icon">✓</span> Accept</>}
                    </button>
                );
            default:
                return (
                    <button
                        className="af-action-btn"
                        disabled={loading}
                        onClick={(e) => { e.stopPropagation(); sendRequest(result.user_id); }}
                    >
                        {loading ? <span className="af-loading-dots" /> : <><span className="af-btn-icon">+</span> Add Friend</>}
                    </button>
                );
        }
    };

    if (!user) return null;

    return (
        <div className="hp-layout">
            <Sidebar user={user} handleLogout={handleLogout} />
            <main className="hp-main-content">
                <div className="af-container">

                    {/* ── Header ── */}
                    <header className="af-header">
                        <button className="af-back-btn" onClick={() => navigate("/friends")}>
                            ← Back
                        </button>
                        <div className="af-title-block">
                            <h1>Find Friends</h1>
                            <p className="af-subtitle">Search for users and send them a Focus Partner request</p>
                        </div>
                    </header>

                    {/* ── Search bar ── */}
                    <div className="af-search-wrap">
                        <span className="af-search-icon">🔍</span>
                        <input
                            id="add-friends-search"
                            type="text"
                            autoFocus
                            placeholder="Search by username…"
                            value={searchQuery}
                            onChange={handleSearch}
                            className="af-search-input"
                        />
                        {searchQuery && (
                            <button
                                className="af-clear-btn"
                                onClick={() => { setSearchQuery(""); setSearchResults([]); setSearchStatus("idle"); }}
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* ── Results ── */}
                    <div className="af-results-area">
                        {searchStatus === "idle" && (
                            <div className="af-empty-state">
                                <div className="af-empty-icon">👥</div>
                                <p>Type a username to discover people</p>
                            </div>
                        )}

                        {searchStatus === "searching" && (
                            <div className="af-empty-state">
                                <div className="af-spinner" />
                                <p>Searching…</p>
                            </div>
                        )}

                        {searchStatus === "done" && searchResults.length === 0 && (
                            <div className="af-empty-state">
                                <div className="af-empty-icon">🤷</div>
                                <p>No users found for "<strong>{searchQuery}</strong>"</p>
                            </div>
                        )}

                        {searchStatus === "done" && searchResults.length > 0 && (
                            <div className="af-results-list">
                                <p className="af-results-count">{searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found</p>
                                {searchResults.map(result => (
                                    <div
                                        key={result.user_id}
                                        className="af-result-card"
                                        onClick={() => navigateToProfile(result.user_id)}
                                    >
                                        <img
                                            src={result.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${result.user_id}`}
                                            alt={result.username}
                                            className="af-result-avatar"
                                        />
                                        <div className="af-result-info">
                                            <span className="af-result-name">{result.username}</span>
                                            <span className="af-result-sub">Focus Partner candidate</span>
                                        </div>
                                        <div
                                            className="af-result-action"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            {renderAddButton(result)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
};

export default AddFriendsPage;
