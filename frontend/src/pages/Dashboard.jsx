import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Eye, EyeOff, Users, ThumbsUp, Edit2, Trash2, BarChart2, Loader2 } from 'lucide-react';
import api from '../api/axios';
import VideoUploadModal from '../components/VideoUploadModal';
import VideoEditModal from '../components/VideoEditModal';
import { login } from '../store/authSlice';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Content');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState(null);
  
  const navigate = useNavigate();
  
  const [myVideos, setMyVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  
  const [channelProfile, setChannelProfile] = useState(null);
  
  const [settingsForm, setSettingsForm] = useState({ fullName: '', email: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  
  const userData = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();

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
    if (userData) {
      setSettingsForm({ fullName: userData.fullName || '', email: userData.email || '' });
      
      const fetchProfile = async () => {
        try {
          const res = await api.get(`/users/channel/${userData.username}`);
          setChannelProfile(res.data.data);
        } catch (error) {
          console.error("Failed to load channel profile", error);
        }
      };
      
      fetchProfile();
      fetchMyVideos();
    }
  }, [userData]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    const loadingToast = toast.loading("Updating profile...");
    try {
      let updatedUser = userData;
      
      if (settingsForm.fullName !== userData.fullName || settingsForm.email !== userData.email) {
        const res = await api.patch('/users/update-account', settingsForm);
        updatedUser = res.data.data;
      }
      
      if (avatarFile) {
        const data = new FormData();
        data.append('avatar', avatarFile);
        const res = await api.patch('/users/update-avatar', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        updatedUser = res.data.data;
      }
      
      if (coverFile) {
        const data = new FormData();
        data.append('coverImage', coverFile);
        const res = await api.patch('/users/update-cover-image', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        updatedUser = res.data.data;
      }
      
      dispatch(login({ userData: updatedUser }));
      setAvatarFile(null);
      setCoverFile(null);
      toast.success("Profile updated successfully", { id: loadingToast });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile", { id: loadingToast });
    } finally {
      setUpdatingProfile(false);
    }
  };

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

  const handleTogglePublish = async (videoId, currentStatus) => {
    try {
      await api.patch(`/videos/toggle/publish/${videoId}`);
      toast.success(currentStatus ? "Video is now Private" : "Video is now Public");
      fetchMyVideos();
    } catch (error) {
      toast.error("Failed to toggle publish status");
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
          <button className="btn-primary" onClick={() => setActiveTab('Settings')}>Customize Channel</button>
        </div>
      </div>

      {/* Analytics Overview Cards (Dummy Data for now) */}
      <div className="analytics-overview">
        <div className="metric-card glass-card">
          <div className="metric-icon-wrapper"><Eye size={24} /></div>
          <div className="metric-text">
            <p className="metric-label">Total Views</p>
            <h2 className="metric-value">{myVideos.reduce((sum, v) => sum + v.views, 0)}</h2>
          </div>
        </div>
        <div className="metric-card glass-card">
          <div className="metric-icon-wrapper"><Users size={24} /></div>
          <div className="metric-text">
            <p className="metric-label">Total Subscribers</p>
            <h2 className="metric-value">{channelProfile?.subscribersCount || 0}</h2>
          </div>
        </div>
        <div className="metric-card glass-card">
          <div className="metric-icon-wrapper"><ThumbsUp size={24} /></div>
          <div className="metric-text">
            <p className="metric-label">Total Likes</p>
            <h2 className="metric-value">-</h2>
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
                    <div 
                      style={{ display: 'flex', gap: '24px', flex: 1, cursor: 'pointer' }}
                      onClick={() => navigate(`/watch/${video._id}`)}
                    >
                      <img src={video.thumbnail} alt="Thumb" className="item-thumb" />
                      
                      <div className="item-details">
                        <h4>{video.title}</h4>
                        <p className="item-meta">
                          <span className={`visibility ${video.isPublished ? 'public' : 'private'}`}>
                            {video.isPublished ? 'Public' : 'Private'}
                          </span> • {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="item-actions">
                      <button 
                        className="icon-btn" 
                        title={video.isPublished ? "Make Private" : "Make Public"} 
                        onClick={() => handleTogglePublish(video._id, video.isPublished)}
                      >
                        {video.isPublished ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button className="icon-btn" title="Edit" onClick={() => { setVideoToEdit(video); setIsEditModalOpen(true); }}><Edit2 size={18} /></button>
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
      
      <VideoEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchMyVideos}
        video={videoToEdit}
      />
      
      {activeTab === 'Playlists' && (
        <div className="content-tab glass-panel">
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>Playlists feature coming soon!</p>
        </div>
      )}

      {activeTab === 'Settings' && (
        <div className="content-tab glass-panel">
          <div className="content-header">
            <h3>Channel Settings</h3>
          </div>
          <form onSubmit={handleUpdateProfile} className="settings-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={settingsForm.fullName} onChange={e => setSettingsForm({...settingsForm, fullName: e.target.value})} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-muted)', padding: '12px', borderRadius: '8px', color: 'var(--text-primary)' }} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={settingsForm.email} onChange={e => setSettingsForm({...settingsForm, email: e.target.value})} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-muted)', padding: '12px', borderRadius: '8px', color: 'var(--text-primary)' }} />
            </div>
            <div className="form-group">
              <label>Update Avatar</label>
              <input type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files[0])} style={{ padding: '10px 0' }} />
            </div>
            <div className="form-group">
              <label>Update Cover Image</label>
              <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files[0])} style={{ padding: '10px 0' }} />
            </div>
            <button type="submit" className="btn-primary" disabled={updatingProfile} style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
              {updatingProfile ? <Loader2 className="spinner" size={20} /> : "Save Changes"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
