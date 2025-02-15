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
    DialogTrigger,
} from "@/components/ui/dialog"

function AddNewInterview() {
    const [openDialog, setOpenDialog] = useState(false)

    return (
        <div>
            <div 
                className='p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer translate-all'
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
                        <label>Job Role/Job Position</label>
                        <Input placeholder="Ex. Full Stack Developer" />
                    </div>
                    <div className=' my-3'>
                        <label>Job Description</label>
                        <textarea placeholder="Ex. React,Angular,Nodejs,Mysql,etc.." />
                    </div>
                    <div className=' my-3'>
                        <label>Years of experience</label>
                        <Input placeholder="Ex. 5" type="number"/>
                    </div>

                    <div className='flex gap-5 justify-end'>
                        <Button variant="ghost" onClick={() => setOpenDialog(false)}>Cancel</Button>
                        <Button>Start Interview</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddNewInterview
