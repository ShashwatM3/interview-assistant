import { NextRequest, NextResponse } from 'next/server'
import mime from 'mime'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as Blob

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: (() => {
      const data = new FormData()
      data.append('file', new Blob([buffer], { type: file.type }), 'audio.webm')
      data.append('model', 'whisper-1')
      return data
    })(),
  })

  const json = await res.json()
  return NextResponse.json(json)
}
