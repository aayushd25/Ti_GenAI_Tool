import React, { useEffect, useRef, useState } from "react";
import './App.css';

const App = () => {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [storedUsers, setStoredUsers] = useState(
    JSON.parse(localStorage.getItem("users")) || {}
  );
  const [activeChat, setActiveChat] = useState(0);
  const [chats, setChats] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("user") ? true : false
  );
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      const currentUser = localStorage.getItem("user");
      const storedChats = JSON.parse(localStorage.getItem(`chats_${currentUser}`)) || [
        {
          id: 0,
          title: "Chat 1",
          messages: [{ text: "Hello! How can I help you?", sender: "bot" }],
        },
      ];
      setChats(storedChats);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(`chats_${user}`, JSON.stringify(chats));
    }
  }, [chats, isAuthenticated, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const handleRegister = () => {
    if (user && password) {
      if (!storedUsers[user]) {
        const updatedUsers = { ...storedUsers, [user]: password };
        localStorage.setItem("users", JSON.stringify(updatedUsers));
        setStoredUsers(updatedUsers);
        localStorage.setItem("user", user);
        setIsAuthenticated(true);
      } else {
        alert("Username already exists!");
      }
    }
  };

  const handleLogin = () => {
    if (storedUsers[user] && storedUsers[user] === password) {
      localStorage.setItem("user", user);
      setIsAuthenticated(true);
    } else {
      alert("Invalid username or password");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser("");
    setPassword("");
    setChats([]);
    setIsAuthenticated(false);
  };

  const createNewChat = () => {
    const newChatId = chats.length;
    const newChat = {
      id: newChatId,
      title: `Chat ${newChatId + 1}`,
      messages: [{ text: "Hello! How can I help you?", sender: "bot" }],
    };
    setChats([...chats, newChat]);
    setActiveChat(newChatId);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Store the message and clear the input immediately
    const messageToSend = input;
    setInput("");

    // Append the user's message to the chat
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === activeChat
          ? {
              ...chat,
              messages: [...chat.messages, { text: messageToSend, sender: "user" }],
            }
          : chat
      )
    );

    setIsTyping(true);

    try {
      // Send a POST request to the /query endpoint of the Flask backend
      const response = await fetch("http://localhost:5000/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: messageToSend }),
      });
      const data = await response.json();

      // Append the bot's response to the chat
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChat
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  { text: data.response, sender: "bot" },
                ],
              }
            : chat
        )
      );
    } catch (error) {
      console.error("Error querying model:", error);
    }

    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="login-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <h2 style={{ fontSize: '32px', textAlign: 'center' }}>TI Generative AI Tool</h2>
        <div>
          <input
            type="text"
            placeholder="Username"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleRegister}>Register</button>
        </div>
      </div>
    );
  }

  const currentChat = chats.find((chat) => chat.id === activeChat);

  return (
    <div className="chat-container">
      <div className="sidebar">
        <h2>Chats</h2>
        <button onClick={createNewChat} className="new-chat-btn">New Chat</button>
        <div className="chat-list">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`chat-item ${activeChat === chat.id ? "active" : ""}`}
            >
              {chat.title}
            </button>
          ))}
        </div>
        <button onClick={handleLogout} className="logout-btn" style={{ marginTop: "auto" }}>Logout</button>
      </div>
      <div className="chat-main">
        <div className="messages">
          {currentChat?.messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className="bubble">{msg.text}</div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="chat-input"
          />
          <button onClick={sendMessage} className="send-btn">Send</button>
        </div>
      </div>
    </div>
  );
};

export default App;
