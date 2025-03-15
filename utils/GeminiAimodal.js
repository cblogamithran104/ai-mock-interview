import { GoogleGenerativeAI } from "@google/generative-ai";

// Verify API key is configured
if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  console.error('Missing NEXT_PUBLIC_GEMINI_API_KEY in .env.local');
  throw new Error('Gemini API key not configured');
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

// Use Gemini 2.0 Flash model
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.9,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 2048,
  }
});

// Initialize chat session
const chat = model.startChat({
  generationConfig: {
    maxOutputTokens: 2048,
  },
});

export const chatSession = chat;

// Add feedback generation function
export const generateFeedback = async (questions, answers) => {
  try {
    const prompt = `Act as an expert technical interviewer. Review these interview questions and answers:
    ${questions.map((q, i) => `
    Question ${i + 1}: ${q.question}
    Candidate's Answer: ${answers[i] || 'No answer provided'}`).join('\n\n')}

    Provide a detailed feedback summary in this JSON format:
    {
      "overall_score": number (1-10),
      "ranking": "Excellent/Good/Average/Need Improvement",
      "strengths": ["strength1", "strength2"...],
      "areas_to_improve": ["area1", "area2"...],
      "detailed_feedback": "comprehensive feedback text",
      "next_steps": ["recommendation1", "recommendation2"...]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error generating feedback:', error);
    throw error;
  }
};

export const generateInterviewQuestions = async (prompt) => {
  try {
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }]
    });
    
    const response = await result.response;
    return await response.text();
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
};
