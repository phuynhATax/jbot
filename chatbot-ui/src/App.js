// ---------------------------------------------------------------
// App.js — Desktop chat UI with stable "Agent is thinking..." timer
// ---------------------------------------------------------------
import { useState, useEffect, useRef } from "react";
import "./App.css";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

marked.setOptions({
  highlight: (code) => hljs.highlightAuto(code).value,
  breaks: true,
});

const API_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname.includes("localhost")
    ? "http://localhost:9000/chat"
    : "/api/chat");

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  // ⏱️ independent timer
  useEffect(() => {
    if (loading) {
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [loading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg = { sender: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      const botMsg = {
        sender: "bot",
        text: marked.parse(data.reply || "⚠️ No response"),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("❌ Chat fetch failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            "⚠️ Error connecting to the server. Please try again shortly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header>
        <img src="alleviate_logo.svg" alt="Alleviate Tax Logo" />
        <h1>Alleviate Tax RSS Assistant</h1>
      </header>

      <div className="chatbox">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.sender === "user" ? "user" : "bot"}`}
            dangerouslySetInnerHTML={{ __html: msg.text }}
          />
        ))}

        {loading && (
          <div className="message bot thinking">
            <em>
              🤖 Agent is thinking
              <span className="dot-pulse">
                <span></span>
                <span></span>
                <span></span>
              </span>
              <span className="timer"> ({elapsed}s)</span>
            </em>
          </div>
        )}
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
          {loading ? `Thinking (${elapsed}s)` : "Send"}
        </button>
      </div>
    </div>
  );
}
