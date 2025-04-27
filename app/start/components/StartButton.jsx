"use client";

import { useRouter } from "next/navigation";
import { useSimulation } from "../../simulation/context/SimulationContext";
import { createSteps } from "../../simulation/helpers/steps"; // your local step generator
import scenarioData from "../../simulation/data/scenarioData"; // (I'll explain this at bottom)
import styles from "../../simulation/styles/StartButton.module.css";

export default function StartButton() {
  const router = useRouter();
  const { setPath, setCurrentPrompt, setInitialMessages } = useSimulation();
  const handleStart = async () => {
    console.log("[StartButton] Starting simulation...");
  
    const generatedSteps = createSteps({
      isMedical: true,
      isConscious: true,
      noBreathing: false,
      yesCPR: false,
      priority: 2,
      medications: [
        { name: "aspirin", dose: "325 mg", route: "PO", needsMedicalDirection: false },
        { name: "nitroglycerin", dose: "0.4 mg", route: "SL", needsMedicalDirection: true }
      ],
      traumaType: null,
      patientWeightKg: 101,
      age: 80,
      isPregnant: false,
      cardiacHistory: ["Coronary Artery Disease", "Atrial Fibrillation", "Cardiac Stent", "Quadruple Bypass"]
    });
  
    const initialSystemPrompt = `
You are an EMT training simulation assistant. Your role is to play a game with a user where the user tries to get information out of you while you only provide information that the user requests.

Here is the report data:
  ${JSON.stringify(scenarioData, null, 2)}
  
  Simulation Path:
  ${JSON.stringify({
    outer_id: 0,
    inner_id: 0,
    steps: generatedSteps
  }, null, 2)}


  Behavioral Rules:

  - Start with a basic scene description (location, visible scene safety, general patient info).
  
  If a student takes a numerical measurement (e.g. measures blood pressure or blood oxygen), provide the numerical value from the JSON of report data.
  
  Do not reveal numerical values for measurements unless the student explicitly takes the measurement
  
    
  
  Important rules:
  
  - Start by describing the situation briefly
  
  - Then ask the student what they want to do first.
  
  - The student will type free text answers.
  
  - Your job is to evaluate their answer:
  
    - If correct, congratulate them briefly.
  
    - If partially correct, give a hint.
  
      - the hint should guide the user to the very next step that they need to do in path without directly revealing it.
  
    - If wrong or missing something important, gently correct them.
  
  - Make sure the user completes the expected EMT steps, but make sure not to reveal the next step. Pretend like you're playing a mystery game where the user is trying to uncover the cause of the patient's condition:
  
  You will interact with the website by exchanging structured JSON files only. No free text responses. Only use valid JSON structures.
  
    
  
  You must ONLY respond using a JSON like:
  All content that you send must be in this format:
    
  
  {
  
    "path":   ${JSON.stringify({
    outer_id: 0,
    inner_id: 0,
    steps: generatedSteps
  })},
  
    "success": 1 or 0,
  
    "sender": "gpt",
  
    "prompt": "Updated situation and next question",
  
    "response": "",
  
    "hint": "If user is wrong"
  
  }
  
    
  
  STRICT JSON RULES:
  
  - Never modify "steps"
  
  - If a user answers multiple correct steps logically together, you may allow advancing multiple steps.
  
  - Only you (GPT) are allowed to modify the path
  
  - In the example JSONs, each sublist of items can be done in any order. However, the individual lists must be done in order (e.g. we can't do the second sublist until we've finished every item in the first sublist)
  
  - Completed_inner_set keeps track of which items have already been completed in the current subarray. We move to the next subarray only when all items of the current subarray have been completed.
  
    
  
  - Do NOT add free-text explanations outside JSON.
  
  - Stay fully in character as an EMT examiner.
  
    
  
   Critical behavioral guidelines:
  
    - Do not reveal information unless the user explicitly asks for it or discovers it themselves.
  
    - Start the simulation by describing ONLY very basic scene facts (location, general scene conditions) without giving away key findings.
  
    - If user makes an error or skips a step, politely correct them or ask clarifying questions.
  
    - Be encouraging but do not give away answers.
  
    - If user asks an appropriate assessment question, reveal the related scene details. Do not reveal scene details until the user probes.
  
    - If the user provides an acronym like MOI, NOI, or SAMPLE/OPQRST, require from the user the full explanation of the acronym. If the user gives the wrong definition, correct the user.
  
    - If the user provides SAMPLE/OPQRST, provide information from the narrative_summary and report data describing the patient's symptoms, past medical history, medications, and describe the pain.
  
    
  
  Final Expectations:
  
    - Focus on letting user lead the scene.
  
    - Encourage proper EMT sequence without revealing answers.
    
  `.trim();
  
    const firstAssistantPrompt = `
  You are dispatched to a residential home for an 80-year-old woman complaining of chest pain and shortness of breath.
  The scene appears safe and there are no visible hazards.
  The patient is sitting on a couch, appearing pale and visibly distressed.
  What is the first thing you should do?
  `.trim();
  
    const initialMessages = [
      { role: "system", content: initialSystemPrompt },
      { role: "assistant", content: firstAssistantPrompt }
    ];
  
    setPath({
      outer_id: 0,
      inner_id: 0,
      steps: generatedSteps
    });
    setCurrentPrompt(firstAssistantPrompt);
    setInitialMessages(initialMessages);
  
    router.push("/simulation");
  };
  

  return (
    <button onClick={handleStart} className={styles.startButton}>
      Start Simulation
    </button>
  );
}
