const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

/* ---------- TIME ---------- */
function timeNow() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

/* ---------- ADD MESSAGE ---------- */
function addMessage(text, role) {
  const msg = document.createElement("div");
  msg.className = `message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "🙂" : "🧠";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  const time = document.createElement("div");
  time.className = "time";
  time.textContent = timeNow();

  const wrapper = document.createElement("div");
  wrapper.appendChild(bubble);
  wrapper.appendChild(time);

  if (role === "user") {
    msg.appendChild(wrapper);
    msg.appendChild(avatar);
  } else {
    msg.appendChild(avatar);
    msg.appendChild(wrapper);
  }

  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  userInput.focus();

  return bubble;
}

/* ---------- GREETING ON LOAD ---------- */
window.onload = () => {
  setTimeout(() => {
    addMessage(
      "Hello there 😊 I’m Tianachat. I’m here to listen and support you. How can I help today?",
      "ai"
    );
  }, 600);
};

/* ---------- SEND MESSAGE ---------- */
sendBtn.onclick = async () => {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  userInput.value = "";

  let typingBubble;

  // Delay typing indicator (human feel)
  setTimeout(() => {
    typingBubble = addMessage("Tianachat is typing…", "ai");
  }, 400);

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();

    // Small delay before response replaces typing
    setTimeout(() => {
      if (typingBubble) {
        typingBubble.textContent = data.reply;
      }
    }, 700);

  } catch (err) {
    if (typingBubble) {
      typingBubble.textContent =
        "I’m here with you, but something went wrong. Please try again.";
    }
  }
};

/* ---------- ENTER KEY ---------- */
userInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendBtn.click();
});
