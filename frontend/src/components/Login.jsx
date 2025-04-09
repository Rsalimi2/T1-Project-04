import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const handleLogin = () => {
        if (username === "testuser" && password === "password") {
            onLogin(true);
            navigate("/home");
        } else {
            setError("Invalid username or password");
        }
    };

    return (
        <div className="login-container container">
            <h2>Login</h2>
            {error && <p className="error">{error}</p>}
            <form className="login-form">
                <div className="input-group">
                    <label htmlFor="username" className="label">
                        Username:
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password" className="label">
                        Password:
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input"
                    />
                </div>
                <button type="button" onClick={handleLogin} className="login-button">
                    Login
                </button>
            </form>
        </div>
    );
};

export { LoginPage };