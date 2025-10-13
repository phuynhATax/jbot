// index.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { ChatOpenAI } from "@langchain/openai";
import { Client } from "pg";

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors()); // ✅ allow requests from browser (React UI)

// Postgres client
const db = new Client({
  connectionString: process.env.DATABASE_URL,
});

(async () => {
  try {
    await db.connect();
    console.log("✅ Connected to Postgres");
  } catch (err) {
    console.error("❌ Failed to connect to Postgres:", err);
  }
})();

// ChatGPT model
const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
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
    const response = await model.invoke([
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: message },
    ]);

    const botReply = response.content || "⚠️ No response from model.";

    // Optional: Save conversation to Postgres if table exists
    try {
      await db.query(
        "INSERT INTO conversations (user_message, bot_response) VALUES ($1, $2)",
        [message, botReply]
      );
    } catch (dbErr) {
      console.warn("⚠️ Skipping DB insert (table may not exist yet):", dbErr.message);
    }

    res.json({ reply: botReply });
  } catch (err) {
    console.error("❌ Chat error:", err);
    res.status(500).json({ error: "Something went wrong with the chatbot." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Chatbot running at http://localhost:${PORT}`);
});
