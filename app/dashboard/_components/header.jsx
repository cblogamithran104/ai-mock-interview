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
    <div className='flex p-4 items-center justify-between bg-secondary shadow-sm'>
        <Image src={'/logo.svg'} width={160} height={100} alt='logo'/> 
        <ul className='hidden md:flex gap-6'>
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