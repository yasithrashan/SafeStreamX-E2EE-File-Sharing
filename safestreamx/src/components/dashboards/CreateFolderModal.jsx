import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';

const CreateFolderModal = ({ isOpen, onClose, parentFolder = null, onFolderCreated }) => {
  const [folderName, setFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate folder name
    if (!folderName.trim()) {
      setError('Please enter a folder name');
      return;
    }
    
    setError('');
    setIsCreating(true);
    
    try {
      const userId = auth.currentUser.uid;
      
      // Create the folder in Firestore
      const folderRef = await addDoc(collection(db, 'folders'), {
        name: folderName.trim(),
        parentId: parentFolder || 'root',
        ownerId: userId,
        path: parentFolder ? `${parentFolder}/${folderName.trim()}` : folderName.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Close the modal and reset state
      setFolderName('');
      onClose();
      
      // Notify parent component
      if (onFolderCreated) {
        onFolderCreated(folderRef.id);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      setError('Failed to create folder: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center">
      {/* Background overlay with backdrop blur effect */}
      <div 
        className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-filter backdrop-blur-sm transition-all" 
        aria-hidden="true" 
        onClick={onClose}
        style={{
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)'
        }}
      ></div>

      {/* Modal Panel */}
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl transform transition-all max-w-lg w-full m-4 z-50 relative">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-100">Create New Folder</h3>
          <button 
            type="button" 
            className="text-gray-400 hover:text-gray-200" 
            onClick={onClose}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            <div className="mb-4">
              <label htmlFor="folderName" className="block text-sm font-medium text-gray-300 mb-2">
                Folder Name
              </label>
              <input
                type="text"
                name="folderName"
                id="folderName"
                className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter folder name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}
            </div>
          </div>
          
          <div className="bg-gray-700 px-6 py-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 px-4 py-2 bg-gray-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                ${isCreating ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500`}
            >
              {isCreating ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal;