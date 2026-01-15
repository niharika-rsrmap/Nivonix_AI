import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect, useRef } from "react";
import { ScaleLoader } from "react-spinners";
import { chatAPI } from "./api.js";

function ChatWindow() {
    const {
        prompt, setPrompt, reply, setReply,
        currThreadId, setPrevChats, setNewChat,
        sidebarCollapsed, setSidebarCollapsed,
        user, darkMode, isTyping, setIsTyping,
        settings, handleLogout
    } = useContext(MyContext);

    const [loading, setLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const textareaRef = useRef(null);
    const dropdownRef = useRef(null);
    const fileInputRef = useRef(null);

    const getReply = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setNewChat(false);
        setIsTyping(true);

        const authToken = localStorage.getItem('authToken');
        
        if (!authToken) {
            console.error("No auth token found. User not logged in.");
            setReply("Please log in first to use the chat.");
            setLoading(false);
            setIsTyping(false);
            return;
        }

        if (!currThreadId) {
            console.error("No thread ID available");
            setReply("Error: No thread ID. Please refresh the page.");
            setLoading(false);
            setIsTyping(false);
            return;
        }

        try {
            console.log("Sending chat request:", { threadId: currThreadId, message: prompt, token: authToken.substring(0, 20) });
            const res = await chatAPI.sendMessage(currThreadId, prompt, authToken);
            setReply(res.reply);
        } catch (err) {
            console.error("Error getting reply:", err);
            setReply("Sorry, I encountered an error. Please try again.");
        }

        setLoading(false);
        setIsTyping(false);
    };

    useEffect(() => {
        if (prompt && reply) {
            setPrevChats(prevChats => (
                [...prevChats, {
                    role: "user",
                    content: prompt
                }, {
                    role: "assistant",
                    content: reply
                }]
            ));
        }
        setPrompt("");
        setWordCount(0);
    }, [reply]);

    useEffect(() => {
        setWordCount(prompt.trim().split(/\s+/).filter(word => word.length > 0).length);
    }, [prompt]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            getReply();
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setPrompt(suggestion);
        textareaRef.current?.focus();
    };

    const handleFileUpload = async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const formData = new FormData();

        // Handle multiple files - always append as 'files'
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        try {
            console.log('Uploading files:', files.length);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const response = await fetch(`${apiUrl}/api/upload/upload`, {
                method: 'POST',
                body: formData
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers.get('content-type'));

            // Get response text first to debug
            const responseText = await response.text();
            console.log('Response text:', responseText.substring(0, 200));

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseErr) {
                console.error('JSON parse error:', parseErr);
                console.error('Response was:', responseText.substring(0, 500));
                throw new Error('Server returned invalid response: ' + responseText.substring(0, 100));
            }

            console.log('Response data:', data);

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            if (data.success) {
                // Handle both single and multiple file responses
                const uploadedFiles = data.file ? [data.file] : (data.files || []);

                if (uploadedFiles.length === 0) {
                    alert('No files were uploaded');
                    return;
                }

                // Store all uploaded files
                setUploadedFile(uploadedFiles);

                // Add file information to prompt
                const fileInfo = uploadedFiles.map(f => {
                    const analysis = f.analysis || {};
                    let info = `📎 ${f.originalName} (${analysis.sizeFormatted || 'unknown size'})`;

                    if (analysis.isImage) {
                        info += ' [Image]';
                    } else if (analysis.isDocument) {
                        info += ' [Document]';
                    } else if (analysis.isArchive) {
                        info += ' [Archive]';
                    } else if (analysis.isText) {
                        info += ` [Text - ${analysis.lines || 'unknown'} lines]`;
                    }

                    return info;
                }).join('\n');

                setPrompt(prev => prev + `\n${fileInfo}\n\nPlease analyze these files.`);
            } else {
                alert('File upload failed: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Failed to upload file: ' + err.message);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
    };

    useEffect(() => {
        adjustTextareaHeight();
    }, [prompt]);

    return (
        <div className="chat-window">
            <div className="navbar">
                <div className="navbar-left">
                    <button
                        className="sidebar-toggle btn-ghost"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
                    >
                        <i className="fas fa-bars"></i>
                    </button>
                    <div className="chat-title">
                        <h1>Nivonix AI</h1>
                        <span className="status-indicator">
                            <span className="status-dot"></span>
                            Online
                        </span>
                    </div>
                </div>

                <div className="navbar-right">
                    <div className="model-selector">
                        <select className="model-select">
                            <option value="gpt-4">GPT-4</option>
                            <option value="gpt-3.5">GPT-3.5</option>
                            <option value="claude">Claude</option>
                        </select>
                    </div>

                    <div className="user-menu" ref={dropdownRef}>
                        <button
                            className="user-avatar-btn"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <div className="user-avatar">
                                <span>{user?.name?.charAt(0).toUpperCase() || "?"}</span>
                            </div>
                            <i className={`fas fa-chevron-down ${isDropdownOpen ? 'rotated' : ''}`}></i>
                        </button>

                        {isDropdownOpen && (
                            <div className="dropdown-menu">
                                <div className="dropdown-header">
                                    <div className="user-info">
                                        <div className="user-name">{user?.name || "Not logged in"}</div>
                                        <div className="user-email">{user?.email || "Please sign up"}</div>
                                    </div>
                                </div>
                                <div className="dropdown-divider"></div>
                                <button className="dropdown-item" onClick={() => setShowSettings(true)}>
                                    <i className="fas fa-cog"></i>
                                    Settings
                                </button>
                                <button className="dropdown-item">
                                    <i className="fas fa-crown"></i>
                                    Upgrade to Pro
                                </button>
                                <button className="dropdown-item">
                                    <i className="fas fa-question-circle"></i>
                                    Help & Support
                                </button>
                                <div className="dropdown-divider"></div>
                                <button className="dropdown-item danger" onClick={handleLogout}>
                                    <i className="fas fa-sign-out-alt"></i>
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="chat-content">
                <Chat />
            </div>

            {loading && (
                <div className="loading-container">
                    <ScaleLoader color="var(--primary-color)" loading={loading} />
                    <span>Nivonix is thinking...</span>
                </div>
            )}

            <div className="chat-input-container">
                <div className="input-wrapper">
                    <div className="input-actions-left">
                        <button
                            className="action-btn"
                            title="Attach file"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading || !user}
                        >
                            <i className="fas fa-paperclip"></i>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.webp,.json,.csv,.zip"
                            multiple
                        />
                        <button className="action-btn" title="Voice input">
                            <i className="fas fa-microphone"></i>
                        </button>
                    </div>

                    {uploadedFile && (
                        <div className="uploaded-files-container">
                            {Array.isArray(uploadedFile) ? (
                                uploadedFile.map((file, idx) => (
                                    <div key={idx} className="uploaded-file-badge">
                                        <i className={`fas ${file.analysis?.isImage ? 'fa-image' : 'fa-file'}`}></i>
                                        <span>{file.originalName}</span>
                                        <button
                                            onClick={() => setUploadedFile(uploadedFile.filter((_, i) => i !== idx))}
                                            className="remove-file"
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="uploaded-file-badge">
                                    <i className="fas fa-file"></i>
                                    <span>{uploadedFile.originalName}</span>
                                    <button
                                        onClick={() => setUploadedFile(null)}
                                        className="remove-file"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <textarea
                        ref={textareaRef}
                        className="chat-textarea"
                        placeholder={!user ? "Please log in to start chatting..." : "Ask Nivonix anything..."}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        disabled={loading || uploading || !user}
                    />

                    <div className="input-actions-right">
                        <button
                            className={`send-btn ${prompt.trim() ? 'active' : ''}`}
                            onClick={getReply}
                            disabled={loading || !prompt.trim() || !user}
                            title="Send message"
                        >
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>

                <div className="input-footer">
                    <div className="input-info">
                        <span className="word-count">{wordCount} words</span>
                        <span className="separator">•</span>
                        <span className="model-info">Using {settings.model}</span>
                    </div>
                    <div className="disclaimer">
                        Nivonix AI can make mistakes. Please verify important information.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatWindow;