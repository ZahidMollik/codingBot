import {ChatGroq} from "@langchain/groq";
import * as dotenv from "dotenv";

dotenv.config();

export const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 1.2,
});


