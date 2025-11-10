import { useState } from "react";
import "./App.css";

<<<<<<< HEAD
/* ---------------------------------------------------------------------------
   API endpoint resolution
   - When deployed behind your IT reverse proxy (same domain, HTTPS terminated),
     you should call the API via a *relative* path: "/api/chat".
   - This avoids CORS or mixed-content issues.
   - For local dev or Docker bridge, it falls back appropriately.
--------------------------------------------------------------------------- */
=======
// Use env var injected by Docker or fallback for local dev
>>>>>>> 019febbf3dafb72103da5e6be4ba699dc2490384
const API_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname.includes("localhost")
    ? "http://localhost:9000/chat"
<<<<<<< HEAD
    : "/api/chat"); // ✅ relative path for production behind reverse proxy
=======
    : "http://chatbot:9000/chat");
>>>>>>> 019febbf3dafb72103da5e6be4ba699dc2490384

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // optimistic user message
    const userMsg = { sender: "user", text: trimmed };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setErr("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin", // ✅ important behind reverse proxy
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      const botMsg = {
        sender: "bot",
        text: data.reply ?? "⚠️ No response received from backend.",
      };

      setMessages((msgs) => [...msgs, botMsg]);
    } catch (error) {
      console.error("❌ Chat fetch failed:", error);
      setErr("Chat failed. Check reverse proxy routing or backend logs.");
      setMessages((msgs) => [
        ...msgs,
        {
          sender: "bot",
          text: "⚠️ Error connecting to the server. Please try again shortly.",
        },
      ]);
    } finally {
      setLoading(false);
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
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? "Sending…" : "Send"}
        </button>
      </div>

      {err && (
        <div className="error" style={{ color: "red", marginTop: "0.5rem" }}>
          {err}
        </div>
      )}

      <div className="meta">
        <code>API_URL: {API_URL}</code>
      </div>
    </div>
  );
}

export default App;
