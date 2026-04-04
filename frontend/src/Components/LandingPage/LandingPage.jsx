import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import tabby from "../Assets/tabbyLogo.png"

const LandingPage = () => {
    const [scrollActive, setScrollActive] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrollActive(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div className="landing-page">
            <header className={`header ${scrollActive ? "active" : ""}`}>
                <nav className="navbar">
                    <div className="brand">
                        <img src={tabby} alt="" />
                        <span className="app-name">AntiProcrastination</span>
                    </div>

                    <div className="auth-buttons">
                        <Link to="/auth" className="sign-in-link">Sign In</Link>
                        <Link to="/auth" className="sign-up-btn">Sign Up</Link>
                    </div>
                </nav>
            </header>


            <div className="hero">
                <div className="hero-text">
                    <h1>An app for the people by the people </h1>
                    <p>this app was mainly built for a certain group of procrastinators that can't ge tthe job done</p>
                </div>
                <div className="hero-image-box">
                    <img src={tabby} alt="" />
                </div>
            </div>

            <div style={{ height: "200vh" }}></div>
        </div>
    );
};

export default LandingPage;
