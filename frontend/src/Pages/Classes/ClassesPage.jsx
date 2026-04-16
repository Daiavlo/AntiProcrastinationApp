import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Components/Sidebar/Sidebar";
import PageLoader from "../../Components/PageLoader/PageLoader";
import { API_URL } from "../../config";
import "./ClassesPage.css";

const ClassesPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        try { const cached = localStorage.getItem("hp_cached_user"); return cached ? JSON.parse(cached) : null; } catch { return null; }
    });
    const [classes, setClasses] = useState(() => {
        try { const cached = localStorage.getItem("hp_cached_classes"); return cached ? JSON.parse(cached) : []; } catch { return []; }
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingClassId, setEditingClassId] = useState(null);
    const [newClass, setNewClass] = useState({ name: "", color: "#4f46e5" });

    const COLORS = [
        "#4f46e5", "#ef4444", "#10b981", "#f59e0b", 
        "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4"
    ];

    const fetchClasses = (token) => {
        fetch(`${API_URL}/classes`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            setClasses(data || []);
            try { localStorage.setItem("hp_cached_classes", JSON.stringify(data || [])); } catch {}
        })
        .catch(console.error);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/auth"); return; }
        const headers = { "Authorization": `Bearer ${token}` };
        
        fetch(`${API_URL}/profile`, { headers })
            .then(res => res.json())
            .then(data => {
                setUser(data);
                try { localStorage.setItem("hp_cached_user", JSON.stringify(data)); } catch {}
            })
            .catch(() => navigate("/auth"));

        fetchClasses(token);
    }, [navigate]);

    const handleCreateOrUpdateClass = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) return;

        const url = isEditing ? `${API_URL}/classes/${editingClassId}` : `${API_URL}/classes`;
        const method = isEditing ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { 
                    "Authorization": `Bearer ${token}`, 
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify(newClass)
            });
            if (res.ok) {
                setIsModalOpen(false);
                setIsEditing(false);
                setNewClass({ name: "", color: "#4f46e5" });
                fetchClasses(token);
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteClass = async (id) => {
        if (!window.confirm("Are you sure? All assignments for this class will become 'General'.")) return;
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_URL}/classes/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) fetchClasses(token);
        } catch (err) { console.error(err); }
    };

    const openEditModal = (cls) => {
        setIsEditing(true);
        setEditingClassId(cls.class_id);
        setNewClass({ name: cls.name, color: cls.color });
        setIsModalOpen(true);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/auth");
    };

    if (!user) {
        return (
            <div className="hp-layout">
                <Sidebar handleLogout={handleLogout} />
                <main className="hp-main-content">
                    <PageLoader text="Loading Classes..." />
                </main>
            </div>
        );
    }

    return (
        <div className="hp-layout">
            <Sidebar user={user} handleLogout={handleLogout} />
            <main className="hp-main-content">
                <div className="classes-page-container">
                    <header className="classes-header">
                        <div>
                            <h1>My Classes</h1>
                            <p className="classes-subtitle">Organize your academic journey</p>
                        </div>
                        <button className="add-class-btn" onClick={() => { setIsEditing(false); setNewClass({ name: "", color: "#4f46e5" }); setIsModalOpen(true); }}>
                            + New Class
                        </button>
                    </header>

                    <div className="classes-grid">
                        {classes.map((cls) => (
                            <div key={cls.class_id} className="class-card" style={{ borderTop: `6px solid ${cls.color}` }}>
                                <div className="class-card-header">
                                    <h3 className="class-title">{cls.name}</h3>
                                    <div className="class-actions">
                                        <button onClick={() => openEditModal(cls)}>Edit</button>
                                        <button onClick={() => handleDeleteClass(cls.class_id)} className="delete-btn">Delete</button>
                                    </div>
                                </div>
                                <button className="view-assignments-btn" onClick={() => navigate(`/tasks?class=${cls.class_id}`)}>
                                    View Assignments
                                </button>
                            </div>
                        ))}
                        {classes.length === 0 && (
                            <p className="no-classes">No classes added yet. Start by adding your first course!</p>
                        )}
                    </div>
                </div>

                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>{isEditing ? "Edit Class" : "Add New Class"}</h2>
                            <form onSubmit={handleCreateOrUpdateClass}>
                                <div className="form-group">
                                    <label>Class Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="e.g. Computer Science 101"
                                        value={newClass.name}
                                        onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Pick a Color</label>
                                    <div className="color-picker">
                                        {COLORS.map(c => (
                                            <div 
                                                key={c} 
                                                className={`color-swatch ${newClass.color === c ? "active" : ""}`}
                                                style={{ backgroundColor: c }}
                                                onClick={() => setNewClass({ ...newClass, color: c })}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="submit-btn">
                                        {isEditing ? "Save Changes" : "Create Class"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ClassesPage;
