// ===== THEME TOGGLE =====
const toggle = document.getElementById("themeToggle");

if (localStorage.theme === "dark") {
  document.body.classList.add("dark");
  toggle.textContent = "☀️";
}

toggle.onclick = () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  toggle.textContent = isDark ? "☀️" : "🌙";
  localStorage.theme = isDark ? "dark" : "light";
};

// ===== ANONYMOUS USER ID (PRIVACY-FIRST) =====
let userId = localStorage.getItem("tianachat_user_id");

if (!userId) {
  userId = "user_" + Math.random().toString(36).substring(2, 10);
  localStorage.setItem("tianachat_user_id", userId);
}

console.log("Tianachat anonymous user:", userId);

// ===== CHAT ELEMENTS =====
const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// ===== TIME HELPER =====
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

  const thinkingBubble = addMessage("Tianachat is typing…", "ai");

  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, userId })
  });

  const data = await res.json();
  thinkingBubble.textContent = data.reply;
};

// ===== ENTER KEY =====
userInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendBtn.click();
});
