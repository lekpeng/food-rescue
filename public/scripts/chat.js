// Make connection
// http://localhost:3000/
const socket = io.connect();

// Query DOM
const body = document.querySelector("body");
const message = document.querySelector("#message");
const username = document.querySelector("#username");
const btn = document.querySelector("#send");
const output = document.querySelector("#output");
const feedback = document.querySelector("#feedback");
const onlineUsers = document.querySelector("#online-users");
const inChatUsers = document.querySelector("#in-chat-users");

// Emit events

socket.emit("online", username.value);

btn.addEventListener("click", () => {
  socket.emit("chat", {
    username: username.value,
    message: message.value,
    timestamp: new Date(),
  });
});

message.addEventListener("keypress", () => {
  socket.emit("typing", username.value);
});

// Listen for events

socket.on("chat", (data) => {
  feedback.innerHTML = "";
  output.innerHTML +=
    "<div class='d-flex justify-content-between'>" +
    "<p id='chat-message'><strong>" +
    data.username +
    ": </strong>" +
    data.message +
    "</p>" +
    "<p id='chat-date'>" +
    new Date(data.timestamp).toLocaleString("en-GB").substring(0, 17) +
    "</p>" +
    "</div>";
});

socket.on("message-history", (usernamesWithMessages) => {
  if (usernamesWithMessages.length) {
    usernamesWithMessages.forEach((data) => {
      output.innerHTML +=
        "<div class='d-flex justify-content-between'>" +
        "<p id='chat-message'><strong>" +
        data.username +
        ": </strong>" +
        data.message +
        "</p>" +
        "<p id='chat-date'>" +
        new Date(data.timestamp).toLocaleString("en-GB").substring(0, 17) +
        "</p>" +
        "</div>";
    });
  }
});

socket.on("connected", (personUsername) => {
  console.log("connected", personUsername);
  onlineUsers.innerHTML += "<li>" + personUsername + " joined the chat" + "</li>";
});

socket.on("disconnected", (personUsername) => {
  console.log("disconnected", personUsername);
  onlineUsers.innerHTML += "<li>" + personUsername + " left the chat" + "</li>";
});

socket.on("update-online-chat", (objOfSocketIdsAndUsernames) => {
  inChatUsers.innerHTML = "";
  Object.values(objOfSocketIdsAndUsernames).forEach((username) => {
    inChatUsers.innerHTML += "<li>" + username + "</li>";
  });
});

socket.on("typing", (data) => {
  feedback.innerHTML = "<p><em>" + data + " is typing a message...</em></p>";
});
