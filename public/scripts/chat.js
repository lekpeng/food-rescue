// Make connection
// http://localhost:3000/
const socket = io.connect();

// Query DOM
const message = document.querySelector("#message");
const username = document.querySelector("#username");
const btn = document.querySelector("#send");
const output = document.querySelector("#output");
// const feedback = document.querySelector("#feedback");

// Emit events
btn.addEventListener("click", () => {
  socket.emit("chat", {
    username: username.value,
    message: message.value,
  });
});

// message.addEventListener("keypress", () => {
//   socket.emit("typing", handle.value);
// });

// Listen for events
socket.on("chat", (data) => {
  // feedback.innerHTML = "";
  output.innerHTML += "<p><strong>" + data.username + ": </strong>" + data.message + "</p>";
});

socket.on("message-history", (usernamesWithMessages) => {
  if (usernamesWithMessages.length) {
    usernamesWithMessages.forEach((individualData) => {
      output.innerHTML +=
        "<p><strong>" + individualData.username + ": </strong>" + individualData.message + "</p>";
    });
  }
});

// socket.on("typing", (data) => {
//   feedback.innerHTML = "<p><em>" + data + " is typing a message...</em></p>";
// });
