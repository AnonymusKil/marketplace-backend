
import { generateProductDescriptionWithAi } from "./geminiService.js";
export async function generateDescription(name: string) {
  if (!name.trim()) {
    throw new Error("Product name is required");
  }

  try {
    const description =
      await generateProductDescriptionWithAi(name);

    return {
      success: true,
      description
    };

  } catch (error) {

    console.log(error);

    return {

      success: false,

      description: "",

      message:
        "AI service unavailable"

    };

  }
}