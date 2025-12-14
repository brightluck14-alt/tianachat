const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

function addMessage(text, cls) {
  const div = document.createElement("div");
  div.className = cls;
  div.textContent = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

sendBtn.onclick = async () => {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  userInput.value = "";

  const aiDiv = document.createElement("div");
  aiDiv.className = "ai";
  aiDiv.textContent = "Tianachat is thinking...";
  chatWindow.appendChild(aiDiv);

  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  const data = await res.json();
  aiDiv.textContent = data.reply;
};

userInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendBtn.click();
});
