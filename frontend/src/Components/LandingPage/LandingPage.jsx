import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import tabby from "../Assets/tabbyLogo.png";
import gojo from "../Assets/gojo.png";
import sukuna from "../Assets/sukuna.png";

const useScrollReveal = (threshold = 0.15) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    obs.unobserve(entry.target);
                }
            },
            { threshold }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [threshold]);

    return [ref, visible];
};

const LandingPage = () => {
    const [scrollActive, setScrollActive] = useState(false);
    const [heroRef, heroVisible] = useScrollReveal(0.1);
    const [section2Ref, section2Visible] = useScrollReveal(0.15);
    const [ctaRef, ctaVisible] = useScrollReveal(0.2);

    useEffect(() => {
        const handleScroll = () => {
            setScrollActive(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="landing-page">
            {/* ── NAVBAR ── */}
            <header className={`lp-header ${scrollActive ? "active" : ""}`}>
                <nav className="lp-navbar">
                    <div className="lp-brand">
                        <img src={tabby} alt="Tabby logo" />
                        <span className="lp-app-name">AntiProcrastination</span>
                    </div>
                    <div className="lp-nav-links">
                        <a href="#hero" className="lp-nav-link">Home</a>
                        <a href="#about" className="lp-nav-link">About</a>
                        <a href="#cta" className="lp-nav-link">Get Started</a>
                    </div>
                    <div className="lp-auth-buttons">
                        <Link to="/auth" className="lp-sign-in-link">Sign In</Link>
                        <Link to="/auth" className="lp-sign-up-btn">Sign Up</Link>
                    </div>
                </nav>
            </header>

            {/* ── HERO ── */}
            <section id="hero" className="lp-hero-section">
                {/* Decorative blobs */}
                <span className="blob blob-orange" />
                <span className="blob blob-blue-sm" />
                <span className="blob blob-yellow" />

                <div
                    ref={heroRef}
                    className={`lp-hero-inner reveal ${heroVisible ? "revealed" : ""}`}
                >
                    {/* LEFT: text */}
                    <div className="lp-hero-text">
                        <p className="lp-eyebrow">Stop delaying. Start doing.</p>
                        <h1 className="lp-hero-heading">
                            Conquer procrastination&nbsp;
                            <span className="lp-highlight">like the strongest.</span>
                        </h1>
                        <p className="lp-hero-sub">
                            Whether you're facing an infinity of tasks or battling your
                            inner demons — this app keeps you locked in, focused,
                            and unstoppable.
                        </p>
                        <div className="lp-hero-actions">
                            <Link to="/auth" className="lp-cta-primary">Get Started</Link>
                            <a href="#about" className="lp-cta-secondary">Learn More</a>
                        </div>
                        <div className="lp-social-row">
                            <div className="lp-social-icon">𝕏</div>
                            <div className="lp-social-icon">f</div>
                            <div className="lp-social-icon">in</div>
                        </div>
                    </div>

                    {/* RIGHT: Gojo image card */}
                    <div className="lp-hero-card">
                        <span className="lp-card-accent accent-blue" />
                        <div className="lp-img-wrapper gojo-wrapper">
                            <img src={gojo} alt="Gojo Satoru – The Strongest" />
                        </div>
                        <span className="lp-card-tag">The Strongest</span>
                    </div>
                </div>
            </section>

            {/* ── ABOUT / SUKUNA SECTION ── */}
            <section id="about" className="lp-about-section">
                <span className="blob blob-red-lg" />
                <span className="blob blob-purple-sm" />

                <div
                    ref={section2Ref}
                    className={`lp-about-inner reveal reveal-right ${section2Visible ? "revealed" : ""}`}
                >
                    {/* LEFT: text */}
                    <div className="lp-about-text">
                        <h2 className="lp-about-heading">
                            A productive mind is built through discipline,
                            consistency, and intent.
                        </h2>
                        <p className="lp-about-body">
                            <em>
                                Even the King of Curses operates with ruthless efficiency.
                                Track your tasks, crush your goals, and dominate your schedule —
                                no mercy for distractions.
                            </em>
                        </p>
                        <div className="lp-about-links">
                            <a href="#cta" className="lp-link-arrow">Our Features ›</a>
                            <a href="#cta" className="lp-link-arrow">How It Works ›</a>
                            <a href="/auth" className="lp-link-arrow">Our Team ›</a>
                        </div>
                    </div>

                    {/* RIGHT: Sukuna image card */}
                    <div className="lp-about-card">
                        <span className="lp-card-accent accent-red" />
                        <div className="lp-img-wrapper sukuna-wrapper">
                            <img src={sukuna} alt="Ryomen Sukuna – King of Curses" />
                        </div>
                        <span className="lp-card-tag tag-red">King of Curses</span>
                    </div>
                </div>
            </section>

            {/* ── CTA BANNER ── */}
            <section id="cta" className="lp-cta-section">
                <div
                    ref={ctaRef}
                    className={`lp-cta-inner reveal reveal-up ${ctaVisible ? "revealed" : ""}`}
                >
                    <h2 className="lp-cta-heading">
                        How we built a productivity tool to boost<br />
                        the impact of your daily grind.
                    </h2>
                    <p className="lp-cta-sub">
                        Join thousands of people who stopped procrastinating and started winning.
                    </p>
                    <Link to="/auth" className="lp-cta-primary lp-cta-big">Start for free</Link>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="lp-footer">
                <span className="lp-footer-brand">AntiProcrastination</span>
                <p className="lp-footer-copy">© 2026 · Built  by the people, for the people.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
