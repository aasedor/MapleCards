'use client'

import { useState } from 'react'

export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input')
      input.value = window.location.href
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
      style={{
        backgroundColor: copied ? 'rgba(192,57,43,0.15)' : 'rgba(0,0,0,0.06)',
        color: copied ? '#c0392b' : '#1a1a1a',
        border: 'none',
        fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
      }}
    >
      {copied ? 'Copied!' : 'Copy Link'}
    </button>
  )
}
