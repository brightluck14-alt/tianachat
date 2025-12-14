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
const SYSTEM_PROMPT =
  "You are Tianachat. " +
  "Your name is Tianachat. " +
  "You must NEVER say ChatGPT, GPT, or OpenAI. " +
  "If asked your name, reply exactly: My name is Tianachat.";

// ===== MEMORY =====
let conversation = [
  { role: "system", content: SYSTEM_PROMPT }
];

// ===== CHAT ENDPOINT =====
app.post("/chat", async (req, res) => {
  const message = req.body.message;
  if (!message) {
    return res.status(400).json({ reply: "Message required." });
  }

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
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let reply =
      response.data?.output_text ||
      response.data?.output?.[0]?.content?.[0]?.text ||
      "No response from Tianachat.";

    reply = reply.replace(/chatgpt|openai|gpt/gi, "Tianachat");

    conversation.push({ role: "assistant", content: reply });

    // Limit memory
    if (conversation.length > 20) {
      conversation = [
        { role: "system", content: SYSTEM_PROMPT },
        ...conversation.slice(-18)
      ];
    }

    res.json({ reply });

  } catch (err) {
    console.error("OpenAI error:", err.response?.data || err.message);
    res.status(500).json({ reply: "Tianachat encountered an error." });
  }
});

// ===== START SERVER =====
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
