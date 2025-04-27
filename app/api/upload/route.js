import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import { OpenAI } from 'openai';
import fs from 'fs/promises'; // Save file after GPT parsing
import path from 'path'; // ✅


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function extractTextFromPDF(buffer) {
  const pdfData = await pdfParse(buffer);
  return pdfData.text;
}

async function parseTextWithGPT(rawText) {
  const systemPrompt = `
You are an expert EMT assistant. Given messy text from a Patient Care Report (PCR), extract the data and format it into a structured JSON in this format. Importantly, only return something that 
can be put through JSON.parse() without error. My code is: 
const gptResponse = response.choices[0].message.content;
return JSON.parse(gptResponse);:

{
  "incident_number": string,
  "patient": {
    "name": string,
    "dob": string,
    "gender": string,
    "race": string,
    "home_address": { "street": string },
    "medical_history": [list of strings],
    "medications": [list of strings]
  },
  "vitals": [ { "bp": string, "hr": number, "rr": number, "spo2": number } ],
  "treatments": [list of strings],
  "transport": {
    "mode_to_hospital": string,
    "priority": string
  },
  "narrative_summary": comprehensive synopsis of the call
  "initial prompt": initial prompt describing the scene. Make it simple and understandable for a layperson.
  "isMedical",
  "isConscious",
    "noBreathing",
    "yesCPR",
    "priority",
    "medications": a list of any of [oxygen,
        aspirin,
        nitroglycerin,
        epinephrine,
        albuterol,
        narcan,
        oralGlucose,
        activatedCharcoal,
        acetaminophen] in this format "[
                { name: "aspirin", dose: "325 mg", route: "PO", needsMedicalDirection: false },
                { name: "nitroglycerin", dose: "0.4 mg", route: "SL", needsMedicalDirection: true }
              ]"
    "traumaType": evisceration, suckingChestWound, "bentKneeFracture", "closedFemurFracture", "openFracture", headInjury, spinalInjury
}

Example initial promt: "You are called to a residential home for an 80-year-old woman complaining of chest pain and shortness of breath. The patient is sitting on a couch, appearing pale and visibly distressed. What is the first thing you should do?"

Only include fields if information is available. If unknown, leave empty string or empty array.

Here is the raw text to parse:
${rawText}
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "system", content: systemPrompt }],
    temperature: 0.1,
  });

  const gptResponse = response.choices[0].message.content;
  console.log(gptResponse);

  return JSON.parse(gptResponse);
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const rawText = await extractTextFromPDF(buffer);
    const parsedData = await parseTextWithGPT(rawText);

    const publicDir = path.join(process.cwd(), 'public'); // absolute path to /public
    const savePath = path.join(publicDir, 'parsed_pcr.json'); // /public/parsed_pcr.json
    await fs.writeFile(savePath, JSON.stringify(parsedData, null, 2)); // Save properly!


    return NextResponse.json({ success: true, data: parsedData }, { status: 200 });

  } catch (error) {
    console.error("[Server] Upload route error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
