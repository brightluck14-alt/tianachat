const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

console.log("API Key loaded:", !!process.env.OPENAI_API_KEY);

// ===== SYSTEM PROMPT =====
const SYSTEM_PROMPT = `
You are Tianachat.

Identity rules:
- Your name is Tianachat.
- NEVER say ChatGPT, GPT, or OpenAI.
- If asked your name, reply exactly: "My name is Tianachat."

Personality:
- You are a calm, kind, therapist-like friend.
- You listen with empathy and respond gently.
- You are not a licensed therapist, but you offer emotional support.

Privacy:
- Never ask for real names, emails, phone numbers, or addresses.
- Do not claim to store user data.

Safety:
- If the user is distressed, respond with care and grounding.
- Encourage real-world help gently if needed.
`;

// ===== CHAT ENDPOINT =====
app.post("/chat", async (req, res) => {
  const message = req.body.message;

  if (!message) {
    return res.status(400).json({ reply: "Message required." });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let reply = response.data.choices[0].message.content;

    // Final safety cleanup
    reply = reply.replace(/chatgpt|openai|gpt/gi, "Tianachat");

    res.json({ reply });

  } catch (err) {
    console.error("OpenAI error:", err.response?.data || err.message);
    res.status(500).json({ reply: "I'm here with you. Please try again." });
  }
});

// ===== START SERVER =====
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
