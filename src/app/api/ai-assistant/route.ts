import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function extractJson(text: string) {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(cleaned);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("AI REQUEST BODY:", JSON.stringify(body, null, 2));

    const { action = "analyze", lead } = body;

    if (!lead) {
      return NextResponse.json(
        { error: "Lead information is required." },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const leadContext = `
Company: ${lead.company_name || "Unknown"}
Website: ${lead.website || "Unknown"}
Landing Page: ${lead.landing_page || "Unknown"}
City: ${lead.city || "Unknown"}
Country: ${lead.country || "Unknown"}
Niche: ${lead.niche || "Unknown"}
Business Type: ${lead.business_type || "Unknown"}

Decision Maker: ${lead.decision_maker || "Unknown"}
Owner Email: ${lead.owner_email || "Unknown"}
Phone: ${lead.phone || "Unknown"}
Company Email: ${lead.company_email || "Unknown"}

Social Media: ${lead.social_media || "Unknown"}
Owner LinkedIn: ${lead.owner_linkedin || "Unknown"}
Company LinkedIn: ${lead.company_linkedin || "Unknown"}

Service: ${lead.service || "Unknown"}
Main Problem: ${lead.main_problem || "Unknown"}
Screenshot URL: ${lead.screenshot_url || "Unknown"}
Research Notes: ${lead.research_notes || "Unknown"}

Lead Score: ${lead.lead_score ?? 0}
Priority: ${lead.priority || "Unknown"}
Status: ${lead.status || "Unknown"}
`;

    let prompt = "";

    if (action === "follow_up") {
      prompt = `You are an expert sales outreach assistant.

Write concise, personalized, professional follow-up messages.

IMPORTANT:
- Use only the information provided.
- Do not invent facts about the company.
- Keep the email natural and useful.
- Return ONLY valid JSON.
- Do not use markdown.

Lead information:
${leadContext}

Return this exact JSON structure:

{
  "subject": "follow-up email subject",
  "email": "complete follow-up email",
  "message": "short follow-up message"
}`;
    } else {
      prompt = `You are an expert B2B sales strategist.

Analyze this sales lead and provide actionable outreach recommendations.

Prioritize the lead's main problem, service opportunity, website/landing-page information, decision maker information, and research notes when forming recommendations.

IMPORTANT:
- Use only the information provided.
- Do not invent facts about the company.
- Be practical and concise.
- Return ONLY valid JSON.
- Do not use markdown.

Lead information:
${leadContext}

Return this exact JSON structure:

{
  "leadAnalysis": "analysis",
  "value": "why this client is valuable",
  "service": "recommended service offer",
  "strategy": "outreach strategy",
  "email": "cold email example",
  "nextAction": "recommended next action"
}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    const result = extractJson(text);

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI assistant error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate AI response.";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
