"use client";

import { useEffect } from "react";
import { useSimulation } from "../context/SimulationContext";
import NavigationArrows from "./NavigationArrows";
import Visual from "./Visual";
import { useRouter } from "next/navigation";
import PromptBox from "./PromptBox";
import styles from "../styles/Simulation.module.css";

export default function Simulation() {
  const { currentPrompt } = useSimulation();
  const router = useRouter();

  useEffect(() => {
    if (!currentPrompt) {
      // If no prompt loaded, user probably refreshed directly into /simulation → send them back
    }
  }, [currentPrompt, router]);

  // if (!currentPrompt) {
  //   return (
  //     <div className={styles.simulationPage}>
  //       <p>Loading simulation...</p>
  //     </div>
  //   );
  // }

  return (
    <div className={styles.simulationContainer}>
      <div className={styles.leftSide}>
        <PromptBox />
        <NavigationArrows />
      </div>
      <div className={styles.rightSide}>
        <Visual />
      </div>
    </div>
  );
}
