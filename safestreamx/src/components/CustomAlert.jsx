import React from 'react';

const CustomAlert = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-gray-700 rounded-lg shadow-xl w-80 overflow-hidden">
        {/* Alert Header */}
        <div className="bg-gray-800 px-4 py-2 flex items-center">
          <svg className="h-5 w-5 text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-sm font-medium text-white">Confirmation</h3>
        </div>
        
        {/* Alert Message */}
        <div className="px-4 py-4 bg-gray-700 text-gray-200 text-sm">
          <p>{message}</p>
        </div>
        
        {/* Alert Actions */}
        <div className="bg-gray-700 px-4 py-3 flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-1 rounded-md text-xs font-medium bg-gray-600 hover:bg-gray-500 text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors focus:outline-none"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;