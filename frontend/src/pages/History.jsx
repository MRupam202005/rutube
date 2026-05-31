import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import api from '../api/axios';
import './Home.css'; // Reuse video grid styling

const History = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/users/watch-history');
        // getWatchHistory returns array of videos directly
        setVideos(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch watch history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="home-container" style={{ padding: '24px 40px' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '1.8rem' }}>Watch History</h2>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Loader2 className="spinner" size={40} color="#2af5d1" />
        </div>
      ) : (
        <div className="video-grid">
          {videos.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>Your watch history is empty.</p>
          ) : (
            videos.map((video, index) => (
              <Link to={`/watch/${video._id}`} key={`${video._id}-${index}`} className="video-card glass-card">
                <div className="thumbnail-container">
                  <img src={video.thumbnail} alt={video.title} className="thumbnail" />
                  <span className="duration">
                    {Math.floor(video.duration / 60)}:{(Math.floor(video.duration % 60)).toString().padStart(2, '0')}
                  </span>
                </div>
                
                <div className="video-info">
                  <div 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/channel/${video.owner?.username}`);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <img 
                      src={video.owner?.avatar || "https://i.pravatar.cc/150"} 
                      alt={video.owner?.fullName} 
                      className="channel-avatar" 
                    />
                  </div>
                  <div className="video-text">
                    <h3 className="video-title">{video.title}</h3>
                    <p 
                      className="channel-name" 
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/channel/${video.owner?.username}`);
                      }}
                      style={{ cursor: 'pointer', display: 'inline-block' }}
                    >
                      @{video.owner?.username || "Unknown"}
                    </p>
                    <p className="video-meta">
                      {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default History;
