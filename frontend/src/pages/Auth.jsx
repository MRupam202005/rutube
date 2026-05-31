// Step 4 : Auth Page (Login and Register) & API Integration

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Play, Users, TrendingUp, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { login } from '../store/authSlice';
import './Auth.css';

const Auth = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setAvatarFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLoginMode) {
        // --- LOGIN FLOW ---
        const response = await api.post('/users/login', {
          email: formData.email,
          password: formData.password
        });
        
        toast.success(`Welcome back, ${response.data.data.user.fullName}!`);
        dispatch(login({ userData: response.data.data.user }));
        navigate('/dashboard'); // redirect to dashboard

      } else {
        // --- REGISTER FLOW (Requires FormData for File Upload) ---
        if (!avatarFile) {
          toast.error("Avatar image is required!");
          setIsLoading(false);
          return;
        }

        const submitData = new FormData();
        submitData.append('username', formData.username);
        submitData.append('fullName', formData.fullName);
        submitData.append('email', formData.email);
        submitData.append('password', formData.password);
        submitData.append('avatar', avatarFile);

        const response = await api.post('/users/register', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        toast.success("Account created successfully! Please sign in.");
        setIsLoginMode(true); // switch to login mode so they can log in
      }
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || "An error occurred";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

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
          <h2>{isLoginMode ? 'Sign In' : 'Create Account'}</h2>
          <p className="auth-subtext">
            {isLoginMode ? 'Welcome back! Please enter your details.' : 'Join the revolution of video streaming.'}
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLoginMode && (
              <>
                <div className="input-group">
                  <label>Username</label>
                  <input type="text" name="username" value={formData.username} onChange={handleInputChange} placeholder="johndoe" required />
                </div>
                <div className="input-group">
                  <label>Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="John Doe" required />
                </div>
              </>
            )}
            
            <div className="input-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="hello@example.com" required />
            </div>
            
            <div className="input-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" required />
            </div>

            {!isLoginMode && (
              <div className="input-group">
                <label>Profile Avatar</label>
                <input type="file" name="avatar" onChange={handleFileChange} accept="image/*" required />
              </div>
            )}

            {isLoginMode && (
              <div className="forgot-password">
                <a href="#">Forgot password?</a>
              </div>
            )}

            <button type="submit" className="btn-primary auth-submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="spinner" size={20} /> : (isLoginMode ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <div className="auth-toggle">
            <p>
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <span onClick={() => setIsLoginMode(!isLoginMode)} className="toggle-link">
                {isLoginMode ? 'Sign up' : 'Log in'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
