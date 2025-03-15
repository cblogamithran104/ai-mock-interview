"use client"
import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'

function header() {

    const path=usePathname();
    useEffect(()=>{
        console.log(path)
    },[])

  return (
    <div className='flex items-center justify-between p-4 shadow-sm bg-secondary'>
        <Image src={'/logo1.svg'} width={160} height={100} alt='logo'/> 
        <ul className='hidden gap-6 md:flex'>
            <li className={`"hover:text-primary hover:font-bold transition cursor-pointer" 
            ${path=='/dasboard'&&'text-primary font bold'}`}
            
            >Dashboard</li>
            <li className={`"hover:text-primary hover:font-bold transition cursor-pointer" 
            ${path=='/dasboard/questions'&&'text-primary font bold'}`}>Questions</li>
            <li className={`"hover:text-primary hover:font-bold transition cursor-pointer" 
            ${path=='/dasboard/upgrade'&&'text-primary font bold'}`}>Upgrade</li>
            <li className={`"hover:text-primary hover:font-bold transition cursor-pointer" 
            ${path=='/dasboard/how'&&'text-primary font bold'}`}>How it works?</li>
        </ul> 
        <UserButton/>
    </div>
  )
}

export default header