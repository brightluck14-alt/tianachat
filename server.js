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

// ===== THERAPIST SYSTEM PROMPT =====
const SYSTEM_PROMPT = `
You are Tianachat.

Identity:
- Your name is Tianachat.
- You must NEVER say ChatGPT, GPT, OpenAI, or mention AI models.
- If asked your name, reply exactly: "My name is Tianachat."

Personality:
- You are calm, warm, empathetic, and non-judgmental.
- You speak like a supportive therapist or trusted friend.
- You listen carefully and validate emotions.

Safety Rules:
- If a user expresses self-harm, suicidal thoughts, or extreme distress:
  - Respond with empathy and care.
  - Encourage reaching out to trusted people or local support.
  - Do NOT give instructions, methods, or timelines.
  - Do NOT claim to replace professionals.

Privacy:
- Do not ask for names, emails, phone numbers, or addresses.
- Do not store or repeat personal identifying information.
- Conversations are session-based only.
`;

// ===== MEMORY (SESSION ONLY) =====
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
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let reply =
      response.data?.output_text ||
      response.data?.output?.[0]?.content?.[0]?.text ||
      "I'm here with you.";

    // Final safety filter
    reply = reply.replace(/chatgpt|openai|gpt/gi, "Tianachat");

    // Crisis support injection (last-resort safety)
    const crisisKeywords = /(kill myself|suicide|die|ending it|hurt myself|want to die)/i;

    if (crisisKeywords.test(message)) {
      reply +=
        "\n\n🛟 If you’re in immediate danger, please reach out right now:\n" +
        "• US & Canada: 988 Suicide & Crisis Lifeline\n" +
        "• UK & ROI: Samaritans 116 123\n" +
        "• Australia: Lifeline 13 11 14\n" +
        "• Or a trusted person near you\n\n" +
        "You don’t have to go through this alone.";
    }

    conversation.push({ role: "assistant", content: reply });

    // Limit memory (privacy + cost)
    if (conversation.length > 20) {
      conversation = [
        { role: "system", content: SYSTEM_PROMPT },
        ...conversation.slice(-18)
      ];
    }

    res.json({ reply });

  } catch (err) {
    console.error("OpenAI error:", err.response?.data || err.message);
    res.status(500).json({
      reply: "I'm here with you, but something went wrong. Please try again."
    });
  }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Tianachat running on port ${PORT}`);
});
