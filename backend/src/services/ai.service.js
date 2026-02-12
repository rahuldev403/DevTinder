import { OpenAI } from "openai";

const client = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}openai/depolyments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
  defaultQuery: {
    "api-version": process.env.AZURE_OPENAI_API_VERSION,
  },
  defaultHeaders: {
    "api-key": process.env.AZURE_OPENAI_API_KEY,
  },
});

const generateCompatibility = async (userA, userB) => {
  const prompt = `
    You are a team compatibility evaluator.

    Analyze the two developer profiles and return JSON only:

    {
    "score": number (0-100),
    "summary": "short explanation"
    }

    User A:
    Name: ${userA.name}
    Bio: ${userA.bio}
    Skills: ${userA.skills.join(", ")}
    Experience: ${userA.experienceLevel}
    Availability: ${userA.availability}

    User B:
    Name: ${userB.name}
    Bio: ${userB.bio}
    Skills: ${userB.skills.join(", ")}
    Experience: ${userB.experienceLevel}
    Availability: ${userB.availability}
`;

  const response = await client.chat.completions.create({
    messages: [
      { role: "system", content: "You respond only in valid JSON." },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
  });

  const content = response.choices[0].message.content;

  return JSON.parse(content);
};

export default generateCompatibility;
