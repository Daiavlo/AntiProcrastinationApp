
import React, { useState } from "react";
import "./LoginSignup.css"

import user_icon from "../Assets/person.png"
import email_icon from "../Assets/email.png"
import password_icon from "../Assets/password.png"

const LoginSignup = () => {
    const [action, setAction] = useState("Sign up");
    return (
        <div className='container'>
            <div className="header">
                <div className="text">{action}</div>
                <div className="underline"></div>
            </div>
            <div className='inputs'>
                {action === "Login" ? <div></div> : <div className="input">
                    <img src={user_icon} alt="" className="" />
                    <input type="text" placeholder='Name' className="" />
                </div>}
                <div className="input">
                    <img src={email_icon} alt="" className="" />
                    <input type="email" placeholder='Email' className="" />
                </div>
                <div className="input">
                    <img src={password_icon} alt="" className="" />
                    <input type="password" placeholder='Password' className="" />
                </div>
            </div>
            {action === "Sign up" ? <div></div> : <div className="forgot-password">Lost Password? <span>Click Here</span></div>}

            <div className="submit-container">
                <div className={action === "Sign up" ? "submit gray" : "submit"} onClick={() => { setAction("Login") }}>Login</div>
                <div className={action === "Login" ? "submit gray" : "submit"} onClick={() => { setAction("Sign up") }}>Sign up</div>
            </div>
        </div>
    )
}

export default LoginSignup
