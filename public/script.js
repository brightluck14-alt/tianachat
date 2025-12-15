const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// ---- USER ID (ANONYMOUS) ----
let userId = localStorage.getItem("tianachat_id");
if (!userId) {
  userId = "tc_" + Math.random().toString(36).substring(2, 10);
  localStorage.setItem("tianachat_id", userId);
}

// ---- GREETING (ONCE) ----
if (!localStorage.getItem("greeted")) {
  addMessage(
    "Hello, I’m Tianachat. I’m here to listen and support you. How are you feeling today?",
    "ai"
  );
  localStorage.setItem("greeted", "yes");
}

// ---- TIME ----
function timeNow() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

// ---- ADD MESSAGE ----
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

  role === "user"
    ? (msg.appendChild(wrapper), msg.appendChild(avatar))
    : (msg.appendChild(avatar), msg.appendChild(wrapper));

  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  return bubble;
}

// ---- SEND MESSAGE ----
sendBtn.onclick = async () => {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  userInput.value = "";

  const typing = addMessage("Tianachat is typing…", "ai");

  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, userId })
  });

  const data = await res.json();
  typing.textContent = data.reply;
};

userInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendBtn.click();
});
