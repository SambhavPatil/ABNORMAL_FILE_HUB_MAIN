import React, { useState } from 'react';
import { FileReferenceType } from '../services/fileService';

interface FileListItemProps {
  file: FileReferenceType;
  onDelete: () => void;
}

const FileListItem: React.FC<FileListItemProps> = ({ file, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'document':
        return '📄';
      case 'image':
        return '🖼️';
      case 'video':
        return '🎬';
      case 'audio':
        return '🎵';
      case 'archive':
        return '🗄️';
      default:
        return '📁';
    }
  };
  
  const handleDelete = () => {
    if (confirmDelete) {
      onDelete();
    } else {
      setConfirmDelete(true);
    }
  };
  
  return (
    <div className="grid grid-cols-12 gap-2 py-3 px-3 hover:bg-gray-50">
      <div className="col-span-5 flex items-center">
        <span className="mr-2">{getFileTypeIcon(file.file_type)}</span>
        <span className="truncate">{file.user_filename}</span>
      </div>
      <div className="col-span-2 flex items-center">
        <span className="capitalize">{file.file_type}</span>
      </div>
      <div className="col-span-2 flex items-center">
        <span>{file.human_size}</span>
      </div>
      <div className="col-span-2 flex items-center">
        <span>{formatDate(file.upload_date)}</span>
      </div>
      <div className="col-span-1 flex items-center justify-end">
        {confirmDelete ? (
          <div className="flex space-x-1">
            <button
              onClick={onDelete}
              className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={handleDelete}
            className="text-gray-500 hover:text-red-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default FileListItem;