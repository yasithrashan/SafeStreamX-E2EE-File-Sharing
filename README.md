# SafeStreamX

<p align="center">
  <strong>Secure File Sharing with End-to-End Encryption</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#technology-stack">Technology Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#security">Security</a> •
  <a href="#roadmap">Roadmap</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

## Overview

SafeStreamX is a modern, secure file sharing system that uses end-to-end encryption (E2EE) to ensure only intended recipients can access shared files. Files are encrypted client-side before upload and decrypted client-side after download, guaranteeing that not even the service providers can access your data.

## Features

### Core Features

- **End-to-End Encryption (E2EE)**: All files are encrypted using AES-256 before being uploaded
- **User Authentication**: Secure login and registration using Firebase Authentication
- **Secure File Sharing**: Share encrypted files through secure, expiring, or one-time-use links
- **File Metadata**: Metadata is stored securely in Firebase Database
- **File Expiration**: Set automatic expiration times for shared files
- **User Dashboard**: Manage uploads, downloads, and sharing from a central dashboard

### Security Features

- **Multi-Party Authorization**: Optional feature requiring approval from multiple authorized parties before file access is granted
- **Zero-Knowledge Architecture**: The platform never has access to unencrypted files or decryption keys
- **Detailed Access Logs**: Track when files are accessed and by whom
- **Auto-Expiring Links**: Links can be set to expire after a certain time, number of downloads, or both
- **Password-Protected Sharing**: Add an additional layer of security with password protection

## Technology Stack

### Frontend
- **Framework**: React (using Vite)
- **Styling**: Tailwind CSS
- **Encryption**: Web Crypto API (AES-256)

### Backend
- **Server**: Node.js with Express
- **Serverless Functions**: Firebase Functions
- **Authentication**: Firebase Authentication
- **Database**: Firebase Realtime Database
- **Storage**: Firebase Storage

### Deployment
- **Frontend Hosting**: Firebase Hosting
- **Backend Hosting**: Firebase Functions (Serverless)

## Architecture

SafeStreamX follows a secure-by-design architecture:

1. **Client-Side Encryption**: Files are encrypted in the browser before upload
2. **Secure Authentication**: Firebase Authentication handles user authentication securely
3. **Separated Storage**: File content and metadata are stored separately
4. **Key Management**: Encryption keys never leave the client, ensuring true E2EE
5. **Backend Security**: Server-side validation ensures proper authorization for all actions

### Data Flow

```
┌─────────────┐     Encrypt     ┌────────────┐     Upload     ┌─────────────┐
│ Client File ├────────────────►│ Encrypted  ├───────────────►│ Firebase    │
└─────────────┘                 │ File       │                │ Storage     │
                                └────────────┘                └─────────────┘
                                                                     │
                                                                     │ Store
                                                                     ▼
┌─────────────┐    Generate     ┌────────────┐     Store      ┌─────────────┐
│ Sharing     ├────────────────►│ Secure     ├───────────────►│ Firebase    │
│ Parameters  │                 │ Link       │                │ Database    │
└─────────────┘                 └────────────┘                └─────────────┘
```

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/safestreamx.git
   cd safestreamx
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Create a Firebase project and setup:
   - Create a new project in Firebase console
   - Enable Authentication, Storage, and Realtime Database
   - Add a web app to your Firebase project
   - Copy the Firebase configuration

4. Create environment files:
   ```bash
   # Create .env.local in the root directory
   cp .env.example .env.local
   ```

5. Update `.env.local` with your Firebase configuration

6. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Usage

### User Registration and Login

1. Create an account using email/password or Google OAuth
2. Verify your email address
3. Log in to access the dashboard

### Uploading Files

1. From the dashboard, click "Upload File"
2. Select files from your device
3. Files will be encrypted in your browser before being uploaded
4. Set optional parameters (expiration, permissions, etc.)
5. Click "Upload" to complete the process

### Sharing Files

1. From the dashboard, select the file you want to share
2. Click "Share" and configure sharing options:
   - Expiration time
   - Download limits
   - Password protection
   - Authorized recipients
3. Generate and copy the secure link
4. Share the link with your intended recipient

### Accessing Shared Files

1. Open the secure link in a web browser
2. Authenticate if required (password, email verification)
3. The file will be downloaded and decrypted in your browser

## Security

SafeStreamX implements multiple layers of security:

- **Encryption Algorithm**: AES-256 (industry standard)
- **Key Management**: Keys are generated in the browser and never sent to the server
- **Transport Security**: All API communication uses HTTPS
- **Authentication**: Firebase Authentication with support for MFA
- **Authorization**: Fine-grained access controls for each file
- **Audit Logging**: All access attempts are logged

### Security Considerations

- SafeStreamX cannot access or recover your files if encryption keys are lost
- Always share links through secure channels
- For maximum security, use password protection and short expiration times

## Roadmap

- [ ] Mobile application (iOS and Android)
- [ ] Desktop sync client
- [ ] Advanced sharing permissions
- [ ] Enterprise features (SSO, team management)
- [ ] Secure messaging between users
- [ ] File version history
- [ ] Blockchain verification for access logs

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Firebase](https://firebase.google.com/) for authentication and storage
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) for encryption
- All contributors and supporters of the project

---

<p align="center">Made with ❤️ for security and privacy</p>
