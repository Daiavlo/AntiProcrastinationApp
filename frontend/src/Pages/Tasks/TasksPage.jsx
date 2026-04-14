import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { API_URL } from "../../config";
import "./TasksPage.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
];

// ── helpers ──────────────────────────────────────────────────────────────────

/** Return "YYYY-MM-DD" for a Date object (local time) */
const toLocalDateStr = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Parse a task's due_date as local YYYY-MM-DD string (strips the time part) */
const taskDateStr = (task) => task.due_date ? task.due_date.slice(0, 10) : null;

// ─────────────────────────────────────────────────────────────────────────────

const TasksPage = () => {
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [classes, setClasses] = useState([]);
    const location = useLocation();

    // view toggle
    const [viewMode, setViewMode] = useState("list"); // "list" | "calendar"

    // list-view state
    const [filterCategory, setFilterCategory] = useState("all");
    const [filterClass, setFilterClass] = useState("all");

    // create/edit modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [newTask, setNewTask] = useState({ title: "", description: "", due_date: "", priority: "medium", status: "pending", class_id: "" });

    // calendar state
    const [calMonth, setCalMonth] = useState(new Date().getMonth());
    const [calYear, setCalYear]   = useState(new Date().getFullYear());

    // detail panel (calendar click on a task)
    const [detailTask, setDetailTask] = useState(null);

    // ── data fetching ─────────────────────────────────────────────────────────

    const fetchClasses = (token) => {
        fetch(`${API_URL}/classes`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setClasses(data || []))
        .catch(console.error);
    };

    const fetchTasks = (token) => {
        fetch(`${API_URL}/tasks`, { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => setTasks(data || []))
            .catch(console.error);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { window.location.href = "/auth"; return; }
        const headers = { "Authorization": `Bearer ${token}` };
        
        fetch(`${API_URL}/profile`, { headers })
            .then(res => res.json())
            .then(data => setUser(data))
            .catch(() => (window.location.href = "/auth"));

        fetchTasks(token);
        fetchClasses(token);

        // Handle URL query for class filtering
        const params = new URLSearchParams(location.search);
        const classId = params.get("class");
        if (classId) {
            setFilterClass(classId);
        }
    }, [location.search]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/auth";
    };

    // ── helpers ───────────────────────────────────────────────────────────────

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case "high":
            case "priority": return "high";
            case "medium":   return "medium";
            case "low":      return "low";
            default:         return "medium";
        }
    };

    const isOverdue = (task) => {
        if (task.status === "completed" || !task.due_date) return false;
        const d = new Date(task.due_date); d.setHours(0,0,0,0);
        const now = new Date(); now.setHours(0,0,0,0);
        return d < now;
    };

    // ── status change ─────────────────────────────────────────────────────────

    const handleChangeStatus = async (taskId, newStatus) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        setTasks(prev => prev.map(t => t.assignment_id === taskId ? { ...t, status: newStatus } : t));
        if (detailTask?.assignment_id === taskId) setDetailTask(prev => ({ ...prev, status: newStatus }));
        try {
            const res = await fetch(`${API_URL}/tasks/${taskId}/status`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) fetchTasks(token);
        } catch { fetchTasks(token); }
    };

    // ── create task ───────────────────────────────────────────────────────────

    const openCreateModal = (dateStr = "") => {
        setIsEditing(false);
        setEditingTaskId(null);
        setNewTask({ title: "", description: "", due_date: dateStr, priority: "medium", status: "pending", class_id: filterClass !== "all" ? filterClass : "" });
        setIsModalOpen(true);
    };

    const openEditModal = (task) => {
        setIsEditing(true);
        setEditingTaskId(task.assignment_id);
        // Extract YYYY-MM-DD from the task date
        const datePart = task.due_date ? task.due_date.slice(0, 10) : "";
        setNewTask({
            title: task.title,
            description: task.description || "",
            due_date: datePart,
            priority: task.priority || "medium",
            status: task.status || "pending",
            class_id: task.class_id || ""
        });
        setIsModalOpen(true);
        setDetailTask(null); // Close detail panel when editing
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            // FIX: Append T00:00:00 to treat input as local time and avoid day shift bug
            let formattedDate = new Date().toISOString();
            if (newTask.due_date) {
                formattedDate = new Date(newTask.due_date + "T00:00:00").toISOString();
            }

            const url = isEditing ? `${API_URL}/tasks/${editingTaskId}` : `${API_URL}/tasks`;
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    title: newTask.title, 
                    description: newTask.description, 
                    due_date: formattedDate, 
                    priority: newTask.priority, 
                    status: newTask.status || "pending",
                    class_id: newTask.class_id ? parseInt(newTask.class_id) : null
                })
            });
            if (res.ok) {
                setIsModalOpen(false);
                setNewTask({ title: "", description: "", due_date: "", priority: "medium", status: "pending", class_id: "" });
                setIsEditing(false);
                setEditingTaskId(null);
                fetchTasks(token);
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteTask = async () => {
        if (!window.confirm("Are you sure you want to delete this assignment?")) return;
        const token = localStorage.getItem("token");
        if (!token || !editingTaskId) return;

        try {
            const res = await fetch(`${API_URL}/tasks/${editingTaskId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                setIsModalOpen(false);
                setIsEditing(false);
                setEditingTaskId(null);
                fetchTasks(token);
            }
        } catch (err) { console.error(err); }
    };

    // ── list filter ───────────────────────────────────────────────────────────

    const getVisibleTasks = () => {
        const now = new Date(); now.setHours(0,0,0,0);
        const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0,0,0,0);
        const endOfWeek   = new Date(now); endOfWeek.setDate(now.getDate() - now.getDay() + 6); endOfWeek.setHours(23,59,59,999);

        return tasks.filter(task => {
            if (task.status === "completed") {
                const cd = task.updated_at ? new Date(task.updated_at) : (task.due_date ? new Date(task.due_date) : new Date());
                cd.setHours(0,0,0,0);
                if (cd < startOfWeek || cd > endOfWeek) return false;
            }
            if (filterClass !== "all" && String(task.class_id) !== String(filterClass)) return false;

            if (filterCategory === "all")     return true;
            if (filterCategory === "overdue") return isOverdue(task);
            return task.status === filterCategory;
        });
    };

    const visibleTasks = getVisibleTasks();

    // ── calendar helpers ──────────────────────────────────────────────────────

    /** Build array of { date: Date|null } for the calendar grid */
    const buildCalendarDays = () => {
        const firstDay = new Date(calYear, calMonth, 1).getDay();
        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
        const cells = [];
        for (let i = 0; i < firstDay; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(calYear, calMonth, d));
        return cells;
    };

    const calDays = buildCalendarDays();

    const getTasksForDate = (date) => {
        if (!date) return [];
        const s = toLocalDateStr(date);
        return tasks.filter(t => taskDateStr(t) === s);
    };

    const todayStr = toLocalDateStr(new Date());

    const prevMonth = () => {
        if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
        else setCalMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
        else setCalMonth(m => m + 1);
    };

    // ── render ────────────────────────────────────────────────────────────────

    return (
        <div className="hp-layout">
            <Sidebar user={user} handleLogout={handleLogout} />
            <main className="hp-main-content">
                <div className="tasks-page-container">

                    {/* ── Header ── */}
                    <header className="tasks-header">
                        <div>
                            <h1>My Assignments</h1>
                            <p className="tasks-subtitle">Manage your path to efficiency</p>
                        </div>
                        <div className="tasks-header-right">
                            {/* View toggle */}
                            <div className="view-toggle">
                                <button
                                    className={`view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
                                    onClick={() => setViewMode("list")}
                                    title="List view"
                                >
                                    ☰ List
                                </button>
                                <button
                                    className={`view-toggle-btn ${viewMode === "calendar" ? "active" : ""}`}
                                    onClick={() => setViewMode("calendar")}
                                    title="Calendar view"
                                >
                                    📅 Calendar
                                </button>
                            </div>
                            <button className="add-task-btn" onClick={() => openCreateModal()}>
                                + New Assignment
                            </button>
                        </div>
                    </header>

                    {/* ── LIST VIEW ── */}
                    {viewMode === "list" && (
                        <>
                            <div className="tasks-filters">
                                {[
                                    { key: "all",         label: "All Status" },
                                    { key: "pending",     label: "Pending" },
                                    { key: "in_progress", label: "In Progress" },
                                    { key: "overdue",     label: "Overdue", danger: true },
                                    { key: "completed",   label: "Completed" },
                                ].map(f => (
                                    <button
                                        key={f.key}
                                        className={`filter-btn ${filterCategory === f.key ? "active" : ""}`}
                                        onClick={() => setFilterCategory(f.key)}
                                        style={f.danger && filterCategory !== f.key ? { color: "#ff6b6b" } : undefined}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                                
                                <div className="class-filter-divider"></div>

                                <select 
                                    className="class-filter-select"
                                    value={filterClass}
                                    onChange={(e) => setFilterClass(e.target.value)}
                                >
                                    <option value="all">All Classes</option>
                                    <option value="general">General (No Class)</option>
                                    {classes.map(c => (
                                        <option key={c.class_id} value={c.class_id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="tasks-list-detailed">
                                {visibleTasks.map((task) => (
                                    <div
                                        key={task.assignment_id}
                                        className={`task-item-row ${isOverdue(task) ? "overdue" : (task.status || "pending")}`}
                                        onClick={() => setDetailTask(task)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div className="priority-indicator" style={{ backgroundColor: task.class_color || getPriorityColor(task.priority) === 'high' ? 'var(--accent)' : getPriorityColor(task.priority) === 'medium' ? 'var(--warning)' : 'var(--info)' }}></div>
                                        <div className="task-row-main">
                                            <div className="task-row-top">
                                                <span className="task-row-cat" style={{ color: task.class_color || 'var(--text-muted)' }}>
                                                    {task.class_name || "General"}
                                                </span>
                                                <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                                                    {isOverdue(task) && (
                                                        <span className="overdue-badge">Overdue</span>
                                                    )}
                                                    <span className="task-row-date">Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No date"}</span>
                                                </div>
                                            </div>
                                            <h3 className="task-row-title">{task.title}</h3>
                                            <p className="task-row-desc">{task.description || "No description provided."}</p>
                                        </div>
                                        <div className="task-row-status" onClick={e => e.stopPropagation()}>
                                            <button 
                                                className="edit-task-link-btn" 
                                                onClick={(e) => { e.stopPropagation(); openEditModal(task); }}
                                            >
                                                Edit
                                            </button>
                                            <select
                                                className="status-select"
                                                value={task.status || "pending"}
                                                onChange={(e) => handleChangeStatus(task.assignment_id, e.target.value)}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                                {visibleTasks.length === 0 && (
                                    <p style={{ color:"var(--text-muted)", textAlign:"center", marginTop:"3rem" }}>No assignments here — enjoy the calm! 🎉</p>
                                )}
                            </div>
                        </>
                    )}

                    {/* ── CALENDAR VIEW ── */}
                    {viewMode === "calendar" && (
                        <div className="cal-wrapper">
                            {/* Month navigation */}
                            <div className="cal-nav">
                                <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
                                <span className="cal-month-label">{MONTHS[calMonth]} {calYear}</span>
                                <button className="cal-nav-btn" onClick={nextMonth}>›</button>
                            </div>

                            {/* Day headers */}
                            <div className="cal-grid">
                                {DAYS.map(d => (
                                    <div key={d} className="cal-day-header">{d}</div>
                                ))}

                                {/* Day cells */}
                                {calDays.map((date, idx) => {
                                    if (!date) return <div key={`blank-${idx}`} className="cal-cell cal-cell--blank" />;

                                    const dayTasks   = getTasksForDate(date);
                                    const dateStr    = toLocalDateStr(date);
                                    const isToday    = dateStr === todayStr;
                                    const isPast     = dateStr < todayStr;

                                    return (
                                        <div
                                            key={dateStr}
                                            className={`cal-cell ${isToday ? "cal-cell--today" : ""} ${isPast && dayTasks.length === 0 ? "cal-cell--past" : ""}`}
                                            onClick={() => {
                                                if (dayTasks.length === 0) openCreateModal(dateStr);
                                            }}
                                            title={dayTasks.length === 0 ? "Add assignment" : undefined}
                                        >
                                            <span className="cal-day-num">{date.getDate()}</span>
                                            <div className="cal-tasks-list">
                                                {dayTasks.map(task => (
                                                    <div
                                                        key={task.assignment_id}
                                                        className={`cal-task-pill cal-pill--${isOverdue(task) ? "overdue" : getPriorityColor(task.priority)} ${task.status === "completed" ? "cal-pill--done" : ""}`}
                                                        onClick={(e) => { e.stopPropagation(); setDetailTask(task); }}
                                                        title={task.title}
                                                    >
                                                        {task.title}
                                                    </div>
                                                ))}
                                            </div>
                                            {dayTasks.length === 0 && (
                                                <span className="cal-add-hint">＋</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div className="cal-legend">
                                <span className="cal-legend-item"><span className="cal-legend-dot dot--high"/>High</span>
                                <span className="cal-legend-item"><span className="cal-legend-dot dot--medium"/>Medium</span>
                                <span className="cal-legend-item"><span className="cal-legend-dot dot--low"/>Low</span>
                                <span className="cal-legend-item"><span className="cal-legend-dot dot--overdue"/>Overdue</span>
                                <span className="cal-legend-item"><span className="cal-legend-dot dot--done"/>Done</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── TASK DETAIL PANEL ── */}
                {detailTask && (
                    <div className="task-detail-overlay" onClick={() => setDetailTask(null)}>
                        <div className="task-detail-panel" onClick={e => e.stopPropagation()}>
                            <div className="task-detail-header">
                                <div>
                                    {isOverdue(detailTask) && <span className="overdue-badge" style={{marginBottom:"6px",display:"inline-block"}}>Overdue</span>}
                                    <h2 className="task-detail-title">{detailTask.title}</h2>
                                    <span className="task-detail-meta">
                                        Due: {detailTask.due_date ? new Date(detailTask.due_date).toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"}) : "No date"}
                                    </span>
                                </div>
                                <button className="close-modal-btn" onClick={() => setDetailTask(null)}>×</button>
                            </div>

                            <div className={`task-detail-priority-bar task-detail-priority--${getPriorityColor(detailTask.priority)}`}>
                                {detailTask.priority?.toUpperCase() || "MEDIUM"} PRIORITY
                            </div>

                            <p className="task-detail-desc">{detailTask.description || "No description provided."}</p>

                            <div className="task-detail-status-row">
                                <label>Status</label>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    <select
                                        className="status-select"
                                        value={detailTask.status || "pending"}
                                        onChange={(e) => handleChangeStatus(detailTask.assignment_id, e.target.value)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                    <button 
                                        className="submit-btn" 
                                        style={{ padding: "6px 15px", fontSize: "0.85rem" }}
                                        onClick={() => openEditModal(detailTask)}
                                    >
                                        Edit Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── CREATE MODAL ── */}
                {isModalOpen && (
                    <div className="task-modal-overlay">
                        <div className="task-modal-content">
                            <div className="task-modal-header">
                                <h2>{isEditing ? "Edit Assignment" : "Create New Assignment"}</h2>
                                <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>×</button>
                            </div>
                            <form onSubmit={handleCreateTask} className="task-modal-form">
                                <div className="form-group">
                                    <label>Title</label>
                                    <input type="text" required placeholder="Enter assignment title..."
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea rows="3" placeholder="Add any details or requirements..."
                                        value={newTask.description}
                                        onChange={(e) => setNewTask({...newTask, description: e.target.value})} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group half">
                                        <label>Due Date</label>
                                        <input type="date" required value={newTask.due_date}
                                            onChange={(e) => setNewTask({...newTask, due_date: e.target.value})} />
                                    </div>
                                    <div className="form-group half">
                                        <label>Priority</label>
                                        <select value={newTask.priority}
                                            onChange={(e) => setNewTask({...newTask, priority: e.target.value})}>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                    <div className="form-group half">
                                        <label>Class</label>
                                        <select value={newTask.class_id}
                                            onChange={(e) => setNewTask({...newTask, class_id: e.target.value})}>
                                            <option value="">General (No Class)</option>
                                            {classes.map(c => (
                                                <option key={c.class_id} value={c.class_id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="task-modal-actions">
                                    {isEditing && (
                                        <button type="button" className="delete-btn" onClick={handleDeleteTask}>Delete</button>
                                    )}
                                    <div style={{ flex: 1 }}></div>
                                    <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="submit-btn">{isEditing ? "Save Changes" : "Create Assignment"}</button>
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
