import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ user, closeSidebar }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Mobile close button */}
      <div className="flex justify-between items-center md:hidden mb-4">
        <span className="text-lg font-bold text-indigo-400">Menu</span>
        {closeSidebar && (
          <button 
            onClick={closeSidebar}
            className="text-gray-300 hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Logo - Hidden on mobile since it's in the top bar */}
      <div className="hidden md:flex items-center text-indigo-400 mb-8">
        <svg className="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12L11 14L15 10M20.618 5.984C17.45 2.667 12.442 2.614 9.207 5.856C5.973 9.097 5.941 14.097 9.145 17.373L12 20.294L14.855 17.373C18.059 14.097 18.027 9.097 14.793 5.856C13.234 4.29 11.14 3.514 9.029 3.525" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            stroke="currentColor" />
        </svg>
        <span className="text-xl font-bold">SafeStreamX</span>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-2 flex-1">
        <ul className="space-y-2 md:space-y-4">
          <li>
            <a
              href="#"
              className="flex items-center px-4 py-3 text-sm rounded-md bg-gray-700 text-indigo-400"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
              </svg>
              Dashboard
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center px-4 py-3 text-sm rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              My Files
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center px-4 py-3 text-sm rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
              </svg>
              Shared Files
            </a>
          </li>
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="mt-6 pt-4 border-t border-gray-700 flex items-center">
        <div className="flex-shrink-0">
          {user?.photoURL ? (
            <img
              className="h-10 w-10 rounded-full"
              src={user.photoURL}
              alt={user.displayName || 'User'}
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-medium">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
          )}
        </div>
        <div className="ml-3 min-w-0 flex-1">
          <div className="text-sm font-medium text-white truncate">
            {user?.displayName || 'User'}
          </div>
          <div className="text-xs text-gray-400 truncate">
            {user?.email || ''}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="ml-2 flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;