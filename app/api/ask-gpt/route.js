import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// This is the correct way
export async function POST(req) {
  try {
    const { messages } = await req.json(); // <-- req.json(), not req.body!

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages,
      temperature: 0.3,
    });

    const gptResponse = completion.choices[0].message.content;

    console.log("[Server] GPT Response:", gptResponse);
    return new Response(JSON.stringify({ success: true, response: gptResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
