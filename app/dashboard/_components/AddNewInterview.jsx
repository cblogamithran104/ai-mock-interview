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

function AddNewInterview() {
    const [openDialog, setOpenDialog] = useState(false)
    const [loading, setLoading] = useState(false)
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

        try {
            if (!formData.jobRole || !formData.jobDescription || !formData.yearsOfExperience) {
                alert('Please fill in all fields');
                return;
            }

            const prompt = `Generate ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} interview questions with answers for the following job:
                           Job Position: ${formData.jobRole}
                           Job Description: ${formData.jobDescription}
                           Years of Experience: ${formData.yearsOfExperience}

                           Return the response in this exact JSON format:
                           {
                             "questions": [
                               {
                                 "question": "question text here",
                                 "answer": "answer text here"
                               }
                             ]
                           }`;

            // Fixed: Correct way to send message to chat session
            const result = await chatSession.sendMessage(prompt);
            const response = await result.response;
            const text = await response.text();

            // ✅ Cleaning the JSON Response
            const cleanedText = text.replace(/```json|```/g, '').trim();
            const jsonData = JSON.parse(cleanedText);

            // ✅ Validate if the response contains questions
            if (!jsonData.questions || !Array.isArray(jsonData.questions)) {
                throw new Error('Invalid response format');
            }

            // ✅ Save to Firestore
            const mockId = uuidv4();
            const interviewData = {
                mockId,
                jsonData,
                jobRole: formData.jobRole,
                jobDescription: formData.jobDescription,
                yearsOfExperience: formData.yearsOfExperience,
                createdBy: user?.primaryEmailAddress?.emailAddress,
                createdAt: moment().format('DD-MM-YYYY')
            };

            const interviewRef = doc(db, "interviews", mockId);
            await setDoc(interviewRef, interviewData);

            // ✅ Close the dialog and redirect
            setOpenDialog(false);
            router.push(`/dashboard/interview/${mockId}`);

        } catch (error) {
            console.error('Error:', error);
            alert('Error generating questions. Please try again.');
        } finally {
            setLoading(false);
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
        </div>
    )
}

export default AddNewInterview;
