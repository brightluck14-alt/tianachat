const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = `bubble ${type}`; // ✅ IMPORTANT FIX
  div.textContent = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

sendBtn.onclick = async () => {
  const message = userInput.value.trim();
  if (!message) return;

  // User message
  addMessage(message, "user");
  userInput.value = "";

  // Typing indicator
  const typingDiv = document.createElement("div");
  typingDiv.className = "typing";
  typingDiv.textContent = "Tianachat is typing...";
  chatWindow.appendChild(typingDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();

    typingDiv.remove();
    addMessage(data.reply, "ai");

  } catch (err) {
    typingDiv.remove();
    addMessage("Tianachat encountered an error.", "ai");
  }
};

userInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendBtn.click();
});
