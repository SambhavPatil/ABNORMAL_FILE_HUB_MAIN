import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

import FileUploader from './components/FileUploader'; // Ensure this file exists in the components directory
import FileList from './components/FileList';
import FileSearch from './components/FileSearch';
import StorageStatsPanel from './components/StorageStatsPanel'; // Ensure this file exists in the components directory

import { FileData, FileFilters, StorageStats } from './types/files';
import fileService from './services/apiService';

const App: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<FileFilters>({});
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  

  // Load files based on current filters
  const loadFiles = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await fileService.getFiles(filters);
      // Ensure data is an array
      setFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading files:', error);
      if ((error as any).code === 'ERR_NETWORK') {
        setApiError('Cannot connect to the server. Please make sure the backend is running.');
      } else {
        setApiError(`An error occurred: ${(error as Error).message}`);
      }
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  
  // Load storage statistics
  const loadStats = async () => {
    try {
      const data = await fileService.getStorageStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading storage stats:', error);
    }
  };
  
  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      await fileService.uploadFile(file);
      // Refresh files and stats after upload
      loadFiles();
      loadStats();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };
  
  // Handle file deletion
  const handleFileDelete = async (id: number) => {
    try {
      await fileService.deleteFile(id);
      // Refresh files and stats after deletion
      loadFiles();
      loadStats();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };
  
  // Handle search/filter changes
  const handleFilterChange = (newFilters: FileFilters) => {
    setFilters(newFilters);
  };
  
  // Initial load and when filters change
  useEffect(() => {
    console.log('Loading files based on filters...');
    loadFiles();
    // We want this to run ONLY when filters or loadFiles changes
  }, [filters, loadFiles]);
  
  // Load stats on initial render only
  useEffect(() => {
    console.log('Loading stats (initial render only)...');
    loadStats();
    // Empty dependency array means this runs once on mount
  }, []);
  
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Abnormal File Vault</h1>
      </header>
      
      {apiError && (
        <div className="api-error-banner">
          <p>{apiError}</p>
          <button onClick={() => loadFiles()}>Retry Connection</button>
        </div>
      )}
      
      <div className="app-content">
        <div className="sidebar">
          <FileUploader onFileUpload={handleFileUpload} />
          <StorageStatsPanel stats={stats} />
        </div>
        
        <div className="main-content">
          <FileSearch onFilterChange={handleFilterChange} />
          <FileList 
            files={files} 
            loading={loading} 
            onDelete={handleFileDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default App;