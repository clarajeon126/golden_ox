// /app/simulation/helpers/gptHelper.js
import { askGPT } from "./askGPT"; // correct relative path!

export async function sendResponseToGPT(path, prompt, response) {
  const json = {
    path,
    success: 1,
    sender: "site",
    prompt,
    response,
    hint: "",
  };

  const gptResponse = await askGPT(json);
  return gptResponse;
}

export async function startSimulation(path) {
  const json = {
    path,
    success: 1,
    sender: "site",
    prompt: "",
    response: "",
    hint: "",
  };

  const gptResponse = await askGPT(json);
  return gptResponse;
}
