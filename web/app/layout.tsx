import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '2OpenClaw - Deploy OpenClaw in 60 Seconds',
  description: 'Get your personal AI assistant running in under a minute. No servers, no terminal, no BS.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white antialiased">{children}</body>
    </html>
  )
}
