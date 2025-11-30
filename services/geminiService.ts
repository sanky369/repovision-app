import { GoogleGenAI } from "@google/genai";

// We create a fresh instance every time to ensure we capture the selected API key if it changes
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please select a key.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Uses Gemini Flash to analyze text/readme and generate a stable diffusion/Imagen style prompt
 * for the architecture diagram.
 */
export const analyzeArchitecture = async (repoName: string, repoContext: string): Promise<string> => {
  const ai = getAIClient();
  
  const systemPrompt = `
    You are a Senior Technical Technical Illustrator. Your goal is to write a highly detailed image generation prompt based on a code repository's description.
    
    The output image should look like a "Hand-drawn Whiteboard Architecture Workflow Diagram".
    
    Style Guide for the image prompt:
    - Visual Style: Hand-drawn marker on whiteboard, clean, comic-style, engineering flowchart, step-by-step workflow.
    - Layout: Left-to-right flow, divided into distinct vertical columns or "Steps" (e.g., Step 1: Input, Step 2: Processing, Step 3: Output).
    - Elements: Boxes, cylinders (databases), clouds (internet), arrows connecting them, small icons.
    - Colors: Black marker outlines with vibrant pastel fills (blue, orange, green, yellow) for highlights.
    
    Task:
    Analyze the provided repository context (README/LLMs.txt). Identify the key modules, data flow, steps, and technologies.
    Then, write a descriptive paragraph that describes this architecture visually as a workflow.
    
    Format the output as a single, dense paragraph suitable for an image generation model. 
    Start with: "A hand-drawn whiteboard workflow diagram of [Repo Name]..."
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Repository Name: ${repoName}\n\nContext/Readme:\n${repoContext}`,
    config: {
      systemInstruction: systemPrompt,
    }
  });

  return response.text || "A hand-drawn architecture diagram of a software system.";
};

/**
 * Uses Gemini Pro Image Preview (Nanobanana Pro equivalent) to generate the actual image.
 * Falls back to Flash Image if Pro is restricted (403).
 */
export const generateDiagramImage = async (imagePrompt: string): Promise<string> => {
  const ai = getAIClient();
  
  try {
    // We utilize the "Nano Banana Pro" mapping: gemini-3-pro-image-preview
    // This model requires the user to have selected a paid key via the UI flow handled in App.tsx
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { text: imagePrompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "2K" // requesting high res for text clarity
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error: any) {
    // Handle 403 Permission Denied or 404 Not Found by falling back to Flash Image
    // This often happens if the API key is valid but not enabled for the Pro preview model
    if (error.status === 403 || error.message?.includes("PERMISSION_DENIED") || error.status === 404) {
      console.warn("Gemini 3 Pro Image failed, falling back to gemini-2.5-flash-image", error);
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: imagePrompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9"
            // imageSize is not supported in flash-image
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    } else {
      throw error;
    }
  }

  throw new Error("No image data returned from Gemini.");
};