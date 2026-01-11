import './App.css';
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import SignUpPopup from "./SignUpPopup.jsx";
import { MyContext } from "./MyContext.jsx";
import { ToastProvider, ToastContext } from "./ToastContext.jsx";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useState, useEffect, useContext } from 'react';
import { v1 as uuidv1 } from "uuid";

function App() {
  const [showSignUpPopup, setShowSignUpPopup] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null); // Start as null instead of Guest
  const [isTyping, setIsTyping] = useState(false);
  const [settings, setSettings] = useState({
    model: "gpt-4",
    temperature: 0.7,
    maxTokens: 2048,
    streamResponse: true
  });
  const { showToast } = useContext(ToastContext);

  // Check if user is already logged in on app load
  useEffect(() => {
    const checkExistingUser = async () => {
      const storedUser = localStorage.getItem('user');
      const authToken = localStorage.getItem('authToken');

      if (storedUser && authToken) {
        try {
          // Verify token is still valid
          const response = await fetch('http://localhost:8080/api/auth/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: authToken })
          });

          const data = await response.json();
          if (data.valid) {
            setUser(JSON.parse(storedUser));
            setShowSignUpPopup(false); // Don't show signup for existing users
            showToast(`Welcome back ${JSON.parse(storedUser).name}!`, 'success', 2000);
            return;
          }
        } catch (err) {
          console.error('Token verification failed:', err);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }

      // Show signup only for new users
      const timer = setTimeout(() => {
        setShowSignUpPopup(true);
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    };

    checkExistingUser();
  }, []);

  const handleGoogleSignUp = async (googleToken) => {
    try {
      console.log('Sending Google token to backend...');
      const response = await fetch('http://localhost:8080/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: googleToken })
      });

      console.log('Response status:', response.status);
      const text = await response.text();
      console.log('Response text:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        alert('Server error: Invalid response from backend');
        return;
      }

      if (data.success) {
        const userData = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          picture: data.user.picture
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('authToken', data.token);
        setShowSignUpPopup(false);
        showToast(`Welcome ${data.user.name}! You're logged in.`, 'success', 3000);
      } else {
        console.error('Google signup failed:', data.error);
        alert('Authentication failed: ' + data.error);
      }
    } catch (err) {
      console.error('Google signup error:', err);
      alert('Failed to authenticate with Google: ' + err.message);
    }
  };

  const handleSkipSignUp = () => {
    setShowSignUpPopup(false);
    // Force show signup again after 10 seconds if still not logged in
    setTimeout(() => {
      if (!user) {
        setShowSignUpPopup(true);
      }
    }, 10000);
  };

  const handleLogout = () => {
    const userName = user?.name || "User";
    localStorage.clear();
    setUser(null);
    setShowSignUpPopup(true);
    setCurrThreadId(uuidv1());
    setPrevChats([]);
    setNewChat(true);
    setReply(null);
    showToast(`${userName} logged out successfully.`, 'info', 3000);
  };

  const providerValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    newChat, setNewChat,
    prevChats, setPrevChats,
    allThreads, setAllThreads,
    darkMode, setDarkMode,
    sidebarCollapsed, setSidebarCollapsed,
    user, setUser,
    isTyping, setIsTyping,
    settings, setSettings,
    handleLogout
  };

  useEffect(() => {
    document.body.className = darkMode ? 'dark-theme' : 'light-theme';
  }, [darkMode]);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.REACT_APP_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className={`app ${darkMode ? 'dark' : 'light'}`}>
        <MyContext.Provider value={providerValues}>
          <Sidebar />
          <ChatWindow />
          <SignUpPopup
            onSignUp={handleGoogleSignUp}
            onSkip={handleSkipSignUp}
            isVisible={showSignUpPopup}
          />
        </MyContext.Provider>
      </div>
    </GoogleOAuthProvider>
  )
}

export default App
