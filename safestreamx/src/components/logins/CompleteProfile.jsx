import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db, storage } from '../../firebase/config.js'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
        // Initialize reCAPTCHA verifier
        if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = new auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible'
          });
        }
        
        const appVerifier = window.recaptchaVerifier;
        const phoneNumber = `+${formData.countryCode}${formData.phoneNumber.replace(/\D/g, '')}`;
        
        // Send verification code
        const confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, appVerifier);
        setVerificationId(confirmationResult);
        
        // Start timer
        setTimer(300);
        setResendDisabled(true);
        
        setStep(3);
      } catch (error) {
        console.error("Error sending verification code:", error);
        setError('Failed to send verification code. Please try again.');
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
      window.recaptchaVerifier = new auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'invisible'
      });
      
      const appVerifier = window.recaptchaVerifier;
      const phoneNumber = `+${formData.countryCode}${formData.phoneNumber.replace(/\D/g, '')}`;
      
      // Resend verification code
      const confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, appVerifier);
      setVerificationId(confirmationResult);
      
      // Reset timer
      setTimer(300);
      setResendDisabled(true);
      
      setError('');
    } catch (error) {
      console.error("Error resending verification code:", error);
      setError('Failed to resend verification code. Please try again.');
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
            {step === 3 && `Enter the 6-digit code sent to +${formData.countryCode} ${formData.phoneNumber}`}
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
                  buttonClass="bg-gray-700 border border-gray-600 rounded-l-md"
                  dropdownClass="bg-gray-700 text-gray-100"
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