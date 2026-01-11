import "./Chat.css";
import React, { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat() {
    const { newChat, prevChats, reply, isTyping, setIsTyping } = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);
    const [isStopped, setIsStopped] = useState(false);
    const messagesEndRef = useRef(null);
    const typingIntervalRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [prevChats, latestReply]);

    const handleStop = () => {
        setIsStopped(true);
        setIsTyping(false);
        if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert("Code copied to clipboard!");
        }).catch(() => {
            alert("Failed to copy code");
        });
    };

    useEffect(() => {
        if (reply === null) {
            setLatestReply(null);
            setIsStopped(false);
            return;
        }

        if (!prevChats?.length) return;

        const content = reply.split(" ");
        let idx = 0;
        
        typingIntervalRef.current = setInterval(() => {
            setLatestReply(content.slice(0, idx + 1).join(" "));
            idx++;
            if (idx >= content.length) {
                clearInterval(typingIntervalRef.current);
                setIsTyping(false);
            }
        }, 30);

        return () => {
            if (typingIntervalRef.current) {
                clearInterval(typingIntervalRef.current);
            }
        };
    }, [prevChats, reply, setIsTyping]);

    const CustomCodeBlock = ({ inline, className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || "");
        const language = match ? match[1] : null;
        const code = String(children).replace(/\n$/, "");

        if (inline) {
            return <code className={className}>{children}</code>;
        }

        // Only show copy button for actual code blocks with language specified
        if (!language) {
            return (
                <pre className="code-block">
                    <code className={className}>{children}</code>
                </pre>
            );
        }

        return (
            <div className="code-block-wrapper">
                <div className="code-block-header">
                    <span className="code-language">{language}</span>
                    <button
                        className="code-copy-btn"
                        onClick={() => copyToClipboard(code)}
                        title="Copy code"
                    >
                        <i className="fas fa-copy"></i>
                        <span>Copy Code</span>
                    </button>
                </div>
                <pre className="code-block">
                    <code className={className}>{children}</code>
                </pre>
            </div>
        );
    };

    return (
        <div className="chat-container">
            {newChat ? (
                <div className="empty-state-container">
                    <div className="empty-state">
                        <div className="empty-icon">
                            <i className="fas fa-sparkles"></i>
                        </div>
                        <h1>Welcome to Nivonix AI</h1>
                        <p>Start a conversation by asking anything</p>
                    </div>
                </div>
            ) : (
                <div className="messages-container">
                    {prevChats?.slice(0, -1).map((chat, idx) => (
                        <div key={idx} className={`message-group ${chat.role}`}>
                            <div className="message-avatar">
                                {chat.role === "user" ? (
                                    <i className="fas fa-user"></i>
                                ) : (
                                    <div className="ai-avatar">
                                        <span>N</span>
                                    </div>
                                )}
                            </div>
                            <div className="message-content-wrapper">
                                <div className={`message-bubble ${chat.role}`}>
                                    {chat.role === "user" ? (
                                        <p className="user-message">{chat.content}</p>
                                    ) : (
                                        <div className="assistant-message">
                                            <ReactMarkdown
                                                rehypePlugins={[rehypeHighlight]}
                                                components={{ code: CustomCodeBlock }}
                                            >
                                                {chat.content}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {prevChats.length > 0 && (
                        <div className="message-group assistant">
                            <div className="message-avatar">
                                <div className="ai-avatar">
                                    <span>N</span>
                                </div>
                            </div>
                            <div className="message-content-wrapper">
                                <div className="message-bubble assistant">
                                    <div className="assistant-message">
                                        {latestReply === null ? (
                                            <ReactMarkdown
                                                rehypePlugins={[rehypeHighlight]}
                                                components={{ code: CustomCodeBlock }}
                                            >
                                                {prevChats[prevChats.length - 1].content}
                                            </ReactMarkdown>
                                        ) : (
                                            <>
                                                <ReactMarkdown
                                                    rehypePlugins={[rehypeHighlight]}
                                                    components={{ code: CustomCodeBlock }}
                                                >
                                                    {latestReply}
                                                </ReactMarkdown>
                                                {isTyping && !isStopped && <span className="typing-cursor"></span>}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}
        </div>
    );
}

export default Chat;