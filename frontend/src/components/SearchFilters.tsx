import React, { useState, useEffect } from 'react';
import fileService, { FileFilters } from '../services/fileService';

interface SearchFiltersProps {
  onFilterChange: (filters: FileFilters) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onFilterChange }) => {
  const [search, setSearch] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('');
  const [sizeRange, setSizeRange] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [customDateRange, setCustomDateRange] = useState<boolean>(false);
  const [ordering, setOrdering] = useState<string>('-upload_date');
  
  const fileTypeOptions = fileService.getFileTypeOptions();
  const dateRangeOptions = fileService.getDateRangeOptions();
  const sizeRangeOptions = fileService.getSizeRangeOptions();
  
  useEffect(() => {
    const filters: FileFilters = { ordering };
    
    if (search) {
      filters.search = search;
    }
    
    if (fileType) {
      filters.file_type = fileType;
    }
    
    if (customDateRange) {
      if (startDate) {
        filters.start_date = startDate;
      }
      if (endDate) {
        filters.end_date = endDate;
      }
    } else if (dateRange) {
      filters.date_range = dateRange;
    }
    
    if (sizeRange) {
      const selectedSize = sizeRangeOptions.find(option => option.value.toString() === sizeRange);
      if (selectedSize) {
        if (selectedSize.value.min !== null) {
          filters.min_size = selectedSize.value.min;
        }
        if (selectedSize.value.max !== null) {
          filters.max_size = selectedSize.value.max;
        }
      }
    }
    
    onFilterChange(filters);
  }, [search, fileType, dateRange, sizeRange, startDate, endDate, customDateRange, ordering]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  
  const handleFileTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFileType(e.target.value);
  };
  
  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDateRange(value);
    setCustomDateRange(value === 'custom');
  };
  
  const handleSizeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSizeRange(e.target.value);
  };
  
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };
  
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };
  
  const handleOrderingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrdering(e.target.value);
  };
  
  const handleClearFilters = () => {
    setSearch('');
    setFileType('');
    setDateRange('');
    setSizeRange('');
    setStartDate('');
    setEndDate('');
    setCustomDateRange(false);
    setOrdering('-upload_date');
  };
  
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h3 className="text-lg font-medium mb-3">Search & Filters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by filename..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* File Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File Type
          </label>
          <select
            value={fileType}
            onChange={handleFileTypeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            {fileTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Size Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Size Range
          </label>
          <select
            value={sizeRange}
            onChange={handleSizeRangeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Any Size</option>
            {sizeRangeOptions.map((option, index) => (
              <option key={index} value={index.toString()}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <select
            value={dateRange}
            onChange={handleDateRangeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Any Time</option>
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            <option value="custom">Custom Range</option>
          </select>
        </div>
        
        {/* Ordering */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            value={ordering}
            onChange={handleOrderingChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="-upload_date">Newest First</option>
            <option value="upload_date">Oldest First</option>
            <option value="user_filename">Name (A-Z)</option>
            <option value="-user_filename">Name (Z-A)</option>
            <option value="file_size">Size (Small to Large)</option>
            <option value="-file_size">Size (Large to Small)</option>
          </select>
        </div>
      </div>
      
      {/* Custom Date Range */}
      {customDateRange && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}
      
      {/* Clear Filters Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleClearFilters}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 font-medium text-sm"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default SearchFilters;