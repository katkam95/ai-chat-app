import { useState, useRef, useEffect, useCallback } from "react";
import { fetchAIResponse } from "./api.js";
import "./App.css";

function formatMessage(text) {
  if (!text) return "";
  return text
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser  = message.role === "user";
  const isError = message.isError;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className={`message-wrapper ${isUser ? "user-wrapper" : "ai-wrapper"}`}>
      <div className={`avatar ${isUser ? "user-avatar" : "ai-avatar"}`}>
        {isUser ? "You" : "AI"}
      </div>
      <div className={`bubble ${isUser ? "user-bubble" : "ai-bubble"} ${isError ? "error-bubble" : ""}`}>
        <div
          className="bubble-text"
          dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
        />
        <div className="bubble-footer">
          <span className="timestamp">{message.time}</span>
          {!isUser && !isError && (
            <button className="copy-btn" onClick={handleCopy}>
              {copied ? "✓ Copied" : "Copy"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="message-wrapper ai-wrapper">
      <div className="avatar ai-avatar">AI</div>
      <div className="bubble ai-bubble typing-bubble">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
}

export default function App() {
  const defaultMessages = [
    {
      role: "ai",
      text: "Hello! Ask me anything.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      id: "welcome",
    },
  ];

  const getInitialMessages = () => {
    try {
      const saved = localStorage.getItem("chatMessages");
      return saved ? JSON.parse(saved) : defaultMessages;
    } catch {
      return defaultMessages;
    }
  };

  const [messages, setMessages]   = useState(getInitialMessages);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [charCount, setCharCount] = useState(0);

  const MAX_CHARS = 1000;

  const chatEndRef    = useRef(null);
  const inputRef      = useRef(null);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val.length <= MAX_CHARS) {
      setInput(val);
      setCharCount(val.length);
      if (error) setError("");
    }
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { role: "user", text: trimmed, time, id: Date.now() };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setCharCount(0);
    setLoading(true);
    setError("");

    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    try {
      const response = await fetchAIResponse(trimmed);
      const aiMsg = {
        role: "ai",
        text: response,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        id: Date.now() + 1,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `⚠️ ${err.message || "Something went wrong"}`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          id: Date.now() + 1,
          isError: true,
        },
      ]);
      setError(err.message);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, loading]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([defaultMessages[0]]);
    setError("");
    localStorage.removeItem("chatMessages");
  };

  const messageCount = messages.filter((m) => m.role === "user").length;
  const nearLimit    = charCount > MAX_CHARS - 100;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">✦</div>
          <span className="logo-text">Chat AI</span>
        </div>
        <div className="sidebar-stats">
          <div className="stat">
            <span className="stat-value">{messageCount}</span>
            <span className="stat-label">Messages</span>
          </div>
        </div>
      </aside>

      <main className="chat-main">
        <header className="chat-header">
          <div className="header-left">
            <span className="status-dot" />
            <div>
              <div className="header-title">AI Assistant</div>
              <div className="header-subtitle">
                <span className="status-label">Online</span>
              </div>
            </div>
          </div>
          <button className="clear-btn" onClick={clearChat}>
            Clear chat
          </button>
        </header>

        <div className="chat-window" ref={chatWindowRef}>
          {messages.map((msg, i) => (
            <MessageBubble key={msg.id || i} message={msg} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={chatEndRef} />
        </div>

        <div className="input-area">
          {error && (
            <div className="error-banner">
              <span>⚠️ {error}</span>
              <button className="dismiss-btn" onClick={() => setError("")}>✕</button>
            </div>
          )}

          <div className="input-row">
            <div className="textarea-wrap">
              <textarea
                ref={inputRef}
                className="chat-input"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                disabled={loading}
                rows={1}
              />
              {charCount > 0 && (
                <span className={`char-count ${nearLimit ? "near-limit" : ""}`}>
                  {charCount}/{MAX_CHARS}
                </span>
              )}
            </div>

            <button
              className={`send-btn ${loading ? "sending" : ""}`}
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              {loading ? <span className="send-spinner" /> : <SendIcon />}
            </button>
          </div>

          <p className="input-hint">
            <kbd>Enter</kbd> to send &nbsp;·&nbsp; <kbd>Shift + Enter</kbd> for new line
          </p>
        </div>
      </main>
    </div>
  );
}
