'use client'
import { useCounterStore } from '@/app/store'
import React from 'react'

function InterviewPage() {
  const interviewInfo = useCounterStore((state) => state.InterviewInfo)
  const setInterviewInfo = useCounterStore((state) => state.setInterviewInfo);
  return (
    <div>
      {interviewInfo && (
        <h1>
          Hello
          {console.log(interviewInfo)}
        </h1>
      )}
    </div>
  )
}

export default InterviewPage