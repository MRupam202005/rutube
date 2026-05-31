import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThumbsUp, ThumbsDown, Share2, BookmarkPlus, Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import './Watch.css';

const Watch = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Like state
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const authStatus = useSelector(state => state.auth.status);
  const userData = useSelector(state => state.auth.userData);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/${id}`);
      setComments(res.data.data.docs || []);
    } catch (error) {
      console.error("Failed to fetch comments", error);
    }
  };

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await api.get(`/videos/${id}`);
        const videoData = response.data.data;
        setVideo(videoData);
        setLikesCount(videoData.likesCount || 0);

        // If user is logged in, check if they already liked this video
        if (authStatus) {
          const likedRes = await api.get('/likes/videos');
          const likedVideos = likedRes.data.data;
          if (likedVideos.some(l => l.videoDetails?._id === id)) {
            setIsLiked(true);
          }
        }

        fetchComments(); // Fetch comments after video loads
      } catch (error) {
        console.error("Failed to fetch video", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideoData();
  }, [id, authStatus]);

  const handleLikeToggle = async () => {
    if (!authStatus) {
      toast.error("Sign in to like this video!");
      return;
    }
    
    // Optimistic UI update
    const previousIsLiked = isLiked;
    setIsLiked(!previousIsLiked);
    setLikesCount(prev => !previousIsLiked ? prev + 1 : prev - 1);

    try {
      const res = await api.post(`/likes/toggle/v/${id}`);
      // Sync with actual backend response just in case
      setIsLiked(res.data.data.isLiked);
    } catch (error) {
      // Revert if failed
      setIsLiked(previousIsLiked);
      setLikesCount(prev => previousIsLiked ? prev + 1 : prev - 1);
      toast.error("Failed to update like status");
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post(`/comments/${id}`, { content: newComment });
      toast.success("Comment added!");
      setNewComment("");
      fetchComments(); // Refresh comments list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <button 
                  className={`action-btn ${isLiked ? 'active-like' : ''}`} 
                  onClick={handleLikeToggle}
                  style={{ color: isLiked ? 'var(--accent-mint)' : 'inherit' }}
                >
                  <ThumbsUp size={20} fill={isLiked ? 'var(--accent-mint)' : 'none'} /> {likesCount}
                </button>
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

          {/* Comments Section */}
          <div className="comments-section">
            <h3>{comments.length} Comments</h3>
            
            {authStatus ? (
              <form className="comment-input-row" onSubmit={handlePostComment}>
                <img 
                  src={userData?.avatar} 
                  alt={userData?.fullName} 
                  className="channel-avatar" 
                />
                <input 
                  type="text" 
                  placeholder="Add a comment..." 
                  className="comment-input" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={isSubmitting}
                />
                <button type="submit" className="icon-btn" disabled={!newComment.trim() || isSubmitting}>
                  {isSubmitting ? <Loader2 size={20} className="spinner" /> : <Send size={20} color="var(--accent-mint)" />}
                </button>
              </form>
            ) : (
              <p style={{ color: 'var(--text-secondary)', padding: '10px 0' }}>Sign in to write a comment.</p>
            )}
            
            <div className="comments-list" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {comments.map((comment) => (
                <div className="comment" key={comment._id}>
                  <img 
                    src={comment.owner?.avatar || "https://i.pravatar.cc/150"} 
                    alt={comment.owner?.username} 
                    className="channel-avatar" 
                  />
                  <div className="comment-content">
                    <p className="comment-header">
                      @{comment.owner?.username} 
                      <span className="comment-time">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </p>
                    <p className="comment-text" style={{ marginTop: '4px' }}>{comment.content}</p>
                    <div className="comment-actions">
                      <button><ThumbsUp size={16} /> 0</button>
                      <button><ThumbsDown size={16} /></button>
                      <button>Reply</button>
                    </div>
                  </div>
                </div>
              ))}
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
