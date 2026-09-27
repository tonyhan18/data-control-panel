import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '🎛️ Data Control Panel',
  description: '데이터 수집 관리자 페이지',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}