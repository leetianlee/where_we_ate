import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'Where We Ate - Family Restaurant Tracker',
  description: 'Track your family\'s restaurant experiences, ratings, and spending together.',
  keywords: ['restaurant', 'tracker', 'family', 'dining', 'reviews'],
  authors: [{ name: 'Where We Ate' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#ee7a12',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
