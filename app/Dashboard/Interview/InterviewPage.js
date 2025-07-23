'use client'
import { useCounterStore } from '@/app/store'
import { Button } from '@/components/ui/button';
import { Headset, Settings } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react'

function InterviewPage() {
  const { data: session, status } = useSession();
  const interviewInfo = useCounterStore((state) => state.InterviewInfo)
  const setInterviewInfo = useCounterStore((state) => state.setInterviewInfo);
  const router = useRouter()
  return (
    <div className='h-[91vh]'>
      {interviewInfo && session.user && (
        <div className='h-full'>
        <div className='nav flex items-center justify-between px-10 h-[9vh]'>
          <div className='flex items-center gap-4'>
            <Headset/>
            <h1 className='scroll-m-20 text-xl font-semibold tracking-tight'>Interviewer AI</h1>
          </div>
          <div className='flex items-center justify-center gap-7'>
            <h3>Recent Activity</h3>
            <h3>Pricing</h3>
            <h3>Interview resources</h3>
          </div>
          <div className='flex items-center gap-4'>
            <h3>{session.user.name}</h3>
            <Settings/>
          </div>
        </div>
        {Object.keys(interviewInfo).length==0 && (
          <div className='flex items-center justify-center flex-col gap-5 h-full'>
            <h1 className='scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance'>You don't have an interview scheduled</h1>
            <h3 className='scroll-m-20 text-2xl font-normal text-neutral-400 tracking-tight w-[35%] text-center'>You must go back to your dashboard and upload a job description for us to process</h3>
            <Button onClick={() => {router.push("/")}}>Click here to go back</Button>
          </div>
        )}
        </div>
      )}
    </div>
  )
}

export default InterviewPage