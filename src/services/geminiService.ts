import { model } from "../config/gemini.js";

export async function generateProductDescriptionWithAi(productName: string) {
  const prompt = `
Write a high-converting e-commerce product description in 2 sentences.

Product: ${productName}

Rules:
- 2 sentences only
- Make it persuasive and modern
- Focus on benefits, not features
- No fluff, no storytelling
`;
  const content = await model.generateContent(prompt);
  const result = await content.response;
  return result.text();
}
