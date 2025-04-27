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
      const { outer_id, inner_id, steps } = gptResponse.path;
  
      if (outer_id >= steps.length) {
        // Finished simulation
        router.push("/finished");
      } else {
        setPath(gptResponse.path);
        setCurrentPrompt(gptResponse.prompt);
        setAttempts(0);
        setHint("");
        setInput("");
      }
    } else {
      // Wrong answer
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
