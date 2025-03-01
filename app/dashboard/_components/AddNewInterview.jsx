"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { GoogleGenerativeAI } from '@google/generative-ai'
import { v4 as uuidv4 } from 'uuid'
import { useUser } from '../../../lib/auth'  
import moment from 'moment/moment'
import { FirebaseError } from 'firebase/app'
import { insert } from '../../../lib/db'

// Initialize with API version
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY)

function AddNewInterview() {
    const [openDialog, setOpenDialog] = useState(false)
    const [loading, setLoading] = useState(false)
    const [questions, setQuestions] = useState([])
    const [formData, setFormData] = useState({
        jobRole: '',
        jobDescription: '',
        yearsOfExperience: ''
    })
    const {user}=useUser();

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        
        try {
            if (!formData.jobRole || !formData.jobDescription || !formData.yearsOfExperience) {
                alert('Please fill in all fields')
                return
            }

            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.0-flash"
            })

            // Use generateContent instead of chat for this version
            const result = await model.generateContent({
                contents: [{
                    parts: [{
                        text: `Generate ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} interview questions with answers for the following job:
                               Job Position: ${formData.jobRole}
                               Job Description: ${formData.jobDescription}
                               Years of Experience: ${formData.yearsOfExperience}
                               
                               Return the response in this exact JSON format without any markdown or additional text:
                               {
                                 "questions": [
                                   {
                                     "question": "question text here",
                                     "answer": "answer text here"
                                   }
                                 ]
                               }`
                    }]
                }]
            })

            const response = await result.response
            const text = response.text()
            
            try {
                const cleanedText = text.replace(/```json|\n```/g, '').trim();
                const jsonData = JSON.parse(cleanedText);
                
                if (!jsonData.questions || !Array.isArray(jsonData.questions)) {
                    throw new Error('Invalid response format');
                }

                setQuestions(jsonData.questions);
                console.log('Questions generated:', jsonData.questions);
                if(jsonData) {
                    const resp = await insert('interviews', {
                        mockId: uuidv4(),
                        jsonData: jsonData,
                        jobRole: formData.jobRole,
                        jobDescription: formData.jobDescription,
                        yearsOfExperience: formData.yearsOfExperience,
                        createdBy: user?.primaryEmailAddress?.emailAddress,
                        createdAt: moment().format('DD-MM-YYYY')
                    });
                    
                    console.log("Inserted ID:", resp.mockId);
                    if(resp){
                        setOpenDialog(false);
                    }
                }

                // Reset form and close dialog
                setFormData({
                    jobRole: '',
                    jobDescription: '',
                    yearsOfExperience: ''
                });
                setOpenDialog(false);

            } catch (jsonError) {
                console.error('JSON parsing error:', jsonError);
                console.log('Raw response:', text);
                throw new Error('Failed to parse AI response');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error generating questions. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div 
                className='p-10 transition-all border rounded-lg cursor-pointer bg-secondary hover:scale-105 hover:shadow-md'
                onClick={() => setOpenDialog(true)}
            >
                <h2 className='text-lg text-center'>+ Add New</h2>
            </div>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">
                            Tell us about your job interviewing?
                        </DialogTitle> 
                    </DialogHeader>

                    <DialogDescription>
                        <span className="font-semibold">
                            Add details about your job position/role, job description, and years of experience.
                        </span>
                    </DialogDescription>

                    <form onSubmit={handleSubmit}>
                        <div className='my-3 mt-7'>
                            <label className="block mb-2">Job Role/Job Position</label>
                            <Input 
                                name="jobRole"
                                value={formData.jobRole}
                                placeholder="Ex. Full Stack Developer" 
                                required
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className='my-3'>
                            <label className="block mb-2">Job Description</label>
                            <textarea 
                                name="jobDescription"
                                value={formData.jobDescription}
                                className="w-full min-h-[100px] p-2 border rounded-md"
                                placeholder="Ex. React, Angular, Node.js, MySQL, etc.." 
                                required
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className='my-3'>
                            <label className="block mb-2">Years of experience</label>
                            <Input 
                                name="yearsOfExperience"
                                value={formData.yearsOfExperience}
                                placeholder="Ex. 5" 
                                type="number"
                                min="0" 
                                required
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className='flex justify-end gap-5'>
                            <Button 
                                variant="ghost" 
                                onClick={() => setOpenDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Generating Questions...' : 'Start Interview'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {questions.length > 0 && (
                <QuestionsList questions={questions} />
            )}
        </div>
    )
}

// New component for displaying questions
function QuestionsList({ questions }) {
    if (!questions.length) return null;

    return (
        <div className="space-y-4">
            {questions.map((q, index) => (
                <div key={index} className="p-4 border rounded-lg">
                    <h3 className="font-bold">Q{index + 1}: {q.question}</h3>
                    <p className="mt-2 text-gray-600">{q.answer}</p>
                </div>
            ))}
        </div>
    );
}

export default AddNewInterview
