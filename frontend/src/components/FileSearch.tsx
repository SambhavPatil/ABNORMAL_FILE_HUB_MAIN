import React, { useState, useEffect } from 'react';
import { FileFilters } from '../types/files';
import './FileSearch.css';

interface FileSearchProps {
  onFilterChange: (filters: FileFilters) => void;
}

const FileSearch: React.FC<FileSearchProps> = ({ onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [minSize, setMinSize] = useState<string>('');
  const [maxSize, setMaxSize] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [expanded, setExpanded] = useState<boolean>(false);
  
  // Common file types for the dropdown
  const fileTypes = [
    { value: '', label: 'All Types' },
    { value: 'pdf', label: 'PDF' },
    { value: 'doc', label: 'DOC' },
    { value: 'docx', label: 'DOCX' },
    { value: 'xls', label: 'XLS' },
    { value: 'xlsx', label: 'XLSX' },
    { value: 'ppt', label: 'PPT' },
    { value: 'pptx', label: 'PPTX' },
    { value: 'txt', label: 'TXT' },
    { value: 'csv', label: 'CSV' },
    { value: 'jpg', label: 'JPG' },
    { value: 'png', label: 'PNG' },
    { value: 'zip', label: 'ZIP' },
  ];
  
  // Size unit multipliers for conversion to bytes
  const sizeMultipliers: { [key: string]: number } = {
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
  };
  
  // Convert size string (e.g. "5 MB") to bytes
  const convertSizeToBytes = (sizeStr: string): number | undefined => {
    if (!sizeStr.trim()) return undefined;
    
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(KB|MB|GB)?$/i);
    if (!match) return undefined;
    
    const value = parseFloat(match[1]);
    const unit = match[2]?.toUpperCase() || 'KB';
    
    return value * (sizeMultipliers[unit] || 1);
  };
  
  // Apply filters when values change with debounce
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    console.log('Filter values changed, setting up debounce timer...');
    // Debounce filter application
    const timerId = setTimeout(() => {
      console.log('Debounce timer finished, applying filters');
      const filters: FileFilters = {};
      
      if (searchTerm.trim()) {
        filters.name = searchTerm.trim();
      }
      
      if (fileType) {
        filters.type = fileType;
      }
      
      const minSizeBytes = convertSizeToBytes(minSize);
      if (minSizeBytes !== undefined) {
        filters.min_size = minSizeBytes;
      }
      
      const maxSizeBytes = convertSizeToBytes(maxSize);
      if (maxSizeBytes !== undefined) {
        filters.max_size = maxSizeBytes;
      }
      
      if (startDate) {
        filters.start_date = new Date(startDate).toISOString();
      }
      
      if (endDate) {
        filters.end_date = new Date(endDate).toISOString();
      }
      
      onFilterChange(filters);
    }, 500); // Increased debounce to 500ms
    
    return () => {
      console.log('Cleaning up previous debounce timer');
      clearTimeout(timerId);
    };
  }, [searchTerm, fileType, minSize, maxSize, startDate, endDate]);  
  // Handle form reset
  const handleReset = () => {
    setSearchTerm('');
    setFileType('');
    setMinSize('');
    setMaxSize('');
    setStartDate('');
    setEndDate('');
  };
  
  // Toggle expanded view
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  return (
    <div className="file-search">
      <div className="search-row">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by filename..."
            className="search-input"
          />
          <i className="fas fa-search search-icon"></i>
        </div>
        
        <select
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          className="type-select"
        >
          {fileTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        
        <button
          className="toggle-filters-button"
          onClick={toggleExpanded}
          title={expanded ? "Hide advanced filters" : "Show advanced filters"}
        >
          {expanded ? "Fewer filters" : "More filters"} 
          <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`}></i>
        </button>
      </div>
      
      {expanded && (
        <div className="advanced-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label>Min Size:</label>
              <input
                type="text"
                value={minSize}
                onChange={(e) => setMinSize(e.target.value)}
                placeholder="e.g. 5 MB"
                className="size-input"
              />
            </div>
            
            <div className="filter-group">
              <label>Max Size:</label>
              <input
                type="text"
                value={maxSize}
                onChange={(e) => setMaxSize(e.target.value)}
                placeholder="e.g. 100 MB"
                className="size-input"
              />
            </div>
          </div>
          
          <div className="filter-row">
            <div className="filter-group">
              <label>From Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="date-input"
              />
            </div>
            
            <div className="filter-group">
              <label>To Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="date-input"
              />
            </div>
            
            <button className="reset-button" onClick={handleReset}>
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileSearch;