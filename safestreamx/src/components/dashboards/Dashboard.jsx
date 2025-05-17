// import React, { useEffect, useState } from 'react';
// import { onAuthStateChanged } from 'firebase/auth';
// import { auth } from '../../firebase/config';
// import { useNavigate } from 'react-router-dom';

// // Import components
// import Sidebar from './Sidebar';
// import TopBar from './TopBar';
// import QuickAccess from './QuickAccess';

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile sidebar toggle

//   useEffect(() => {
//     // Check if user is authenticated
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       if (currentUser) {
//         setUser(currentUser);
//       } else {
//         // Redirect to login if not authenticated
//         navigate('/login');
//       }
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, [navigate]);

//   // Handle sidebar toggle for mobile
//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   // Basic handlers for dashboard functionality
//   const handleFolderClick = (folder) => {
//     console.log('Folder clicked:', folder);
//     // Implement folder navigation
//   };

//   const handleAddFolder = () => {
//     console.log('Add folder clicked');
//     // Implement add folder functionality
//   };

//   const handleFileUpload = (files) => {
//     console.log('Uploading files:', files);
//     // Implement file upload functionality
//     return new Promise(resolve => {
//       setTimeout(() => {
//         // Simulate upload completion
//         resolve();
//       }, 2000);
//     });
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-900 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col md:flex-row">
//       {/* Mobile Sidebar Toggle Button */}
//       <div className="md:hidden bg-gray-800 p-4 flex items-center justify-between">
//         <div className="flex items-center text-indigo-400">
//           <svg className="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//             <path d="M9 12L11 14L15 10M20.618 5.984C17.45 2.667 12.442 2.614 9.207 5.856C5.973 9.097 5.941 14.097 9.145 17.373L12 20.294L14.855 17.373C18.059 14.097 18.027 9.097 14.793 5.856C13.234 4.29 11.14 3.514 9.029 3.525" 
//               strokeWidth="2" 
//               strokeLinecap="round" 
//               strokeLinejoin="round" 
//               stroke="currentColor" />
//           </svg>
//           <span className="text-xl font-bold">SafeStreamX</span>
//         </div>
//         <button 
//           onClick={toggleSidebar}
//           className="text-gray-300 hover:text-white"
//         >
//           <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
//           </svg>
//         </button>
//       </div>

//       {/* Sidebar */}
//       <div className={`
//         ${sidebarOpen ? 'block' : 'hidden'} 
//         md:block w-full md:w-64 lg:w-72 bg-gray-800 
//         fixed md:static inset-0 z-20
//         overflow-y-auto md:overflow-y-visible
//       `}>
//         <Sidebar user={user} closeSidebar={() => setSidebarOpen(false)} />
//       </div>
      
//       {/* Overlay for mobile when sidebar is open */}
//       {sidebarOpen && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
//           onClick={toggleSidebar}
//         ></div>
//       )}
      
//       {/* Main Content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* TopBar */}
//         <TopBar onUpload={handleFileUpload} />
        
//         {/* Main Dashboard Content */}
//         <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
//           {/* Welcome Message */}
//           <div className="bg-gray-800 rounded-lg p-6 mb-8 text-center">
//             <h2 className="text-xl font-bold text-gray-100 mb-2">Welcome to SafeStreamX</h2>
//             <p className="text-gray-300">
//               Your secure file sharing platform with end-to-end encryption
//             </p>
//           </div>
          
//           {/* Quick Access */}
//           <QuickAccess 
//             onFolderClick={handleFolderClick}
//             onAddFolder={handleAddFolder}
//           />
          
//           {/* Placeholder for files - will be implemented later */}
//           <div className="bg-gray-800 rounded-lg p-8 text-center">
//             <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
//             </svg>
//             <h3 className="mt-2 text-sm font-medium text-gray-300">No files found</h3>
//             <p className="mt-1 text-sm text-gray-400">Get started by uploading a file or creating a folder.</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';

// Import components
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import QuickAccess from './QuickAccess';
import FileUpload from './FileUpload';
import FileList from './FileList';
import CreateFolderModal from './CreateFolderModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentFolder, setCurrentFolder] = useState('root');
  const [folderPath, setFolderPath] = useState([{ id: 'root', name: 'Home' }]);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Check if user is authenticated
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Redirect to login if not authenticated
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Handle sidebar toggle for mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle folder navigation
  const handleFolderClick = (folderId, folderName) => {
    setCurrentFolder(folderId);
    
    // Update folder path
    const pathIndex = folderPath.findIndex(folder => folder.id === folderId);
    if (pathIndex >= 0) {
      // Folder exists in path, go back to that level
      setFolderPath(folderPath.slice(0, pathIndex + 1));
    } else {
      // Add folder to path
      setFolderPath([...folderPath, { id: folderId, name: folderName }]);
    }
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (folderId, index) => {
    setCurrentFolder(folderId);
    setFolderPath(folderPath.slice(0, index + 1));
  };

  // Handle folder creation
  const handleFolderCreated = () => {
    // Trigger a refresh of the file list
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle file upload completion
  const handleUploadComplete = () => {
    // Trigger a refresh of the file list
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle quick access folder click
  const handleQuickAccessClick = (folder) => {
    if (folder.id === 'create-folder') {
      setShowCreateFolderModal(true);
    } else {
      // Handle navigation to special folders
      // For example: 'shared-with-me', 'project-files', etc.
      // In a real app, this would use actual folder IDs from the database
      console.log(`Navigate to ${folder.name}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col md:flex-row">
      {/* Mobile Sidebar Toggle Button */}
      <div className="md:hidden bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center text-indigo-400">
          <svg className="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M20.618 5.984C17.45 2.667 12.442 2.614 9.207 5.856C5.973 9.097 5.941 14.097 9.145 17.373L12 20.294L14.855 17.373C18.059 14.097 18.027 9.097 14.793 5.856C13.234 4.29 11.14 3.514 9.029 3.525" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              stroke="currentColor" />
          </svg>
          <span className="text-xl font-bold">SafeStreamX</span>
        </div>
        <button 
          onClick={toggleSidebar}
          className="text-gray-300 hover:text-white"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'block' : 'hidden'} 
        md:block w-full md:w-64 lg:w-72 bg-gray-800 
        fixed md:static inset-0 z-20
        overflow-y-auto md:overflow-y-visible
      `}>
        <Sidebar user={user} closeSidebar={() => setSidebarOpen(false)} />
      </div>
      
      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TopBar with File Upload */}
        <div className="bg-gray-800 px-4 py-3 shadow-md flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-100">Dashboard</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowCreateFolderModal(true)}
              className="flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Folder
            </button>
            <FileUpload 
              onUploadComplete={handleUploadComplete}
              currentFolder={currentFolder}
            />
          </div>
        </div>
        
        {/* Main Dashboard Content */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {currentFolder === 'root' && (
            <>
              {/* Welcome Message */}
              <div className="bg-gray-800 rounded-lg p-6 mb-8 text-center">
                <h2 className="text-xl font-bold text-gray-100 mb-2">Welcome to SafeStreamX</h2>
                <p className="text-gray-300">
                  Your secure file sharing platform with end-to-end encryption
                </p>
              </div>
              
              {/* Quick Access */}
              <QuickAccess 
                onFolderClick={handleQuickAccessClick}
                onAddFolder={() => setShowCreateFolderModal(true)}
              />
            </>
          )}
          
          {/* Breadcrumb navigation */}
          <div className="flex items-center text-sm mb-4 overflow-x-auto">
            {folderPath.map((folder, index) => (
              <React.Fragment key={folder.id}>
                {index > 0 && (
                  <svg className="mx-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                )}
                <button
                  onClick={() => handleBreadcrumbClick(folder.id, index)}
                  className={`hover:text-indigo-400 whitespace-nowrap ${
                    index === folderPath.length - 1 ? 'text-indigo-400 font-medium' : 'text-gray-300'
                  }`}
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </div>
          
          {/* File List */}
          <FileList 
            key={refreshTrigger} // Force re-render when files change
            currentFolder={currentFolder}
            onFolderClick={handleFolderClick}
          />
        </div>
      </div>
      
      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        parentFolder={currentFolder}
        onFolderCreated={handleFolderCreated}
      />
    </div>
  );
};

export default Dashboard;