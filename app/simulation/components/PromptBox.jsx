"use client";

import { useState } from "react";
import { useSimulation } from "../context/SimulationContext";
import { sendResponseToGPT } from "../helpers/gptHelper";
import { useRouter } from "next/navigation";
import Hint from "./Hint";
import LoadingSpinner from "./LoadingSpinner";
import styles from "../styles/PromptBox.module.css";

export default function PromptBox() {
  const {
    currentPrompt,
    attempts,
    setAttempts,
    hint,
    setHint,
    path,
    setPath,
    setCurrentPrompt
  } = useSimulation();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
  
    const gptResponse = await sendResponseToGPT(path, currentPrompt, input);
    setLoading(false);
  
    if (gptResponse.success === 1) {
      // Correct answer
      if (gptResponse.path.current === gptResponse.path.total) {
        router.push("/finished");
      } else {
        setPath(gptResponse.path);
        setCurrentPrompt(gptResponse.prompt);
        setAttempts(0); // Reset attempts
        setHint("");     // Clear hint
        setInput("");    // Clear input
      }
    } else {
      // Wrong answer
      setAttempts(prev => prev + 1);
  
      // Shake the input box
      const inputBox = document.getElementById("input-box");
      if (inputBox) {
        inputBox.classList.add(styles.shake);
        setTimeout(() => inputBox.classList.remove(styles.shake), 500);
      }
  
      // IMMEDIATELY show the hint if GPT provided one
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
