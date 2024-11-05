import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { OpenAI } from 'openai';

interface SurfSpot {
  name: string;
  description: string;
  bestFor: string[];
}

interface APIResponse {
  surfSpots: SurfSpot[];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

const getRegionPrompts = () => ({
  base: `You are a professional surf forecaster. Respond in JSON format with a 'surfSpots' array. Each spot must have:
    {
      "name": "spot name [if outside main region, format as: Town - Spot Name (Xkm)]",
      "description": "Wave description: [wave details]\nDifficulty: [level]\nBest tide: [tide info]\nHazards: [hazards]\nCrowd level: [crowd info]",
      "bestFor": ["skill level"]
    }`,
    
  format: `Format each section as follows:
    Wave description: Focus only on wave characteristics. Describe the type of break (beach/reef/point), wave shape, power, typical size, and how the waves break. Example: "This location features powerful A-frame peaks breaking over a sandy bottom. The waves offer both lefts and rights, with steep takeoffs leading into long workable walls. The inside section can produce hollow barrels during larger swells, while smaller days provide more manageable waves with good form."
    
    Difficulty: The spot is rated as [beginner/intermediate/advanced] due to [specific challenging factors].
    
    Best tide: Describe how the wave behaves at different tides. Example: "The wave works best at mid to low tide when it stands up more and offers better shape. High tide tends to make the waves softer and less defined, while very low tide can expose the reef and make sections too shallow. The sweet spot is 2 hours either side of mid tide."
    
    Hazards: The main hazards include [describe ONLY physical/natural dangers, mentioning:
    - Exact location (e.g., "at the northern end", "along the reef's outer edge")
    - Specific nature of the hazard (e.g., "sharp coral reef", "powerful rip current")
    - When they're most dangerous (e.g., "during low tide", "intensifies with larger swells")
    Focus strictly on natural features like rocks, reef, rips, currents, shallow sections.
    Do NOT mention crowds, localism, parking, access, or any human factors.]
    
    Crowd level: You can expect [uncrowded/moderate/crowded] conditions, typically seeing [specific crowd scenario].`,
    
  structure: `Structure the response as follows:
    - First list 4-5 main spots in the requested region
    - Add "Other Nearby Spots" as a divider
    - List 2-3 notable spots from nearby areas
    - Use format "Town - Spot Name (Xkm)" for spots outside the main region`
});

// First call: Get basic spot list
async function getSpotList(country: string, region: string) {
  const prompt = `List surf spots in ${region}, ${country}. Include EXACTLY:
     1. 4 - 5 main spots in the region (not more)
     2. "Other Nearby Spots" as a divider
     3. ONLY 2 nearby spots with distances
     Format as: { "surfSpots": [{ "name": "spot name", "bestFor": ["skill level"] }] }
     For spots outside the main region, use format: "Town - Spot Name (Xkm)"`;

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a surf spot expert. Be precise with the number of spots requested. Never exceed the specified number of spots."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    model: "gpt-4-turbo-preview",
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 4000
  });

  return JSON.parse(completion.choices[0].message.content || '{}');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received request:', body);

    const { country, region } = body;
    const prompts = getRegionPrompts();

    console.log('Making OpenAI request...');
    
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: prompts.base
        },
        {
          role: "system",
          content: prompts.format
        },
        {
          role: "system",
          content: prompts.structure
        },
        {
          role: "user",
          content: `Provide a comprehensive overview of surf spots in ${region}, ${country}, including both main spots in the region and notable spots in nearby areas.`
        }
      ],
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000
    });

    console.log('OpenAI response received');
    
    const responseData = JSON.parse(completion.choices[0].message.content || '{}') as APIResponse;
    
    // Filter out any "Other Nearby Spots" entries that might come as spots
    responseData.surfSpots = responseData.surfSpots.filter(spot => 
      spot.name !== "Other Nearby Spots"
    );

    // Find the index where nearby spots start (they have the format "Town - Spot Name (Xkm)")
    const nearbySpotIndex = responseData.surfSpots.findIndex(spot => spot.name.includes(" - "));
    
    if (nearbySpotIndex !== -1) {
      // Insert a simple divider marker
      responseData.surfSpots.splice(nearbySpotIndex, 0, {
        name: "__DIVIDER__", // Special marker that won't be confused with a real spot name
        description: "",
        bestFor: []
      });
    }
    
    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Error details:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "API is working" });
}
