"use client";

import { createContext, useContext, useState } from "react";

export const SimulationContext = createContext();

export function SimulationProvider({ children }) {
  const [path, setPath] = useState(null); // path = { outer_id, inner_id, steps }
  const [currentPrompt, setCurrentPrompt] = useState(""); // what user sees
  const [attempts, setAttempts] = useState(0); // how many wrong tries
  const [hint, setHint] = useState(""); // hint to display if wrong
  const [initialMessages, setInitialMessages] = useState([]); // 🆕 messages list to send to GPT

  return (
    <SimulationContext.Provider
      value={{
        path,
        setPath,
        currentPrompt,
        setCurrentPrompt,
        attempts,
        setAttempts,
        hint,
        setHint,
        initialMessages,
        setInitialMessages, // 🆕 expose setter too
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  return useContext(SimulationContext);
}
