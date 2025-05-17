// utils/encryption.js

/**
 * Utility functions for client-side encryption and decryption
 * using the Web Crypto API
 */

/**
 * Generate a random AES-256 key for file encryption
 * @returns {Promise<CryptoKey>} The generated crypto key
 */
export const generateFileKey = async () => {
  try {
    return await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true, // extractable
      ["encrypt", "decrypt"]
    );
  } catch (error) {
    console.error("Error generating encryption key:", error);
    throw new Error("Failed to generate encryption key");
  }
};

/**
 * Encrypt a file with AES-GCM
 * @param {File} file - The file to encrypt
 * @param {CryptoKey} key - The AES-256 key to use for encryption
 * @returns {Promise<Object>} Object containing encrypted file and IV
 */
export const encryptFile = async (file, key) => {
  try {
    // Create a random initialization vector
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Read the file as an ArrayBuffer
    const fileBuffer = await file.arrayBuffer();
    
    // Encrypt the file content
    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      fileBuffer
    );
    
    // Create a new file with the encrypted content
    const encryptedFile = new File(
      [encryptedContent], 
      file.name,
      { type: 'application/encrypted', lastModified: new Date().getTime() }
    );
    
    // Export the key for storage
    const exportedKey = await window.crypto.subtle.exportKey("raw", key);
    
    return {
      encryptedFile,
      iv: Array.from(iv), // Convert to array for storage
      encryptedKey: Array.from(new Uint8Array(exportedKey)) // Key for storage
    };
  } catch (error) {
    console.error("Error encrypting file:", error);
    throw new Error("Failed to encrypt file");
  }
};

/**
 * Decrypt a file with AES-GCM
 * @param {ArrayBuffer} encryptedData - The encrypted file data
 * @param {Uint8Array} iv - The initialization vector used for encryption
 * @param {CryptoKey} key - The AES-256 key to use for decryption
 * @param {string} fileName - Original file name
 * @param {string} fileType - Original file type
 * @returns {Promise<File>} The decrypted file
 */
export const decryptFile = async (encryptedData, iv, key, fileName, fileType) => {
  try {
    // Convert IV from array to Uint8Array if needed
    const ivArray = iv instanceof Uint8Array ? iv : new Uint8Array(iv);
    
    // Decrypt the file content
    const decryptedContent = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivArray },
      key,
      encryptedData
    );
    
    // Create a new file with the decrypted content
    return new File(
      [decryptedContent],
      fileName,
      { type: fileType, lastModified: new Date().getTime() }
    );
  } catch (error) {
    console.error("Error decrypting file:", error);
    throw new Error("Failed to decrypt file");
  }
};

/**
 * Import an AES key from raw data
 * @param {Uint8Array} rawKey - The raw key data
 * @returns {Promise<CryptoKey>} The imported crypto key
 */
export const importEncryptionKey = async (rawKey) => {
  try {
    // Convert from array to Uint8Array if needed
    const keyData = rawKey instanceof Uint8Array ? rawKey : new Uint8Array(rawKey);
    
    return await window.crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "AES-GCM", length: 256 },
      true, // extractable
      ["encrypt", "decrypt"]
    );
  } catch (error) {
    console.error("Error importing encryption key:", error);
    throw new Error("Failed to import encryption key");
  }
};

/**
 * Generate a random key for the user
 * In a real app, this would be securely stored and managed by a key management system
 * For simplicity, we'll generate a key and simulate storage
 */
export const generateUserKey = async () => {
  try {
    // Generate a keypair for the user
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true, // extractable
      ["encrypt", "decrypt"]
    );
    
    return keyPair;
  } catch (error) {
    console.error("Error generating user key pair:", error);
    throw new Error("Failed to generate user key pair");
  }
};

/**
 * Encrypt a file key with a user's public key
 * @param {CryptoKey} fileKey - The file encryption key
 * @param {CryptoKey} publicKey - The user's public key
 * @returns {Promise<Uint8Array>} The encrypted file key
 */
export const encryptFileKey = async (fileKey, publicKey) => {
  try {
    // Export the file key to raw format
    const exportedKey = await window.crypto.subtle.exportKey("raw", fileKey);
    
    // Encrypt the file key with the user's public key
    const encryptedKey = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      publicKey,
      exportedKey
    );
    
    return new Uint8Array(encryptedKey);
  } catch (error) {
    console.error("Error encrypting file key:", error);
    throw new Error("Failed to encrypt file key");
  }
};

/**
 * Decrypt a file key with a user's private key
 * @param {Uint8Array} encryptedKey - The encrypted file key
 * @param {CryptoKey} privateKey - The user's private key
 * @returns {Promise<CryptoKey>} The decrypted file key
 */
export const decryptFileKey = async (encryptedKey, privateKey) => {
  try {
    // Decrypt the file key with the user's private key
    const decryptedKeyData = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      encryptedKey
    );
    
    // Import the decrypted key as an AES-GCM key
    return await window.crypto.subtle.importKey(
      "raw",
      decryptedKeyData,
      { name: "AES-GCM", length: 256 },
      true, // extractable
      ["encrypt", "decrypt"]
    );
  } catch (error) {
    console.error("Error decrypting file key:", error);
    throw new Error("Failed to decrypt file key");
  }
};