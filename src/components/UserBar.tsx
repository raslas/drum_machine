'use client'

import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface UserBarProps {
  user: User | null
  syncing: boolean
  localPatternCount: number
  onShowAuth: () => void
  onImportLocal: () => void
}

export default function UserBar({
  user,
  syncing,
  localPatternCount,
  onShowAuth,
  onImportLocal,
}: UserBarProps) {
  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  if (!user) {
    return (
      <div className="flex items-center justify-end gap-3 w-full">
        <span className="text-[0.62rem] font-bold uppercase tracking-widest text-[#2a2a4a]">
          Saving locally
        </span>
        <button
          onClick={onShowAuth}
          className="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest text-black
                     transition-all duration-150 hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #ff00ff, #aa00ff)' }}
        >
          Sign In / Sign Up
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 flex-wrap justify-end w-full">
      {/* Migrate local patterns prompt */}
      {localPatternCount > 0 && (
        <button
          onClick={onImportLocal}
          className="px-3 py-1.5 rounded-xl text-[0.65rem] font-bold uppercase tracking-widest
                     transition-colors duration-150"
          style={{
            border: '1px solid #ffee0055',
            color: '#ffee00',
            background: '#0e0e00',
          }}
        >
          ↑ Import {localPatternCount} local pattern{localPatternCount !== 1 ? 's' : ''} to cloud
        </button>
      )}

      {/* Sync status */}
      <span
        className="text-[0.62rem] font-black uppercase tracking-widest"
        style={{ color: syncing ? '#ffee00' : '#00ffcc' }}
      >
        {syncing ? '⟳ Syncing…' : '✓ Cloud'}
      </span>

      {/* Email */}
      <span className="text-[0.62rem] font-bold text-[#555577] truncate max-w-[180px]">
        {user.email}
      </span>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="px-3 py-1.5 rounded-xl text-[0.65rem] font-bold uppercase tracking-widest border
                   border-[#333355] text-[#555577] hover:border-[#ff2244] hover:text-[#ff2244]
                   transition-colors duration-150"
      >
        Sign Out
      </button>
    </div>
  )
}
