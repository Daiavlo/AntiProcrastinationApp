import React, { useState } from "react";
import "./LoginSignup.css";
import user_icon from "../Assets/person.png"
import email_icon from "../Assets/email.png"
import password_icon from "../Assets/password.png"

const LoginSignup = () => {
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);

    const handleSignUpClick = () => {
        setIsRightPanelActive(true);
    };

    const handleSignInClick = () => {
        setIsRightPanelActive(false);
    };

    return (
        <div className={`container ${isRightPanelActive ? "right-panel-active" : ""}`} id="container">
            <div className="form-container sign-up-container">
                <form action="#" onSubmit={(e) => e.preventDefault()}>
                    <h1>Create Account</h1>

                    <div className="input-group">
                        <img src={user_icon} alt="user" />
                        <input type="text" placeholder="Username" />
                    </div>
                    <div className="input-group">
                        <img src={email_icon} alt="email" />
                        <input type="email" placeholder="Email" />
                    </div>
                    <div className="input-group">
                        <img src={password_icon} alt="password" />
                        <input type="password" placeholder="Password" />
                    </div>
                    <button>Sign Up</button>
                </form>
            </div>
            <div className="form-container sign-in-container">
                <form action="#" onSubmit={(e) => e.preventDefault()}>
                    <h1>Sign In</h1>
                    <div className="input-group">
                        <img src={email_icon} alt="email" />
                        <input type="email" placeholder="Email" />
                    </div>
                    <div className="input-group">
                        <img src={password_icon} alt="password" />
                        <input type="password" placeholder="Password" />
                    </div>
                    <a href="#">Forgot your password?</a>
                    <button>Sign In</button>
                </form>
            </div>
            <div className="overlay-container">
                <div className="overlay">
                    <div className="overlay-panel overlay-left">
                        <h1>Welcome Back!</h1>
                        <p>To keep connected with us please login with your personal info</p>
                        <button className="ghost" id="signIn" onClick={handleSignInClick}>Sign In</button>
                    </div>
                    <div className="overlay-panel overlay-right">
                        <h1>Hello, Friend!</h1>
                        <p>Enter your personal details and start journey with us</p>
                        <button className="ghost" id="signUp" onClick={handleSignUpClick}>Sign Up</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginSignup;
