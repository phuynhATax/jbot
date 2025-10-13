import React, { useState } from "react";
import "./App.css";

// Use env var injected by Docker or fallback for local dev
const API_URL = process.env.REACT_APP_API_URL || "http://192.168.110.27:9000/chat";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      const botMsg = { sender: "bot", text: data.reply };

      setMessages((msgs) => [...msgs, botMsg]);
    } catch (err) {
      console.error("❌ Chat fetch failed:", err);
      setMessages((msgs) => [
        ...msgs,
        { sender: "bot", text: "⚠️ Could not connect to backend. Check server logs." },
      ]);
    }
  };

  return (
    <div className="App">
      <h1>Alleviate Tax RSS Helper</h1>
      <div className="chatbox">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.sender === "user" ? "user" : "bot"}`}
          >
            <b>{msg.sender === "user" ? "You" : "Bot"}:</b> {msg.text}
          </div>
        ))}
      </div>
      <div className="inputBox">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
