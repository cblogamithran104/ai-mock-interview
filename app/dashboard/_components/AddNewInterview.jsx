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

function AddNewInterview() {
    const [openDialog, setOpenDialog] = useState(false)
    const [formData, setFormData] = useState({
        jobRole: '',
        jobDescription: '',
        yearsOfExperience: ''
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async () => {
        try {
            // Validate form data
            if (!formData.jobRole || !formData.jobDescription || !formData.yearsOfExperience) {
                alert('Please fill in all fields')
                return
            }

            // Add your submission logic here
            console.log('Form submitted:', formData)
            
            // Clear form and close dialog
            setFormData({
                jobRole: '',
                jobDescription: '',
                yearsOfExperience: ''
            })
            setOpenDialog(false)
        } catch (error) {
            console.error('Error submitting form:', error)
            alert('Error submitting form. Please try again.')
        }
    }

    return (
        <div>
            <div 
                className='p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all'
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

                    <div className='mt-7 my-3'>
                        <label className="block mb-2">Job Role/Job Position</label>
                        <Input 
                            name="jobRole"
                            value={formData.jobRole}
                            onChange={handleInputChange}
                            placeholder="Ex. Full Stack Developer" 
                        />
                    </div>
                    <div className='my-3'>
                        <label className="block mb-2">Job Description</label>
                        <textarea 
                            name="jobDescription"
                            value={formData.jobDescription}
                            onChange={handleInputChange}
                            className="w-full min-h-[100px] p-2 border rounded-md"
                            placeholder="Ex. React, Angular, Node.js, MySQL, etc.." 
                        />
                    </div>
                    <div className='my-3'>
                        <label className="block mb-2">Years of experience</label>
                        <Input 
                            name="yearsOfExperience"
                            value={formData.yearsOfExperience}
                            onChange={handleInputChange}
                            placeholder="Ex. 5" 
                            type="number"
                            min="0"
                        />
                    </div>

                    <div className='flex gap-5 justify-end'>
                        <Button 
                            variant="ghost" 
                            onClick={() => setOpenDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>Start Interview</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddNewInterview
