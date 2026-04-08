import React, { useState } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import "./TasksPage.css";

const TasksPage = () => {
    const [user, setUser] = useState(() => {
        const stored = sessionStorage.getItem("currentUser");
        return stored ? JSON.parse(stored) : null;
    });

    const [tasks, setTasks] = useState(user?.tasks || []);

    if (!user) return null;

    const handleLogout = () => {
        sessionStorage.removeItem("currentUser");
        window.location.href = "/auth";
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
            case 'priority': return 'high';
            case 'medium': return 'medium';
            case 'low': return 'low';
            default: return 'medium';
        }
    };

    return (
        <div className="hp-layout">
            <Sidebar user={user} handleLogout={handleLogout} />
            <main className="hp-main-content">
                <div className="tasks-page-container">
                    <header className="tasks-header">
                        <div>
                            <h1>My Assignments</h1>
                            <p className="tasks-subtitle">Manage your path to efficiency</p>
                        </div>
                        <button className="add-task-btn">+ New Assignment</button>
                    </header>

                    <div className="tasks-filters">
                        <button className="filter-btn active">All</button>
                        <button className="filter-btn">Pending</button>
                        <button className="filter-btn">In Progress</button>
                        <button className="filter-btn">Completed</button>
                    </div>

                    <div className="tasks-list-detailed">
                        {tasks.map((task) => (
                            <div key={task.id} className={`task-item-row ${task.status === 'completed' ? 'done' : ''}`}>
                                <div className={`priority-indicator ${getPriorityColor(task.type || task.priority)}`}></div>
                                <div className="task-row-main">
                                    <div className="task-row-top">
                                        <span className="task-row-cat">{task.category || 'GENERAL'}</span>
                                        <span className="task-row-date">Due: {task.due_date || task.remaining || 'No date'}</span>
                                    </div>
                                    <h3 className="task-row-title">{task.title}</h3>
                                    <p className="task-row-desc">{task.description || "No description provided."}</p>
                                </div>
                                <div className="task-row-status">
                                    <select 
                                        className="status-select" 
                                        defaultValue={task.status || (task.progress === 100 ? 'completed' : 'pending')}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                    <button className="task-row-more">⋮</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TasksPage;
