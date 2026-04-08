import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Components/Sidebar/Sidebar";
import "./HomePage.css";

const HomePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const stored = sessionStorage.getItem("currentUser");
        if (!stored) {
            navigate("/auth");
        } else {
            setUser(JSON.parse(stored));
        }
    }, [navigate]);

    const handleLogout = () => {
        sessionStorage.removeItem("currentUser");
        navigate("/auth");
    };

    const togglePriority = (taskId) => {
        const updatedTasks = user.tasks.map(task => 
            task.id === taskId ? { ...task, type: task.type === 'priority' ? 'standard' : 'priority' } : task
        );
        const updatedUser = { ...user, tasks: updatedTasks };
        setUser(updatedUser);
        sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));
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
                    <div className="hp-header-actions">
                        <button className="hp-icon-btn">🔔</button>
                    </div>
                </header>

                <div className="hp-grid">
                    <div className="hp-left-col">
                        {/* Friends Section */}
                        <section className="hp-section hp-friends-section">
                            <div className="hp-section-header">
                                <h2>Friends</h2>
                                <button className="hp-text-btn">View All</button>
                            </div>
                            <div className="hp-friends-list">
                                {user.friends?.map((friend) => (
                                    <div key={friend.id} className="hp-friend-item">
                                        <div className="hp-friend-avatar-wrap">
                                            <img src={friend.avatar} alt={friend.name} className="hp-friend-avatar" />

                                        </div>
                                        <span className="hp-friend-name">{friend.name}</span>
                                    </div>
                                ))}
                                <div className="hp-friend-item add-friend">
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
                                    {user.tasks?.filter(t => t.type === 'priority').length} Priority Tasks
                                </span>
                            </div>
                            <div className="hp-task-list">
                                {user.tasks?.map((task) => (
                                    <div key={task.id} className={`hp-task-card ${task.type}`}>
                                        <div className="hp-task-info">
                                            <span className="hp-task-cat">{task.category}</span>
                                            <h3 className="hp-task-title">{task.title}</h3>
                                            <div className="hp-progress-container">
                                                <div className="hp-progress-bar">
                                                    <div className="hp-progress-fill" style={{ width: `${task.progress}%` }}></div>
                                                </div>
                                                <div className="hp-progress-stats">
                                                    <span>{task.progress}% COMPLETE</span>
                                                    <span>{task.remaining}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="hp-task-actions">
                                            <button 
                                                className={`hp-focus-btn ${task.type === 'priority' ? 'primary' : 'secondary'}`}
                                                onClick={() => togglePriority(task.id)}
                                            >
                                                {task.type === 'priority' ? 'Focused' : 'Focus'}
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
                <button className="hp-fab">+</button>
            </main>
        </div>
    );
};

export default HomePage;
