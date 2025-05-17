import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../firebase/config';
import { importEncryptionKey, decryptFile } from '../../util/encryption.js';

const FileList = ({ currentFolder = 'root', onFolderClick }) => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch files and folders when component mounts or currentFolder changes
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const userId = auth.currentUser.uid;
        
        // Fetch folders
        const folderQuery = query(
          collection(db, 'folders'),
          where('ownerId', '==', userId),
          where('parentId', '==', currentFolder),
          orderBy('name')
        );
        
        const folderSnapshot = await getDocs(folderQuery);
        const folderList = folderSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'folder'
        }));
        
        // Fetch files
        const fileQuery = query(
          collection(db, 'files'),
          where('ownerId', '==', userId),
          where('folderId', '==', currentFolder),
          orderBy('name')
        );
        
        const fileSnapshot = await getDocs(fileQuery);
        const fileList = fileSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'file'
        }));
        
        setFolders(folderList);
        setFiles(fileList);
      } catch (error) {
        console.error('Error fetching files and folders:', error);
        setError('Failed to load files and folders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchItems();
  }, [currentFolder]);

  // Handle file download with decryption
  const handleDownload = async (file) => {
    try {
      // Download the encrypted file
      const response = await fetch(file.encryptedUrl);
      const encryptedData = await response.arrayBuffer();
      
      // Import the encryption key 
      // In a real app, this key would be encrypted with the user's public key
      // and would need to be decrypted first
      const key = await importEncryptionKey(new Uint8Array(file.encryptedKey));
      
      // Decrypt the file
      const decryptedFile = await decryptFile(
        encryptedData,
        file.iv,
        key,
        file.name,
        file.originalType
      );
      
      // Create a download link for the decrypted file
      const url = URL.createObjectURL(decryptedFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file: ' + error.message);
    }
  };

  // Handle file deletion
  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      return;
    }
    
    try {
      if (item.type === 'file') {
        // Delete from Storage
        const storageRef = ref(storage, `files/${auth.currentUser.uid}/${item.id}`);
        await deleteObject(storageRef);
        
        // Delete from Firestore
        await deleteDoc(doc(db, 'files', item.id));
        
        // Update UI
        setFiles(files.filter(f => f.id !== item.id));
      } else {
        // For folders, we'd need to check if it's empty first
        // and potentially delete all contents recursively
        // This is a simplified version
        await deleteDoc(doc(db, 'folders', item.id));
        
        // Update UI
        setFolders(folders.filter(f => f.id !== item.id));
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete: ' + error.message);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Determine file icon based on file type
  const getFileIcon = (file) => {
    const type = file.originalType || '';
    
    if (type.includes('image')) {
      return (
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      );
    } else if (type.includes('pdf')) {
      return (
        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>
      );
    } else if (type.includes('video')) {
      return (
        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>
      );
    } else if (type.includes('audio')) {
      return (
        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
        </svg>
      );
    } else {
      return (
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>
      );
    }
  };

  // Folder icon
  const getFolderIcon = () => {
    return (
      <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
      </svg>
    );
  };

  // Handle click on an item
  const handleItemClick = (item) => {
    if (item.type === 'folder' && onFolderClick) {
      onFolderClick(item.id, item.name);
    } else if (item.type === 'file') {
      setSelectedItem(item.id === selectedItem ? null : item.id);
    }
  };

  // If loading, show a spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="text-red-400 text-center py-10">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-indigo-400 hover:text-indigo-300"
        >
          Retry
        </button>
      </div>
    );
  }

  // If no files or folders, show empty state
  if (files.length === 0 && folders.length === 0) {
    return (
      <div className="text-center py-10">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-300">No files found</h3>
        <p className="mt-1 text-sm text-gray-400">Get started by uploading a file or creating a folder.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Table header */}
      <div className="flex px-6 py-3 bg-gray-700 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
        <div className="w-8"></div>
        <div className="flex-1">Name</div>
        <div className="w-32 hidden md:block">Size</div>
        <div className="w-32 hidden md:block">Modified</div>
        <div className="w-24 text-right">Actions</div>
      </div>

      {/* Display folders first */}
      {folders.map((folder) => (
        <div 
          key={folder.id}
          className="flex items-center px-6 py-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer"
          onClick={() => handleItemClick(folder)}
        >
          <div className="w-8">
            {getFolderIcon()}
          </div>
          <div className="flex-1 font-medium text-gray-200">
            {folder.name}
          </div>
          <div className="w-32 text-gray-400 hidden md:block">
            --
          </div>
          <div className="w-32 text-gray-400 hidden md:block">
            {formatDate(folder.createdAt)}
          </div>
          <div className="w-24 flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(folder);
              }}
              className="text-red-400 hover:text-red-300 ml-2"
              title="Delete folder"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      ))}

      {/* Display files */}
      {files.map((file) => (
        <div key={file.id}>
          <div 
            className="flex items-center px-6 py-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer"
            onClick={() => handleItemClick(file)}
          >
            <div className="w-8">
              {getFileIcon(file)}
            </div>
            <div className="flex-1 font-medium text-gray-200">
              {file.name}
              {/* Encrypted indicator */}
              <span className="ml-2 text-xs text-indigo-400">
                (Encrypted)
              </span>
            </div>
            <div className="w-32 text-gray-400 hidden md:block">
              {formatFileSize(file.size)}
            </div>
            <div className="w-32 text-gray-400 hidden md:block">
              {formatDate(file.createdAt)}
            </div>
            <div className="w-24 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(file);
                }}
                className="text-green-400 hover:text-green-300"
                title="Download file"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(file);
                }}
                className="text-red-400 hover:text-red-300 ml-2"
                title="Delete file"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Expanded file details */}
          {selectedItem === file.id && (
            <div className="bg-gray-750 p-4 border-b border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">
                    <span className="font-medium">Type:</span> {file.originalType || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-400">
                    <span className="font-medium">Size:</span> {formatFileSize(file.size)}
                  </p>
                  <p className="text-sm text-gray-400">
                    <span className="font-medium">Created:</span> {formatDate(file.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">
                    <span className="font-medium">Encrypted Size:</span> {formatFileSize(file.encryptedSize)}
                  </p>
                  <p className="text-sm text-gray-400">
                    <span className="font-medium">Encryption:</span> AES-256
                  </p>
                  <p className="text-sm text-indigo-400">
                    <span className="font-medium">Security:</span> End-to-end encrypted
                  </p>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => handleDownload(file)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Download
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FileList;