
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTerminalResponse = async (
  command: string,
  cwd: string,
  fileSystemSummary: string
): Promise<string> => {
  try {
    // If no API key is set (development mode), fallback to static response
    if (!process.env.API_KEY) {
      return `[SIMULATION MODE - NO API KEY]\nCommand '${command}' executed in ${cwd}.\n\nConfigure API_KEY to enable AI simulation.`;
    }

    const systemPrompt = `
      You are the kernel and shell of 'Yashika OS', a sophisticated cybersecurity operating system simulator (like Kali Linux).
      The user acts as a cybersecurity professional or hacker.
      
      Current Working Directory: ${cwd}
      File System Structure (Summary): ${fileSystemSummary}
      
      User Command: ${command}

      INSTRUCTIONS:
      1. Act EXACTLY like a Linux terminal.
      2. If the command is a standard linux command (ls, cat, pwd, echo, whoami), output the result based on the file system context provided.
      3. If the command is a hacking tool (nmap, sqlmap, metasploit, hydra, ping, traceroute, dig), SIMULATE a realistic output. Make it look technical and cool.
      4. If the command is invalid, return "command not found".
      5. DO NOT include markdown code blocks (like \`\`\`). Return RAW text only.
      6. Keep responses concise but realistic.
      7. Use coloring codes if you want, but plain text is safer for this React renderer unless we implement ANSI parsing. Stick to plain text for now, maybe use [OK] or [+] prefixes for status.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Error: execution failed. ${(error as any).message}`;
  }
};

export const getChatResponse = async (message: string): Promise<string> => {
    try {
        if (!process.env.API_KEY) {
            return "I'm sorry, I cannot connect to the AI service right now. (Missing API Key)";
        }
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: message,
            config: {
                systemInstruction: "You are ChatGPT, a helpful AI assistant running inside Yashika OS. Be concise, helpful, and friendly.",
            }
        });
        return response.text || "I couldn't generate a response.";
    } catch (error) {
        console.error("Chat Error:", error);
        return "Error: Could not connect to AI.";
    }
};
