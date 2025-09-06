import {ChatGroq} from "@langchain/groq";
import * as dotenv from "dotenv";

dotenv.config();

export const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.5,
});

export async function testLLMConnection(): Promise<boolean> {
  try {
    const testResponse = await llm.invoke([
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Say hello in a concise manner." },
    ]);
    console.log("LLM connection test successful:", testResponse.content);
    return true;
  } catch (error) {
    console.error("LLM connection test failed:", error);
    return false;
  }
}


