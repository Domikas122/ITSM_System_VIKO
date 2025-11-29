import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user

// Only initialize OpenAI client if API key is available
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface AnalysisResult {
  tags: string[];
  analysis: string;
  suggestedCategory?: string;
  suggestedSeverity?: string;
}

export async function analyzeIncident(
  title: string,
  description: string,
  category: string,
  severity: string
): Promise<AnalysisResult> {
  // Return fallback if no API key
  if (!openai) {
    return {
      tags: extractKeywords(title, description),
      analysis: "AI analysis requires an OpenAI API key. Based on keywords, this incident has been tagged automatically.",
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an IT and Cyber Security incident analysis expert. Analyze the incident and provide:
1. Relevant tags (3-5 keywords) for categorization
2. A brief analysis (2-3 sentences) of the incident and potential root causes
3. Suggestions for resolution based on similar incidents

Respond in JSON format:
{
  "tags": ["tag1", "tag2", "tag3"],
  "analysis": "Brief analysis of the incident...",
  "suggestedCategory": "it or cyber if the current category seems incorrect",
  "suggestedSeverity": "critical, high, medium, or low if the current severity seems incorrect"
}`,
        },
        {
          role: "user",
          content: `Analyze this ${category.toUpperCase()} incident:

Title: ${title}

Description: ${description}

Current Severity: ${severity}

Provide analysis and recommendations.`,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 500,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    return JSON.parse(content) as AnalysisResult;
  } catch (error) {
    console.error("OpenAI analysis error:", error);
    // Return fallback analysis if API fails
    return {
      tags: extractKeywords(title, description),
      analysis: "AI analysis is temporarily unavailable. Manual review recommended.",
    };
  }
}

function extractKeywords(title: string, description: string): string[] {
  const text = (title + " " + description).toLowerCase();
  const keywords = new Set<string>();
  
  // Common IT/Cyber keywords
  const patterns = [
    "server", "network", "email", "database", "vpn", "security", 
    "phishing", "malware", "outage", "performance", "access", 
    "password", "backup", "firewall", "virus", "attack"
  ];
  
  for (const pattern of patterns) {
    if (text.includes(pattern)) {
      keywords.add(pattern);
    }
  }
  
  return Array.from(keywords).slice(0, 5);
}
