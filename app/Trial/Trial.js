'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function Trial() {
  const [url, setUrl] = useState("");

  async function scrapeWebsite() {
    console.log(url);
  }
  
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js";
    script.async = true;
    script.type = "text/javascript";
    document.body.appendChild(script);
  }, []);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
          <vapi-widget
            public-key="a621b1f4-f070-4e9f-bf3f-d3e01aa4d183"
            assistant-id="2c734f0d-cd68-4598-8109-713f8c370f20"
            mode="voice"
            theme="dark"
            base-bg-color="#000000"
            accent-color="#14B8A6"
            cta-button-color="#000000"
            cta-button-text-color="#ffffff"
            border-radius="large"
            size="full"
            position="bottom-right"
            title="TALK WITH AI"
            start-button-text="Start"
            end-button-text="End Call"
            chat-first-message="Hey, How can I help you today?"
            chat-placeholder="Type your message..."
            voice-show-transcript="true"
            consent-required="true"
            consent-title="Terms and conditions"
            consent-content='By clicking "Agree," and each time I interact with this AI agent, I consent to the recording, storage, and sharing of my communications with third-party service providers, and as otherwise described in our Terms of Service.'
            consent-storage-key="vapi_widget_consent"
          ></vapi-widget>
        `,
      }}
    />
  )
}

export default Trial