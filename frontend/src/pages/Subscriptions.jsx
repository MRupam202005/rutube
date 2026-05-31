import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import api from '../api/axios';
import './Subscriptions.css'; // We'll create a simple css for channels

const Subscriptions = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const userData = useSelector(state => state.auth.userData);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!userData?._id) return;
      try {
        const res = await api.get(`/subscriptions/u/${userData._id}`);
        setChannels(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch subscriptions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, [userData]);

  return (
    <div className="home-container" style={{ padding: '24px 40px' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '1.8rem' }}>Your Subscriptions</h2>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Loader2 className="spinner" size={40} color="#2af5d1" />
        </div>
      ) : (
        <div className="channels-grid">
          {channels.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>You haven't subscribed to any channels yet.</p>
          ) : (
            channels.map(item => {
              const channel = item.channelDetails;
              return (
                <Link to={`/channel/${channel.username}`} key={channel._id} className="channel-card glass-card">
                  <img src={channel.avatar || "https://i.pravatar.cc/150"} alt={channel.fullName} className="channel-card-avatar" />
                  <h3 className="channel-card-name">{channel.fullName}</h3>
                  <p className="channel-card-username">@{channel.username}</p>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
