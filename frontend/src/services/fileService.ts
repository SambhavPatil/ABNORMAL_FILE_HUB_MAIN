import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Types
export interface FileType {
  id: number;
  file: string;
  filename: string;
  original_filename: string;
  size: number;
  human_size: string;
  file_type: string;
  file_type_display: string;
  content_hash: string;
  upload_date: string;
  reference_count: number;
}

export interface FileReferenceType {
  id: number;
  user_filename: string;
  upload_date: string;
  file_type: string;
  file_size: number;
  human_size: string;
}

export interface FileReferenceDetailType {
  id: number;
  file: number;
  file_data: FileType;
  user_filename: string;
  upload_date: string;
}

export interface StorageSavingsType {
  date: string;
  bytes_saved: number;
  human_bytes_saved: string;
  file_count: number;
}

export interface TotalSavingsType {
  bytes_saved: number;
  human_bytes_saved: string;
  file_count: number;
}

export interface FileUploadResponse {
  message: string;
  file_reference: FileReferenceDetailType;
  duplicate: boolean;
}

// Filter types
export interface FileFilters {
  search?: string;
  file_type?: string;
  min_size?: number;
  max_size?: number;
  start_date?: string;
  end_date?: string;
  date_range?: string;
  ordering?: string;
}

// API services
const fileService = {
  // File references API
  getFileReferences: async (filters: FileFilters = {}) => {
    const params = new URLSearchParams();
    
    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    
    const response = await axios.get<FileReferenceType[]>(`${API_URL}/references/`, { params });
    return response.data;
  },
  
  getFileReferenceDetail: async (id: number) => {
    const response = await axios.get<FileReferenceDetailType>(`${API_URL}/references/${id}/`);
    return response.data;
  },
  
  uploadFile: async (file: File, customFilename?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (customFilename) {
      formData.append('filename', customFilename);
    }
    
    const response = await axios.post<FileUploadResponse>(
      `${API_URL}/references/upload/`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  },
  
  deleteFileReference: async (id: number) => {
    const response = await axios.delete(`${API_URL}/references/${id}/`);
    return response.data;
  },
  
  // Storage savings API
  getStorageSavings: async () => {
    const response = await axios.get<StorageSavingsType[]>(`${API_URL}/savings/`);
    return response.data;
  },
  
  getTotalSavings: async () => {
    const response = await axios.get<TotalSavingsType>(`${API_URL}/savings/total/`);
    return response.data;
  },
  
  // File types utility
  getFileTypeOptions: () => [
    { value: 'document', label: 'Document' },
    { value: 'image', label: 'Image' },
    { value: 'video', label: 'Video' },
    { value: 'audio', label: 'Audio' },
    { value: 'archive', label: 'Archive' },
    { value: 'other', label: 'Other' },
  ],
  
  // Date range options utility
  getDateRangeOptions: () => [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'this_year', label: 'This Year' },
  ],
  
  // Size range options utility (in bytes)
  getSizeRangeOptions: () => [
    { value: { min: 0, max: 102400 }, label: '< 100 KB' },
    { value: { min: 102400, max: 1048576 }, label: '100 KB - 1 MB' },
    { value: { min: 1048576, max: 10485760 }, label: '1 MB - 10 MB' },
    { value: { min: 10485760, max: 104857600 }, label: '10 MB - 100 MB' },
    { value: { min: 104857600, max: null }, label: '> 100 MB' },
  ],
};

export default fileService;