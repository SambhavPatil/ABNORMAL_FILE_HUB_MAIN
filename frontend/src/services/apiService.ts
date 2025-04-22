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

export const fileService = {
  // Get all files with optional filters
  getFiles: async (filters?: FileFilters): Promise<FileData[]> => {
    try {
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
      
      // Ensure we always return an array
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        // Handle DRF pagination
        return response.data.results;
      } else {
        console.error('API response is not an array:', response.data);
        return [];
      }
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
    const response = await apiClient.get('/stats/');
    return response.data;
  },
};

export default fileService;