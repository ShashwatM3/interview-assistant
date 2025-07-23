'use client'

import React, { useRef, useState, useCallback } from 'react';
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import "./styles.css";
import {Settings} from "lucide-react"
import {Headset} from "lucide-react"
import { AuroraText } from "@/components/magicui/aurora-text";
import Tesseract from 'tesseract.js';
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
import { doc, setDoc } from "firebase/firestore"; 
import { useCounterStore } from '../store';
import { db } from '@/firebase';
import { useRouter } from 'next/navigation';

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
  const [stage, setStage] = useState('input');
  // const [stage, setStage] = useState('interview_params');
  const [texts, setTexts] = useState([]); // Array of extracted texts
  const [loadingImages, setLoadingImages] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [finalExtracted, setFinalExtracted] = useState({});
  const [numWarmup, setNumWarmup] = useState("");
  const [numCore, setNumCore] = useState("");

  const setInterviewInfo = useCounterStore((state) => state.setInterviewInfo);

  const router = useRouter();

  const handleFiles = async (newFiles) => {
    const currentCount = texts.length;
    const filesToProcess = Array.from(newFiles).slice(0, 3 - currentCount);

    if (currentCount >= 3) {
      setError('Limit of 3 images reached.');
      return;
    }

    if (filesToProcess.length === 0) return;

    setError('');
    setLoading(true);

    const processedTexts = await Promise.all(
      filesToProcess.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const result = await Tesseract.recognize(reader.result, 'eng');
              resolve(result.data.text);
            } catch (err) {
              resolve('[Error processing image]');
              console.log(err)
            }
          };
          reader.readAsDataURL(file);
        });
      })
    );

    setTexts((prev) => [...prev, ...processedTexts]);
    setLoading(false);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [texts]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const onFileChange = (e) => {
    handleFiles(e.target.files);
  };

  const simulateProcessing = (cb) => {
    setStage('processing');
    setTimeout(() => {
      setStage('interview_params');
      if (cb) cb();
    }, 2000);
  };

  const handleShow = () => {
    simulateProcessing();
    const result = texts.join(". ");
    setFinalExtracted({
      jobDescription: result
    });
    console.log('🧾 Transcriptions:', texts);
  };

  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  async function extractText(file) {
    simulateProcessing();
    pdfToText(file)
        .then(text => {
          setText(text);
          setFinalExtracted({
            jobDescription: text
          });
          console.log(text);
        })
        .catch(error => console.error("Failed to extract text from pdf"))
  }

  const handleChange = (event) => {
    const fileUploaded = event.target.files[0];
    if (!fileUploaded) return;

    // Check MIME type
    if (fileUploaded.type !== "application/pdf") {
      alert("Please upload a PDF file only.");
      return;
    }

    extractText(fileUploaded);
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

  const analyzeForm = () => {
    // Validate required fields
    if (!jobTitle || !jobDescription) {
      alert('Please fill out all required fields.');
      return;
    }
    const formData = {
      "Job Title" : jobTitle,
      "Company Name": companyName,
      "Job Content": jobDescription,
      "Skills/Technologies": skills,
      "Experience Level": experienceLevel,
      "Job Type": jobType,
      "Location": location,
      "Additional notes": notes
    }
    setFinalExtracted(formData);
    simulateProcessing();
  };

  const sendToGPT = async (inputForGPT) => {
    const res = await fetch("/api/gpt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: inputForGPT })
    });
  
    if (!res.ok) {
      const errText = await res.text();
      console.error("GPT API error:", res.status, errText);
      throw new Error(`API error ${res.status}`);
    }
  
    const data = await res.json();
    return data.reply;
  };
  

  async function generateInterview() {
    const prompt = `
      You are a prompt generator for an AI-powered mock interviewer system.

      The interview is based on the following job description:

      ${JSON.stringify(finalExtracted)}

      The interview should include:
      - ${numWarmup} warm-up questions, comprising a mix of behavioral and light technical questions to ease the candidate in
      - ${numCore} core deep-dive technical questions, focused on key responsibilities, technical requirements, and critical thinking
      - 4 smart, contextual follow-up questions derived from the core technical questions to probe deeper or clarify understanding

      Your task is to output a structured JSON object with the following fields:

      - "Role": Format is a string. A detailed persona for the interviewer. It should reflect the tone, technical authority, and culture of the company and simulate the level of a senior engineer or hiring manager at the company.
        
      - "Goal": Format is a string. The primary objective of the interview — what the company is looking for in a candidate based on the job description. This should include both technical skills and mission or culture alignment.

      - "Questions": An object with two keys: 
        - "Warmup": A list of warm-up questions that are aligned with the company’s values and general expectations for a candidate at this level.
        - "Core": A list of deep technical and reasoning-based questions, specific to the job description, tools, and domains required.

      - "Rules": Format is a string. A bunch of rules that the AI interviewer should follow to simulate a realistic and thoughtful interview. This includes tone, pacing, how to handle candidate responses, and how to explain technical terms where necessary.

      Make sure the generated content reflects:
      - The company’s unique mission, culture, and tone
      - The technical domains mentioned in the job description
      - The level and expectations of the role (intern, junior, senior, etc.)
      - Language appropriate for a real professional technical interview

      Avoid generic or vague questions. The questions should be specific, practical, and tailored to the actual job responsibilities.

      Ensure that:
      - The JSON output is strictly valid — no comments, no trailing commas, and all keys/strings use double quotes.
      - Format the JSON to be parsable directly by JavaScript's JSON.parse() method.
      - Escape any quotes inside strings.
      - Respond with nothing except the raw JSON object.
      `
    console.log(prompt)
    setStage("processing")
    const rawOutput = await sendToGPT(prompt)
    try {
      const parsedOutput = JSON.parse(rawOutput);
      console.log("Parsed successfully")

      const now = new Date();
      const options = {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };
  
      const formatted = now.toLocaleString('en-US', options).replace(',', '');
      const formattedDoc = now.toLocaleString('en-US', options).replace(',', '').replace(/\s/g, '_');
      const objData = {
        preInterview: {
          dateCreated: formatted,
          JD: JSON.stringify(finalExtracted),
          warmup_depth: numWarmup,
          core_depth: numCore
        },
        warm_up: {
          questions: parsedOutput.Questions.Warmup
        },
        core: {
          questions: parsedOutput.Questions.Core
        },
      }
      await setDoc(doc(db, "users", session.user.email, "interviews", formattedDoc), objData);
      setInterviewInfo(objData);

      setStage("ready");
      
    } catch (err) {
      console.log("Failed to parse JSON:", err);
      // console.log("Raw output:", rawOutput);
      setStage("error");
    }
  }

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
      {stage=="input" && (
        <div className='h-[84vh] flex items-center justify-center flex-col gap-3'>
        <h1 className='scroll-m-20 text-center text-5xl font-extrabold tracking-tight text-balance mb-3'>Let's give an <AuroraText>interview</AuroraText> today</h1>
        <h3 className='scroll-m-20 text-xl font-light text-neutral-400 tracking-tight mb-10'>Select one of the below methods to give us your job context</h3>
        <div className='flex items-center justify-center gap-10 w-[80vw] mb-7'>

          {/* File Upload JD */}
          <div className='h-[25vh] flex-1  flex items-center flex-col '>
            <h1 className='scroll-m-20 text-2xl font-semibold tracking-tight mb-3'>File Upload</h1>
            <h3 className='mb-3 scroll-m-20 text-md font-light text-neutral-500 tracking-tight'>Upload a PDF of your job description</h3>
            <Button onClick={() => {router.push("/Dashboard/Interview")}} variant={'secondary'}>Select a file</Button>
            {/* <Button onClick={handleClick} variant={'secondary'}>Select a file</Button> */}
            <input
              type="file"
              ref={hiddenFileInput}
              onChange={handleChange}
              accept="application/pdf"
              style={{ display: 'none' }}
            />
          </div>
          
          {/* Images Upload JD */}
          <div className='h-[25vh] flex-1  flex items-center flex-col'>
            <h1 className='scroll-m-20 text-2xl font-semibold tracking-tight mb-3'>Images Upload</h1>
            <h3 className='mb-3 scroll-m-20 text-md font-light text-neutral-500 tracking-tight text-center'>Upload upto 3 screenshots of your job application description</h3>
            <div className="p-4 max-w-xl mx-auto">
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={`border-2 border-dashed rounded-md p-6 text-center transition-all ${
                  dragging ? 'bg-blue-950 border-blue-500' : 'border-neutral-700'
                }`}
              >
                <p className="mb-2 font-semibold">Drag & Drop screenshots or click below</p>
                <p className="text-sm text-gray-500 mb-4">Limit: 3 images max</p>
                <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-solid text-white rounded-lg shadow-md text-sm hover:bg-neutral-800 transition duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v8m0 0L8 16m4 4l4-4m-4-4V4m0 0l-4 4m4-4l4 4"
                    />
                  </svg>
                  Upload Image
                </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                {error && <p className="text-red-500 mt-4">{error}</p>}
                {loading && <p className="mt-4">🔄 Processing image...</p>}

                {!loading && texts.length > 0 && (
                  <div className="mt-4 flex items-center justify-center gap-3">
                    {texts.map((_, idx) => (
                      <div key={idx}>
                        ✅ <strong>Image {idx + 1}</strong> uploaded
                      </div>
                    ))}
                  </div>
                )}
              <br/>
              <center>
                <Button
                  disabled={texts.length === 0}
                  onClick={handleShow}
                >
                  Create Interview
                </Button>
              </center>
              </div>
            </div>
          <br/></div>

          {/* Manual Input JD */}
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
                      Analyze Job Description
                    </Button>
                  </div>
                </form>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
      )}
      {stage=="processing" && (
        <div className="h-[91vh] w-full flex flex-col items-center justify-center">
          <div className="text-2xl font-semibold mb-10">Processing...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mb-10"></div>
          <div className="text-neutral-500">Please wait while we analyze your input.</div>
        </div>
      )}
      {stage=="interview_params" && (
        <div className="h-[91vh] fadeInElement w-full flex flex-col items-center justify-center">
          <h1 className='scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance mb-4'>Just one more step</h1>
          <h3 className='scroll-m-20 text-2xl font-normal text-neutral-500 tracking-tight mb-7'>Choose your Interview Parameters</h3>
          <div className='px-10 py-8 border border-solid rounded-md mb-4 flex justify-center flex-col'>
            <div className='flex items-center justify-between gap-10 mb-8'>
              <div>
                <h4 className='scroll-m-20 text-xl font-semibold tracking-tight'>Number of Qs for <span className='text-yellow-500'>warm-up</span> interview</h4>
                <p className='text-neutral-400'>Chosen: {numWarmup=="" ? "None": <span className='text-orange-500 font-bold'>{numWarmup}</span>}</p>
              </div>
              <div className='flex items-center justify-center gap-3'>
                <h3 onClick={() => {setNumWarmup("4")}} className='p-4 border border-solid rounded-lg cursor-pointer'>4</h3>
                <h3 onClick={() => {setNumWarmup("6")}} className='p-4 border border-solid rounded-lg cursor-pointer'>6</h3>
                <h3 onClick={() => {setNumWarmup("8")}} className='p-4 border border-solid rounded-lg cursor-pointer'>8</h3>
              </div>
            </div>
            <div className='flex items-center justify-between gap-10'>
              <div>
                <h4 className='scroll-m-20 text-xl font-semibold tracking-tight'>Number of Qs for <span className='text-green-500'>core</span> interview</h4>
                <p className='text-neutral-400'>Chosen: {numCore=="" ? "None": <span className='text-teal-500 font-bold'>{numCore}</span>}</p>
              </div>
              <div className='flex items-center justify-center gap-3'>
                <h3 onClick={() => {setNumCore("8")}} className='p-4 border border-solid rounded-lg cursor-pointer'>8</h3>
                <h3 onClick={() => {setNumCore("10")}} className='p-4 border border-solid rounded-lg cursor-pointer'>10</h3>
                <h3 onClick={() => {setNumCore("12")}} className='p-4 border border-solid rounded-lg cursor-pointer'>12</h3>
              </div>
            </div>
          </div>
          {(numCore!="" && numWarmup!="") ? (
            <Button onClick={generateInterview}>Generate Interview</Button>
          ):(
            <Button disabled>Generate Interview</Button>
          )}
        </div>
      )}
      {stage=="ready" && (
        <div className="h-[91vh] fadeInElement w-full flex flex-col items-center justify-center">
          <div className="text-3xl font-bold mb-5">Let's get started</div>
          <div className="text-lg mb-4 text-neutral-500 text-center">We have analyzed your job description and<br/> are ready to interview you.</div>
          <Button onClick={() => {router.push("/Dashboard/Interview")}} className="w-64 py-4 text-md">Enter Interview Dashboard</Button>
          {/* <Button variant="ghost" className="mt-4" onClick={() => setStage('input')}>Go Back</Button> */}
        </div>
      )}
      {stage=="error" && (
        <div className="h-[91vh] fadeInElement w-full flex flex-col items-center justify-center">
          <div className="text-3xl font-bold mb-5">❌ Oops</div>
          <div className="text-lg mb-4 text-neutral-500 text-center">It seems like we can't generate<br/> the interview. Try again!</div>
          {/* <Button className="w-64 py-4 text-md">Enter Interview Dashboard</Button> */}
          <Button variant="ghost" className="mt-4" onClick={() => window.location.reload()}>Go Back</Button>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
