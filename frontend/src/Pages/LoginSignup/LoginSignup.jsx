import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginSignup.css";
import user_icon from "../../Components/Assets/person.png";
import email_icon from "../../Components/Assets/email.png";
import password_icon from "../../Components/Assets/password.png";
import users from "../../data/users.json";

const LoginSignup = () => {
    const navigate = useNavigate();
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);

    // Sign-in state
    const [signInEmail, setSignInEmail] = useState("");
    const [signInPassword, setSignInPassword] = useState("");
    const [signInError, setSignInError] = useState("");

    // Sign-up state
    const [signUpUsername, setSignUpUsername] = useState("");
    const [signUpEmail, setSignUpEmail] = useState("");
    const [signUpPassword, setSignUpPassword] = useState("");
    const [signUpError, setSignUpError] = useState("");

    const handleSignUpClick = () => {
        setIsRightPanelActive(true);
        setSignInError("");
    };

    const handleSignInClick = () => {
        setIsRightPanelActive(false);
        setSignUpError("");
    };

    const handleSignIn = (e) => {
        e.preventDefault();
        const found = users.find(
            (u) =>
                u.email.toLowerCase() === signInEmail.toLowerCase() &&
                u.password === signInPassword
        );
        if (found) {
            // Persist logged-in user to sessionStorage for HomePage
            sessionStorage.setItem("currentUser", JSON.stringify(found));
            navigate("/home");
        } else {
            setSignInError("Invalid email or password.");
        }
    };

    const handleSignUp = (e) => {
        e.preventDefault();
        // Check if email already exists
        const exists = users.find(
            (u) => u.email.toLowerCase() === signUpEmail.toLowerCase()
        );
        if (exists) {
            setSignUpError("An account with that email already exists.");
            return;
        }
        if (!signUpUsername || !signUpEmail || !signUpPassword) {
            setSignUpError("Please fill in all fields.");
            return;
        }
        // Create a mock new user and store in sessionStorage
        const newUser = {
            id: Date.now(),
            username: signUpUsername,
            email: signUpEmail,
            password: signUpPassword,
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${signUpUsername}`,
            robux: 0,
            level: 1,
            friends: 0,
        };
        sessionStorage.setItem("currentUser", JSON.stringify(newUser));
        navigate("/home");
    };

    return (
        <div
            className={`container ${isRightPanelActive ? "right-panel-active" : ""}`}
            id="container"
        >
            {/* ── SIGN UP FORM ── */}
            <div className="form-container sign-up-container">
                <form onSubmit={handleSignUp}>
                    <h1>Create Account</h1>

                    <div className="input-group">
                        <img src={user_icon} alt="user" />
                        <input
                            type="text"
                            placeholder="Username"
                            value={signUpUsername}
                            onChange={(e) => setSignUpUsername(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <img src={email_icon} alt="email" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={signUpEmail}
                            onChange={(e) => setSignUpEmail(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <img src={password_icon} alt="password" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={signUpPassword}
                            onChange={(e) => setSignUpPassword(e.target.value)}
                        />
                    </div>

                    {signUpError && (
                        <p className="auth-error">{signUpError}</p>
                    )}

                    <button type="submit">Sign Up</button>
                </form>
            </div>

            {/* ── SIGN IN FORM ── */}
            <div className="form-container sign-in-container">
                <form onSubmit={handleSignIn}>
                    <h1>Sign In</h1>

                    <div className="input-group">
                        <img src={email_icon} alt="email" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={signInEmail}
                            onChange={(e) => setSignInEmail(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <img src={password_icon} alt="password" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={signInPassword}
                            onChange={(e) => setSignInPassword(e.target.value)}
                        />
                    </div>

                    {signInError && (
                        <p className="auth-error">{signInError}</p>
                    )}

                    <a href="#forgot">Forgot your password?</a>
                    <button type="submit">Sign In</button>
                </form>
            </div>

            {/* ── OVERLAY PANELS ── */}
            <div className="overlay-container">
                <div className="overlay">
                    <div className="overlay-panel overlay-left">
                        <h1>Welcome Back!</h1>
                        <p>To keep connected with us please login with your personal info</p>
                        <button className="ghost" id="signIn" onClick={handleSignInClick}>
                            Sign In
                        </button>
                    </div>
                    <div className="overlay-panel overlay-right">
                        <h1>Hello, Friend!</h1>
                        <p>Enter your personal details and start journey with us</p>
                        <button className="ghost" id="signUp" onClick={handleSignUpClick}>
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginSignup;
