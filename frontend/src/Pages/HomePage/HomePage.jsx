import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Components/Sidebar/Sidebar";
import "./HomePage.css";

import { API_URL as API } from "../../config";
const authHeaders = () => ({ "Authorization": `Bearer ${localStorage.getItem("token")}` });

const HomePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [friends, setFriends] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const notifications = useMemo(() => {
        const today = new Date();
        today.setHours(0,0,0,0);

        const notifs = [];

        tasks.forEach(task => {
            if ((task.status === 'pending' || task.status === 'in_progress') && task.priority === 'high' && task.due_date) {
                const dueDate = new Date(task.due_date);
                dueDate.setHours(0,0,0,0);
                
                const diffTime = dueDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays >= 0 && diffDays <= 1) {
                    notifs.push({
                        id: `urgent-${task.assignment_id}`,
                        type: 'urgent',
                        message: `🚨 Urgent: "${task.title}" is due ${diffDays === 0 ? 'today' : 'tomorrow'}!`,
                        taskId: task.assignment_id
                    });
                } else if (diffDays > 1 && diffDays <= 7) {
                    notifs.push({
                        id: `upcoming-${task.assignment_id}`,
                        type: 'upcoming',
                        message: `📅 Upcoming: "${task.title}" is due in ${diffDays} days.`,
                        taskId: task.assignment_id
                    });
                }
            }
        });

        return notifs;
    }, [tasks]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/auth");
            return;
        }

        const headers = { "Authorization": `Bearer ${token}` };

        // Fetch Profile
        fetch(`${API}/profile`, { headers: authHeaders() })
            .then(res => res.json())
            .then(data => { setUser(data); loadFriends(data); })
            .catch(() => navigate("/auth"));

        // Fetch Tasks
        fetch(`${API}/tasks`, { headers: authHeaders() })
            .then(res => res.json())
            .then(data => setTasks(data || []))
            .catch(console.error);

    }, [navigate]);

    const loadFriends = useCallback(async (currentUser) => {
        if (!currentUser) return;
        const res = await fetch(`${API}/friends`, { headers: authHeaders() });
        if (!res.ok) { setFriends([]); return; }
        const data = await res.json();
        const enriched = await Promise.all(
            (data || []).map(async (c) => {
                const friendId = c.user_id !== currentUser.user_id ? c.user_id : c.friend_id;
                try {
                    const pr = await fetch(`${API}/profile/${friendId}`, { headers: authHeaders() });
                    if (!pr.ok) throw new Error();
                    const pd = await pr.json();
                    return {
                        id: friendId,
                        name: pd.username || `User #${friendId}`,
                        avatar: pd.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${friendId}`,
                    };
                } catch {
                    return {
                        id: friendId,
                        name: `User #${friendId}`,
                        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${friendId}`,
                    };
                }
            })
        );
        setFriends(enriched);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/auth");
    };

    const togglePriority = (taskId) => {
        // Optimistic UI update or send to backend...
        // Currently the backend doesn't have an endpoint for this, so we'll just toggle locally for now
        setTasks(prev => prev.map(task => 
            task.assignment_id === taskId 
                ? { ...task, priority: task.priority === 'high' ? 'medium' : 'high' } 
                : task
        ));
    };

    if (!user) return null;

    return (
        <div className="hp-layout">
            <Sidebar user={user} handleLogout={handleLogout} />

            <main className="hp-main-content">
                {/* Header Section */}
                <header className="hp-header">
                    <div className="hp-profile-summary">
                        <div className="hp-avatar-container">
                            <img src={user.avatar} alt="User Avatar" className="hp-main-avatar" />

                        </div>
                        <div className="hp-profile-text">
                            <h1 className="hp-username">{user.username}</h1>
                        </div>
                    </div>
                    <div className="hp-header-actions" style={{ position: 'relative' }}>
                        <button className="hp-icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                            🔔
                            {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
                        </button>
                        {showNotifications && (
                            <div className="notifications-dropdown">
                                <h4>Notifications</h4>
                                {notifications.length === 0 ? (
                                    <p className="no-notifications">You're all caught up!</p>
                                ) : (
                                    <ul className="notifications-list">
                                        {notifications.map(n => (
                                            <li key={n.id} className={`notification-item ${n.type}`}>
                                                {n.message}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                <div className="hp-grid">
                    <div className="hp-left-col">
                        {/* Friends Section */}
                        <section className="hp-section hp-friends-section">
                            <div className="hp-section-header">
                                <h2>Friends</h2>
                                <button className="hp-text-btn" onClick={() => navigate("/friends")}>View All</button>
                            </div>
                            <div className="hp-friends-list">
                                {friends.map((friend) => (
                                    <div 
                                        key={friend.id} 
                                        className="hp-friend-item" 
                                        onClick={() => navigate(`/profile/${friend.id}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="hp-friend-avatar-wrap">
                                            <img src={friend.avatar} alt={friend.name} className="hp-friend-avatar" />
                                        </div>
                                        <span className="hp-friend-name">{friend.name}</span>
                                    </div>
                                ))}
                                <div className="hp-friend-item add-friend" onClick={() => navigate("/friends/add")} style={{ cursor: 'pointer' }}>
                                    <div className="hp-add-avatar">+</div>
                                    <span className="hp-friend-name">Add Friend</span>
                                </div>
                            </div>
                        </section>

                        {/* Current Tasks Section */}
                        <section className="hp-section hp-tasks-section">
                            <div className="hp-section-header">
                                <h2>Current Tasks</h2>
                                <span className="hp-task-count">
                                    {tasks.filter(t => (t.status === 'pending' || t.status === 'in_progress') && t.priority === 'high').length} Priority Tasks
                                </span>
                            </div>
                            <div className="hp-task-list">
                                {tasks
                                    .filter(t => t.status === 'pending' || t.status === 'in_progress')
                                    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                                    .map((task) => (
                                    <div key={task.assignment_id} className={`hp-task-card ${task.priority}`}>
                                        <div className="hp-task-info">
                                            <div className="hp-task-date-row">
                                                <span className="hp-task-cat">General</span>
                                                <span className="hp-task-due">Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'TBD'}</span>
                                            </div>
                                            <h3 className="hp-task-title">{task.title}</h3>
                                            <p>{task.description}</p>
                                        </div>
                                        <div className="hp-task-actions">
                                            <button 
                                                className={`hp-focus-btn ${task.priority === 'high' ? 'primary' : 'secondary'}`}
                                                onClick={() => togglePriority(task.assignment_id)}
                                            >
                                                {task.priority === 'high' ? 'Focused' : 'Focus'}
                                            </button>
                                            <button className="hp-more-btn">⋮</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>


                </div>

                {/* FAB */}
                <button className="hp-fab" onClick={() => navigate("/tasks")}>+</button>
            </main>
        </div>
    );
};

export default HomePage;
