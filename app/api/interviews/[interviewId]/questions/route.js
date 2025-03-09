import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const fallbackQuestions = [
  { id: 1, question: `Describe a complex architectural challenge you faced with React.js, Node.js and how you solved it.`, category: "Technical" },
  { id: 2, question: `How do you optimize performance in React.js, Node.js applications? Provide specific examples.`, category: "Technical" },
  { id: 3, question: "Explain your approach to testing and quality assurance in your development workflow.", category: "Problem Solving" },
  { id: 4, question: "How do you handle technical debt and legacy code modernization?", category: "Technical" },
  { id: 5, question: "Describe a situation where you had to make a technical compromise. How did you handle it?", category: "Behavioral" }
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const techStack = searchParams.get('techStack') || 'React.js, Node.js';
    const seniority = searchParams.get('seniority') || 'mid-level';

    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found, using fallback questions');
      return NextResponse.json(fallbackQuestions);
    }

    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    const models = await genAI.listModels();
    console.log('Available Models:', models);

    const validModel = models.models.find(m => m.name.includes('gemini'))?.name || 'gemini-pro';
    console.log('Using Model:', validModel);

    const model = genAI.getGenerativeModel({ model: validModel });

    const prompt = `Create 5 professional-level technical interview questions for a ${seniority} Software Developer position.
    
    Technology Stack: ${techStack}

    Follow these guidelines:
    1. Technical Depth:
       - Include system design considerations
       - Cover scalability and performance optimization
       - Address security best practices
       - Include architectural patterns relevant to ${techStack}

    2. Question Distribution:
       - 2 Advanced technical questions specific to ${techStack}
       - 1 System design or architecture question
       - 1 Problem-solving question focusing on real-world scenarios
       - 1 Technical decision-making or leadership question

    3. Question Style:
       - Focus on practical experience over theoretical knowledge
       - Include scenarios that test problem-solving abilities
       - Ask about best practices and anti-patterns
       - Cover both technical depth and breadth

    Return ONLY a JSON array with this exact format:
    [
      {
        "id": number,
        "question": "detailed_question_text",
        "category": "Technical/System Design/Problem Solving/Leadership"
      }
    ]`;

    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }]
    });

    if (!result || !result.response || !result.response.candidates) {
      console.error("Invalid API response structure", result);
      throw new Error('Invalid API response');
    }

    const questions = result.response.candidates[0].content.parts.map(part => part.text);

    if (!Array.isArray(questions) || questions.length === 0) {
      console.error("Invalid questions format:", questions);
      throw new Error('Invalid response format');
    }

    return NextResponse.json(questions);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(fallbackQuestions);
  }
}
