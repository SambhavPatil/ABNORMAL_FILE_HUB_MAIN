import React from 'react';
import { StorageStats } from '../types/files';
import './StorageStatsPanel.css';

interface StorageStatsPanelProps {
  stats: StorageStats | null;
}

const StorageStatsPanel: React.FC<StorageStatsPanelProps> = ({ stats }) => {
  // Format bytes to human-readable format
  const formatBytes = (bytes: number | undefined): string => {
    if (bytes === undefined || bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  if (!stats) {
    return (
      <div className="storage-stats-panel loading">
        <h2>Storage Statistics</h2>
        <div className="loading-indicator">Loading stats...</div>
      </div>
    );
  }
  
  // Calculate the percentage width of the used space in the progress bar
  const storageRatio = stats.actual_storage_size / stats.total_size;
  const barWidth = stats.total_size > 0 ? (storageRatio * 100) : 0;
  
  return (
    <div className="storage-stats-panel">
      <h2>Storage Statistics</h2>
      
      <div className="stat-item">
        <span className="stat-label">Total Files:</span>
        <span className="stat-value">{stats.total_files}</span>
      </div>
      
      <div className="stat-item">
        <span className="stat-label">Unique Files:</span>
        <span className="stat-value">{stats.unique_files}</span>
      </div>
      
      <div className="stat-item">
        <span className="stat-label">Total Size:</span>
        <span className="stat-value">{formatBytes(stats.total_size)}</span>
      </div>
      
      <div className="stat-item">
        <span className="stat-label">Actual Storage:</span>
        <span className="stat-value">{formatBytes(stats.actual_storage_size)}</span>
      </div>
      
      <div className="storage-progress">
        <div className="progress-label">
          <span>Storage Efficiency</span>
          <span>{Math.round(stats.storage_saved_percent)}% saved</span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{ width: `${barWidth}%` }}
          ></div>
        </div>
      </div>
      
      <div className="stats-highlight">
        <div className="highlight-value">
          {formatBytes(stats.storage_saved)}
        </div>
        <div className="highlight-label">
          Storage Saved via Deduplication
        </div>
      </div>
    </div>
  );
};

export default StorageStatsPanel;