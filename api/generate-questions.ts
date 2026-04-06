import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const prompt = `
Generate exactly 7 situational IQ test questions in JSON format.
Return only an object with a "questions" field that contains the array.
Each question must follow this format:
{
  "text": "string",
  "choices": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "answer": "A" | "B" | "C" | "D"
}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message?.content || '{}';

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      return res.status(500).json({ error: 'Invalid JSON response from OpenAI' });
    }

    return res.status(200).json(parsed);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
