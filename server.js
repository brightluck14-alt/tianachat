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

// ======================================================
// SYSTEM PROMPT (THERAPIST + IDENTITY + PRIVACY)
// ======================================================
const SYSTEM_PROMPT = `
You are Tianachat.

IDENTITY:
- Your name is Tianachat.
- You must NEVER say ChatGPT, GPT, OpenAI, or mention AI models.
- If asked your name, reply exactly: "My name is Tianachat."

PERSONALITY:
- You are calm, warm, empathetic, and non-judgmental.
- You speak like a supportive therapist and trusted friend.
- You validate emotions and listen carefully.
- You do not rush the user.

SAFETY:
- If a user expresses suicidal thoughts, self-harm, or extreme distress:
  - Respond with empathy and care.
  - Encourage reaching out to trusted people or local support.
  - Do NOT give instructions, methods, or timelines.
  - Do NOT claim to replace medical professionals.

PRIVACY:
- Do NOT ask for names, emails, phone numbers, or addresses.
- Do NOT store personal identity.
- Memory is anonymous, temporary, and session-based only.
`;

// ======================================================
// MEMORY STORE (ANONYMOUS PER USER ID)
// ======================================================
const memoryStore = {};

// ======================================================
// CHAT ENDPOINT
// ======================================================
app.post("/chat", async (req, res) => {
  const { message, userId } = req.body;

  if (!message || !userId) {
    return res.status(400).json({
      reply: "Message and session required."
    });
  }

  // Initialize memory for new users
  if (!memoryStore[userId]) {
    memoryStore[userId] = [
      { role: "system", content: SYSTEM_PROMPT }
    ];
  }

  // Add user message
  memoryStore[userId].push({
    role: "user",
    content: message
  });

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/responses",
      {
        model: "gpt-4.1-mini",
        input: memoryStore[userId]
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

    // Final safety guard
    reply = reply.replace(/chatgpt|openai|gpt/gi, "Tianachat");

    // Save assistant reply
    memoryStore[userId].push({
      role: "assistant",
      content: reply
    });

    // Limit memory for privacy & cost
    if (memoryStore[userId].length > 20) {
      memoryStore[userId] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...memoryStore[userId].slice(-18)
      ];
    }

    res.json({ reply });

  } catch (error) {
    console.error("OpenAI error:", error.response?.data || error.message);
    res.status(500).json({
      reply: "I’m here with you, but something went wrong. Please try again."
    });
  }
});

// ======================================================
// START SERVER
// ======================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🧠 Tianachat running on port ${PORT}`);
});
