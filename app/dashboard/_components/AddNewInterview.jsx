"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { v4 as uuidv4 } from 'uuid'
import { useUser } from '../../../lib/auth'
import moment from 'moment/moment'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../../../lib/db'
import { useRouter } from 'next/navigation'
import { chatSession } from "../../../utils/GeminiAimodal"
import { LoadingOverlay } from '@/components/ui/loading-overlay';

function AddNewInterview() {
    const [openDialog, setOpenDialog] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false);
    const [formData, setFormData] = useState({
        jobRole: '',
        jobDescription: '',
        yearsOfExperience: ''
    });
    const { user } = useUser();
    const router = useRouter();

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setIsGenerating(true);

        try {
            if (!formData.jobRole || !formData.jobDescription || !formData.yearsOfExperience) {
                alert('Please fill in all fields');
                return;
            }

            const prompt = `Generate ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} interview questions for the following job:
                           Job Position: ${formData.jobRole}
                           Job Description: ${formData.jobDescription}
                           Years of Experience: ${formData.yearsOfExperience}

                           Format the response as a valid JSON array with this exact structure:
                           [
                             {
                               "id": 1,
                               "question": "question text here",
                               "category": "Technical/System Design/Problem Solving/Leadership"
                             }
                           ]`;

            const result = await chatSession.sendMessage(prompt);
            const response = await result.response;
            const text = await response.text();
            
            // Add error handling for JSON parsing
            let jsonData;
            try {
                // Clean the response and parse JSON
                const cleanedText = text.replace(/```json|```/g, '').trim();
                console.log('Cleaned response:', cleanedText);
                jsonData = JSON.parse(cleanedText);
                
                if (!Array.isArray(jsonData)) {
                    throw new Error('Response is not an array');
                }
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                throw new Error('Failed to parse AI response');
            }

            // Save to Firestore
            const mockId = uuidv4();
            const interviewData = {
                mockId,
                questions: jsonData,
                jobRole: formData.jobRole,
                jobDescription: formData.jobDescription,
                yearsOfExperience: formData.yearsOfExperience,
                createdBy: user?.primaryEmailAddress?.emailAddress,
                createdAt: moment().format('DD-MM-YYYY')
            };

            const interviewRef = doc(db, "interviews", mockId);
            await setDoc(interviewRef, interviewData);

            // Delay navigation for better UX
            setTimeout(() => {
                setOpenDialog(false);
                setTimeout(() => {
                    router.push(`/dashboard/interview/${mockId}/start`);
                }, 500);
            }, 1000);

        } catch (error) {
            console.error('Error:', error);
            alert('Error generating questions. Please try again.');
        } finally {
            setLoading(false);
            setIsGenerating(false);
        }
    };

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

                    {isGenerating && <LoadingOverlay />}

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
                                {loading ? 'AI Generating Questions...' : 'Start Interview'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddNewInterview;
