// /app/simulation/context/SimulationContext.js

"use client";

import { createContext, useContext, useState } from "react";

const SimulationContext = createContext();

export function SimulationProvider({ children }) {
  const [path, setPath] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [hint, setHint] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [generatedSteps, setGeneratedSteps] = useState([]);
  const [visual, setVisual] = useState("");
  return (
    <SimulationContext.Provider value={{
      path,
      setPath,
      currentPrompt,
      setCurrentPrompt,
      hint,
      setHint,
      attempts,
      setAttempts,
      generatedSteps,
      setGeneratedSteps,
      visual,
      setVisual
    }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  return useContext(SimulationContext);
}