import OpenAI from "openai";

// Naujausias OpenAI modelis yra „gpt-5“, išleistas 2025 m. rugpjūčio 7 d. Nekeiskite šio modelio, nebent vartotojas aiškiai to paprašytų.

// Inicijuokite OpenAI klientą tik tuo atveju, jei turite API raktą.
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
  // fallback, jei nėra API rakto
  if (!openai) {
    return {
      tags: extractKeywords(title, description),
      analysis: "AI analizei reikalingas OpenAI API raktas. Remiantis raktažodžiais, šis incidentas buvo pažymėtas automatiškai.",
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `Jūs esate IT ir kibernetinio saugumo incidentų analizės ekspertas. Išanalizuokite incidentą ir pateikite:
1. Atitinkamos žymos (3–5 raktažodžiai) kategorizavimui
2. Trumpas incidento ir galimų priežasčių analizė (2–3 sakiniai)
3. Sprendimo pasiūlymai, pagrįsti panašiais incidentais

Respond in JSON format:
{
  "tags": ["tag1", "tag2", "tag3"],
  "analysis": "Trumpa incidento analizė...",
  "suggestedCategory": "IT arba kibernetinis, jei dabartinė kategorija atrodo neteisinga",
  "suggestedSeverity": "kritinis, aukštas, vidutinis arba žemas, jei dabartinis sunkumas atrodo neteisingas"
}`,
        },
        {
          role: "user",
          content: `Išanalizuok ${category.toUpperCase()} incidentą:

Pavadinimas: ${title}

Aprašymas: ${description}

Kategorija: ${severity}

Pateikti analizę ir rekomendacijas.`,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 500,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Nėra atsakymo iš OpenAI");
    }

    return JSON.parse(content) as AnalysisResult;
  } catch (error) {
    console.error("OpenAI analizės klaida:", error);
    // Grąžinti fallback variantą, jei API nepavyksta
    return {
      tags: extractKeywords(title, description),
      analysis: "AI analizė laikinai neveikia. Rekomenduojama atlikti rankinį patikrinimą.",
    };
  }
}

function extractKeywords(title: string, description: string): string[] {
  const text = (title + " " + description).toLowerCase();
  const keywords = new Set<string>();
  
  // Dažniausiai naudojami IT/kibernetinio saugumo raktažodžiai
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
