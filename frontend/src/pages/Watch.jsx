import React from 'react';
import { ThumbsUp, ThumbsDown, Share2, BookmarkPlus } from 'lucide-react';
import './Watch.css';

const Watch = () => {
  return (
    <div className="watch-container">
      <div className="watch-main">
        {/* Video Player Placeholder */}
        <div className="video-player-wrapper">
          <div className="video-player">
            <img src="https://picsum.photos/1280/720" alt="Video Placeholder" className="player-img" />
          </div>
        </div>

        {/* Video Info */}
        <div className="watch-info">
          <h1 className="watch-title">Premium Video Content | 4K Cinematic Experience</h1>
          
          <div className="watch-actions-row">
            <div className="channel-info-full">
              <img src="https://i.pravatar.cc/150?u=channel" alt="Avatar" className="channel-avatar-large" />
              <div className="channel-text">
                <h3>Tech Noir Channel</h3>
                <p>1.2M subscribers</p>
              </div>
              <button className="btn-primary subscribe-btn">Subscribe</button>
            </div>

            <div className="video-action-buttons">
              <div className="action-pill glass-panel">
                <button className="action-btn"><ThumbsUp size={20} /> 124K</button>
                <div className="divider-vertical"></div>
                <button className="action-btn"><ThumbsDown size={20} /></button>
              </div>
              <button className="action-pill glass-panel action-btn"><Share2 size={20} /> Share</button>
              <button className="action-pill glass-panel action-btn"><BookmarkPlus size={20} /> Save</button>
            </div>
          </div>

          {/* Description */}
          <div className="video-description glass-panel">
            <p className="views-date">1.5M views • 2 days ago</p>
            <p>Welcome to the ultimate cinematic experience. This video showcases the stunning high-fidelity nature of the new Tech Noir platform.</p>
            <button className="show-more">Show more</button>
          </div>

          {/* Comments */}
          <div className="comments-section">
            <h3>4,231 Comments</h3>
            <div className="comment-input-row">
              <img src="https://i.pravatar.cc/150?u=user" alt="You" className="channel-avatar" />
              <input type="text" placeholder="Add a comment..." className="comment-input" />
            </div>
            
            {/* Dummy Comment */}
            <div className="comment">
              <img src="https://i.pravatar.cc/150?u=c1" alt="User" className="channel-avatar" />
              <div className="comment-content">
                <p className="comment-header">@videofan <span className="comment-time">1 day ago</span></p>
                <p className="comment-text">The aesthetics of this platform are absolutely mind-blowing. Love the dark mode!</p>
                <div className="comment-actions">
                  <button><ThumbsUp size={16} /> 245</button>
                  <button><ThumbsDown size={16} /></button>
                  <button>Reply</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="watch-sidebar">
        <h3>Up Next</h3>
        <div className="up-next-list">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="up-next-card">
              <img src={`https://picsum.photos/seed/${i + 20}/320/180`} alt="Up Next" className="up-next-thumb" />
              <div className="up-next-info">
                <h4>Next Video Title Here</h4>
                <p>Channel Name</p>
                <p>254K views</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Watch;
