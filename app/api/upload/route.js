import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import { OpenAI } from 'openai';
import fs from 'fs/promises'; // Save file after GPT parsing
import path from 'path'; // ✅


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateSceneImage(initialPrompt) {
  const imagePrompt = `
${initialPrompt}
in this style Minimalist cute chibi characters with big heads and tiny bodies, flat pastel colors, thin soft outlines, simple dot eyes and no mouths, whimsical accessories like hats and propellers, hand-drawn sketchy UI buttons, arranged in a neat but playful composition, cozy and friendly atmosphere, doodle-like style.

`;

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: imagePrompt,
    n: 1,
    size: "1024x1024",
  });

  const imageUrl = response.data[0].url;
  console.log("[Server] Generated image URL:", imageUrl);

  return imageUrl;
}


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
  "isMedical": true or false,
  "isConscious": true or false,
    "noBreathing": true or false,
    "yesCPR": true or false,
    "priority" : 1 or 2 or 3,
    "medications": an array of medication in this format "[
                { name: "aspirin", dose: "325 mg", route: "PO", needsMedicalDirection: false },
                { name: "nitroglycerin", dose: "0.4 mg", route: "SL", needsMedicalDirection: true }
              ]"
    "traumaType": "a value of evisceration, suckingChestWound, "bentKneeFracture", "closedFemurFracture", "openFracture", headInjury, spinalInjury",
    "visual": ""
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
}export async function POST(request) {
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

    // ✨ Instead of saving to disk, just return it
    return NextResponse.json({ success: true, data: parsedData }, { status: 200 });

  } catch (error) {
    console.error("[Server] Upload route error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
