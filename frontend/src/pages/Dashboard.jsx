import React, { useState } from 'react';
import { Eye, Users, ThumbsUp, Edit2, Trash2, BarChart2 } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Content');

  return (
    <div className="dashboard-container">
      {/* Channel Header */}
      <div className="channel-header">
        <div className="cover-image-container">
          <img src="https://picsum.photos/1600/400" alt="Cover" className="cover-image" />
          <div className="cover-overlay"></div>
        </div>
        
        <div className="channel-profile">
          <img src="https://i.pravatar.cc/150?u=channel" alt="Avatar" className="profile-avatar" />
          <div className="profile-info">
            <h1>Tech Noir Studio</h1>
            <p className="profile-stats">10.5K Subscribers • 142 Videos</p>
          </div>
          <button className="btn-primary">Customize Channel</button>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="analytics-overview">
        <div className="metric-card glass-card">
          <div className="metric-icon-wrapper"><Eye size={24} /></div>
          <div className="metric-text">
            <p className="metric-label">Total Views</p>
            <h2 className="metric-value">1.4M</h2>
          </div>
        </div>
        <div className="metric-card glass-card">
          <div className="metric-icon-wrapper"><Users size={24} /></div>
          <div className="metric-text">
            <p className="metric-label">Total Subscribers</p>
            <h2 className="metric-value">10,542</h2>
          </div>
        </div>
        <div className="metric-card glass-card">
          <div className="metric-icon-wrapper"><ThumbsUp size={24} /></div>
          <div className="metric-text">
            <p className="metric-label">Total Likes</p>
            <h2 className="metric-value">84.2K</h2>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-content">
        <div className="tab-navigation">
          {['Content', 'Playlists', 'Settings'].map(tab => (
            <button 
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Content' && (
          <div className="content-tab glass-panel">
            <div className="content-header">
              <h3>Uploaded Videos</h3>
              <button className="btn-ghost">Upload New</button>
            </div>
            
            <div className="video-list">
              {/* Dummy List */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="video-list-item">
                  <img src={`https://picsum.photos/seed/${i + 50}/320/180`} alt="Thumb" className="item-thumb" />
                  
                  <div className="item-details">
                    <h4>Building a Premium Video Platform {i + 1}</h4>
                    <p className="item-meta">
                      <span className="visibility public">Public</span> • 12K views • Oct 14, 2025
                    </p>
                  </div>
                  
                  <div className="item-actions">
                    <button className="icon-btn" title="Edit"><Edit2 size={18} /></button>
                    <button className="icon-btn" title="Analytics"><BarChart2 size={18} /></button>
                    <button className="icon-btn danger" title="Delete"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
