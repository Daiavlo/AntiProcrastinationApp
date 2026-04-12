import React, { useEffect, useMemo, useRef, useState } from "react";
import "./ComparePointsModal.css";
import yutaVideo from "../../Components/Assets/Yuta.mp4";
import danteVergilVideo from "../../Components/Assets/DanteVergil.mp4";

const videoPool = [yutaVideo, danteVergilVideo];

const ComparePointsModal = ({ onClose, myUser, alienUser }) => {
    const modalRef = useRef(null);
    const videoRef = useRef(null);

    // Pick a random video once per modal open
    const randomVideo = useMemo(
        () => videoPool[Math.floor(Math.random() * videoPool.length)],
        []
    );

    // Calculate tug-of-war split
    // Formula: (MyPoints / (MyPoints + FriendPoints)) * 100
    const totalPoints = (myUser.points || 0) + (alienUser.points || 0);
    const myPercentage = totalPoints > 0
        ? ((myUser.points || 0) / totalPoints) * 100
        : 50; // default 50/50 if both zero

    const [animatedPercentage, setAnimatedPercentage] = useState(50);
    const [isBattleActive, setIsBattleActive] = useState(false);

    useEffect(() => {
        // Auto-play video on mount
        if (videoRef.current) {
            videoRef.current.play().catch(err => console.error("Auto-play failed:", err));
        }

        // Trigger battle animation after modal opens
        const timer = setTimeout(() => {
            setIsBattleActive(true);
            setAnimatedPercentage(myPercentage);
        }, 1200);

        // Turn off intense battle mode after bars fill
        const battleTimer = setTimeout(() => {
            setIsBattleActive(false);
        }, 2200);

        return () => {
            clearTimeout(timer);
            clearTimeout(battleTimer);
        };
    }, [myPercentage]);

    return (
        <div className="compare-modal-overlay">
            <div className="compare-modal-content" ref={modalRef}>
                {/* Background Video Placeholder */}
                <video
                    ref={videoRef}
                    className="compare-bg-video"
                    src={randomVideo}
                    autoPlay
                    loop
                    playsInline
                />

                <div className={`compare-content-layer ${isBattleActive ? "battle-mode" : ""}`}>
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
                                style={{ width: `${animatedPercentage}%` }}
                            >
                                <span className="tug-label">{Math.round(animatedPercentage)}%</span>
                            </div>
                            <div
                                className="tug-fill red"
                                style={{ width: `${100 - animatedPercentage}%` }}
                            >
                                <span className="tug-label">{Math.round(100 - animatedPercentage)}%</span>
                            </div>
                        </div>
                        <div 
                            className={`tug-marker ${isBattleActive ? "active" : ""}`} 
                            style={{ left: `${animatedPercentage}%` }}
                        ></div>
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
