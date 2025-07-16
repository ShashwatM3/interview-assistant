'use client'

import React, { useRef, useState } from 'react';
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import "./styles.css";
import {Settings} from "lucide-react"
import {Headset} from "lucide-react"
import { AuroraText } from "@/components/magicui/aurora-text";
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import pdfToText from 'react-pdftotext'

function DashboardPage() {
  const { data: session, status } = useSession();
  const [uploadMethod, setUploadMethod] = useState("Bro");
  const [url, setUrl] = useState("");
  const hiddenFileInput = useRef(null);
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Intern');
  const [jobType, setJobType] = useState('Full-time');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleClick = () => {
    hiddenFileInput.current.click(); // Triggers the hidden input
  };

  async function extractText(file) {
    let extractedText = ""
    pdfToText(file)
        .then(text => {
          console.log(text)
          extractedText=text
        })
        .catch(error => console.error("Failed to extract text from pdf"))

  }

  const handleChange = (event) => {
    const fileUploaded = event.target.files[0];
    console.log("Selected file:", fileUploaded);
    extractText(fileUploaded)
  };

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return <p>You are not logged in.</p>;

  function isValidURL(string) {
    try {
      new URL(string);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  function analyzeURL() {
    if(!(isValidURL(url))) {
      alert("Incorrect URL. Please enter tha correct URL")
    }
  }

  const analyzeForm = () => {
    const formData = {
      jobTitle,
      companyName,
      jobDescription,
      skills,
      experienceLevel,
      jobType,
      location,
      notes,
    };

    console.log('Analyzing form:', formData);
    // You can call an API here or pass this to a generator function
  };

  return (
    <div className='h-full w-full'>
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
      <div className='h-[91vh] flex items-center justify-center flex-col gap-3'>
        <h1 className='scroll-m-20 text-center text-5xl font-extrabold tracking-tight text-balance mb-3'>Let's give an <AuroraText>interview</AuroraText> today</h1>
        <h3 className='scroll-m-20 text-xl font-light text-neutral-400 tracking-tight mb-10'>Select one of the below methods to give us your job context</h3>
        <div className='flex items-center justify-center gap-20 w-[70vw] mb-7'>
          <div className='h-[25vh] flex-1  flex items-center flex-col'>
            <h1 className='scroll-m-20 text-2xl font-semibold tracking-tight mb-3'>File Upload</h1>
            <h3 className='mb-3 scroll-m-20 text-md font-light text-neutral-500 tracking-tight'>Upload a PDF of your job description</h3>
            <Button onClick={handleClick} variant={'secondary'}>Select a file</Button>
            <input
              type="file"
              ref={hiddenFileInput}
              onChange={handleChange}
              style={{ display: 'none' }}
            />
          </div>
          <div className='h-[25vh] flex-1  flex items-center flex-col'>
            <h1 className='scroll-m-20 text-2xl font-semibold tracking-tight mb-3'>Website URL Upload</h1>
            <h3 className='mb-3 scroll-m-20 text-md font-light text-neutral-500 tracking-tight text-center'>Upload a link of the website that contains all information regarding the job</h3>
            <Input className='mb-5' onChange={(e) => {setUrl(e.target.value)}} value={url}/>
            <Button onClick={analyzeURL} variant={'secondary'}>Analyze URL</Button>
          </div>
          <div className='h-[25vh] flex-1  flex items-center flex-col'>
            <h1 className='scroll-m-20 text-2xl font-semibold tracking-tight mb-3'>Manual Input</h1>
            <h3 className='mb-3 scroll-m-20 text-md font-light text-neutral-500 tracking-tight text-center'>Enter your job description manually via a structured input form</h3>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant={'secondary'}>Open Form</Button>
              </SheetTrigger>
              <SheetContent className="py-8 px-5 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-xl font-bold">Manual Job Description Input</SheetTitle>
                  <SheetDescription>
                    Fill out the job details below so we can generate a custom interview for you.
                  </SheetDescription>
                </SheetHeader>
                <form className="space-y-5 px-4" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Frontend Engineer"
                      required
                      className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Google"
                      className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Job Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={6}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste or write the full job description here..."
                      required
                      className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Skills/Technologies <b>(Recommended)</b>
                    </label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="e.g. React, Node.js, REST APIs"
                      className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Experience Level <b>(Recommended)</b></label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option>Intern</option>
                      <option>Entry-level (0–2 years)</option>
                      <option>Mid-level (2–5 years)</option>
                      <option>Senior (5+ years)</option>
                      <option>Lead/Manager</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Job Type</label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Internship</option>
                      <option>Contract</option>
                      <option>Freelance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Remote, San Francisco"
                      className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Additional Notes</label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Must be comfortable with public speaking, managing teams, etc."
                      className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    ></textarea>
                  </div>

                  <div className="pt-4">
                    <Button className="w-full" onClick={analyzeForm}>
                      Generate Interview
                    </Button>
                  </div>
                </form>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        {/* {uploadMethod!="" ? (
          <Button variant={''} className='py-5 px-6 cursor-pointer'>Generate Interview</Button>
        ):(
          <Button disabled variant={''} className='py-4 cursor-pointer'>Generate Interview</Button>
        )} */}
        <Button>Learn how it works</Button>
        {/* <Button className='dark' variant={''}>How this works</Button> */}
      </div>
    </div>
  );
}

export default DashboardPage;
