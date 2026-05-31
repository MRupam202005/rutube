import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import './VideoUploadModal.css';

export default function VideoEditModal({ isOpen, onClose, onSuccess, video }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || '',
        description: video.description || ''
      });
      setThumbnailFile(null);
    }
  }, [video]);

  if (!isOpen || !video) return null;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error("Please provide both title and description.");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Updating video...");

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      if (thumbnailFile) {
        data.append('thumbnail', thumbnailFile);
      }

      await api.patch(`/videos/${video._id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success("Video updated successfully!", { id: loadingToast });
      
      if(onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || "Failed to update video";
      toast.error(message, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Video</h2>
          <button className="close-btn" onClick={onClose} disabled={loading}>
            <X size={24} />
          </button>
        </div>

        <form className="upload-form" onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>Thumbnail (Optional)</label>
            <div className="file-input-wrapper">
              <ImageIcon className="file-icon" size={32} />
              <p>Upload a new thumbnail to replace the current one.</p>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setThumbnailFile(e.target.files[0])} 
              />
              {thumbnailFile && <p className="file-name">{thumbnailFile.name}</p>}
            </div>
          </div>

          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleInputChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleInputChange} 
              required 
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary submit-btn" disabled={loading}>
              {loading ? (
                <><Loader2 className="spinner" size={20} style={{ marginRight: '8px' }} /> Updating...</>
              ) : (
                <><Save size={20} style={{ marginRight: '8px' }} /> Save Changes</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
