const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// ===== SESSION ID (ANONYMOUS) =====
let sessionId = localStorage.getItem("tianachat_session");
if (!sessionId) {
  sessionId = crypto.randomUUID();
  localStorage.setItem("tianachat_session", sessionId);
}

function timeNow() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

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

sendBtn.onclick = async () => {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  userInput.value = "";

  let typingBubble;
  setTimeout(() => {
    typingBubble = addMessage("Tianachat is typing…", "ai");
  }, 700);

  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sessionId })
  });

  const data = await res.json();

  setTimeout(() => {
    if (typingBubble) {
      typingBubble.textContent = data.reply;
    } else {
      addMessage(data.reply, "ai");
    }
  }, 900);
};

userInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendBtn.click();
});
