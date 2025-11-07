import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: [
    "https://rssbot.ataxadmin.com", // ✅ allow your production domain
    "http://localhost:3000",        // ✅ allow local dev access
    "http://localhost:9001",          // your Docker frontend container
  ],
  credentials: true,
}));

// Serve static frontend files from the "public" directory
app.use(express.static("public"));

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_2,
});

// Health check route
app.get("/", (req, res) => {
  res.send("🚀 Chatbot backend is running!");
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // 🧠 Call OpenAI Responses API using your stored prompt + vector store
    const response = await openai.responses.create({
      model: "gpt-4.1-mini", // or "gpt-4o-mini" depending on your plan
      prompt: {
        id: "pmpt_68af946582848193940cff86bc54ab4c0c9fc3b51985dbb2", // your stored prompt ID
        version: "3",
      },
      input: [
        {
          role: "user",
          content: message,
        },
      ],
      text: {
        format: { type: "text" },
      },
      reasoning: {},
      tools: [
        {
          type: "file_search",
          vector_store_ids: [
            "vs_68af904b69b4819180a20c693f62d4b7", // your existing OpenAI knowledge base
          ],
        },
      ],
      max_output_tokens: 2048,
      store: true, // keeps conversation history on OpenAI
      include: ["web_search_call.action.sources"],
    });

    // Unified text output
    const botReply = response.output_text || "⚠️ No response from model.";

    // Respond to frontend
    res.json({ reply: botReply });
  } catch (err) {
    console.error("❌ Chat error:", err);
    res.status(500).json({ error: "Something went wrong with the chatbot." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Chatbot running at http://localhost:${PORT}`);
});
