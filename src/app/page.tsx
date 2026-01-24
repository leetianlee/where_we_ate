import Link from 'next/link'
import { ChefHat, Users, Star, DollarSign, Smartphone } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-orange-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-primary-500" />
            <span className="text-xl font-bold text-gray-900">Where We Ate</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Remember Every
            <span className="text-primary-500"> Family Meal</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Track restaurants, share reviews, and never forget that amazing dish again.
            A collaborative dining journal for your whole family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-primary-500 text-white rounded-xl font-semibold text-lg hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/30"
            >
              Start Your Family Journal
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
              Join Your Family
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Family Groups</h3>
            <p className="text-gray-600">
              Create a family group and invite members with a simple code. Everyone can contribute and see the same restaurants.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Rate Everything</h3>
            <p className="text-gray-600">
              Rate restaurants, individual dishes, and value for money. Track which dishes everyone loved (or should avoid).
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Spending</h3>
            <p className="text-gray-600">
              Keep track of bills and per-person costs. Find the best value spots for your next family dinner.
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Create Account', desc: 'Sign up in seconds with your email' },
              { step: '2', title: 'Start or Join Family', desc: 'Create a new family or join with an invite code' },
              { step: '3', title: 'Add Restaurants', desc: 'Log the places you visit with ratings and notes' },
              { step: '4', title: 'Share & Remember', desc: 'Everyone sees updates in real-time' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 bg-primary-500 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to start tracking?</h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            Join families already using Where We Ate to remember their best dining experiences.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <ChefHat className="w-5 h-5 text-primary-500" />
            <span>Where We Ate</span>
          </div>
          <p>Built with love for families who love food</p>
        </div>
      </footer>
    </div>
  )
}
