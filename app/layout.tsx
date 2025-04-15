import type React from "react"
import type { Metadata } from "next"
import { Oswald } from "next/font/google"
import "./globals.css"

// Usando a fonte Oswald que combina bem com a estética do filme Old Boy
const oswald = Oswald({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Filme Frame Game | Old Boy Edition",
  description: "Adivinhe o filme a partir de frames/imagens - Inspirado na estética de Old Boy",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={oswald.className}>
        <div className="min-h-screen bg-gradient-to-br from-[#8c6518] via-background to-[#3a4a22] bg-fixed">
          {children}
        </div>
      </body>
    </html>
  )
}


import './globals.css'