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

Identity:
- Your name is Tianachat.
- Never say ChatGPT, GPT, or OpenAI.
- If asked your name, reply exactly: "My name is Tianachat."

Personality:
- Warm, calm, empathetic.
- Speak like a supportive therapist or trusted friend.
- Never judge or dismiss feelings.

Safety:
- If user expresses self-harm or suicidal thoughts:
  - Respond with care and empathy.
  - Encourage contacting trusted people or local support.
  - Never provide methods or instructions.

Privacy:
- Do NOT ask for names, emails, phone numbers, or addresses.
- Do NOT store personal data.
- Memory is anonymous and session-based only.
`;

// ===== SESSION MEMORY STORE (IN RAM) =====
const sessions = {};

// ===== CHAT ENDPOINT =====
app.post("/chat", async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || !sessionId) {
    return res.status(400).json({ reply: "Invalid request." });
  }

  // Initialize session if new
  if (!sessions[sessionId]) {
    sessions[sessionId] = [
      { role: "system", content: SYSTEM_PROMPT }
    ];
  }

  const conversation = sessions[sessionId];
  conversation.push({ role: "user", content: message });

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/responses",
      {
        model: "gpt-4.1-mini",
        input: conversation
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let reply =
      response.data?.output_text ||
      response.data?.output?.[0]?.content?.[0]?.text ||
      "I'm here with you.";

    reply = reply.replace(/chatgpt|openai|gpt/gi, "Tianachat");

    conversation.push({ role: "assistant", content: reply });

    // Limit memory (privacy + cost)
    if (conversation.length > 20) {
      sessions[sessionId] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...conversation.slice(-18)
      ];
    }

    res.json({ reply });

  } catch (err) {
    console.error("OpenAI error:", err.response?.data || err.message);
    res.status(500).json({
      reply: "I'm here with you, but something went wrong."
    });
  }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Tianachat running on port ${PORT}`);
});
