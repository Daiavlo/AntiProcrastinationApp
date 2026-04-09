import React, { useEffect, useRef } from "react";
import "./ComparePointsModal.css";

const ComparePointsModal = ({ onClose, myUser, alienUser }) => {
    const modalRef = useRef(null);
    const videoRef = useRef(null);

    // Calculate tug-of-war split
    // Formula: (MyPoints / (MyPoints + FriendPoints)) * 100
    const totalPoints = (myUser.points || 0) + (alienUser.points || 0);
    const myPercentage = totalPoints > 0 
        ? ((myUser.points || 0) / totalPoints) * 100 
        : 50; // default 50/50 if both zero

    useEffect(() => {
        // Auto-play video on mount
        if (videoRef.current) {
            videoRef.current.play().catch(err => console.error("Auto-play failed:", err));
        }
    }, []);

    return (
        <div className="compare-modal-overlay">
            <div className="compare-modal-content" ref={modalRef}>
                {/* Background Video Placeholder */}
                <video 
                    ref={videoRef}
                    className="compare-bg-video"
                    src="/assets/placeholder_video.mp4" 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                />
                
                <div className="compare-content-layer">
                    <button className="compare-close-btn" onClick={onClose}>✕</button>
                    
                    <h2 className="compare-title">Point Battle</h2>
                    
                    <div className="compare-players">
                        <div className="player blue">
                            <img src={myUser.avatar} alt="Me" className="player-avatar" />
                            <span className="player-name">You</span>
                            <span className="player-points">{myUser.points || 0}</span>
                        </div>
                        
                        <div className="battle-vs">VS</div>
                        
                        <div className="player red">
                            <img src={alienUser.avatar} alt={alienUser.username} className="player-avatar" />
                            <span className="player-name">{alienUser.username}</span>
                            <span className="player-points">{alienUser.points || 0}</span>
                        </div>
                    </div>

                    {/* Tug of War Bar */}
                    <div className="tug-of-war-container">
                        <div className="tug-of-war-bar">
                            <div 
                                className="tug-fill blue" 
                                style={{ width: `${myPercentage}%` }}
                            >
                                <span className="tug-label">{Math.round(myPercentage)}%</span>
                            </div>
                            <div 
                                className="tug-fill red" 
                                style={{ width: `${100 - myPercentage}%` }}
                            >
                                <span className="tug-label">{Math.round(100 - myPercentage)}%</span>
                            </div>
                        </div>
                        <div className="tug-marker" style={{ left: `${myPercentage}%` }}></div>
                    </div>

                    <div className="battle-status">
                        {myUser.points > alienUser.points ? (
                            <p className="status-text win">You are dominating the week!</p>
                        ) : myUser.points < alienUser.points ? (
                            <p className="status-text lose">{alienUser.username} is leading!</p>
                        ) : (
                            <p className="status-text tie">It's a dead heat!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComparePointsModal;
