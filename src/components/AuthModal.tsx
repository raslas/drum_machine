'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AuthModalProps {
  onClose: () => void
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode]         = useState<'signin' | 'signup'>('signin')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [message, setMessage]   = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Account created! Check your email to confirm, then sign in.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onClose()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-6 flex flex-col gap-5"
        style={{ background: '#0c0c1a', borderColor: '#1a1a3a' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2
            className="text-sm font-black uppercase tracking-[0.25em]"
            style={{ color: '#00ffcc' }}
          >
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#555577] hover:text-white transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Tab toggle */}
        <div className="flex rounded-xl overflow-hidden border border-[#1e1e3a]">
          {(['signin', 'signup'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setMessage('') }}
              className="flex-1 py-2 text-xs font-black uppercase tracking-widest transition-colors duration-150"
              style={{
                background: mode === m ? '#1a1a3a' : 'transparent',
                color: mode === m ? '#00ffcc' : '#555577',
              }}
            >
              {m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="px-4 py-2.5 rounded-xl text-sm font-bold bg-[#0e0e22] border border-[#1e1e3a]
                       text-white placeholder-[#2a2a4a] focus:outline-none focus:border-[#00ffcc]"
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="px-4 py-2.5 rounded-xl text-sm font-bold bg-[#0e0e22] border border-[#1e1e3a]
                       text-white placeholder-[#2a2a4a] focus:outline-none focus:border-[#00ffcc]"
          />

          {error   && <p className="text-xs font-bold" style={{ color: '#ff2244' }}>{error}</p>}
          {message && <p className="text-xs font-bold" style={{ color: '#00ffcc' }}>{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="py-2.5 rounded-xl text-sm font-black uppercase tracking-widest text-black
                       disabled:opacity-50 transition-all duration-150 hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #00ffcc, #00aaff)' }}
          >
            {loading ? 'Loading…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-[0.6rem] text-[#2a2a4a]">
          Your patterns are saved to your account and sync across devices.
        </p>
      </div>
    </div>
  )
}
