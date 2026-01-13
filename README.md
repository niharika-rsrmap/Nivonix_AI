# Nivonix AI - Project Description

## Overview
Nivonix AI is a full-stack web application that provides an intelligent chatbot interface powered by Google's Gemini API. Users can have persistent conversations, manage multiple chat threads, and access their chat history across sessions.

## Key Features

### 1. Authentication & User Management
- **Google OAuth Integration**: Seamless login using Google accounts
- **JWT Authentication**: Secure token-based authorization for all API requests
- **Persistent Sessions**: Users remain logged in across browser sessions
- **User Data Persistence**: Chat history is tied to individual user accounts

### 2. Chat Functionality
- **Real-time Chat Interface**: Interactive chat window with message history
- **Gemini AI Integration**: Powered by Google's Gemini 2.5 Flash model
- **Thread Management**: Create, view, and delete multiple chat conversations
- **Message History**: All conversations are saved and retrievable
- **Auto-save**: Messages are automatically saved to the database

### 3. User Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Sidebar Navigation**: Quick access to chat history and new conversations
- **User Profile**: Display logged-in user information
- **Toast Notifications**: Real-time feedback for user actions

### 4. File Management
- **File Upload**: Support for multiple file types (PDF, images, documents, etc.)
- **File Analysis**: Automatic file type detection and metadata extraction
- **File Integration**: Uploaded files can be referenced in chat messages

### 5. Data Management
- **MongoDB Database**: Persistent storage for users and chat threads
- **User-Specific Data**: Each user's data is isolated and secure
- **Thread Organization**: Conversations are organized by creation date
- **Search Functionality**: Find conversations by title

## Tech Stack

### Frontend
- **React 18**: Modern UI library with hooks
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing
- **Google OAuth**: Authentication library
- **CSS3**: Custom styling with dark/light theme support
- **UUID**: Unique thread ID generation

### Backend
- **Node.js & Express**: Server framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT (jsonwebtoken)**: Token-based authentication
- **Google Auth Library**: OAuth token verification
- **Gemini API**: AI response generation
- **CORS**: Cross-origin resource sharing
- **Bcryptjs**: Password hashing

## Project Structure

```
Nivonix/
├── Frontend/
│   ├── src/
│   │   ├── App.jsx              # Main app component
│   │   ├── ChatWindow.jsx       # Chat interface
│   │   ├── Sidebar.jsx          # Navigation sidebar
│   │   ├── Chat.jsx             # Message display
│   │   ├── SignUpPopup.jsx      # Authentication modal
│   │   ├── MyContext.jsx        # Global state management
│   │   ├── ToastContext.jsx     # Notification system
│   │   └── *.css                # Styling files
│   └── package.json
│
├── backend/
│   ├── routes/
│   │   ├── auth.js              # Authentication endpoints
│   │   ├── chat.js              # Chat endpoints
│   │   └── upload.js            # File upload endpoints
│   ├── models/
│   │   ├── User.js              # User schema
│   │   └── Thread.js            # Chat thread schema
│   ├── utils/
│   │   └── openai.js            # Gemini API integration
│   ├── server.js                # Express server setup
│   ├── .env                     # Environment variables
│   └── package.json
│
└── uploads/                     # Uploaded files storage
```

## API Endpoints

### Authentication Routes
- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/verify` - Verify JWT token

### Chat Routes (Require Authentication)
- `POST /api/chat` - Send a chat message
- `POST /api/chat/generate` - Generate AI response
- `GET /api/chat/thread` - Get all user threads
- `GET /api/chat/thread/:threadId` - Get specific thread messages
- `DELETE /api/chat/thread/:threadId` - Delete a thread

### Upload Routes
- `POST /api/upload/upload` - Upload files

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  picture: String,
  googleId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Thread Model
```javascript
{
  userId: ObjectId (ref: User),
  threadId: String (unique per user),
  title: String,
  messages: [
    {
      role: String (user/assistant),
      content: String,
      timestamp: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## User Flow

1. **First Visit**: User sees signup popup after 5 seconds
2. **Authentication**: User logs in with Google OAuth
3. **Dashboard**: User sees empty chat or previous conversations
4. **New Chat**: Click "New Chat" to start a conversation
5. **Messaging**: Type message and send to Gemini AI
6. **History**: All messages saved automatically
7. **Thread Management**: Switch between conversations or delete old ones
8. **Logout**: Clear session and return to login screen

## Security Features

- **JWT Authentication**: Secure token-based API access
- **Password Hashing**: Bcryptjs for secure password storage
- **CORS Protection**: Restricted to allowed origins
- **Token Verification**: All protected routes verify JWT
- **User Isolation**: Users can only access their own data
- **Environment Variables**: Sensitive keys stored securely

## Environment Variables Required

```
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Deployment Considerations

- Update API URLs from localhost to production backend
- Update CORS origins to match frontend domain
- Use strong JWT_SECRET in production
- Enable HTTPS for secure communication
- Set up environment variables on hosting platform
- Configure MongoDB Atlas for production database

## Future Enhancements

- Voice input/output
- Image generation
- Code syntax highlighting
- Conversation sharing
- User preferences/settings
- Rate limiting
- Analytics dashboard
- Multi-language support
- Conversation export (PDF/JSON)

## Getting Started

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm start
```

Devloper : Niharika Ramishetty
