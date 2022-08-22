// Make connection
const socket = io.connect();

// Query DOM
const body = document.querySelector("body");
const message = document.querySelector("#message");
const username = document.querySelector("#username");
const btn = document.querySelector("#send");
const output = document.querySelector("#output");
const feedback = document.querySelector("#feedback");
const chatWindow = document.querySelector("#chat-window");
// Emit events

console.log("STATUS ONLINE", username.value);
socket.emit("online", chatId, username.value);

btn.addEventListener("click", () => {
  socket.emit("chat", chatId, {
    username: username.value,
    message: message.value,
    timestamp: new Date(),
  });
  message.value = "";
  message.focus();
});

message.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    // Cancel the default action, if needed
    e.preventDefault();
    // Trigger the button element with a click
    btn.click();
  } else {
    socket.emit("typing", chatId, username.value);
  }
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
    new Date(data.timestamp).toLocaleString("en-UK").substring(0, 17) +
    "</p>" +
    "</div>";
  chatWindow.scrollTop = chatWindow.scrollHeight;
});

socket.on("message-history", (messages) => {
  if (messages.length) {
    messages.forEach((msg) => {
      output.innerHTML +=
        "<div class='d-flex justify-content-between'>" +
        "<p id='chat-message'><strong>" +
        msg.username +
        ": </strong>" +
        msg.message +
        "</p>" +
        "<p id='chat-date'>" +
        new Date(msg.timestamp).toLocaleString("en-GB").substring(0, 17) +
        "</p>" +
        "</div>";
    });
  }
});

socket.on("typing", (data) => {
  feedback.innerHTML = "<p><em>" + data + " is typing a message...</em></p>";
});
