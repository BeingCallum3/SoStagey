import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

export const getOpenAIClient = () => {
  if (openaiClient) {
    return openaiClient;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable.");
  }

  openaiClient = new OpenAI({ apiKey });
  return openaiClient;
};

export type OpenAIClient = ReturnType<typeof getOpenAIClient>;

