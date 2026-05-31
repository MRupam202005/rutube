import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import api from '../api/axios';
import './Home.css';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  // Fetch videos when page or search query changes
  useEffect(() => {
    let isSubscribed = true;

    const fetchVideos = async () => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        let url = `/videos?page=${page}&limit=12`;
        if (searchQuery) {
          url += `&query=${encodeURIComponent(searchQuery)}`;
        }
        
        const response = await api.get(url);
        if (!isSubscribed) return;

        const newVideos = response.data.data.docs || [];
        
        if (page === 1) {
          setVideos(newVideos);
        } else {
          setVideos(prev => [...prev, ...newVideos]);
        }
        
        setHasMore(response.data.data.hasNextPage);
      } catch (error) {
        if (isSubscribed) console.error("Failed to fetch videos", error);
      } finally {
        if (isSubscribed) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };
    fetchVideos();

    return () => { isSubscribed = false; };
  }, [page, searchQuery]);

  // Reset page when search query changes
  useEffect(() => {
    setPage(1);
    setVideos([]); // Clear videos immediately while loading new ones
  }, [searchQuery]);

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading]);

  return (
    <div className="home-container">
      {/* Category Pills */}
      <div className="category-scroll">
        <button className="category-pill active">All</button>
        <button className="category-pill">Gaming</button>
        <button className="category-pill">Technology</button>
        <button className="category-pill">Cinematography</button>
        <button className="category-pill">Podcasts</button>
        <button className="category-pill">Live</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Loader2 className="spinner" size={40} color="#2af5d1" />
        </div>
      ) : (
        <div className="video-grid">
          {videos.length === 0 && !loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>No videos found.</p>
          ) : (
            <>
              {videos.map(video => (
                <Link to={`/watch/${video._id}`} key={video._id} className="video-card glass-card">
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
              ))}
              
              {/* Invisible element at the bottom used as a trigger for IntersectionObserver */}
              <div ref={loaderRef} style={{ height: '50px', width: '100%', gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {loadingMore && <Loader2 className="spinner" size={30} color="#2af5d1" />}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
