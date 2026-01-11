import "./Sidebar.css";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";

function Sidebar() {
    const {
        allThreads, setAllThreads,
        currThreadId, setNewChat,
        setPrompt, setReply,
        setCurrThreadId, setPrevChats,
        sidebarCollapsed, setSidebarCollapsed,
        user, handleLogout
    } = useContext(MyContext);

    const [searchQuery, setSearchQuery] = useState("");

    const getAllThreads = async () => {
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch("http://localhost:8080/api/chat/thread", {
                headers: {
                    "Authorization": `Bearer ${authToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            const threads = await response.json();
            const filteredData = threads.map(thread => ({
                threadId: thread.threadId,
                title: thread.title,
                updatedAt: thread.updatedAt || new Date().toISOString()
            }));
            setAllThreads(filteredData);
        } catch (err) {
            console.error("Error fetching threads:", err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId]);

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    };

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:8080/api/chat/thread/${newThreadId}`, {
                headers: {
                    "Authorization": `Bearer ${authToken}`
                }
            });
            const messages = await response.json();
            setPrevChats(messages);
            setNewChat(false);
            setReply(null);
        } catch (err) {
            console.error("Error loading thread:", err);
        }
    };

    const deleteThread = async (threadId) => {
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:8080/api/chat/thread/${threadId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${authToken}`
                }
            });
            await response.json();
            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));
            if (threadId === currThreadId) {
                createNewChat();
            }
        } catch (err) {
            console.error("Error deleting thread:", err);
        }
    };

    const filteredThreads = allThreads.filter(thread =>
        thread.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return "Today";
        if (diffDays === 2) return "Yesterday";
        if (diffDays <= 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <section className={`sidebar ${sidebarCollapsed ? 'collapsed' : 'open'}`}>
            <div className="sidebar-header">
                <div className="brand">
                    <div className="logo-container">
                        <div className="logo">
                            <span className="logo-text">N</span>
                        </div>
                        {!sidebarCollapsed && <span className="brand-name">Nivonix</span>}
                    </div>
                    <button
                        className="collapse-btn btn-ghost"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <i className={`fas ${sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
                    </button>
                </div>

                {!sidebarCollapsed && (
                    <>
                        <button className="new-chat-btn btn-primary" onClick={createNewChat}>
                            <i className="fas fa-plus"></i>
                            <span>New Chat</span>
                        </button>

                        <div className="search-container">
                            <div className="search-box">
                                <i className="fas fa-search"></i>
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {!sidebarCollapsed && (
                <div className="sidebar-content">
                    <div className="history-section">
                        <div className="section-header">
                            <h3>Recent Chats</h3>
                            <span className="chat-count">{filteredThreads.length}</span>
                        </div>

                        <ul className="history">
                            {filteredThreads.length === 0 ? (
                                <li className="empty-state">
                                    <i className="fas fa-comments"></i>
                                    <span>No conversations yet</span>
                                </li>
                            ) : (
                                filteredThreads.map((thread, idx) => (
                                    <li
                                        key={idx}
                                        onClick={() => changeThread(thread.threadId)}
                                        className={`history-item ${thread.threadId === currThreadId ? 'active' : ''}`}
                                    >
                                        <div className="thread-info">
                                            <div className="thread-title">{thread.title}</div>
                                            <div className="thread-date">{formatDate(thread.updatedAt)}</div>
                                        </div>
                                        <button
                                            className="delete-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteThread(thread.threadId);
                                            }}
                                            title="Delete conversation"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>
            )}

            <div className="sidebar-footer">
                {!sidebarCollapsed && (
                    <>
                        <div className="user-profile">
                            <div className="user-avatar">
                                <span>{user?.name?.charAt(0).toUpperCase() || "?"}</span>
                            </div>
                            <div className="user-info">
                                <div className="user-name">{user?.name || "Not logged in"}</div>
                                <div className="user-email">{user?.email || "Please sign up"}</div>
                            </div>
                        </div>

                        <div className="brand-footer">
                            <p>Powered by <strong>Nivonix AI</strong></p>
                            <button
                                className="logout-btn btn-ghost"
                                onClick={handleLogout}
                                title="Sign out"
                                style={{ width: '100%', marginTop: '0.5rem' }}
                            >
                                <i className="fas fa-sign-out-alt"></i>
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}

export default Sidebar;