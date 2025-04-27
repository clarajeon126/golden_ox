"use client";

import { useRouter } from "next/navigation";
import { useSimulation } from "../../simulation/context/SimulationContext";
import styles from "../../simulation/styles/StartButton.module.css";


export default function StartButton() {
  const router = useRouter();
  const { setPath, setCurrentPrompt, setHint, setAttempts } = useSimulation();

  const handleStart = async () => {
    try {
      const res = await fetch("../../../parsed_pcr.json", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to load parsed_pcr.json");
      }
      const parsedPCR = await res.json();
      if (parsedPCR.initial_prompt) {
        setCurrentPrompt(parsedPCR.initial_prompt);
        console.log(parsedPCR.initial_prompt);
      }
    } catch (error) {
      console.error("[StartPage] Failed to fetch parsed_pcr.json:", error);
    }
    

    setHint("");
    setPath({
      outer_id: 0,
      completed_inner_set: [],
    });

    router.push("/simulation"); // 🚀 Move to Simulation Page!
  };

  return (
    <button className={styles.startButton} onClick={handleStart}>
      start !
    </button>
  );
}
