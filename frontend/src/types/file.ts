export interface File {
  id: string;
  original_filename: string;
  file_type: string;
  size: number;
  uploaded_at: string;
  file: string;
  duplicate?: boolean;
  storage_saved?: number;
}
