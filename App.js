// App.js – Plain JavaScript version of the chat application

// Global state
var state = {
  user: localStorage.getItem("user") || null,
  storedUsers: JSON.parse(localStorage.getItem("users")) || {},
  activeChat: 0,
  chats: []
};

// Save chats to localStorage for the logged-in user
function saveChats() {
  if (state.user) {
    localStorage.setItem("chats_" + state.user, JSON.stringify(state.chats));
  }
}

// Load chats from localStorage; create a default chat if none exists
function loadChats() {
  if (state.user) {
    var stored = localStorage.getItem("chats_" + state.user);
    if (stored) {
      state.chats = JSON.parse(stored);
    } else {
      state.chats = [
        {
          id: 0,
          title: "Chat 1",
          messages: [
            { text: "Hello! How can I help you?", sender: "bot" }
          ]
        }
      ];
    }
  }
}

// Render the login and registration view
function renderLogin() {
  var app = document.getElementById("app");
  app.innerHTML = "";

  var container = document.createElement("div");
  container.className = "login-container";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.alignItems = "center";
  container.style.justifyContent = "center";
  container.style.height = "100vh";

  var title = document.createElement("h2");
  title.style.fontSize = "32px";
  title.style.textAlign = "center";
  title.textContent = "TI Generative AI Tool";
  container.appendChild(title);

  var usernameInput = document.createElement("input");
  usernameInput.type = "text";
  usernameInput.placeholder = "Username";
  container.appendChild(usernameInput);

  var passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.placeholder = "Password";
  container.appendChild(passwordInput);

  var loginBtn = document.createElement("button");
  loginBtn.textContent = "Login";
  loginBtn.onclick = function() {
    var username = usernameInput.value.trim();
    var password = passwordInput.value.trim();
    if (state.storedUsers[username] && state.storedUsers[username] === password) {
      state.user = username;
      localStorage.setItem("user", username);
      loadChats();
      renderChat();
    } else {
      alert("Invalid username or password");
    }
  };
  container.appendChild(loginBtn);

  var registerBtn = document.createElement("button");
  registerBtn.textContent = "Register";
  registerBtn.onclick = function() {
    var username = usernameInput.value.trim();
    var password = passwordInput.value.trim();
    if (username && password) {
      if (!state.storedUsers[username]) {
        state.storedUsers[username] = password;
        localStorage.setItem("users", JSON.stringify(state.storedUsers));
        state.user = username;
        localStorage.setItem("user", username);
        loadChats();
        renderChat();
      } else {
        alert("Username already exists!");
      }
    }
  };
  container.appendChild(registerBtn);

  app.appendChild(container);
}

// Render the main chat interface
function renderChat() {
  var app = document.getElementById("app");
  app.innerHTML = "";

  // Main chat container
  var chatContainer = document.createElement("div");
  chatContainer.className = "chat-container";

  // Sidebar with chat list, new chat button, and logout
  var sidebar = document.createElement("div");
  sidebar.className = "sidebar";

  var chatsTitle = document.createElement("h2");
  chatsTitle.textContent = "Chats";
  sidebar.appendChild(chatsTitle);

  var newChatBtn = document.createElement("button");
  newChatBtn.className = "new-chat-btn";
  newChatBtn.textContent = "New Chat";
  newChatBtn.onclick = function() {
    var newChatId = state.chats.length;
    var newChat = {
      id: newChatId,
      title: "Chat " + (newChatId + 1),
      messages: [{ text: "Hello! How can I help you?", sender: "bot" }]
    };
    state.chats.push(newChat);
    state.activeChat = newChatId;
    saveChats();
    renderChat();
  };
  sidebar.appendChild(newChatBtn);

  var chatList = document.createElement("div");
  chatList.className = "chat-list";
  state.chats.forEach(function(chat, index) {
    var chatBtn = document.createElement("button");
    chatBtn.className = "chat-item" + (state.activeChat === index ? " active" : "");
    chatBtn.textContent = chat.title;
    chatBtn.onclick = function() {
      state.activeChat = index;
      renderChat();
    };
    chatList.appendChild(chatBtn);
  });
  sidebar.appendChild(chatList);

  var logoutBtn = document.createElement("button");
  logoutBtn.className = "logout-btn";
  logoutBtn.textContent = "Logout";
  logoutBtn.style.marginTop = "auto";
  logoutBtn.onclick = function() {
    localStorage.removeItem("user");
    state.user = null;
    renderLogin();
  };
  sidebar.appendChild(logoutBtn);

  chatContainer.appendChild(sidebar);

  // Main chat area with messages and input
  var chatMain = document.createElement("div");
  chatMain.className = "chat-main";

  var messagesDiv = document.createElement("div");
  messagesDiv.className = "messages";

  var currentChat = state.chats[state.activeChat];
  if (currentChat && currentChat.messages) {
    currentChat.messages.forEach(function(msg) {
      var msgDiv = document.createElement("div");
      msgDiv.className = "message " + msg.sender;
      var bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.textContent = msg.text;
      msgDiv.appendChild(bubble);
      messagesDiv.appendChild(msgDiv);
    });
  }
  // Dummy element for scrolling
  var dummyScroll = document.createElement("div");
  messagesDiv.appendChild(dummyScroll);

  chatMain.appendChild(messagesDiv);

  // Input container
  var inputContainer = document.createElement("div");
  inputContainer.className = "input-container";

  var inputField = document.createElement("input");
  inputField.type = "text";
  inputField.placeholder = "Type a message...";
  inputField.className = "chat-input";
  inputField.onkeypress = function(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputField);
    }
  };
  inputContainer.appendChild(inputField);

  var sendBtn = document.createElement("button");
  sendBtn.className = "send-btn";
  sendBtn.textContent = "Send";
  sendBtn.onclick = function() {
    sendMessage(inputField);
  };
  inputContainer.appendChild(sendBtn);

  chatMain.appendChild(inputContainer);
  chatContainer.appendChild(chatMain);

  app.appendChild(chatContainer);

  // Scroll to bottom
  dummyScroll.scrollIntoView({ behavior: "smooth" });
}

// Send a message and process response from backend
function sendMessage(inputField) {
  var messageToSend = inputField.value.trim();
  if (!messageToSend) return;
  inputField.value = ""; // clear input immediately

  var currentChat = state.chats[state.activeChat];
  // Append user's message
  currentChat.messages.push({ text: messageToSend, sender: "user" });
  saveChats();
  renderChat();

  // Send POST request to Flask backend (update URL as needed)
  fetch("http://54.91.105.145:8000/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question: messageToSend })
  })
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    // Append bot's response
    currentChat.messages.push({ text: data.response, sender: "bot" });
    saveChats();
    renderChat();
  })
  .catch(function(error) {
    console.error("Error querying model:", error);
  });
}

// On page load, check authentication and render the appropriate view
window.onload = function() {
  if (state.user) {
    loadChats();
    renderChat();
  } else {
    renderLogin();
  }
};
