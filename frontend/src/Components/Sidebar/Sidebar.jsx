import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import homeIcon from "../Assets/person.png";
import profileIcon from "../Assets/person.png";
import HelpModal from "../HelpModal/HelpModal";



const Sidebar = ({ user, handleLogout }) => {
    const location = useLocation();
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { name: "Home", path: "/home", icon: "" },
        { name: "Tasks", path: "/tasks", icon: "" },
        { name: "Classes", path: "/classes", icon: "" },
        { name: "Friends", path: "/friends", icon: "" },
        { name: "Settings", path: "/settings", icon: "" },
    ];

    return (
        <>
            <div className="mobile-header">
                <h2 className="mobile-logo">AntiProc</h2>
                <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    ☰
                </button>
            </div>

            {isMobileMenuOpen && (
                <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
            )}


            <div className={`sidebar ${isMobileMenuOpen ? "open" : ""}`}>
                <div className="sidebar-top">
                    <h2 className="logo">AntiProc</h2>
                    <nav className="nav-links">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="sidebar-bottom">
                    <div className="user-profile-capsule">
                        <img src={user?.avatar} alt="avatar" className="sidebar-avatar" />
                        <div className="user-info">
                            <span className="user-name">{user?.username}</span>
                        </div>
                    </div>
                    <div className="extra-links">
                        <button className="extra-link" onClick={() => setIsHelpOpen(true)}>
                            <span className="nav-icon"></span> Help
                        </button>
                        <button className="extra-link logout" onClick={handleLogout}>
                            <span className="nav-icon"></span> Logout
                        </button>
                    </div>
                </div>
                <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

                <div className="sidebar-bottom">
                    <Link to="/profile" className="user-profile-capsule" style={{ textDecoration: 'none' }}>
                        <img src={user?.avatar} alt="avatar" className="sidebar-avatar" />
                        <div className="user-info">
                            <span className="user-name">{user?.username}</span>
                        </div>
                    </Link>
                    <div className="extra-links">
                        <button className="extra-link">
                            <span className="nav-icon"></span> Help
                        </button>
                        <button className="extra-link logout" onClick={handleLogout}>
                            <span className="nav-icon"></span> Logout
                        </button>
                    </div>

                </div>
            </>
            );
};

            export default Sidebar;
