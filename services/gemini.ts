
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

// Using gemini-3-pro-preview for complex design and coding tasks.
const GEMINI_MODEL = 'gemini-3-pro-preview';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert Senior Frontend Engineer and UI/UX Designer.
Your goal is to generate **3 DISTINCT PROFESSIONAL WEBSITE THEMES** based on the user's request.

*** OUTPUT FORMAT ***
Return a JSON object containing an array of 3 designs.
{
  "designs": [
    { 
      "themeName": "Theme Name (e.g. Modern Minimal)", 
      "description": "Short description of the vibe.",
      "html": "<!DOCTYPE html>...FULL HTML CODE..."
    },
    ... (2 more versions)
  ]
}

*** CRITICAL HTML STRUCTURE (SPA via Hash Routing) ***
Each HTML file MUST be a self-contained Single Page Application (SPA) that simulates multiple pages using CSS and URL Hashes.
1. **Pages as Sections**: distinct pages must be <section id="page-home">, <section id="page-about">, <section id="page-services">, <section id="page-contact">.
2. **CSS Routing**: 
   - Default state: Hide all sections.
   - Target state: Show section when target matches (e.g., #page-about:target { display: block; }).
   - **IMPORTANT**: Add a fallback JavaScript to ensure #page-home is displayed by default if no hash is present or if the hash doesn't match a section.
3. **Navigation**: Links must use href="#page-home", href="#page-about", etc.
4. **Responsive**: Use Tailwind CSS (CDN).

*** CONTENT REQUIREMENTS FOR EACH THEME ***
1. **Visuals**: Distinct color palette, typography, and border radius for each theme.
2. **Pages**: Include at least:
   - **Home**: Hero, Value Prop, CTA.
   - **Features/Services**: Grid layout.
   - **Pricing/Contact**: Pricing table or Form.
3. **Embedded Prompt**: 
   - Inside the HTML, include a hidden script tag: <script id="design-prompt-data" type="text/plain">...DETAILED PROMPT...</script>
   - This prompt text should describe the design system, colors, components, and layout rules so an AI could recreate it.

*** THEME VARIATION STRATEGY ***
- **Theme 1**: The safe, clean, professional choice (e.g., "Corporate Clean").
- **Theme 2**: A modern, trendy choice (e.g., "Dark Mode Gradient" or "Bento Grid").
- **Theme 3**: A bold, unique choice (e.g., "Brutalist", "Luxury Serif", or "Playful Pop").

*** IMPORTANT ***
- Do NOT markdown format the JSON. Return raw JSON.
- Ensure all 3 HTML strings are complete, valid, and production-ready.
`;

export interface DesignVersion {
  themeName: string;
  description: string;
  html: string;
}

export async function bringToLife(prompt: string, fileBase64?: string, mimeType?: string): Promise<DesignVersion[]> {
  const parts: any[] = [];
  
  const finalPrompt = `
  USER REQUEST: "${prompt}"
  
  Generate 3 distinct, high-quality website design themes (HTML).
  Each HTML must be a multi-page SPA using hash routing (#page-home, #page-features, #page-contact).
  Return valid JSON.
  `;

  parts.push({ text: finalPrompt });

  if (fileBase64 && mimeType) {
    parts.push({
      inlineData: {
        data: fileBase64,
        mimeType: mimeType,
      },
    });
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            designs: {
              type: Type.ARRAY,
              description: "Array of 3 distinct website design versions.",
              items: {
                type: Type.OBJECT,
                properties: {
                  themeName: { type: Type.STRING },
                  description: { type: Type.STRING },
                  html: { type: Type.STRING }
                },
                required: ["themeName", "description", "html"]
              }
            }
          }
        }
      },
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);
    
    if (!data.designs || !Array.isArray(data.designs)) {
        throw new Error("Invalid response structure");
    }

    return data.designs;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}
