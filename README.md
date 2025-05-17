# SafeStreamX

## 🔒 Overview

SafeStreamX is a modern web application that enables secure file sharing with true end-to-end encryption. Files are encrypted in the browser before upload and decrypted only after download, ensuring that not even our servers can access your data. Built with React and Firebase, SafeStreamX provides a seamless user experience without compromising on security.

## ✨ Features

- **End-to-End Encryption (E2EE)**: AES-256 encryption happens client-side
- **Zero-Knowledge Architecture**: We never see your unencrypted files or keys
- **Secure File Sharing**: Share files via secure, expiring, or one-time-use links
- **Folder Organization**: Create and manage folders for your files
- **User Authentication**: Secure login via Firebase Authentication
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Progress**: Monitor encryption and upload progress

## 🛠️ Technology Stack

- **Frontend**: React (Vite), Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage, Functions)
- **Encryption**: Web Crypto API (AES-256, RSA-OAEP)
- **Deployment**: Firebase Hosting

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

## 🚀 Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yasithrashan/SafeStreamX-E2EE-File-Sharing.git
   cd safestreamx
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Set up Authentication, Firestore, and Storage services

4. Configure Firebase:
   - Create a `.env` file in the root directory
   - Add your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:5173](http://localhost:5173) to view the app in your browser.

### Firebase Configuration

Set up the following Firestore collections:
- `users`: Stores user information
- `files`: Stores file metadata and encryption details
- `folders`: Stores folder structure information

Configure Firebase Storage security rules:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /files/{userId}/{fileId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Configure Firestore security rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /files/{fileId} {
      allow read: if request.auth != null && resource.data.ownerId == request.auth.uid;
      allow write: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
    }
    match /folders/{folderId} {
      allow read: if request.auth != null && resource.data.ownerId == request.auth.uid;
      allow write: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
    }
  }
}
```

## 🔐 How the Encryption Works

SafeStreamX uses a hybrid encryption approach:

1. **File Encryption**:
   - A unique AES-256 key is generated for each file
   - Files are encrypted using AES-GCM mode with a random initialization vector (IV)
   - The encrypted file is uploaded to Firebase Storage

2. **Key Protection**:
   - Each user has an RSA key pair (generated client-side)
   - File encryption keys are themselves encrypted with the recipient's public RSA key
   - Encrypted keys are stored in Firestore

3. **Sharing Process**:
   - When sharing a file, the system creates a secure link
   - Recipients use their private key to decrypt the file key
   - The file key is then used to decrypt the file content

## 📁 Project Structure

```
safestreamx/
├── src/
│   ├── components/
│   │   ├── auth/           # Authentication related components
│   │   ├── dashboard/      # Dashboard and file management components
│   │   └── shared/         # Shared UI components
│   ├── contexts/           # React contexts for state management
│   ├── firebase/           # Firebase configuration
│   ├── pages/              # Route components
│   ├── util/               # Utility functions
│   │   └── encryption.js   # Encryption/decryption utilities
│   ├── App.jsx             # Main application component
│   └── main.jsx            # Entry point
├── public/                 # Static assets
├── .env                    # Environment variables (not committed to git)
├── vite.config.js          # Vite configuration
└── package.json            # Dependencies and scripts
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔮 Future Enhancements

- Multi-recipient support with individual encryption keys
- File previews for supported formats
- Password-protected files
- Mobile applications for Android and iOS
- Enhanced collaboration features

## 🧑‍💻 Developers

- Yasith Rashan - [@yasithrashan](https://github.com/yasithrashan)

## 🙏 Acknowledgements

- [Firebase](https://firebase.google.com/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

---

<p align="center">Made with ❤️ for security and privacy</p>
