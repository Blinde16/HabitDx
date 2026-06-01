import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HabitDx — Build the life you\'re becoming',
  description: 'An AI-powered life architecture system. 18-month shadow vision, built from a real conversation.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-ink text-white antialiased">
        {children}
      </body>
    </html>
  )
}
