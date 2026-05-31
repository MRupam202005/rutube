import React, { useState } from 'react';
import { X, UploadCloud, Film, Image as ImageIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import './VideoUploadModal.css';

export default function VideoUploadModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !videoFile || !thumbnailFile) {
      toast.error("Please fill all fields and select both files.");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Uploading to Cloudinary... This may take a moment.");

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('videoFile', videoFile);
      data.append('thumbnail', thumbnailFile);

      await api.post('/videos', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success("Video published successfully!", { id: loadingToast });
      
      // Reset form
      setFormData({ title: '', description: '' });
      setVideoFile(null);
      setThumbnailFile(null);
      
      // Notify parent to refresh list
      if(onSuccess) onSuccess();
      
      onClose();
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || "Failed to upload video";
      toast.error(message, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const { title, description } = formData;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Upload Video</h2>
          <button className="close-btn" onClick={onClose} disabled={loading}>
            <X size={24} />
          </button>
        </div>

        <form className="upload-form" onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>Video File</label>
            <div className="file-input-wrapper">
              <Film className="file-icon" size={32} />
              <p>Drag and drop a video file, or click to browse.</p>
              <p className="file-hint">MP4, WebM (Max 50MB for free tier)</p>
              <input 
                type="file" 
                accept="video/*" 
                onChange={(e) => setVideoFile(e.target.files[0])} 
                required 
              />
              {videoFile && <p className="file-name">{videoFile.name}</p>}
            </div>
          </div>

          <div className="form-group">
            <label>Thumbnail</label>
            <div className="file-input-wrapper">
              <ImageIcon className="file-icon" size={32} />
              <p>Upload a cinematic thumbnail for your video.</p>
              <p className="file-hint">JPG, PNG (16:9 ratio recommended)</p>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setThumbnailFile(e.target.files[0])} 
                required 
              />
              {thumbnailFile && <p className="file-name">{thumbnailFile.name}</p>}
            </div>
          </div>

          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              name="title" 
              value={title} 
              onChange={handleInputChange} 
              placeholder="Give your video a catchy title" 
              required 
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description" 
              value={description} 
              onChange={handleInputChange} 
              placeholder="Tell viewers what your video is about..." 
              required 
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary submit-btn" disabled={loading}>
              {loading ? (
                <><Loader2 className="spinner" size={20} style={{ marginRight: '8px' }} /> Uploading...</>
              ) : (
                <><UploadCloud size={20} style={{ marginRight: '8px' }} /> Publish Video</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
