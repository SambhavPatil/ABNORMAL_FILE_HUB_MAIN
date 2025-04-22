import React from 'react';
import { FileData } from '../types/files';
import './FileList.css';

interface FileListProps {
  files: FileData[];
  loading: boolean;
  onDelete: (id: number) => Promise<void>;
}

const FileList: React.FC<FileListProps> = ({ files, loading, onDelete }) => {
  // Format bytes to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Format date string
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get file icon based on file extension
  const getFileIconClass = (extension: string): string => {
    const iconMap: { [key: string]: string } = {
      pdf: 'fa-file-pdf',
      doc: 'fa-file-word',
      docx: 'fa-file-word',
      xls: 'fa-file-excel',
      xlsx: 'fa-file-excel',
      ppt: 'fa-file-powerpoint',
      pptx: 'fa-file-powerpoint',
      jpg: 'fa-file-image',
      jpeg: 'fa-file-image',
      png: 'fa-file-image',
      gif: 'fa-file-image',
      txt: 'fa-file-alt',
      zip: 'fa-file-archive',
      rar: 'fa-file-archive',
      mp3: 'fa-file-audio',
      mp4: 'fa-file-video',
    };
    
    return iconMap[extension.toLowerCase()] || 'fa-file';
  };
  
  // Handle file deletion with confirmation
  const handleDelete = async (id: number, fileName: string) => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Error deleting file:', error);
        alert('Failed to delete file');
      }
    }
  };
  
  if (loading) {
    return <div className="loading-spinner">Loading files...</div>;
  }
  
  // Make sure files is an array
  const fileArray = Array.isArray(files) ? files : [];
  
  if (fileArray.length === 0) {
    return (
      <div className="empty-list">
        <p>No files found. Upload files or adjust your search filters.</p>
      </div>
    );
  }
  
  return (
    <div className="file-list">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Size</th>
            <th>Upload Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {fileArray.map((file) => (
            <tr key={file.id}>
              <td className="file-name">
                <i className={`fas ${getFileIconClass(file.file_extension)}`}></i>
                {file.name}
              </td>
              <td>{file.file_extension.toUpperCase()}</td>
              <td>{formatFileSize(file.size)}</td>
              <td>{formatDate(file.upload_date)}</td>
              <td>
                {file.is_duplicate && (
                  <span className="duplicate-badge" title="This file is a duplicate">
                    Duplicate
                  </span>
                )}
              </td>
              <td>
                <button 
                  className="delete-button"
                  onClick={() => handleDelete(file.id, file.name)}
                  title="Delete file"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileList;