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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
        </div>

        {/* Modal Panel */}
        <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-100">
                    Create New Folder
                  </h3>
                  <div className="mt-4">
                    <input
                      type="text"
                      name="folderName"
                      id="folderName"
                      className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Folder Name"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      autoFocus
                    />
                    {error && (
                      <p className="mt-2 text-sm text-red-400">{error}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isCreating}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white 
                  ${isCreating ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm`}
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-500 shadow-sm px-4 py-2 bg-gray-800 text-base font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateFolderModal;