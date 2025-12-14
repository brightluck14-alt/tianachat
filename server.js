app.post("/chat", async (req, res) => {
  const { message, userId } = req.body;

  if (!message || !userId) {
    return res.status(400).json({ reply: "Invalid request." });
  }

  // Create memory for this user if it doesn't exist
  if (!userMemory[userId]) {
    userMemory[userId] = [
      { role: "system", content: SYSTEM_PROMPT }
    ];
  }

  const conversation = userMemory[userId];
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

    // Keep memory short for privacy
    if (conversation.length > 20) {
      userMemory[userId] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...conversation.slice(-18)
      ];
    }

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      reply: "I'm here with you, but something went wrong."
    });
  }
});
