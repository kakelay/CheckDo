import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CheckDo',
  description: 'Created with v0 and next js',
  generator: 'CheckDo.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      {/* No attributes on body to keep server/client in sync */}
      <body>{children}</body>
    </html>
  )
}
