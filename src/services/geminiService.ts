import { model } from "../config/gemini.js";

export async function generateProductDescriptionWithAi(productName: string){
  const prompt = `
    Write a short, high-converting e-commerce product description for:
    Product: ${productName}
    Keep it clear, modern, and persuasive.
  `;

  const content = await model.generateContent(prompt)
  const result = await content.response
  return result.text();
}
