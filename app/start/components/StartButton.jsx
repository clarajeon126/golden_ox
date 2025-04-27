// /app/start/components/StartButton.jsx

"use client";

import { useRouter } from "next/navigation";
import { initSimulation } from "../../simulation/helpers/initGPT";
import { useSimulation } from "../../simulation/context/SimulationContext";
import styles from "../../simulation/styles/StartButton.module.css";

export default function StartButton() {
  const router = useRouter();
  const { setPath, setCurrentPrompt, setHint, setAttempts } = useSimulation();

  const handleStart = async () => {
    const initData = await initSimulation();

    if (initData) {
      setPath(initData.path);
      setCurrentPrompt(initData.prompt);
      setHint(""); 
      setAttempts(0); 
      router.push("/simulation"); // 🚀 Move to Simulation Page!
    } else {
      alert("Failed to start simulation. Please try again!");
    }
  };

  return (
    <button className={styles.startButton} onClick={handleStart}>
      start !
    </button>
  );
}
