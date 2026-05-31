import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, UserCircle, Bell, Menu, LogOut } from 'lucide-react';
import api from '../api/axios';
import { logout } from '../store/authSlice';
import toast from 'react-hot-toast';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/`);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/users/logout');
      dispatch(logout());
      toast.success("Logged out successfully");
      navigate('/');
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-left">
        <button className="icon-btn" onClick={toggleSidebar}><Menu size={24} /></button>
        <Link to="/" className="brand-logo">
          <div className="logo-mark">R</div>
          <span className="logo-text">RuTube</span>
        </Link>
      </div>

      <div className="navbar-center">
        <form className="search-bar" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Search for premium content..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-btn"><Search size={20} /></button>
        </form>
      </div>

      <div className="navbar-right">
        {authStatus ? (
          <>
            <Link to="/dashboard" className="btn-ghost">Upload</Link>
            <button className="icon-btn"><Bell size={24} /></button>
            <Link to="/dashboard" className="profile-link">
              <img 
                src={userData?.avatar} 
                alt="Profile" 
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
              />
            </Link>
            <button className="icon-btn" onClick={handleLogout} title="Log Out">
              <LogOut size={24} />
            </button>
          </>
        ) : (
          <Link to="/auth" className="btn-primary">Sign In</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
