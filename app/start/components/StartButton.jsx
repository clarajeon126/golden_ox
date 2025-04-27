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
    router.push("/simulation"); // 🚀 Move to Simulation Page!

  };

  return (
    <button className={styles.startButton} onClick={handleStart}>
      start !
    </button>
  );
}
