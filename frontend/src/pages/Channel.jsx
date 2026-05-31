import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import './Channel.css';

const Channel = () => {
  const { username } = useParams();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  const authStatus = useSelector(state => state.auth.status);

  useEffect(() => {
    const fetchChannelAndVideos = async () => {
      try {
        setLoading(true);
        // 1. Fetch channel profile
        const profileRes = await api.get(`/users/channel/${username}`);
        const channelData = profileRes.data.data;
        setChannel(channelData);

        // 2. Fetch channel's videos using their _id
        if (channelData?._id) {
          const videoRes = await api.get(`/videos?userId=${channelData._id}`);
          setVideos(videoRes.data.data.docs || []);
        }
      } catch (error) {
        console.error("Failed to load channel", error);
        toast.error("Failed to load channel profile");
      } finally {
        setLoading(false);
      }
    };
    fetchChannelAndVideos();
  }, [username]);

  const handleSubscribeToggle = async () => {
    if (!authStatus) {
      toast.error("Sign in to subscribe!");
      return;
    }
    if (userData?._id === channel._id) {
      toast.error("You cannot subscribe to your own channel");
      return;
    }
    try {
      setSubscribing(true);
      const res = await api.post(`/subscriptions/c/${channel._id}`);
      const isSubbed = res.data.data.subscribed;
      
      setChannel(prev => ({
        ...prev,
        isSubscribed: isSubbed,
        subscribersCount: prev.isSubscribed === isSubbed ? prev.subscribersCount : (isSubbed ? prev.subscribersCount + 1 : prev.subscribersCount - 1)
      }));
      toast.success(isSubbed ? "Subscribed!" : "Unsubscribed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Subscription failed");
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="spinner" size={48} color="#2af5d1" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Channel not found</h2>
      </div>
    );
  }

  return (
    <div className="channel-container">
      {/* Banner */}
      <div 
        className="channel-banner" 
        style={{ backgroundImage: `url(${channel.coverImage || 'https://picsum.photos/1920/300'})` }}
      >
      </div>

      {/* Channel Info Row */}
      <div className="channel-header">
        <img 
          src={channel.avatar || "https://i.pravatar.cc/150"} 
          alt={channel.fullName} 
          className="channel-avatar-huge" 
        />
        <div className="channel-details">
          <h1 className="profile-channel-name">{channel.fullName}</h1>
          <div className="channel-meta">
            <span>@{channel.username}</span>
            <span className="dot">•</span>
            <span>{channel.subscribersCount} subscribers</span>
            <span className="dot">•</span>
            <span>{videos.length} videos</span>
          </div>
          <p className="channel-bio">Welcome to {channel.fullName}'s official channel on Tech Noir.</p>
          <button 
            className={`btn-primary subscribe-btn ${channel.isSubscribed ? 'subscribed' : ''}`}
            onClick={handleSubscribeToggle}
            disabled={subscribing}
          >
            {channel.isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        </div>
      </div>

      <div className="channel-nav">
        <button className="active">Videos</button>
        <button>Playlists</button>
        <button>About</button>
      </div>

      {/* Video Grid */}
      <div className="channel-content">
        {videos.length === 0 ? (
          <div className="no-videos-message">This channel hasn't uploaded any videos yet.</div>
        ) : (
          <div className="video-grid">
            {videos.map(video => (
              <Link to={`/watch/${video._id}`} key={video._id} className="video-card glass-card">
                <div className="thumbnail-container">
                  <img src={video.thumbnail} alt={video.title} className="thumbnail" />
                  <span className="duration">
                    {Math.floor(video.duration / 60)}:{(Math.floor(video.duration % 60)).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="video-info">
                  <div className="video-text">
                    <h3 className="video-title">{video.title}</h3>
                    <div className="video-meta">
                      {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Channel;
