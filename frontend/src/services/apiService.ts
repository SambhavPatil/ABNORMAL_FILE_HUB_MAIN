import axios from 'axios';
import { FileData, StorageStats, FileFilters } from '../types/files';

// For development - we need different URLs depending on where the code is running
// In the browser (user's computer), use localhost
// In the Docker container, use the service name
const isRunningInBrowser = typeof window !== 'undefined';
const API_URL = process.env.REACT_APP_API_URL || 
                (isRunningInBrowser ? 'http://localhost:8000/api' : 'http://backend:8000/api');

console.log('API URL:', API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simple cache to prevent redundant API calls with the same parameters
const cache = {
  files: new Map<string, { data: FileData[], timestamp: number }>(),
  stats: { data: null as StorageStats | null, timestamp: 0 },
  
  // Cache expiration in milliseconds (5 seconds)
  EXPIRATION: 5000,
  
  // Generate a cache key from filters
  getFilesKey: (filters?: FileFilters): string => {
    return JSON.stringify(filters || {});
  },
  
  // Check if cache entry is still valid
  isValid: (timestamp: number): boolean => {
    return Date.now() - timestamp < cache.EXPIRATION;
  }
};

export const fileService = {
  // Get all files with optional filters
  getFiles: async (filters?: FileFilters): Promise<FileData[]> => {
    try {
      // Check cache first
      const cacheKey = cache.getFilesKey(filters);
      const cachedData = cache.files.get(cacheKey);
      
      if (cachedData && cache.isValid(cachedData.timestamp)) {
        console.log('Using cached file data');
        return cachedData.data;
      }
      
      // Cache miss, make API request
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.name) params.append('name', filters.name);
        if (filters.type) params.append('type', filters.type);
        if (filters.min_size !== undefined) params.append('min_size', filters.min_size.toString());
        if (filters.max_size !== undefined) params.append('max_size', filters.max_size.toString());
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
      }
      
      console.log('Making API request to:', `${API_URL}/files/`);
      const response = await apiClient.get('/files/', { params });
      console.log('API response:', response.data);
      
      // Process the response data
      let fileData: FileData[] = [];
      if (Array.isArray(response.data)) {
        fileData = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        // Handle DRF pagination
        fileData = response.data.results;
      } else {
        console.error('API response is not an array:', response.data);
      }
      
      // Update cache
      cache.files.set(cacheKey, {
        data: fileData,
        timestamp: Date.now()
      });
      
      return fileData;
    } catch (error) {
      console.error('API Error in getFiles:', error);
      throw error;
    }
  },
  
  // Upload a file
  uploadFile: async (file: globalThis.File): Promise<FileData> => {
    try {
      console.log('Uploading file:', file.name, 'size:', file.size);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/files/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in uploadFile:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response error data:', error.response.data);
      }
      throw error;
    }
  },
  
  // Delete a file
  deleteFile: async (id: number): Promise<void> => {
    await apiClient.delete(`/files/${id}/`);
  },
  
  // Get storage statistics
  getStorageStats: async (): Promise<StorageStats> => {
    try {
      // Check cache first
      if (cache.stats.data && cache.isValid(cache.stats.timestamp)) {
        console.log('Using cached stats data');
        return cache.stats.data;
      }
      
      // Cache miss, make API request
      console.log('Making API request for stats');
      const response = await apiClient.get('/stats/');
      
      // Update cache
      cache.stats = {
        data: response.data,
        timestamp: Date.now()
      };
      
      return response.data;
    } catch (error) {
      console.error('API Error in getStorageStats:', error);
      throw error;
    }
  }
};

export default fileService;