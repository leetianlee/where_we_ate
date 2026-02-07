import Link from 'next/link'
import { ChefHat, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-6">
          <ChefHat className="w-10 h-10 text-primary-500" />
          <span className="text-2xl font-bold text-gray-900">Where We Ate</span>
        </Link>

        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-8">
          We couldn&apos;t verify your email. The link may have expired or already been used.
          Please try signing up again or request a new confirmation email.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth/signup">
            <Button variant="primary" leftIcon={<RefreshCw className="w-4 h-4" />}>
              Try again
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
