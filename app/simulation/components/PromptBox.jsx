"use client";

import { useState } from "react";
import { useSimulation } from "../context/SimulationContext";
import { createSteps } from "../helpers/steps";
import { askGPT } from "../helpers/gptHelper";
import { useRouter } from "next/navigation";
import scenarioData from "../data/scenarioData";
import Hint from "./Hint";
import LoadingSpinner from "./LoadingSpinner";
import styles from "../styles/PromptBox.module.css";

    // First generate your steps from createSteps
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
      cardiacHistory: [
        "Coronary Artery Disease",
        "Atrial Fibrillation",
        "Cardiac Stent",
        "Quadruple Bypass (2017)"
      ]
      });
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


    // Now create the path
    const pathStruc = {
      outer_id: 0,
      inner_id: 0,
      steps: generatedSteps
    };


  const [messages, setMessages] = useState([
    {
      role: "system",
      content: `
      You are an EMT training simulation assistant. Your role is to play a game with a user where the user tries to get information out of you while you only provide information that the user requests.
  
      Here is the report data:
      ${JSON.stringify(scenarioData, null, 2)}


      ---

    BEHAVIORAL RULES:
    - If a student takes a numerical measurement (e.g. measures blood pressure or blood oxygen), provide the numerical value from the JSON of report data.
    - Do not reveal numerical values for measurements unless the student explicitly takes the measurement
    - The student will type free text answers.
    - Your job is to evaluate their answer:
      - If correct, congratulate them briefly. and ask them what they want to do next.
      - else , give a hint in the hint field:
        - the hint should guide the user to the very next step in the steps path that they need to do in path without directly revealing it. if the user went ahead, and did something ahead in path, then let then know that they are going ahead and that they need to think about what the immediate next step is.
    - Make sure the user completes the expected EMT steps, but make sure not to reveal the next step. Pretend like you're playing a mystery game where the user is trying to uncover the cause of the patient's condition. Do NOT reveal the next step to obviously. 
    - You will interact with the website by exchanging structured JSON files only. No free text responses. Only use valid JSON structures.
    - Do NOT add free-text explanations outside JSON.
    - Stay fully in character as an EMT examiner.
    - Do not reveal information unless the user explicitly asks for it or discovers it themselves.
    - If user makes an error or skips a step, politely correct them or ask clarifying questions.
    - Be encouraging but do not give away answers.
    - If user asks an appropriate assessment question, reveal the related scene details. Do not reveal scene details until the user probes.
    - If the user provides an acronym like MOI, NOI, or SAMPLE/OPQRST, require from the user the full explanation of the acronym. If the user gives the wrong definition, correct the user.
    - If the user provides SAMPLE/OPQRST, provide information from the narrative_summary and report data describing the patient's symptoms, past medical history, medications, and describe the pain.

    You must ONLY respond using a JSON like:

    {
      "path": {
          "outer_id": outer index in the steps array,
          "completed_inner_set": [],
      },
      "success": 1 or 0,
      "sender": "gpt",
      "prompt": "Updated situation and next question",
      "hint": "If user is wrong"
    }

    DETERMINING IF A STEP IS COMPLETED:
      Here are the steps the user needs to take:
      ${JSON.stringify(pathStruc, null, 2)}
    Steps is a nested array.
      Example:
      [
        ["Step A"],
        ["Step B1", "Step B2", "Step B3"],
        ["Step C1", "Step C2"]
      ]
      Each outer array (e.g., ["Step A"], ["Step B1", "Step B2", "Step B3"]) represents a stage.

      Each stage must be completed fully before moving to the next stage.

      You CANNOT move forward to a new outer list unless:
      The user has completed ALL steps inside the current subarray (at outer_id).

      Example:
      If outer_id = 1 and the steps are:

      "Step B1"

      "Step B2"

      "Step B3"

      Then the user must complete B1, B2, and B3 before moving to outer_id = 2.

      Within a Subarray (Inner Steps):
      The user may complete steps in any order inside a given subarray.

      They can complete multiple steps at once if their answer covers them.

      Example:

      If user says something that correctly completes both "Step B1" and "Step B2", update the tracking accordingly.

      Do not force steps to be completed in sequence inside a single subarray.

    - Completed_inner_set keeps track of which items have already been completed in the current subarray. We move to the next subarray only when all items of the current subarray specified by outer id have been completed. Store the full step string of steps that have been completed in the completed_inner_set array.
    - and outer_id is the index of the current subarray in the steps array.
    outer_id should increment when all items in the current subarray have been completed.

        `
    }
  ]);
  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    let newInput = input + " Make sure the response is in the given JSON format. Do not add any free text.";
    const updatedMessages = [...messages, { role: "user", content: newInput }];
    setMessages(updatedMessages);
  
    try {
      console.log("Sending messages to GPT:", updatedMessages);
    const gptResponseRaw = await askGPT(updatedMessages);

    // Check if it's a string and needs parsing
    let gptResponse;
    if (typeof gptResponseRaw === 'string') {
      try {
        gptResponse = JSON.parse(gptResponseRaw);
      } catch (error) {
        console.error("Error parsing GPT response:", error);
        gptResponse = null;
      }
    } else {
      gptResponse = gptResponseRaw; // already an object
    }

    console.log("Parsed GPT Response:", gptResponse);
    console.log(gptResponse?.success);

    setLoading(false);

      if (gptResponse.success === 1) {
        const { outer_id } = gptResponse.path;
        if (outer_id >= generatedSteps.length) {
          router.push("/finished");
        } else {
          setPath(gptResponse.path);
          setCurrentPrompt(gptResponse.prompt);
          setHint("");
          setInput("");
          setMessages([
            ...updatedMessages,
            { role: "assistant", content: gptResponseRaw }
          ]);
        }
      } else {
        const inputBox = document.getElementById("input-box");
        if (inputBox) {
          inputBox.classList.add(styles.shake);
          setTimeout(() => inputBox.classList.remove(styles.shake), 500);
        }
        if (gptResponse.hint) {
          setHint(gptResponse.hint);
        }
        setMessages([
          ...updatedMessages,
          { role: "assistant", content: gptResponse.hint || "Try again!" }
        ]);
      }
    } catch (error) {
      console.error("askGPT Error:", error);
      setLoading(false);
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
