import React, { useState } from 'react';

const TopBar = ({ onUpload }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadClick = () => {
    // Create a hidden file input and trigger it
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true; // Allow multiple files
    fileInput.accept = '*/*'; // Accept all file types
    
    fileInput.onchange = async (e) => {
      const files = e.target.files;
      if (files.length > 0 && onUpload) {
        try {
          setIsUploading(true);
          await onUpload(files);
        } catch (error) {
          console.error('Error uploading files:', error);
        } finally {
          setIsUploading(false);
        }
      }
    };
    
    fileInput.click();
  };

  return (
    <div className="bg-gray-800 px-4 py-3 shadow-md flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-100">Dashboard</h1>
      
      <button
        onClick={handleUploadClick}
        disabled={isUploading}
        className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium 
          ${isUploading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} 
          text-white transition-colors`}
      >
        {isUploading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
          </>
        ) : (
          <>
            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload File
          </>
        )}
      </button>
    </div>
  );
};

export default TopBar;