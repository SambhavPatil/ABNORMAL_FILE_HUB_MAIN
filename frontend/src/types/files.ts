export interface FileData {
  id: number;
  name: string;
  content_type: string;
  upload_date: string;
  size: number;
  file_extension: string;
  is_duplicate?: boolean;
}

export interface StorageStats {
  total_files: number;
  unique_files: number;
  total_size: number;
  actual_storage_size: number;
  storage_saved: number;
  storage_saved_percent: number;
}

export interface FileFilters {
  name?: string;
  type?: string;
  min_size?: number;
  max_size?: number;
  start_date?: string;
  end_date?: string;
}