import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db, storage } from '../../firebase/config.js'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: '',
    photoURL: '',
    phoneNumber: '',
    countryCode: '1', // Default to US
  });
  const [fileUpload, setFileUpload] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [verificationId, setVerificationId] = useState(null);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes countdown
  const [resendDisabled, setResendDisabled] = useState(true);

  // Custom styles for the phone input in dark mode
  const customPhoneInputStyles = `
    /* Main container */
    .react-tel-input {
      font-family: inherit;
    }

    /* Main input field */
    .react-tel-input .form-control {
      width: 100%;
      background-color: #374151 !important; /* Dark background */
      border: 1px solid #4B5563 !important; /* Dark border */
      color: #F3F4F6 !important; /* Light text */
      box-shadow: none !important;
      height: 42px;
    }

    /* Flag dropdown button */
    .react-tel-input .flag-dropdown {
      background-color: #374151 !important; /* Dark background */
      border: 1px solid #4B5563 !important; /* Dark border */
      border-right: none !important;
    }

    /* Open dropdown button */
    .react-tel-input .flag-dropdown.open {
      background-color: #4B5563 !important; /* Slightly lighter when open */
      border-color: #6366F1 !important; /* Indigo highlight */
    }

    /* Selected flag */
    .react-tel-input .selected-flag {
      background-color: #374151 !important; /* Dark background */
      padding: 0 8px 0 11px;
    }

    .react-tel-input .selected-flag:hover, 
    .react-tel-input .selected-flag:focus {
      background-color: #4B5563 !important; /* Slightly lighter on hover */
    }

    /* Arrow in dropdown */
    .react-tel-input .selected-flag .arrow {
      border-top-color: #9CA3AF !important; /* Gray arrow */
    }

    .react-tel-input .selected-flag .arrow.up {
      border-bottom-color: #9CA3AF !important; /* Gray arrow when open */
    }

    /* Dropdown menu */
    .react-tel-input .country-list {
      background-color: #1F2937 !important; /* Dark background */
      border-color: #4B5563 !important; /* Dark border */
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5) !important;
      max-height: 220px !important;
    }

    /* Country item in dropdown */
    .react-tel-input .country-list .country {
      color: #F3F4F6 !important; /* Light text */
    }

    /* Hover state for country item */
    .react-tel-input .country-list .country:hover,
    .react-tel-input .country-list .country.highlight {
      background-color: #374151 !important; /* Darker on hover */
    }

    /* Search box */
    .react-tel-input .search-box {
      background-color: #374151 !important; /* Dark background */
      border-color: #4B5563 !important; /* Dark border */
      color: #F3F4F6 !important; /* Light text */
    }

    /* The selected country */
    .react-tel-input .country-list .country.highlight {
      background-color: #4F46E5 !important; /* Indigo highlight */
    }

    /* Country name and dial code */
    .react-tel-input .country-name, 
    .react-tel-input .dial-code {
      color: #F3F4F6 !important; /* Light text */
    }
  `;

  useEffect(() => {
    // Check if user is logged in
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Pre-fill form with data from user's Google account
        setFormData({
          ...formData,
          displayName: currentUser.displayName || '',
          photoURL: currentUser.photoURL || '',
        });
        
        // Check if user already completed profile
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists() && userDoc.data().phoneVerified) {
          // User already completed profile, redirect to dashboard
          navigate('/dashboard');
        }
      } else {
        // No user is logged in, redirect to login
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Countdown timer for OTP verification
  useEffect(() => {
    let interval;
    if (step === 3 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          const newTimer = prevTimer - 1;
          if (newTimer === 0) {
            setResendDisabled(false);
          }
          return newTimer;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [step, timer]);

  // Setup RecaptchaVerifier
  useEffect(() => {
    // Only set up recaptcha in step 2
    if (step === 2) {
      // Clear any existing recaptcha
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }

      // Create new recaptcha verifier
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          console.log('reCAPTCHA verified');
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
          console.log('reCAPTCHA expired');
          setError('reCAPTCHA verification expired. Please try again.');
        }
      });
    }

    // Clean up function
    return () => {
      if (window.recaptchaVerifier && step !== 2) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, [step]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setFileUpload(e.target.files[0]);
      setPreviewImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handlePhoneChange = (value, country) => {
    setFormData({
      ...formData,
      phoneNumber: value,
      countryCode: country.dialCode
    });
  };

  const handleVerificationCodeChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input field
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleNextStep = async () => {
    if (step === 1) {
      // Validate first step
      if (!formData.displayName.trim()) {
        setError('Please enter your name');
        return;
      }
      
      try {
        // Upload profile image if user chose a custom one
        if (fileUpload) {
          const storageRef = ref(storage, `profileImages/${user.uid}`);
          await uploadBytes(storageRef, fileUpload);
          const downloadURL = await getDownloadURL(storageRef);
          
          // Update formData with new photo URL
          setFormData({
            ...formData,
            photoURL: downloadURL
          });
          
          // Update user profile
          await updateProfile(auth.currentUser, {
            displayName: formData.displayName,
            photoURL: downloadURL
          });
        } else {
          // Just update the display name
          await updateProfile(auth.currentUser, {
            displayName: formData.displayName
          });
        }
        
        // Save initial user data
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          displayName: formData.displayName,
          photoURL: formData.photoURL || user.photoURL,
          email: user.email,
          createdAt: new Date(),
          phoneVerified: false
        });
        
        setStep(2);
      } catch (error) {
        console.error("Error saving profile data:", error);
        setError('Failed to save profile data. Please try again.');
      }
    }
    
    if (step === 2) {
      // Validate phone number (simple validation, you might want to improve this)
      if (!formData.phoneNumber || formData.phoneNumber.length < 8) {
        setError('Please enter a valid phone number');
        return;
      }
      
      try {
        // Ensure the reCaptcha verifier exists
        if (!window.recaptchaVerifier) {
          setError('Error initializing verification. Please refresh the page and try again.');
          return;
        }
        
        const appVerifier = window.recaptchaVerifier;
        // Format the phone number correctly
        const phoneNumber = `+${formData.phoneNumber}`;
        
        // Send verification code
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        setVerificationId(confirmationResult);
        
        // Start timer
        setTimer(300);
        setResendDisabled(true);
        
        setStep(3);
      } catch (error) {
        console.error("Error sending verification code:", error);
        setError('Failed to send verification code: ' + (error.message || 'Please try again.'));
        
        // Reset captcha on error
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
        }
        
        // Re-initialize the reCaptcha
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible'
        });
      }
    }
  };

  const handleVerifyCode = async () => {
    const code = verificationCode.join('');
    
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }
    
    try {
      await verificationId.confirm(code);
      
      // Update user as verified
      await setDoc(doc(db, 'users', user.uid), {
        phoneNumber: formData.phoneNumber,
        phoneVerified: true
      }, { merge: true });
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error("Error verifying code:", error);
      setError('Invalid verification code. Please try again.');
    }
  };

  const handleResendCode = async () => {
    try {
      // Reset reCAPTCHA verifier
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
      
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
      
      const appVerifier = window.recaptchaVerifier;
      // Format the phone number correctly
      const phoneNumber = `+${formData.phoneNumber}`;
      
      // Resend verification code
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setVerificationId(confirmationResult);
      
      // Reset timer
      setTimer(300);
      setResendDisabled(true);
      
      setError('');
    } catch (error) {
      console.error("Error resending verification code:", error);
      setError('Failed to resend verification code: ' + (error.message || 'Please try again.'));
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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Add the phone input styles */}
      <style>{customPhoneInputStyles}</style>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-xl"
      >
        {/* Logo and Title */}
        <div className="flex justify-center">
          <div className="flex-shrink-0 flex items-center text-indigo-400">
            <svg className="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M20.618 5.984C17.45 2.667 12.442 2.614 9.207 5.856C5.973 9.097 5.941 14.097 9.145 17.373L12 20.294L14.855 17.373C18.059 14.097 18.027 9.097 14.793 5.856C13.234 4.29 11.14 3.514 9.029 3.525" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                stroke="currentColor" />
            </svg>
            <span className="text-xl font-bold">SafeStreamX</span>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="flex justify-center">
          <ol className="flex items-center w-full">
            <li className={`flex items-center ${step >= 1 ? 'text-indigo-400' : 'text-gray-500'}`}>
              <span className={`flex items-center justify-center w-8 h-8 rounded-full border ${step >= 1 ? 'border-indigo-400 text-indigo-400' : 'border-gray-500 text-gray-500'}`}>
                1
              </span>
              <span className="ml-2 text-sm">Profile</span>
            </li>
            <div className={`flex-1 h-0.5 mx-4 ${step >= 2 ? 'bg-indigo-400' : 'bg-gray-700'}`}></div>
            <li className={`flex items-center ${step >= 2 ? 'text-indigo-400' : 'text-gray-500'}`}>
              <span className={`flex items-center justify-center w-8 h-8 rounded-full border ${step >= 2 ? 'border-indigo-400 text-indigo-400' : 'border-gray-500 text-gray-500'}`}>
                2
              </span>
              <span className="ml-2 text-sm">Phone</span>
            </li>
            <div className={`flex-1 h-0.5 mx-4 ${step >= 3 ? 'bg-indigo-400' : 'bg-gray-700'}`}></div>
            <li className={`flex items-center ${step >= 3 ? 'text-indigo-400' : 'text-gray-500'}`}>
              <span className={`flex items-center justify-center w-8 h-8 rounded-full border ${step >= 3 ? 'border-indigo-400 text-indigo-400' : 'border-gray-500 text-gray-500'}`}>
                3
              </span>
              <span className="ml-2 text-sm">Verify</span>
            </li>
          </ol>
        </div>

        {/* Title based on step */}
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-gray-100">
            {step === 1 && 'Complete Your Profile'}
            {step === 2 && 'Phone Verification'}
            {step === 3 && 'Enter Verification Code'}
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            {step === 1 && 'We need a few more details to secure your account'}
            {step === 2 && 'Enter your phone number to verify your account'}
            {step === 3 && `Enter the 6-digit code sent to +${formData.phoneNumber}`}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-900 bg-opacity-25 text-red-400 px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Profile Information */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-300">
                Full Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Profile Picture
              </label>
              <div className="mt-1 flex items-center space-x-5">
                <div className="flex-shrink-0">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile Preview"
                      className="h-16 w-16 rounded-full object-cover border border-gray-600"
                    />
                  ) : formData.photoURL ? (
                    <img
                      src={formData.photoURL}
                      alt="Profile"
                      className="h-16 w-16 rounded-full object-cover border border-gray-600"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600">
                      <span className="text-xl text-gray-400">
                        {formData.displayName ? formData.displayName.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                  )}
                </div>
                <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-700 rounded-md px-3 py-2 border border-gray-600 text-sm font-medium text-gray-300 hover:bg-gray-600">
                  <span>Choose Custom Image</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNextStep}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800"
              >
                Continue to Phone Verification
              </motion.button>
            </div>
          </div>
        )}

        {/* Step 2: Phone Number */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300">
                Phone Number
              </label>
              <div className="mt-1">
                <PhoneInput
                  country={'us'}
                  value={formData.phoneNumber}
                  onChange={handlePhoneChange}
                  inputClass="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  containerClass="react-tel-input"
                  searchClass="search-box"
                  enableSearch={true}
                  preferredCountries={['us', 'ca', 'gb']}
                  placeholder="Enter your phone number"
                />
              </div>
              <p className="mt-2 text-xs text-gray-400">
                We'll send a verification code to this number
              </p>
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNextStep}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800"
              >
                Send Verification Code
              </motion.button>
            </div>

            <div className="mt-4">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                &larr; Back to Profile
              </button>
            </div>
            
            {/* Invisible reCAPTCHA container */}
            <div id="recaptcha-container"></div>
          </div>
        )}

        {/* Step 3: Verification Code */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Verification Code
              </label>
              <div className="mt-3 flex justify-center space-x-2">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                    onKeyDown={(e) => {
                      // Allow backspace to go to previous input
                      if (e.key === 'Backspace' && !digit && index > 0) {
                        document.getElementById(`otp-${index - 1}`).focus();
                      }
                    }}
                    className="w-12 h-14 text-center text-xl font-semibold rounded-md bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ))}
              </div>
              <p className="mt-3 text-center text-sm text-gray-400">
                Code expires in: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={handleResendCode}
                disabled={resendDisabled}
                className={`text-sm ${resendDisabled ? 'text-gray-500' : 'text-indigo-400 hover:text-indigo-300'}`}
              >
                {resendDisabled ? 'Resend code in...' : 'Resend code'}
              </button>
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleVerifyCode}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800"
              >
                Verify Code
              </motion.button>
            </div>

            <div className="mt-4">
              <button
                onClick={() => setStep(2)}
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Wrong number? Go back
              </button>
            </div>

            {/* Security Notice */}
            <div className="mt-6 bg-gray-700 bg-opacity-50 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-300">Security Notice</h3>
                  <div className="mt-1 text-xs text-gray-400">
                    <p>We use phone verification to protect your account and secure your encrypted files. Standard SMS rates may apply.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CompleteProfile;