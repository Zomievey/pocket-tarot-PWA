import React, { useState, useEffect } from "react";
import { useAuth } from "../../services/AuthContext";
import "./LoginStyles.css";

export default function Login() {
  const { googleLogin, login, register, error, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    setEmailError("");
    setPasswordError("");
    setResetMessage("");
  }, [isRegistering]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    
    let valid = true;

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email in the format: name@example.com");
      valid = false;
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      valid = false;
    }

    if (valid) {
      if (isRegistering) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setEmailError(""); // Clear email error for Google login
    setPasswordError(""); // Clear password error for Google login
    try {
      await googleLogin();
    } catch (err) {
      console.error("Error with Google login:", err);
    }
  };

  const handlePasswordReset = async () => {
    setResetMessage("");
    setEmailError("");

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email to reset password.");
      return;
    }

    try {
      await resetPassword(email);
      setResetMessage("Password reset link sent! Check your email.");
    } catch (err) {
      setResetMessage("Error sending reset email. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h1 className="title">
          {isResetting ? "Reset Password" : isRegistering ? "Register" : "Login"}
        </h1>

        {error && <p className="error-message">{error}</p>}
        {resetMessage && <p className="reset-message">{resetMessage}</p>}

        {isResetting ? (
          <form onSubmit={(e) => e.preventDefault()} noValidate>
            <label className="label-login">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {emailError && <p className="error-message">{emailError}</p>}
            
            <button type="button" className="login-button" onClick={handlePasswordReset}>
              Send Reset Link
            </button>

            <button className="toggle-button" onClick={() => setIsResetting(false)}>
              Return to Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <label className="label-login">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {emailError && <p className="error-message">{emailError}</p>}

            <label className="label-login">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {passwordError && <p className="error-message">{passwordError}</p>}

            <button type="submit" className="login-button">
              {isRegistering ? "Register" : "Login"}
            </button>

            <button type="button" className="login-button" onClick={handleGoogleLogin}>
              Login with Google
            </button>

            <button
              className="toggle-button"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
            </button>

            <button className="reset-button" onClick={() => setIsResetting(true)}>
              Forgot Password?
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
