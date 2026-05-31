import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Eye, Users, ThumbsUp, Edit2, Trash2, BarChart2, Loader2 } from 'lucide-react';
import api from '../api/axios';
import VideoUploadModal from '../components/VideoUploadModal';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Content');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [myVideos, setMyVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  
  const userData = useSelector((state) => state.auth.userData);

  const fetchMyVideos = async () => {
    if (!userData?._id) return;
    try {
      setLoadingVideos(true);
      const res = await api.get(`/videos?userId=${userData._id}`);
      setMyVideos(res.data.data.docs || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load your videos");
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    fetchMyVideos();
  }, [userData]);

  const handleDelete = async (videoId) => {
    if(window.confirm("Are you sure you want to delete this video?")) {
      try {
        await api.delete(`/videos/${videoId}`);
        toast.success("Video deleted successfully");
        fetchMyVideos(); // Refresh list
      } catch (error) {
        toast.error("Failed to delete video");
      }
    }
  };

  return (
    <div className="dashboard-container">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="dashboard-cover-container">
          <img 
            src={userData?.coverImage || "https://picsum.photos/1600/400"} 
            alt="Cover" 
            className="cover-image" 
          />
          <div className="cover-overlay"></div>
        </div>
        
        <div className="dashboard-profile">
          <img 
            src={userData?.avatar || "https://i.pravatar.cc/150"} 
            alt="Avatar" 
            className="profile-avatar" 
          />
          <div className="profile-info">
            <h1>{userData?.fullName || "Your Channel"}</h1>
            <p className="profile-stats">@{userData?.username}</p>
          </div>
          <button className="btn-primary">Customize Channel</button>
        </div>
      </div>

      {/* Analytics Overview Cards (Dummy Data for now) */}
      <div className="analytics-overview">
        <div className="metric-card glass-card">
          <div className="metric-icon-wrapper"><Eye size={24} /></div>
          <div className="metric-text">
            <p className="metric-label">Total Views</p>
            <h2 className="metric-value">0</h2>
          </div>
        </div>
        <div className="metric-card glass-card">
          <div className="metric-icon-wrapper"><Users size={24} /></div>
          <div className="metric-text">
            <p className="metric-label">Total Subscribers</p>
            <h2 className="metric-value">0</h2>
          </div>
        </div>
        <div className="metric-card glass-card">
          <div className="metric-icon-wrapper"><ThumbsUp size={24} /></div>
          <div className="metric-text">
            <p className="metric-label">Total Likes</p>
            <h2 className="metric-value">0</h2>
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
              <button className="btn-ghost" onClick={() => setIsUploadModalOpen(true)}>Upload New</button>
            </div>
            
            <div className="video-list">
              {loadingVideos ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                  <Loader2 className="spinner" size={32} color="#2af5d1" />
                </div>
              ) : myVideos.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                  You haven't uploaded any videos yet.
                </p>
              ) : (
                myVideos.map((video) => (
                  <div key={video._id} className="video-list-item">
                    <img src={video.thumbnail} alt="Thumb" className="item-thumb" />
                    
                    <div className="item-details">
                      <h4>{video.title}</h4>
                      <p className="item-meta">
                        <span className={`visibility ${video.isPublished ? 'public' : 'private'}`}>
                          {video.isPublished ? 'Public' : 'Private'}
                        </span> • {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="item-actions">
                      <button className="icon-btn" title="Edit"><Edit2 size={18} /></button>
                      <button className="icon-btn" title="Analytics"><BarChart2 size={18} /></button>
                      <button className="icon-btn danger" title="Delete" onClick={() => handleDelete(video._id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <VideoUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onSuccess={fetchMyVideos} 
      />
    </div>
  );
};

export default Dashboard;
