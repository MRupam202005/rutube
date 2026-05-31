import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  // Dummy data representing videos for layout purposes
  const videos = Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    title: `Premium Video Content ${i + 1} | 4K Cinematic`,
    thumbnail: `https://picsum.photos/seed/${i + 1}/640/360`,
    channelName: `Tech Noir Channel ${i + 1}`,
    channelAvatar: `https://i.pravatar.cc/150?u=${i + 1}`,
    views: `${Math.floor(Math.random() * 900) + 100}K`,
    timestamp: `${Math.floor(Math.random() * 11) + 1} days ago`,
    duration: '14:20'
  }));

  return (
    <div className="home-container">
      {/* Category Pills (Trending equivalent) */}
      <div className="category-scroll">
        <button className="category-pill active">All</button>
        <button className="category-pill">Gaming</button>
        <button className="category-pill">Technology</button>
        <button className="category-pill">Cinematography</button>
        <button className="category-pill">Podcasts</button>
        <button className="category-pill">Live</button>
      </div>

      <div className="video-grid">
        {videos.map(video => (
          <Link to={`/watch/${video.id}`} key={video.id} className="video-card glass-card">
            <div className="thumbnail-container">
              <img src={video.thumbnail} alt={video.title} className="thumbnail" />
              <span className="duration">{video.duration}</span>
            </div>
            
            <div className="video-info">
              <img src={video.channelAvatar} alt={video.channelName} className="channel-avatar" />
              <div className="video-text">
                <h3 className="video-title">{video.title}</h3>
                <p className="channel-name">{video.channelName}</p>
                <p className="video-meta">{video.views} views • {video.timestamp}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
