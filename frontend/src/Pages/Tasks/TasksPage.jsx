import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import "./TasksPage.css";

const TasksPage = () => {
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterCategory, setFilterCategory] = useState("all");
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        due_date: "",
        priority: "medium"
    });

    const fetchTasks = (token) => {
        fetch("http://localhost:8080/api/tasks", { 
            headers: { "Authorization": `Bearer ${token}` } 
        })
        .then(res => res.json())
        .then(data => setTasks(data || []))
        .catch(console.error);
    };

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

        // Fetch Tasks
        fetchTasks(token);

    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem("token");
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

    const handleChangeStatus = async (taskId, newStatus) => {
        const token = sessionStorage.getItem("token");
        if (!token) return;
        
        // Optimistic UI update
        setTasks(prev => prev.map(t => t.assignment_id === taskId ? { ...t, status: newStatus } : t));

        try {
            const response = await fetch(`http://localhost:8080/api/tasks/${taskId}/status`, {
                method: "PUT",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                // Revert or refresh on failure
                fetchTasks(token);
            } else if (newStatus === 'completed') {
                // If checking off a task, we might want to also refresh the profile's points!
                // But for now, we just refresh the local task cache
                fetchTasks(token);
            }
        } catch (error) {
            console.error("Error updating status:", error);
            fetchTasks(token);
        }
    };

    // FILTER LOGIC
    const getVisibleTasks = () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() - now.getDay() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return tasks.filter(task => {
            const taskDate = task.due_date ? new Date(task.due_date) : (task.created_at ? new Date(task.created_at) : new Date());
            taskDate.setHours(0, 0, 0, 0);

            // 1. Mandatory Date/Overdue filtering per requirements
            // Overdue and NOT completed -> Hide
            if (task.status !== 'completed' && task.due_date) {
                if (taskDate < now) {
                    return false; 
                }
            }

            // Completed -> Only show if from this current week (based on when it was finished)
            if (task.status === 'completed') {
                const completionDate = task.updated_at ? new Date(task.updated_at) : taskDate;
                completionDate.setHours(0, 0, 0, 0);
                if (completionDate < startOfWeek || completionDate > endOfWeek) {
                    return false;
                }
            }

            // 2. Category filtering based on UI buttons
            if (filterCategory === "all") return true;
            return task.status === filterCategory;
        });
    };

    const visibleTasks = getVisibleTasks();

    const handleCreateTask = async (e) => {
        e.preventDefault();
        const token = sessionStorage.getItem("token");
        if (!token) return;

        try {
            // Due date formatting for backend (Ensure it's a valid ISO string or time)
            let formattedDate = new Date().toISOString(); 
            if (newTask.due_date) {
                formattedDate = new Date(newTask.due_date).toISOString();
            }

            const response = await fetch("http://localhost:8080/api/tasks", {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: newTask.title,
                    description: newTask.description,
                    due_date: formattedDate,
                    priority: newTask.priority,
                    status: "pending"
                })
            });

            if (response.ok) {
                setIsModalOpen(false);
                setNewTask({ title: "", description: "", due_date: "", priority: "medium" });
                fetchTasks(token); // Refresh tasks
            }
        } catch (error) {
            console.error("Error creating task:", error);
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
                        <button className="add-task-btn" onClick={() => setIsModalOpen(true)}>
                            + New Assignment
                        </button>
                    </header>

                    <div className="tasks-filters">
                        <button 
                            className={`filter-btn ${filterCategory === "all" ? "active" : ""}`}
                            onClick={() => setFilterCategory("all")}
                        >
                            All
                        </button>
                        <button 
                            className={`filter-btn ${filterCategory === "pending" ? "active" : ""}`}
                            onClick={() => setFilterCategory("pending")}
                        >
                            Pending
                        </button>
                        <button 
                            className={`filter-btn ${filterCategory === "in_progress" ? "active" : ""}`}
                            onClick={() => setFilterCategory("in_progress")}
                        >
                            In Progress
                        </button>
                        <button 
                            className={`filter-btn ${filterCategory === "completed" ? "active" : ""}`}
                            onClick={() => setFilterCategory("completed")}
                        >
                            Completed
                        </button>
                    </div>

                    <div className="tasks-list-detailed">
                        {visibleTasks.map((task) => (
                            <div key={task.assignment_id} className={`task-item-row ${task.status || 'pending'}`}>
                                <div className={`priority-indicator ${getPriorityColor(task.priority)} ${task.status || 'pending'}`}></div>
                                <div className="task-row-main">
                                    <div className="task-row-top">
                                        <span className="task-row-cat">General</span>
                                        <span className="task-row-date">Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}</span>
                                    </div>
                                    <h3 className="task-row-title">{task.title}</h3>
                                    <p className="task-row-desc">{task.description || "No description provided."}</p>
                                </div>
                                <div className="task-row-status">
                                    <select 
                                        className="status-select" 
                                        value={task.status || 'pending'}
                                        onChange={(e) => handleChangeStatus(task.assignment_id, e.target.value)}
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

                {/* MODAL / POPUP FOR NEW ASSIGNMENT */}
                {isModalOpen && (
                    <div className="task-modal-overlay">
                        <div className="task-modal-content">
                            <div className="task-modal-header">
                                <h2>Create New Assignment</h2>
                                <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>×</button>
                            </div>
                            <form onSubmit={handleCreateTask} className="task-modal-form">
                                <div className="form-group">
                                    <label>Title</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="Enter assignment title..." 
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea 
                                        rows="3" 
                                        placeholder="Add any details or requirements..."
                                        value={newTask.description}
                                        onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                                    ></textarea>
                                </div>
                                <div className="form-row">
                                    <div className="form-group half">
                                        <label>Due Date</label>
                                        <input 
                                            type="date" 
                                            required
                                            value={newTask.due_date}
                                            onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group half">
                                        <label>Priority</label>
                                        <select 
                                            value={newTask.priority}
                                            onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="task-modal-actions">
                                    <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="submit-btn">Create Assignment</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TasksPage;
