import React from 'react';
import { Link } from 'react-router-dom';
import { Search, UserCircle, Bell, Menu } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
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
        <div className="search-bar">
          <input type="text" placeholder="Search for premium content..." />
          <button className="search-btn"><Search size={20} /></button>
        </div>
      </div>

      <div className="navbar-right">
        <Link to="/auth" className="btn-ghost">Upload</Link>
        <button className="icon-btn"><Bell size={24} /></button>
        <Link to="/dashboard" className="profile-link">
          <UserCircle size={32} />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
