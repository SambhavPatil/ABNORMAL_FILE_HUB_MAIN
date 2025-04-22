import React, { useState, useRef } from 'react';
import './FileUploader.css';

interface FileUploaderProps {
  onFileUpload: (file: File) => Promise<void>;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setUploadError(null);
    }
  };
  
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setSelectedFile(event.dataTransfer.files[0]);
      setUploadError(null);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file first');
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadError(null);
      await onFileUpload(selectedFile);
      setSelectedFile(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      let errorMessage = 'Failed to upload file. Please try again.';
      
      // If there's a more specific error message from the server, use it
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof error.response === 'object' &&
        error.response !== null &&
        'data' in error.response &&
        typeof error.response.data === 'object' &&
        error.response.data !== null &&
        'error' in error.response.data
      ) {
        errorMessage = String(error.response.data.error);
      }
      
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="file-uploader">
      <h2>Upload Files</h2>
      
      <div 
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <input 
          type="file" 
          onChange={handleFileChange} 
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        
        {selectedFile ? (
          <div className="selected-file">
            <p>{selectedFile.name}</p>
            <span>({(selectedFile.size / 1024).toFixed(2)} KB)</span>
          </div>
        ) : (
          <div className="drop-zone-prompt">
            <p>Drag & drop files here</p>
            <p>or</p>
            <button type="button" className="browse-button">
              Browse Files
            </button>
          </div>
        )}
      </div>
      
      {uploadError && <div className="upload-error">{uploadError}</div>}
      
      <button 
        className="upload-button"
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
      >
        {isUploading ? 'Uploading...' : 'Upload File'}
      </button>
    </div>
  );
};

export default FileUploader;