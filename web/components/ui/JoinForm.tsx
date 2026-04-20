'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const AVATARS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🥝', '🍍']

type Step = 'join' | 'profile' | 'board'

interface Job {
  id: string
  URL: string
  company: string | null
  position: string | null
  pushedBy: string
  createdAt: string
}

export default function JoinForm() {
  const [step, setStep] = useState<Step>('join')
  const [squadCode, setSquadCode] = useState('')
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [jobs, setJobs] = useState<Job[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleJoin() {
    if (!squadCode.trim()) return
    setLoading(true)
    setError('')

    const res = await fetch(`/api/jobs?squadCode=${squadCode.trim()}`)

    if (!res.ok) {
      setError('Invalid squad code. Try again.')
      setLoading(false)
      return
    }

    setLoading(false)
    setStep('profile')
  }

  async function handleProfile() {
    if (!name.trim()) return
    setLoading(true)

    const res = await fetch(`/api/jobs?squadCode=${squadCode.trim()}`)
    const data = await res.json()
    setJobs(data)
    setLoading(false)
    setStep('board')
  }

  async function handleShare(url: string) {
    await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ URL: url, person: name, joiningCode: squadCode }),
    })
    const res = await fetch(`/api/jobs?squadCode=${squadCode.trim()}`)
    const data = await res.json()
    setJobs(data)
  }

  // ── Step 1: enter squad code ──────────────────────────────────────────────
  if (step === 'join') return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
      <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-8 w-full max-w-[380px]">
        <p className="text-[22px] font-medium text-[#f0f0f0] mb-1">Jobber</p>
        <p className="text-[13px] text-[#555] mb-6">share jobs with your squad</p>
        <p className="text-[11px] text-[#666] uppercase tracking-widest mb-1.5">squad code</p>
        <Input
          className="bg-[#1a1a1a] border-[#2e2e2e] text-[#e0e0e0] w-full"
          placeholder="ABC12345"
          maxLength={8}
          value={squadCode}
          onChange={e => setSquadCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleJoin()}
        />
        {error && <p className="text-[12px] text-red-500 mt-1.5">{error}</p>}
        <Button
          className="w-full mt-3 bg-[#e0e0e0] text-[#0f0f0f] font-medium hover:bg-white"
          onClick={handleJoin}
          disabled={loading}
        >
          {loading ? 'checking...' : 'continue'}
        </Button>
      </div>
    </div>
  )

  // ── Step 2: pick avatar + name ────────────────────────────────────────────
  if (step === 'profile') return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
      <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-8 w-full max-w-[380px]">
        <p className="text-[22px] font-medium text-[#f0f0f0] mb-1">pick your vibe</p>
        <p className="text-[13px] text-[#555] mb-6">choose an avatar + enter your name</p>
        <p className="text-[11px] text-[#666] uppercase tracking-widest mb-1.5">avatar</p>
        <div className="grid grid-cols-8 gap-2 mt-2">
          {AVATARS.map(a => (
            <div
              key={a}
              onClick={() => setAvatar(a)}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-lg cursor-pointer bg-[#1a1a1a] border-[1.5px] transition-colors ${
                avatar === a ? 'border-[#e0e0e0]' : 'border-transparent'
              }`}
            >
              {a}
            </div>
          ))}
        </div>
        <Input
          className="bg-[#1a1a1a] border-[#2e2e2e] text-[#e0e0e0] w-full mt-3"
          placeholder="your name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleProfile()}
        />
        <Button
          className="w-full mt-3 bg-[#e0e0e0] text-[#0f0f0f] font-medium hover:bg-white"
          onClick={handleProfile}
          disabled={loading}
        >
          {loading ? 'loading...' : "let's go"}
        </Button>
      </div>
    </div>
  )

  // ── Step 3: jobs board ────────────────────────────────────────────────────
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
      <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl w-full max-w-[640px] overflow-hidden">

        <div className="px-8 pt-6">
          <p className="text-[11px] text-[#555] uppercase tracking-widest mb-1">{today}</p>
          <p className="text-[22px] font-medium text-[#f0f0f0]">squad pool</p>
          <p className="text-[13px] text-[#555] mt-1 mb-4">
            {jobs.length} jobs shared · squad: {squadCode}
          </p>
          <div className="flex border-b border-[#1e1e1e]">
            <p className="text-[12px] text-[#e0e0e0] pb-2 mr-6 border-b-[1.5px] border-[#e0e0e0]">squad pool</p>
            <p className="text-[12px] text-[#444] pb-2 cursor-pointer">my shares</p>
          </div>
        </div>

        <div className="px-8 pb-6 mt-4 flex flex-col">
          {jobs.length === 0 && (
            <p className="text-[13px] text-[#444] py-4">
              no jobs yet — share one from the extension
            </p>
          )}
          {jobs.map(job => (
            <a
              key={job.id}
              href={job.URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 py-2.5 border-b border-[#1a1a1a] last:border-none no-underline group"
            >
              <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center text-sm shrink-0">
                {avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[#f0f0f0] font-medium truncate group-hover:text-white">
                  {job.position ?? 'role unknown'}{job.company ? ` — ${job.company}` : ''}
                </p>
                <p className="text-[11px] text-[#444] truncate font-mono mt-0.5">{job.URL}</p>
              </div>
              <p className="text-[11px] text-[#444] shrink-0">{job.pushedBy}</p>
              <p className="text-[10px] text-[#333] shrink-0">
                {new Date(job.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </a>
          ))}
        </div>

      </div>
    </div>
  )
}