import { getOpenAIClient } from "@/lib/openai";

const SUMMARIZE_PROMPT = `You are an assistant that writes concise theatre news summaries for a UK audience.
- Produce 2-3 sentences (max 80 words total).
- Highlight premiere dates or venues when available.
- Avoid marketing language and keep a neutral tone.
- Include the source outlet name if relevant.`;

export const summarizeArticle = async ({
  headline,
  content,
}: {
  headline: string;
  content: string;
}) => {
  if (!content || content.length < 200) {
    return headline;
  }

  const openai = getOpenAIClient();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: SUMMARIZE_PROMPT,
      },
      {
        role: "user",
        content: `Headline: ${headline}\n\nArticle:\n${content}`,
      },
    ],
    temperature: 0.4,
    max_tokens: 200,
  });

  const outputText = response.choices[0]?.message?.content?.trim();
  if (!outputText) {
    throw new Error("OpenAI did not return a summary.");
  }

  return outputText;
};

