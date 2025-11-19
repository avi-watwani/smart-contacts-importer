import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), "system_prompt.md"),
  "utf-8"
); 

export async function POST(request: NextRequest) {
  try {
    const { headers } = await request.json();

    if (!headers || !Array.isArray(headers)) {
      return NextResponse.json(
        { error: "Headers array is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const userPrompt = JSON.stringify({ headers }, null, 2);

    // Use generateContent with JSON mode for structured output
    const result = await model.generateContent(userPrompt);

    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    let jsonResponse;
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      jsonResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      // If parsing fails, try to extract JSON object from the text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse JSON from Gemini response");
      }
    }

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error("Error processing headers with Gemini:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process headers" },
      { status: 500 }
    );
  }
}

