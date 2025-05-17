// import React, { useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
// import { doc, getDoc } from 'firebase/firestore';
// import { auth, db } from '../../firebase/config.js'; 

// const Login = () => {
//   const navigate = useNavigate();

//   // Check if user is already logged in
//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged(async (user) => {
//       if (user) {
//         // Check if user exists in our database and is verified
//         const userRef = doc(db, 'users', user.uid);
//         const userDoc = await getDoc(userRef);
        
//         if (userDoc.exists() && userDoc.data().phoneVerified) {
//           // User exists and is verified - redirect to dashboard
//           navigate('/dashboard');
//         } else {
//           // User exists but profile not complete - redirect to profile completion
//           navigate('/complete-profile');
//         }
//       }
//     });

//     return () => unsubscribe();
//   }, [navigate]);

//   const handleGoogleSignIn = async () => {
//     try {
//       const provider = new GoogleAuthProvider();
//       const result = await signInWithPopup(auth, provider);
//       // Redirect will be handled by the useEffect above
//     } catch (error) {
//       console.error("Error signing in with Google:", error);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-xl"
//       >
//         <div className="text-center">
//           <div className="flex justify-center">
//             <div className="flex-shrink-0 flex items-center text-indigo-400">
//               <svg className="h-10 w-10 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M9 12L11 14L15 10M20.618 5.984C17.45 2.667 12.442 2.614 9.207 5.856C5.973 9.097 5.941 14.097 9.145 17.373L12 20.294L14.855 17.373C18.059 14.097 18.027 9.097 14.793 5.856C13.234 4.29 11.14 3.514 9.029 3.525" 
//                   strokeWidth="2" 
//                   strokeLinecap="round" 
//                   strokeLinejoin="round" 
//                   stroke="currentColor" />
//               </svg>
//               <span className="text-xl font-bold">SafeStreamX</span>
//             </div>
//           </div>
//           <h2 className="mt-6 text-2xl font-extrabold text-gray-100">
//             Sign in to your account
//           </h2>
//           <p className="mt-2 text-sm text-gray-400">
//             Access your secure file sharing platform
//           </p>
//         </div>
        
//         <div className="mt-8">
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={handleGoogleSignIn}
//             className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800 transition-all duration-200"
//           >
//             <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
//                 <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
//                 <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
//                 <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
//                 <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
//               </g>
//             </svg>
//             Continue with Google
//           </motion.button>
          
//           <div className="mt-6">
//             <p className="text-xs text-center text-gray-400">
//               By signing in, you agree to our 
//               <a href="/terms" className="text-indigo-400 hover:text-indigo-300 ml-1">
//                 Terms of Service
//               </a>
//               <span className="mx-1">and</span>
//               <a href="/privacy" className="text-indigo-400 hover:text-indigo-300">
//                 Privacy Policy
//               </a>
//             </p>
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default Login;

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  GoogleAuthProvider,
  browserSessionPersistence,
  setPersistence,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase/config.js'; 

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check for any lingering authentication issues on component mount
  useEffect(() => {
    const cleanupAuth = async () => {
      try {
        // Check if we're in a weird state with auth issues
        const currentUser = auth.currentUser;
        if (currentUser) {
          // If we have a user but got redirected to login page,
          // it might indicate auth issues, so let's re-authenticate
          await signOut(auth);
          console.log("Cleaned up previous auth session");
        }
        
        // Set auth persistence to SESSION to avoid issues across sessions
        await setPersistence(auth, browserSessionPersistence);
      } catch (err) {
        console.error("Auth cleanup error:", err);
      }
    };
    
    cleanupAuth();
  }, []);

  // Check for redirect results and auth state
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check for redirect result
        const result = await getRedirectResult(auth).catch(err => {
          console.log("Redirect result error (this is often normal):", err);
          return null;
        });
        
        if (result?.user) {
          await handleUserLogin(result.user);
        }

        // Then listen for auth state changes
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          if (user) {
            await handleUserLogin(user);
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Auth check error:", error);
        setError("An error occurred while checking authentication. Please try again.");
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Handle user login and redirection logic
  const handleUserLogin = async (user) => {
    try {
      setLoading(true);
      // Check if user exists in our database
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists() && userDoc.data().phoneVerified) {
        // User exists and is verified - redirect to dashboard
        // Update last login
        await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
        navigate('/dashboard');
      } else if (userDoc.exists()) {
        // User exists but not fully onboarded
        navigate('/complete-profile');
      } else {
        // New user - create user document
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          phoneVerified: false
        });
        navigate('/complete-profile');
      }
    } catch (error) {
      console.error("Error processing login:", error);
      setError("Unable to complete login process. Please try again.");
      // If we encounter errors during user processing, sign out to clean state
      try {
        await signOut(auth);
      } catch (e) {
        console.error("Error signing out:", e);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, ensure we're signed out to prevent state conflicts
      await signOut(auth).catch(e => {
        console.log("No active session to sign out from");
      });
      
      // Use redirect method by default - more reliable across devices and browsers
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // On desktop, try popup first for better UX
      if (window.innerWidth > 768) {
        try {
          const result = await signInWithPopup(auth, provider);
          // Auth state listener will handle the redirect
        } catch (popupError) {
          console.log("Popup error, falling back to redirect:", popupError);
          // Fall back to redirect for any popup issues
          await signInWithRedirect(auth, provider);
        }
      } else {
        // On mobile, use redirect directly for better reliability
        await signInWithRedirect(auth, provider);
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      let errorMessage = "Unable to sign in with Google. Please try again.";
      
      if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = "Sign-in process was cancelled. Please try again.";
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = "This account has been disabled. Please contact support.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-xl"
      >
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex-shrink-0 flex items-center text-indigo-400">
              <svg className="h-10 w-10 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M20.618 5.984C17.45 2.667 12.442 2.614 9.207 5.856C5.973 9.097 5.941 14.097 9.145 17.373L12 20.294L14.855 17.373C18.059 14.097 18.027 9.097 14.793 5.856C13.234 4.29 11.14 3.514 9.029 3.525" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  stroke="currentColor" />
              </svg>
              <span className="text-xl font-bold">SafeStreamX</span>
            </div>
          </div>
          <h2 className="mt-6 text-2xl font-extrabold text-gray-100">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Access your secure file sharing platform
          </p>
        </div>
        
        <div className="mt-8">
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 text-red-200 rounded-md text-sm">
              {error}
              <button 
                onClick={() => setError(null)} 
                className="ml-2 text-red-200 hover:text-white focus:outline-none"
              >
                ✕
              </button>
            </div>
          )}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={`w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800 transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                  </g>
                </svg>
                Continue with Google
              </>
            )}
          </motion.button>
          
          <div className="mt-6">
            <p className="text-xs text-center text-gray-400">
              By signing in, you agree to our 
              <a href="/terms" className="text-indigo-400 hover:text-indigo-300 ml-1">
                Terms of Service
              </a>
              <span className="mx-1">and</span>
              <a href="/privacy" className="text-indigo-400 hover:text-indigo-300">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;