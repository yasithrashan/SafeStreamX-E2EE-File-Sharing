import React, { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, storage, db } from '../../firebase/config';
import { generateFileKey, encryptFile } from '../../util/encryption'; 

const FileUpload = ({ onUploadComplete, currentFolder = null }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (files.length === 0) return;

    try {
      setIsUploading(true);
      setEncryptionProgress(0);
      setUploadProgress(0);

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update encryption progress
        setEncryptionProgress(10);
        
        // Generate a unique file key
        const fileKey = await generateFileKey();
        setEncryptionProgress(30);
        
        // Encrypt the file
        const { encryptedFile, iv, encryptedKey } = await encryptFile(file, fileKey);
        setEncryptionProgress(100);
        
        // Start upload process
        setUploadProgress(10);
        
        // Create a reference to upload the encrypted file
        const userId = auth.currentUser.uid;
        const fileId = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 15);
        const storageRef = ref(storage, `files/${userId}/${fileId}`);
        
        // Upload the encrypted file
        await uploadBytes(storageRef, encryptedFile);
        setUploadProgress(70);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);
        setUploadProgress(90);
        
        // Store the file metadata and encryption info in Firestore
        await addDoc(collection(db, 'files'), {
          name: file.name,
          originalType: file.type,
          size: file.size,
          encryptedSize: encryptedFile.size,
          encryptedUrl: downloadURL,
          iv: iv, // Initialization vector
          encryptedKey: encryptedKey, // This would be encrypted with user's public key in a real app
          ownerId: userId,
          folderId: currentFolder || 'root',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isShared: false
        });
        
        setUploadProgress(100);
      }
      
      // Reset the file input
      e.target.value = null;
      
      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
      />
      <button
        onClick={handleUploadClick}
        disabled={isUploading}
        className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium 
          ${isUploading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} 
          text-white transition-colors`}
      >
        {isUploading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {encryptionProgress < 100 ? `Encrypting (${encryptionProgress}%)` : `Uploading (${uploadProgress}%)`}
          </>
        ) : (
          <>
            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload File
          </>
        )}
      </button>
    </div>
  );
};

export default FileUpload;