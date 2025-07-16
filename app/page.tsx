import React from 'react'
import LandingPage from "./LandingPage"
import Landing2 from "./Landing2"


function Page() {
  console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET);
  return (
    <div className='h-screen w-full'>
      <LandingPage/>
      <Landing2/>
    </div>
  )
}

export default Page