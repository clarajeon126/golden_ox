"use client";

import { useState, useEffect } from "react";
import { useSimulation } from "../context/SimulationContext";
import { sendMessagesToGPT } from "../helpers/gptHelper"; // <-- Updated function!
import { useRouter } from "next/navigation";
import Hint from "./Hint";
import LoadingSpinner from "./LoadingSpinner";
import styles from "../styles/PromptBox.module.css";

export default function PromptBox() {
  const {
    currentPrompt,
    setCurrentPrompt,
    attempts,
    setAttempts,
    hint,
    setHint,
    path,
    setPath,
    initialMessages,   // <-- New!
    setInitialMessages // <-- New!
  } = useSimulation();
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]); // <-- New local state
  const router = useRouter();

  useEffect(() => {
    // When initialMessages come from StartButton, load them!
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);

    const updatedMessages = [...messages, { role: "user", content: input }];
    setMessages(updatedMessages);
    setInput("");

    const gptResponse = await sendMessagesToGPT(updatedMessages); // <-- updated helper
    setLoading(false);

    if (gptResponse.success === 1) {
      const { outer_id, inner_id, steps } = gptResponse.path;

      if (outer_id >= steps.length) {
        router.push("/finished");
      } else {
        setPath(gptResponse.path);
        setCurrentPrompt(gptResponse.prompt);
        setAttempts(0);
        setHint("");
        setInput("");
        setMessages([...updatedMessages, { role: "assistant", content: gptResponse.prompt }]);
      }
    } else {
      setAttempts(prev => prev + 1);

      const inputBox = document.getElementById("input-box");
      if (inputBox) {
        inputBox.classList.add(styles.shake);
        setTimeout(() => inputBox.classList.remove(styles.shake), 500);
      }

      if (gptResponse.hint) {
        setHint(gptResponse.hint);
      }
    }
  };

  return (
    <div className={styles.promptBox}>
      <div className={styles.prompt}>{currentPrompt}</div>
      <input
        id="input-box"
        type="text"
        className={styles.input}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your response..."
      />
      <button className={styles.submitButton} onClick={handleSubmit}>
        Submit
      </button>
      {loading && <LoadingSpinner />}
      {hint && <Hint />}
    </div>
  );
}
