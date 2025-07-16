'use client'
import React, { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { authOptions } from '@/authOptions';

function LandingPage() {
  const router = useRouter();
  return (
    <div className='h-full w-full flex items-center justify-center flex-col'>
      <h1 className='scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance mb-4'>Interview with Ease. Now.</h1>
      <Button onClick={() => {
        router.push("/Authentication")
      }} className='dark'>Start</Button>
    </div>
  )
}

export default LandingPage