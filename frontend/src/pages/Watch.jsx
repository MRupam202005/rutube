import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share2, BookmarkPlus, Loader2 } from 'lucide-react';
import api from '../api/axios';
import './Watch.css';

const Watch = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await api.get(`/videos/${id}`);
        setVideo(response.data.data);
      } catch (error) {
        console.error("Failed to fetch video", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="spinner" size={48} color="#2af5d1" />
      </div>
    );
  }

  if (!video) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Video not found</h2>
      </div>
    );
  }

  return (
    <div className="watch-container">
      <div className="watch-main">
        {/* Actual HTML5 Video Player */}
        <div className="video-player-wrapper">
          <video 
            src={video.videoFile} 
            poster={video.thumbnail}
            controls 
            autoPlay 
            className="player-video"
            style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
          />
        </div>

        {/* Video Info */}
        <div className="watch-info">
          <h1 className="watch-title">{video.title}</h1>
          
          <div className="watch-actions-row">
            <div className="channel-info-full">
              <img 
                src={video.owner?.avatar || "https://i.pravatar.cc/150"} 
                alt={video.owner?.fullName} 
                className="channel-avatar-large" 
              />
              <div className="channel-text">
                <h3>{video.owner?.fullName || "Unknown Channel"}</h3>
                <p>@{video.owner?.username}</p>
              </div>
              <button className="btn-primary subscribe-btn">Subscribe</button>
            </div>

            <div className="video-action-buttons">
              <div className="action-pill glass-panel">
                <button className="action-btn"><ThumbsUp size={20} /> Like</button>
                <div className="divider-vertical"></div>
                <button className="action-btn"><ThumbsDown size={20} /></button>
              </div>
              <button className="action-pill glass-panel action-btn"><Share2 size={20} /> Share</button>
              <button className="action-pill glass-panel action-btn"><BookmarkPlus size={20} /> Save</button>
            </div>
          </div>

          {/* Description */}
          <div className="video-description glass-panel">
            <p className="views-date">{video.views} views • {new Date(video.createdAt).toLocaleDateString()}</p>
            <p style={{ whiteSpace: 'pre-wrap' }}>{video.description}</p>
          </div>

          {/* Comments Placeholder */}
          <div className="comments-section">
            <h3>Comments</h3>
            <div className="comment-input-row">
              <img src="https://i.pravatar.cc/150?u=user" alt="You" className="channel-avatar" />
              <input type="text" placeholder="Add a comment..." className="comment-input" />
            </div>
          </div>
        </div>
      </div>

      <div className="watch-sidebar">
        <h3>Up Next</h3>
        <div className="up-next-list">
          {/* We can fetch related videos later, keeping dummy for layout */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="up-next-card">
              <img src={`https://picsum.photos/seed/${i + 20}/320/180`} alt="Up Next" className="up-next-thumb" />
              <div className="up-next-info">
                <h4>Recommended Video {i+1}</h4>
                <p>Tech Noir</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Watch;
