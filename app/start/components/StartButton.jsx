"use client";

import { useRouter } from "next/navigation";
import { useSimulation } from "../../simulation/context/SimulationContext";
import styles from "../../simulation/styles/StartButton.module.css";

export default function StartButton() {
  const router = useRouter();
  const { setPath, setCurrentPrompt, setHint, setAttempts } = useSimulation();

  const handleStart = async () => {
    setCurrentPrompt("You are dispatched to a residential home for an 80-year-old woman complaining of chest pain and shortness of breath.\n  The scene appears safe and there are no visible hazards.\n  The patient is sitting on a couch, appearing pale and visibly distressed.\n  What is the first thing you should do?");
    setHint("");
    setPath({
      outer_id: 0,
      completed_inner_set: []
    });
    router.push("/simulation"); // 🚀
  };

  return (
    <button className={styles.startButton} onClick={handleStart}>
      start !
    </button>
  );
}
