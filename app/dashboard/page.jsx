import { UserButton } from '@clerk/nextjs'
import react from 'react'
import AddNewInterview from './_components/AddNewInterview'


function dashboard(){
    return(
        <div>
            <h2 className='font-bpld text-2xl'>Dashboard</h2>
            <h2 className='text-gray-500'>Create and starat your AI mockup Interview</h2>
            <div className='grid grid-cols-1 md:grid-cols-3 my-5'>
                <AddNewInterview/>
            </div>
        </div>
    )
}

export default dashboard