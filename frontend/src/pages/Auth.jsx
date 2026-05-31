import React, { useState } from 'react';
import { Play, Users, TrendingUp } from 'lucide-react';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      <div className="auth-showcase">
        <div className="showcase-content">
          <h1>Welcome to RuTube</h1>
          <p className="showcase-subtitle">The Premium Tech Noir Video Platform</p>
          
          <div className="feature-cards">
            <div className="feature-card glass-card">
              <Play className="feature-icon" size={32} />
              <div className="feature-text">
                <h3>Stunning 4K Streaming</h3>
                <p>Experience crystal clear video playback with zero buffering.</p>
              </div>
            </div>
            
            <div className="feature-card glass-card">
              <Users className="feature-icon" size={32} />
              <div className="feature-text">
                <h3>Vibrant Community</h3>
                <p>Connect with millions of creators and fans worldwide.</p>
              </div>
            </div>
            
            <div className="feature-card glass-card">
              <TrendingUp className="feature-icon" size={32} />
              <div className="feature-text">
                <h3>Create & Monetize</h3>
                <p>Turn your passion into profit with our creator tools.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-section">
        <div className="auth-form-wrapper glass-panel">
          <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>
          <p className="auth-subtext">
            {isLogin ? 'Welcome back! Please enter your details.' : 'Join the revolution of video streaming.'}
          </p>

          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
            {!isLogin && (
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" placeholder="Enter your name" />
              </div>
            )}
            
            <div className="input-group">
              <label>Email</label>
              <input type="email" placeholder="Enter your email" />
            </div>
            
            <div className="input-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" />
            </div>

            {isLogin && (
              <div className="forgot-password">
                <a href="#">Forgot password?</a>
              </div>
            )}

            <button type="submit" className="btn-primary auth-submit">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="auth-toggle">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span onClick={() => setIsLogin(!isLogin)} className="toggle-link">
                {isLogin ? 'Sign up' : 'Log in'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
