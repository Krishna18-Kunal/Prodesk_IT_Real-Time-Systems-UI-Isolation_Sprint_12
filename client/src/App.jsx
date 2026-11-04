import { useEffect, useRef, useState } from "react";
import {
  MessageCircle, Send, Hash, Headphones, Users, Wifi, WifiOff,
  LogOut, Sparkles, CornerDownLeft
} from "lucide-react";
import { createSocket } from "./socket";

const ROOMS = [
  { name: "General", description: "Everyday conversations", icon: Hash },
  { name: "Tech Support", description: "Ask and help with tech", icon: Headphones }
];

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function App() {
  const [usernameInput, setUsernameInput] = useState("");
  const [username, setUsername] = useState("");
  const [activeRoom, setActiveRoom] = useState("General");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [connected, setConnected] = useState(false);
  const [joined, setJoined] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  useEffect(() => {
    if (!joined || !socketRef.current) return;
    const socket = socketRef.current;
    setMessages([]);
    setTypingUsers([]);
    socket.emit("join-room", { username, room: activeRoom });
    return () => {
      socket.emit("stop-typing");
    };
  }, [activeRoom, joined, username]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socketRef.current?.disconnect();
    };
  }, []);

  function joinChat(event) {
    event.preventDefault();
    const safeName = usernameInput.trim().replace(/\s+/g, " ").slice(0, 24);
    if (!safeName) {
      setError("Please enter your name to continue.");
      return;
    }

    setError("");
    setUsername(safeName);
    const socket = createSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setJoined(true);
      // The room subscription is initiated by the joined/activeRoom effect below.
    });

    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => {
      setConnected(false);
      setError("Could not connect to the chat server. Check that the backend is running.");
    });

    socket.on("room-joined", ({ room }) => {
      setActiveRoom(room);
      setError("");
    });

    socket.on("new-message", (message) => {
      setMessages((current) => [...current, message]);
    });

    socket.on("system-message", (message) => {
      setMessages((current) => [...current, { ...message, type: "system" }]);
    });

    socket.on("user-typing", ({ socketId, username: name }) => {
      setTypingUsers((current) => current.some((user) => user.socketId === socketId)
        ? current : [...current, { socketId, username: name }]);
    });

    socket.on("user-stop-typing", ({ socketId }) => {
      setTypingUsers((current) => current.filter((user) => user.socketId !== socketId));
    });

    socket.on("chat-error", (message) => setError(message));
    socket.connect();
  }

  function sendMessage(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !socketRef.current?.connected) return;

    socketRef.current.emit("chat-message", { text });
    socketRef.current.emit("stop-typing");
    isTypingRef.current = false;
    setTypingUsers((current) => current);
    setDraft("");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }

  function handleDraftChange(event) {
    setDraft(event.target.value);
    const socket = socketRef.current;
    if (!socket?.connected) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing");
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing");
      isTypingRef.current = false;
    }, 1200);
  }

  function changeRoom(room) {
    if (room === activeRoom) return;
    socketRef.current?.emit("stop-typing");
    isTypingRef.current = false;
    setActiveRoom(room);
  }

  function leaveChat() {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setConnected(false);
    setJoined(false);
    setMessages([]);
    setTypingUsers([]);
    setDraft("");
    setUsername("");
    setUsernameInput("");
  }

  if (!joined) {
    return (
      <main className="entry-page">
        <div className="entry-glow glow-one" />
        <div className="entry-glow glow-two" />
        <section className="entry-card">
          <div className="brand-mark"><MessageCircle size={25} /></div>
          <div className="eyebrow"><Sparkles size={14} /> SPRINT 12 · REAL-TIME SYSTEMS</div>
          <h1>Good conversations<br /><span>start here.</span></h1>
          <p className="entry-copy">A simple space to connect, collaborate, and solve things together — in real time.</p>
          <form onSubmit={joinChat} className="entry-form">
            <label htmlFor="username">Your display name</label>
            <input
              id="username"
              value={usernameInput}
              onChange={(event) => setUsernameInput(event.target.value)}
              placeholder="e.g. Krishna"
              maxLength={24}
              autoComplete="nickname"
              autoFocus
            />
            <label>Choose your first room</label>
            <div className="entry-rooms">
              {ROOMS.map(({ name, description, icon: Icon }) => (
                <button
                  type="button"
                  key={name}
                  className={`entry-room ${activeRoom === name ? "selected" : ""}`}
                  onClick={() => setActiveRoom(name)}
                >
                  <Icon size={18} />
                  <span><strong>{name}</strong><small>{description}</small></span>
                  <span className="radio-dot" />
                </button>
              ))}
            </div>
            {error && <p className="error-text">{error}</p>}
            <button className="primary-button entry-submit" type="submit">
              Enter chat <CornerDownLeft size={17} />
            </button>
          </form>
          <div className="entry-foot"><span className="status-dot" /> Built for real-time collaboration</div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark small"><MessageCircle size={20} /></div>
          <div><strong>connect<span>x</span></strong><small>TEAM SPACE</small></div>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <div className="workspace-card">
          <div className="workspace-avatar">C</div>
          <div><strong>ConnectX Space</strong><small>Free workspace</small></div>
        </div>

        <div className="section-heading">CHANNELS <span>02</span></div>
        <nav className="room-nav">
          {ROOMS.map(({ name, description, icon: Icon }) => (
            <button
              key={name}
              onClick={() => changeRoom(name)}
              className={`room-link ${activeRoom === name ? "active" : ""}`}
            >
              <Icon size={17} />
              <span>{name}</span>
              {activeRoom === name && <i />}
              <small className="room-description">{description}</small>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-card">
            <div className="user-avatar">{username.charAt(0).toUpperCase()}</div>
            <div className="profile-info"><strong>{username}</strong><small>Active member</small></div>
            <button className="icon-button" title="Leave chat" onClick={leaveChat}><LogOut size={17} /></button>
          </div>
        </div>
      </aside>

      <section className="chat-panel">
        <header className="chat-header">
          <div className="channel-title">
            <div className="channel-icon">{activeRoom === "General" ? <Hash size={20} /> : <Headphones size={20} />}</div>
            <div><h2>{activeRoom}</h2><p>{ROOMS.find((room) => room.name === activeRoom)?.description}</p></div>
          </div>
          <div className="header-right">
            <div className={`connection-pill ${connected ? "online" : "offline"}`}>
              {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
              {connected ? "Connected" : "Reconnecting"}
            </div>
            <div className="member-pill"><Users size={15} /> Live room</div>
          </div>
        </header>

        <div className="messages-area">
          <div className="channel-intro">
            <div className="intro-icon">{activeRoom === "General" ? <Hash size={22} /> : <Headphones size={22} />}</div>
            <h3>Welcome to {activeRoom}</h3>
            <p>This is the beginning of the <strong>{activeRoom}</strong> channel. Messages here are only visible to people in this room.</p>
          </div>

          {messages.map((message, index) => {
            if (message.type === "system") {
              return <div className="system-message" key={`${message.timestamp}-${index}`}><span>{message.text}</span></div>;
            }
            const mine = message.username === username;
            return (
              <article className={`message-row ${mine ? "mine" : ""}`} key={message.id || index}>
                <div className="message-avatar">{message.username.charAt(0).toUpperCase()}</div>
                <div className="message-content">
                  <div className="message-meta"><strong>{message.username}</strong><time>{formatTime(message.timestamp)}</time></div>
                  <div className="message-bubble">{message.text}</div>
                </div>
              </article>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="composer-wrap">
          {typingUsers.length > 0 && (
            <div className="typing-line">
              <span className="typing-dots"><i /><i /><i /></span>
              {typingUsers.map((user) => user.username).join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
            </div>
          )}
          {error && <p className="error-text inline-error">{error}</p>}
          <form className="composer" onSubmit={sendMessage}>
            <input
              value={draft}
              onChange={handleDraftChange}
              placeholder={`Message #${activeRoom}`}
              maxLength={1000}
              disabled={!connected}
              aria-label="Write a message"
            />
            <span className="composer-hint">Enter to send</span>
            <button className="send-button" type="submit" disabled={!draft.trim() || !connected} aria-label="Send message">
              <Send size={18} />
            </button>
          </form>
          <div className="composer-footer"><span>Messages are live and room-specific.</span><span>{draft.length}/1000</span></div>
        </div>
      </section>
    </main>
  );
}
