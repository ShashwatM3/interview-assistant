'use client'
import Image from 'next/image'
import React, { useState } from 'react'
import gradient1 from "@/components/media/gradient1.png";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { signIn } from 'next-auth/react';
import bcrypt from "bcryptjs";

function Authentication() {
  const [emailSignup, setEmailSignup] = useState("");
  const [nameSignup, setNameSignup] = useState("");
  const [passwordSignup, setPasswordSignup] = useState("");
  const [emailLogin, setEmailLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");

  const router = useRouter();

  const [authState, setAuthState] = useState("login")

  async function signup() {
    const hashedPassword = await bcrypt.hash(passwordSignup, 10);

    await setDoc(doc(db, "users", emailSignup), {
      name: nameSignup,
      email: emailSignup,
      password: hashedPassword,
    });

    const res = await signIn("credentials", {
      email: emailSignup, 
      password: passwordSignup, 
      redirect: false,
    });

    if (res?.ok) router.push("/Dashboard");
    else alert("Login failed. Please try again later!");
  }

  const login = async () => {
    const res = await signIn("credentials", {
      email: emailLogin,
      password: passwordLogin,
      redirect: false,
    });

    if (res?.ok) router.push("/Dashboard");
    else alert("Login failed");
  };

  return (
    <div className='auth-main h-full'>
      <div className='flex items-center justify-center h-full w-full'>
        <div className='flex-1'>
          {authState=="login" && (
            <div className='flex items-center justify-center'>
              <div className='flex items-center justify-center flex-col gap-3 w-[24vw]'>
                <h1 className='scroll-m-20 text-center text-3xl font-extrabold tracking-tight text-balance'>
                  Login to your account
                </h1>
                <h3 className='opacity-[65%] mb-4'>Enter your email below to access your account</h3>
                <div className='w-full'>
                  <Label className='mb-3.5'>Email</Label>
                  <Input onChange={(e) => {setEmailLogin(e.target.value)}} value={emailLogin} placeholder='m@gmail.com'/><br/>
                  <Label className='mb-3.5'>Password</Label>
                  <Input onChange={(e) => {setPasswordLogin(e.target.value)}} value={passwordLogin} type='password' placeholder='Ex: ilovekanexoxo'/>
                </div>
                <Button onClick={login} className='w-full mb-3'>Login</Button>
                <h3>Don't have an account? <span className='underline cursor-pointer' onClick={() => {setAuthState("signup")}}>Sign up</span></h3>
              </div>
            </div>
          )}
          {authState=="signup" && (
            <div className='flex items-center justify-center'>
              <div className='flex items-center justify-center flex-col gap-3 w-[24vw]'>
                <h1 className='scroll-m-20 text-center text-3xl font-extrabold tracking-tight text-balance'>
                  Create an account
                </h1>
                <h3 className='opacity-[65%] mb-4'>Enter your details below to create your account</h3>
                <div className='w-full'>
                  <Label className='mb-3.5'>What should we call you?</Label>
                  <Input onChange={(e) => {setNameSignup(e.target.value)}} value={nameSignup} placeholder='John Doe'/><br/>
                  <Label className='mb-3.5'>Email</Label>
                  <Input onChange={(e) => {setEmailSignup(e.target.value)}} value={emailSignup} placeholder='m@gmail.com'/><br/>
                  <Label className='mb-3.5'>Password</Label>
                  <Input onChange={(e) => {setPasswordSignup(e.target.value)}} value={passwordSignup} type='password' placeholder='Ex: ilovekanexoxo'/>
                </div>
                <Button onClick={signup} className='w-full mb-3'>Sign up</Button>
                <h3>Have an account already? <span className='underline cursor-pointer' onClick={() => {setAuthState("login")}}>Login</span></h3>
              </div>
            </div>
          )}
        </div>
        <div className='flex-1 h-full w-full flex items-center justify-center overflow-hidden'>
          <Image className='object-cover w-full h-full' src={gradient1} alt=''/>
        </div>
      </div>
    </div>
  )
}

export default Authentication