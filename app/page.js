"use client"; // You need this because you're using hooks!

import { useState } from "react";
import { askGPT } from "../utils/askGPT";
import styles from "./page.module.css";

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [messages, setMessages] = useState([
    { role: "system", content: "You are an EMT training simulation assistant. Guide the user step-by-step through the emergency call checklist." }
  ]);

  const handleSend = async () => {
    const updatedMessages = [...messages, { role: "user", content: input }];
    setMessages(updatedMessages);
    setInput(""); // clear input

    const reply = await askGPT(updatedMessages);

    setMessages([...updatedMessages, { role: "assistant", content: reply }]);
    setOutput(reply);
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>🚑 EMT Simulation</h1>

        <div style={{ marginBottom: "1rem" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your next action here..."
            rows={4}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <button onClick={handleSend} style={{ padding: "0.5rem 1rem", marginBottom: "1rem" }}>
          Send
        </button>

        <div style={{ border: "1px solid gray", padding: "1rem", borderRadius: "8px" }}>
          <h2>📋 Simulation Output</h2>
          <p>{output}</p>
        </div>
      </main>

      <footer className={styles.footer}>
        EMT Training Simulation 🚑
      </footer>
    </div>
  );
}
