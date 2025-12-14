const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// ===== GREETING ON LOAD =====
window.onload = () => {
  addMessage(
    "Hello there 👋 I’m Tianachat. I’m here to listen and support you. What’s been on your mind today?",
    "ai"
  );
  userInput.focus();
};

// ===== TIME =====
function timeNow() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

// ===== ADD MESSAGE =====
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

  return bubble;
}

// ===== SEND MESSAGE =====
sendBtn.onclick = async () => {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  userInput.value = "";

  // Delay typing indicator (more human)
  let thinkingBubble;
  setTimeout(() => {
    thinkingBubble = addMessage("Tianachat is typing…", "ai");
  }, 400);

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();

    setTimeout(() => {
      if (thinkingBubble) {
        thinkingBubble.textContent = data.reply;
      } else {
        addMessage(data.reply, "ai");
      }
      userInput.focus();
    }, 700);

  } catch (err) {
    addMessage(
      "I’m here with you, but something went wrong. Please try again.",
      "ai"
    );
  }
};

// ===== ENTER KEY =====
userInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendBtn.click();
});
