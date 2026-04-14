import React from "react";
import "./HelpModal.css";

const HelpModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    // Close on overlay click
    const handleOverlayClick = (e) => {
        if (e.target.classList.contains("help-modal-overlay")) {
            onClose();
        }
    };

    return (
        <div className="help-modal-overlay" onClick={handleOverlayClick}>
            <div className="help-modal-content">
                <div className="help-modal-header">
                    <h2>How AntiProc Works</h2>
                    <button className="help-close-btn" onClick={onClose} aria-label="Close">
                        &times;
                    </button>
                </div>
                <div className="help-modal-body">
                    
                    <div className="help-section">
                        <h3>🏆 The Points System</h3>
                        <p>
                            Points are a measure of your productivity and consistency in the app.
                        </p>
                        <ul>
                            <li><strong>Earn points</strong> by completing tasks before their deadlines. Focusing on high-priority tasks and keeping a structured schedule will boost your score.</li>
                            <li><strong>Monitor progress</strong> on your Profile page. As your points grow, they represent your commitment to beating procrastination!</li>
                        </ul>
                    </div>

                    <div className="help-section">
                        <h3>👥 Friends & Accountability</h3>
                        <p>
                            Beating procrastination is easier with friends. The Friends system is for accountability:
                        </p>
                        <ul>
                            <li><strong>Add friends</strong> via the "Add Friend" section by searching for their username or viewing public profiles.</li>
                            <li><strong>Stay accountable</strong> by checking your friends' profiles to see their progress and points. Encourage each other to stay on track.</li>
                            <li><strong>Privacy:</strong> While friends can see your profile details and overall points, your sensitive private tasks remain visible only to you.</li>
                        </ul>
                    </div>

                    <div className="help-section">
                        <h3>📋 Tasks & Focus</h3>
                        <p>
                            The core of the app is managing your to-do list effectively.
                        </p>
                        <ul>
                            <li><strong>Creating Tasks:</strong> Click the "+" floating button or go to the Tasks page to add new items. Provide titles, descriptions, and deadlines.</li>
                            <li><strong>Priorities:</strong> You can mark tasks as "Focused" to highlight them as high-priority on your Home dashboard. Don't let these slip!</li>
                            <li><strong>Completion:</strong> Check off tasks as you finish them to keep your list clean and secure your well-earned points.</li>
                        </ul>
                    </div>

                    <div className="help-section">
                        <h3>⚙️ Profile & Customization</h3>
                        <p>
                            Make exactly your space. Visit your Profile to upload an avatar and a personalized banner, add your pronouns, and create a bio that shares a bit about who you are.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default HelpModal;
