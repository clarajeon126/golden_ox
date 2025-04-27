// /app/api/init-gpt/route.js

import { OpenAI } from "openai";
import { createSteps } from "@/app/simulation/helpers/steps"; // ✅ Import your steps generator!

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
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
      patientWeightKg: scenarioData.patient.weight_kg,
      age: 80,
      isPregnant: false,
      cardiacHistory: scenarioData.patient.medical_history
    });

    // Now create the path
    const path = {
      outer_id: 0,
      inner_id: 0,
      steps: generatedSteps
    };

    const systemPrompt = `
You are an EMT simulation assistant.

Your job:
- Write the FIRST SCENE DESCRIPTION and first PROMPT ONLY.
- The prompt must set the setting: location, patient appearance, basic setting of the scene, etc.
- But do not include any info that an EMT would not be able to see when they directly arrive on scene.
- DO NOT create any steps or path. Assume the steps were already generated.
- Focus on making the scene realistic, medically accurate, and immersive.
- Use 2-4 sentences.
- Ask the user what they would like to do first

Strictly output JSON ONLY like:

{
  "path": (provided path),
  "success": 1,
  "sender": "gpt",
  "prompt": "Scene description and question here",
  "response": "",
  "hint": ""
}

Here is the patient report:

${JSON.stringify(scenarioData, null, 2)}

Here is the already created path:

${JSON.stringify(path, null, 2)}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.3,
    });

    const gptResponse = completion.choices[0]?.message?.content;
    console.log("[Server] GPT Initial Setup Response:", gptResponse);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(gptResponse);
    } catch (error) {
      console.error("[Server] GPT Initial Setup Parsing Error:", error);
      return Response.json({ success: false, error: "Invalid GPT JSON" }, { status: 500 });
    }

    return Response.json({ success: true, data: parsedResponse });
  } catch (error) {
    console.error("[Server] Initial Setup Server Error:", error);
    return Response.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}
