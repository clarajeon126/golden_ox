// /app/api/ask-gpt/route.js
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { messages } = await req.json(); // now expect {messages}

    console.log("[Server] Received Messages:", JSON.stringify(messages, null, 2));

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages,
      temperature: 0.3,
    });

    const gptResponse = completion.choices[0]?.message?.content;
    if (!gptResponse.trim().startsWith("{")) {
      console.error("[Server] GPT returned non-JSON:", gptResponse);
      return Response.json({
        success: false,
        error: "GPT did not follow JSON format. Please retry or adjust user input."
      }, { status: 500 });
    }
    

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(gptResponse);
      console.log("[Server] Parsed GPT JSON:", JSON.stringify(parsedResponse, null, 2));
    } catch (error) {
      console.error("[Server] GPT Parsing Error:", error);
      return Response.json({ success: false, error: "Invalid GPT JSON" }, { status: 500 });
    }

    return Response.json({ success: true, response: parsedResponse });
  } catch (error) {
    console.error("[Server] Internal Server Error:", error);
    return Response.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}