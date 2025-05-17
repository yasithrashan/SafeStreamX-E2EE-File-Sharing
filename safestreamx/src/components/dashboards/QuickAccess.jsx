import React from 'react';

const QuickAccess = ({ onFolderClick, onAddFolder }) => {
  // Default folders - you can replace these with actual data from Firebase later
  const defaultFolders = [
    { id: 'project-files', name: 'Project Files', icon: 'folder' },
    { id: 'private-docs', name: 'Private Documents', icon: 'lock' },
    { id: 'shared-with-me', name: 'Shared With Me', icon: 'share' }
  ];

  // Get folder icon based on type
  const getFolderIcon = (iconType) => {
    switch (iconType) {
      case 'lock':
        return (
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        );
      case 'share':
        return (
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
          </svg>
        );
      case 'add':
        return (
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
          </svg>
        );
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-100 mb-4">Quick Access</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Map through folders */}
        {defaultFolders.map((folder) => (
          <div
            key={folder.id}
            className="bg-gray-800 rounded-lg p-5 flex flex-col items-center cursor-pointer shadow hover:bg-gray-750 transition-colors"
            onClick={() => onFolderClick && onFolderClick(folder)}
          >
            <div className="w-14 h-14 bg-gray-700 rounded-lg flex items-center justify-center mb-3">
              {getFolderIcon(folder.icon)}
            </div>
            <h3 className="text-md font-medium text-gray-200 text-center">
              {folder.name}
            </h3>
          </div>
        ))}
        
        {/* Add Folder Card */}
        <div
          className="bg-gray-800 rounded-lg p-5 flex flex-col items-center cursor-pointer shadow border border-dashed border-gray-600 hover:border-indigo-400 transition-colors"
          onClick={onAddFolder}
        >
          <div className="w-14 h-14 bg-indigo-500 bg-opacity-10 rounded-lg flex items-center justify-center mb-3">
            {getFolderIcon('add')}
          </div>
          <h3 className="text-md font-medium text-gray-200 text-center">
            Add Folder
          </h3>
        </div>
      </div>
    </div>
  );
};

export default QuickAccess;