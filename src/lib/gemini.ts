import { GoogleGenerativeAI } from '@google/generative-ai';

function getGeminiModel() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY가 설정되지 않았습니다. .env 파일에 키를 추가하세요.');
  }

  return new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.8,
      topP: 0.95,
      topK: 40,
      responseMimeType: 'text/plain',
    },
    systemInstruction: '당신은 따뜻하고 응원하는 톤으로, 사용자가 잘한 일을 구체적으로 칭찬하는 AI 어시스턴트입니다.',
  });
}

export async function generateAiPraise(thing1: string, thing2: string, thing3: string) {
  const model = getGeminiModel();
  const prompt = `오늘 내가 잘한 일 3가지야. 각각에 대해 구체적으로 언급하면서 따뜻하게 칭찬해줘. 3개 항목 모두 각각 2~3문장으로 작성해줘.
1. ${thing1}
2. ${thing2}
3. ${thing3}`;

  const result = await model.generateContent(prompt);

  const candidate = result?.response?.candidates?.[0];
  if (!candidate?.content?.parts?.length) {
    return '';
  }

  return candidate.content.parts
    .map((part) => ('text' in part && typeof part.text === 'string' ? part.text : ''))
    .join('')
    .trim();
}
