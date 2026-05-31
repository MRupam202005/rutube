import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, PlaySquare, Clock, History, ThumbsUp } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();

  if (!isOpen) return null; // Or you could render a collapsed version

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: PlaySquare, label: 'Subscriptions', path: '/subscriptions' },
    { divider: true },
    { icon: History, label: 'History', path: '/history' },
    { icon: Clock, label: 'Watch Later', path: '/watch-later' },
    { icon: ThumbsUp, label: 'Liked Videos', path: '/liked' },
  ];

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-menu">
        {menuItems.map((item, index) => {
          if (item.divider) return <div key={index} className="divider" />;
          
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link 
              key={index} 
              to={item.path} 
              className={`menu-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
