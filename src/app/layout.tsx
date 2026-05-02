import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Drum Machine',
  description: 'Web Audio API drum machine with step sequencer — no backend, no audio files',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#06060f] text-white antialiased font-mono">
        {children}
      </body>
    </html>
  )
}
