// import React, { useEffect, useState, useRef } from 'react';
// import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import { 
//   signInWithPopup, 
//   signInWithRedirect, 
//   getRedirectResult, 
//   GoogleAuthProvider,
//   browserSessionPersistence,
//   setPersistence,
//   signOut,
//   onAuthStateChanged
// } from 'firebase/auth';
// import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
// import { auth, db } from '../../firebase/config.js'; 

// const Login = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [isAuthenticating, setIsAuthenticating] = useState(false);
//   const [authMessage, setAuthMessage] = useState("Please wait...");
//   const authInProgressRef = useRef(false);
//   const isMobileRef = useRef(false);
//   const lastAuthTimeRef = useRef(0);
//   const navigatingRef = useRef(false);
//   const processedAuthRef = useRef(false); // New ref to track if we've processed auth

//   // Detect if device is mobile
//   useEffect(() => {
//     const checkMobile = () => {
//       const userAgent = window.navigator.userAgent.toLowerCase();
//       isMobileRef.current = /android|webos|iphone|ipad|ipod|blackberry|windows phone/.test(userAgent);
//       console.log("Device detected as:", isMobileRef.current ? "mobile" : "desktop");
//     };
    
//     checkMobile();
    
//     // Check if we're in the process of authentication
//     const urlParams = new URLSearchParams(window.location.search);
//     if (urlParams.has('authStart')) {
//       console.log("Auth start parameter detected");
//       setIsAuthenticating(true);
//       setAuthMessage("Authentication in progress...");
//       authInProgressRef.current = true;
      
//       // Store the timestamp when auth started
//       lastAuthTimeRef.current = parseInt(urlParams.get('authStart') || Date.now());
//     }
//   }, []);

//   // Function to navigate safely
//   const safeNavigate = (path) => {
//     if (navigatingRef.current) {
//       console.log("Navigation already in progress, skipping duplicate");
//       return;
//     }
    
//     navigatingRef.current = true;
//     console.log(`Navigating to: ${path}`);
    
//     // Clear auth parameters from URL before navigating
//     window.history.replaceState({}, document.title, window.location.pathname);
    
//     // Add a small delay for UI to update
//     setTimeout(() => {
//       navigate(path);
//     }, 500);
//   };

//   // Handle redirect results as soon as component mounts - critical for mobile flows
//   useEffect(() => {
//     const checkRedirectResult = async () => {
//       try {
//         console.log("Checking for redirect result...");
        
//         if (processedAuthRef.current) {
//           console.log("Already processed auth in this session, skipping redirect check");
//           return;
//         }
        
//         // Check if we need to run this - must be something in URL or auth in progress
//         const urlParams = new URLSearchParams(window.location.search);
//         const hasAuthParams = urlParams.has('authStart');
//         const recentAuth = (Date.now() - lastAuthTimeRef.current) < 60000; // 1 minute window
        
//         // Skip if we have no evidence of auth flow
//         if (!hasAuthParams && !recentAuth && !authInProgressRef.current) {
//           console.log("No auth parameters, skipping redirect result check");
//           return;
//         }
        
//         // Set loading state while we check
//         setIsAuthenticating(true);
//         setAuthMessage("Verifying your authentication...");
        
//         // Get redirect result - this is crucial for iOS
//         const result = await getRedirectResult(auth);
//         if (result?.user) {
//           console.log("Found user from redirect result:", result.user.email);
//           processedAuthRef.current = true;
//           await handleUserLogin(result.user);
//         } else {
//           console.log("No redirect result found, checking current user");
          
//           // Check if we already have a user
//           const currentUser = auth.currentUser;
//           if (currentUser && hasAuthParams) {
//             console.log("User already authenticated:", currentUser.email);
//             processedAuthRef.current = true;
//             await handleUserLogin(currentUser);
//           } else if (hasAuthParams) {
//             // We had auth params but no user - maybe wait a bit more
//             console.log("Auth parameters present but no user yet, maintaining overlay");
//             setTimeout(() => {
//               // Final check - if we still have auth params but no navigation happened
//               if (!navigatingRef.current && !processedAuthRef.current) {
//                 console.log("Auth flow abandoned or failed, resetting UI");
//                 setIsAuthenticating(false);
//                 // Clear URL parameters
//                 window.history.replaceState({}, document.title, window.location.pathname);
//               }
//             }, 5000); // Reasonable timeout
//           } else {
//             // No evidence we are in an auth flow
//             setIsAuthenticating(false);
//           }
//         }
//       } catch (error) {
//         console.error("Error checking redirect result:", error);
//         setIsAuthenticating(false);
//         setError("Authentication error. Please try again.");
//       }
//     };
    
//     // Run this check immediately
//     checkRedirectResult();
//   }, []);

//   // Add a separate auth state listener for continuous monitoring
//   useEffect(() => {
//     console.log("Setting up auth state monitor");
    
//     const globalAuthMonitor = onAuthStateChanged(auth, async (user) => {
//       console.log("Auth state changed - user:", user ? user.email : "none");
      
//       // Don't duplicate auth handling if we've processed via redirect
//       if (processedAuthRef.current) {
//         console.log("Auth already processed, ignoring auth state change");
//         return;
//       }
      
//       // Process user login if:
//       // 1. We have a user
//       // 2. AND We're in an auth flow (auth in progress or URL has authStart)
//       // 3. AND We're not already navigating
//       const urlParams = new URLSearchParams(window.location.search);
//       const hasAuthParams = urlParams.has('authStart');
//       const recentAuth = (Date.now() - lastAuthTimeRef.current) < 60000; // 1 minute window
      
//       if (user && (authInProgressRef.current || hasAuthParams || recentAuth) && !navigatingRef.current) {
//         console.log("Auth state change detected with valid user during auth flow");
        
//         // Mark as processed to prevent duplicate handling
//         processedAuthRef.current = true;
        
//         setIsAuthenticating(true);
//         setAuthMessage("Account authenticated, preparing your dashboard...");
        
//         // Process login
//         await handleUserLogin(user);
//       }
//     });
    
//     return () => globalAuthMonitor();
//   }, []);

//   // Handle user login and redirection logic
//   const handleUserLogin = async (user) => {
//     try {
//       if (!user) {
//         console.error("handleUserLogin called with no user");
//         setIsAuthenticating(false);
//         return;
//       }
      
//       // Skip if we're already navigating
//       if (navigatingRef.current) {
//         console.log("Already navigating, skipping duplicate login handling");
//         return;
//       }
      
//       console.log("Processing login for user:", user.email);
//       setLoading(true);
//       setIsAuthenticating(true);
      
//       // Update auth message to show progress
//       setAuthMessage("Verified, retrieving your account details...");
      
//       // Check if user exists in our database
//       const userRef = doc(db, 'users', user.uid);
//       const userDoc = await getDoc(userRef);
      
//       if (userDoc.exists() && userDoc.data().phoneVerified) {
//         // User exists and is verified - redirect to dashboard
//         // Update last login
//         setAuthMessage("Account confirmed, preparing dashboard...");
//         await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
        
//         // Critical for mobile - using safeNavigate to prevent duplicate navigations
//         console.log("User verified, redirecting to dashboard...");
//         safeNavigate('/dashboard');
//       } else if (userDoc.exists()) {
//         // User exists but not fully onboarded
//         setAuthMessage("Account found, completing your profile setup...");
//         console.log("User needs profile completion");
//         safeNavigate('/complete-profile');
//       } else {
//         // New user - create user document
//         setAuthMessage("Creating your new account...");
//         console.log("Creating new user document");
//         await setDoc(userRef, {
//           uid: user.uid,
//           email: user.email,
//           displayName: user.displayName,
//           photoURL: user.photoURL,
//           createdAt: serverTimestamp(),
//           lastLogin: serverTimestamp(),
//           phoneVerified: false
//         });
//         safeNavigate('/complete-profile');
//       }
//     } catch (error) {
//       console.error("Error processing login:", error);
//       setError("Unable to complete login process. Please try again.");
//       setIsAuthenticating(false);
      
//       // If we encounter errors during user processing, sign out to clean state
//       try {
//         await signOut(auth);
//       } catch (e) {
//         console.error("Error signing out:", e);
//       }
      
//       // Reset auth state
//       authInProgressRef.current = false;
//       navigatingRef.current = false;
//       processedAuthRef.current = false;
//     } finally {
//       setLoading(false);
//       // We don't hide the overlay - it stays until navigation completes
//     }
//   };

//   // Handle Google sign in with mobile-specific improvements
//   const handleGoogleSignIn = async () => {
//     try {
//       // Skip if already in progress
//       if (navigatingRef.current || authInProgressRef.current) {
//         console.log("Auth already in progress, ignoring duplicate click");
//         return;
//       }
      
//       setLoading(true);
//       setError(null);
      
//       // Mark that auth is in progress
//       authInProgressRef.current = true;
//       lastAuthTimeRef.current = Date.now();
      
//       // Immediately show the overlay and ensure it stays visible
//       setIsAuthenticating(true);
//       setAuthMessage("Connecting to Google...");
      
//       // Set persistence to ensure auth state survives redirects
//       await setPersistence(auth, browserSessionPersistence);
//       console.log("Set auth persistence to browserSessionPersistence");
      
//       // Clear any existing auth session to ensure a clean start
//       try {
//         await signOut(auth);
//         console.log("Signed out existing user before new auth");
//       } catch (e) {
//         console.log("No active session to sign out from");
//       }
      
//       // Setup Google auth provider with optimal settings for mobile
//       const provider = new GoogleAuthProvider();
      
//       // Important scopes
//       provider.addScope('profile');
//       provider.addScope('email');
      
//       // For mobile - CRITICAL - force account selection EVERY time
//       provider.setCustomParameters({
//         prompt: 'select_account'
//       });
      
//       // Mobile-specific logic
//       if (isMobileRef.current) {
//         console.log("Using mobile authentication flow");
        
//         // Add auth parameter to track state across redirects - use timestamp for debugging
//         const timestamp = Date.now();
//         const currentUrl = new URL(window.location.href);
//         currentUrl.searchParams.set('authStart', timestamp.toString());
//         window.history.replaceState({}, document.title, currentUrl.toString());
        
//         setAuthMessage("Redirecting to Google sign-in...");
        
//         // Reset the processedAuth flag as we're starting a new auth flow
//         processedAuthRef.current = false;
        
//         // iOS Safari specific tweak - slightly longer delay before redirect
//         setTimeout(async () => {
//           try {
//             console.log("Initiating redirect auth flow with timestamp:", timestamp);
//             await signInWithRedirect(auth, provider);
//             // Page will reload after this
//           } catch (redirectError) {
//             console.error("Error during redirect:", redirectError);
//             setIsAuthenticating(false);
//             authInProgressRef.current = false;
//             setError("Failed to connect to Google. Please try again.");
//           }
//         }, 800); // Increased delay for iOS
//       } else {
//         // Desktop logic
//         try {
//           console.log("Using desktop popup authentication");
//           setAuthMessage("Please select your Google account...");
//           const result = await signInWithPopup(auth, provider);
//           console.log("Popup auth successful");
//           setAuthMessage("Account selected, verifying...");
//           // Process the user directly since we already have the result
//           await handleUserLogin(result.user);
//         } catch (popupError) {
//           console.log("Popup error:", popupError);
          
//           if (popupError.code === 'auth/popup-closed-by-user' || 
//               popupError.code === 'auth/cancelled-popup-request') {
//             console.log("Popup was closed or cancelled");
//             setIsAuthenticating(false);
//             authInProgressRef.current = false;
//           } else {
//             // For other errors, try redirect as fallback
//             console.log("Popup error, falling back to redirect");
//             setAuthMessage("Redirecting to Google sign-in...");
            
//             // Add auth parameter
//             const timestamp = Date.now();
//             const currentUrl = new URL(window.location.href);
//             currentUrl.searchParams.set('authStart', timestamp.toString());
//             window.history.replaceState({}, document.title, currentUrl.toString());
            
//             // Reset the processedAuth flag as we're starting a new auth flow
//             processedAuthRef.current = false;
            
//             setTimeout(async () => {
//               await signInWithRedirect(auth, provider);
//             }, 500);
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error in sign-in process:", error);
//       let errorMessage = "Unable to sign in with Google. Please try again.";
      
//       if (error.code === 'auth/network-request-failed') {
//         errorMessage = "Network error. Please check your internet connection.";
//       } else if (error.code === 'auth/user-disabled') {
//         errorMessage = "This account has been disabled. Please contact support.";
//       }
      
//       setError(errorMessage);
//       setIsAuthenticating(false);
//       authInProgressRef.current = false;
//       navigatingRef.current = false;
//       processedAuthRef.current = false;
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
//       {/* Full-screen authentication overlay */}
//       {isAuthenticating && (
//         <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex flex-col items-center justify-center">
//           <div className="text-center p-8 max-w-md bg-gray-800/80 rounded-xl shadow-2xl border border-gray-700/50">
//             <div className="flex justify-center mb-6">
//               <svg className="animate-spin h-16 w-16 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//             </div>
//             <h2 className="text-2xl font-bold text-white mb-2">Signing in</h2>
//             <p className="text-indigo-300 text-lg">{authMessage}</p>
//           </div>
//         </div>
//       )}

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
//           {error && (
//             <div className="mb-4 p-3 bg-red-900/50 text-red-200 rounded-md text-sm">
//               {error}
//               <button 
//                 onClick={() => setError(null)} 
//                 className="ml-2 text-red-200 hover:text-white focus:outline-none"
//               >
//                 ✕
//               </button>
//             </div>
//           )}
          
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={handleGoogleSignIn}
//             disabled={loading || isAuthenticating || navigatingRef.current}
//             className={`w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800 transition-all duration-200 ${(loading || isAuthenticating) ? 'opacity-70 cursor-not-allowed' : ''}`}
//           >
//             {loading ? (
//               <>
//                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 Connecting...
//               </>
//             ) : (
//               <>
//                 <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                   <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
//                     <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
//                     <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
//                     <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
//                     <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
//                   </g>
//                 </svg>
//                 Continue with Google
//               </>
//             )}
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

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  GoogleAuthProvider,
  browserSessionPersistence,
  setPersistence,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase/config.js'; 

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const authInProgressRef = useRef(false);
  const isMobileRef = useRef(false);
  const lastAuthTimeRef = useRef(0);
  const navigatingRef = useRef(false);
  const processedAuthRef = useRef(false);

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      isMobileRef.current = /android|webos|iphone|ipad|ipod|blackberry|windows phone/.test(userAgent);
      console.log("Device detected as:", isMobileRef.current ? "mobile" : "desktop");
    };
    
    checkMobile();
    
    // Check if we're in the process of authentication
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('authStart')) {
      console.log("Auth start parameter detected");
      authInProgressRef.current = true;
      
      // Store the timestamp when auth started
      lastAuthTimeRef.current = parseInt(urlParams.get('authStart') || Date.now());
    }
  }, []);

  // Function to navigate safely
  const safeNavigate = (path) => {
    if (navigatingRef.current) {
      console.log("Navigation already in progress, skipping duplicate");
      return;
    }
    
    navigatingRef.current = true;
    console.log(`Navigating to: ${path}`);
    
    // Clear auth parameters from URL before navigating
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Add a small delay for UI to update
    setTimeout(() => {
      navigate(path);
    }, 500);
  };

  // Handle redirect results as soon as component mounts - critical for mobile flows
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        console.log("Checking for redirect result...");
        
        if (processedAuthRef.current) {
          console.log("Already processed auth in this session, skipping redirect check");
          return;
        }
        
        // Check if we need to run this - must be something in URL or auth in progress
        const urlParams = new URLSearchParams(window.location.search);
        const hasAuthParams = urlParams.has('authStart');
        const recentAuth = (Date.now() - lastAuthTimeRef.current) < 60000; // 1 minute window
        
        // Skip if we have no evidence of auth flow
        if (!hasAuthParams && !recentAuth && !authInProgressRef.current) {
          console.log("No auth parameters, skipping redirect result check");
          return;
        }
        
        // Get redirect result - this is crucial for iOS
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log("Found user from redirect result:", result.user.email);
          processedAuthRef.current = true;
          await handleUserLogin(result.user);
        } else {
          console.log("No redirect result found, checking current user");
          
          // Check if we already have a user
          const currentUser = auth.currentUser;
          if (currentUser && hasAuthParams) {
            console.log("User already authenticated:", currentUser.email);
            processedAuthRef.current = true;
            await handleUserLogin(currentUser);
          } else if (hasAuthParams) {
            // We had auth params but no user - maybe wait a bit more
            console.log("Auth parameters present but no user yet");
            setTimeout(() => {
              // Final check - if we still have auth params but no navigation happened
              if (!navigatingRef.current && !processedAuthRef.current) {
                console.log("Auth flow abandoned or failed, resetting UI");
                // Clear URL parameters
                window.history.replaceState({}, document.title, window.location.pathname);
              }
            }, 5000); // Reasonable timeout
          }
        }
      } catch (error) {
        console.error("Error checking redirect result:", error);
        setError("Authentication error. Please try again.");
      }
    };
    
    // Run this check immediately
    checkRedirectResult();
  }, []);

  // Add a separate auth state listener for continuous monitoring
  useEffect(() => {
    console.log("Setting up auth state monitor");
    
    const globalAuthMonitor = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed - user:", user ? user.email : "none");
      
      // Don't duplicate auth handling if we've processed via redirect
      if (processedAuthRef.current) {
        console.log("Auth already processed, ignoring auth state change");
        return;
      }
      
      // Process user login if:
      // 1. We have a user
      // 2. AND We're in an auth flow (auth in progress or URL has authStart)
      // 3. AND We're not already navigating
      const urlParams = new URLSearchParams(window.location.search);
      const hasAuthParams = urlParams.has('authStart');
      const recentAuth = (Date.now() - lastAuthTimeRef.current) < 60000; // 1 minute window
      
      if (user && (authInProgressRef.current || hasAuthParams || recentAuth) && !navigatingRef.current) {
        console.log("Auth state change detected with valid user during auth flow");
        
        // Mark as processed to prevent duplicate handling
        processedAuthRef.current = true;
        
        // Process login
        await handleUserLogin(user);
      }
    });
    
    return () => globalAuthMonitor();
  }, []);

  // Handle user login and redirection logic
  const handleUserLogin = async (user) => {
    try {
      if (!user) {
        console.error("handleUserLogin called with no user");
        return;
      }
      
      // Skip if we're already navigating
      if (navigatingRef.current) {
        console.log("Already navigating, skipping duplicate login handling");
        return;
      }
      
      console.log("Processing login for user:", user.email);
      
      // Check if user exists in our database
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists() && userDoc.data().phoneVerified) {
        // User exists and is verified - redirect to dashboard
        // Update last login
        await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
        
        // Critical for mobile - using safeNavigate to prevent duplicate navigations
        console.log("User verified, redirecting to dashboard...");
        safeNavigate('/dashboard');
      } else if (userDoc.exists()) {
        // User exists but not fully onboarded
        console.log("User needs profile completion");
        safeNavigate('/complete-profile');
      } else {
        // New user - create user document
        console.log("Creating new user document");
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          phoneVerified: false
        });
        safeNavigate('/complete-profile');
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
      
      // Reset auth state
      authInProgressRef.current = false;
      navigatingRef.current = false;
      processedAuthRef.current = false;
    }
  };

  // Handle Google sign in with mobile-specific improvements
  // Add state for button text
  const [buttonText, setButtonText] = useState("Continue with Google");

  const handleGoogleSignIn = async () => {
    try {
      // Skip if already in progress
      if (navigatingRef.current || authInProgressRef.current) {
        console.log("Auth already in progress, ignoring duplicate click");
        return;
      }
      
      setError(null);
      setButtonText("Signing in...");
      
      // Mark that auth is in progress
      authInProgressRef.current = true;
      lastAuthTimeRef.current = Date.now();
      
      // Set persistence to ensure auth state survives redirects
      await setPersistence(auth, browserSessionPersistence);
      console.log("Set auth persistence to browserSessionPersistence");
      
      // Clear any existing auth session to ensure a clean start
      try {
        await signOut(auth);
        console.log("Signed out existing user before new auth");
      } catch (e) {
        console.log("No active session to sign out from");
      }
      
      // Setup Google auth provider with optimal settings for mobile
      const provider = new GoogleAuthProvider();
      
      // Important scopes
      provider.addScope('profile');
      provider.addScope('email');
      
      // For mobile - CRITICAL - force account selection EVERY time
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Mobile-specific logic
      if (isMobileRef.current) {
        console.log("Using mobile authentication flow");
        
        // Add auth parameter to track state across redirects - use timestamp for debugging
        const timestamp = Date.now();
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('authStart', timestamp.toString());
        window.history.replaceState({}, document.title, currentUrl.toString());
        
        // Reset the processedAuth flag as we're starting a new auth flow
        processedAuthRef.current = false;
        
        // iOS Safari specific tweak - slightly longer delay before redirect
        setTimeout(async () => {
          try {
            console.log("Initiating redirect auth flow with timestamp:", timestamp);
            await signInWithRedirect(auth, provider);
            // Page will reload after this
          } catch (redirectError) {
            console.error("Error during redirect:", redirectError);
            authInProgressRef.current = false;
            setButtonText("Continue with Google");
            setError("Failed to connect to Google. Please try again.");
          }
        }, 800); // Increased delay for iOS
      } else {
        // Desktop logic
        try {
          console.log("Using desktop popup authentication");
          const result = await signInWithPopup(auth, provider);
          console.log("Popup auth successful");
          // Process the user directly since we already have the result
          await handleUserLogin(result.user);
        } catch (popupError) {
          console.log("Popup error:", popupError);
          
          if (popupError.code === 'auth/popup-closed-by-user' || 
              popupError.code === 'auth/cancelled-popup-request') {
            console.log("Popup was closed or cancelled");
            authInProgressRef.current = false;
            setButtonText("Continue with Google");
          } else {
            // For other errors, try redirect as fallback
            console.log("Popup error, falling back to redirect");
            
            // Add auth parameter
            const timestamp = Date.now();
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('authStart', timestamp.toString());
            window.history.replaceState({}, document.title, currentUrl.toString());
            
            // Reset the processedAuth flag as we're starting a new auth flow
            processedAuthRef.current = false;
            
            setTimeout(async () => {
              await signInWithRedirect(auth, provider);
            }, 500);
          }
        }
      }
    } catch (error) {
      console.error("Error in sign-in process:", error);
      let errorMessage = "Unable to sign in with Google. Please try again.";
      
      if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = "This account has been disabled. Please contact support.";
      }
      
      setError(errorMessage);
      setButtonText("Continue with Google");
      authInProgressRef.current = false;
      navigatingRef.current = false;
      processedAuthRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
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
            disabled={navigatingRef.current || authInProgressRef.current}
            className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800 transition-all duration-200"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
              </g>
            </svg>
            {buttonText}
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