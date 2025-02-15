import react from 'react'
import Header from './_components/header'

function dashboardLayout({children}){
    return(
        <div>
            <Header/>
            <div className='mx-8 md:mx-27 lg:mx-35'>
            {children}
            </div>
            
        </div>
    )
}

export default dashboardLayout