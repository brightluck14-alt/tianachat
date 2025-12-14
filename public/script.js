const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

function addMessage(text, cls) {
  const div = document.createElement("div");
  div.className = `bubble ${cls}`;
  div.textContent = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Typing animation
function showTyping() {
  const div = document.createElement("div");
  div.className = "typing";
  div.id = "typing-indicator";
  div.textContent = "Tianachat is typing";
  chatWindow.appendChild(div);

  let dots = 0;
  const interval = setInterval(() => {
    dots = (dots + 1) % 4;
    div.textContent = "Tianachat is typing" + ".".repeat(dots);
  }, 500);

  return interval;
}

sendBtn.onclick = async () => {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  userInput.value = "";

  const typingInterval = showTyping();

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();

    clearInterval(typingInterval);
    document.getElementById("typing-indicator")?.remove();

    addMessage(data.reply, "ai");
  } catch (err) {
    clearInterval(typingInterval);
    document.getElementById("typing-indicator")?.remove();
    addMessage("Tianachat encountered an error.", "ai");
  }
};

userInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendBtn.click();
});
