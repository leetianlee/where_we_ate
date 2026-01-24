'use client'

import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  onChange?: (rating: number) => void
  size?: 'sm' | 'md' | 'lg'
  readOnly?: boolean
}

export function StarRating({ rating, onChange, size = 'md', readOnly = false }: StarRatingProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  const sizeClass = sizes[size]

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && onChange?.(star)}
          disabled={readOnly}
          className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <Star
            className={`${sizeClass} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

interface ValueRatingProps {
  value: number
  onChange?: (value: number) => void
  readOnly?: boolean
}

export function ValueRating({ value, onChange, readOnly = false }: ValueRatingProps) {
  const labels = ['Poor', 'Fair', 'Good', 'Great', 'Excellent']
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
  ]

  return (
    <div className="flex gap-2 items-center">
      {[1, 2, 3, 4, 5].map((val) => (
        <button
          key={val}
          type="button"
          onClick={() => !readOnly && onChange?.(val)}
          disabled={readOnly}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
            val <= value
              ? `${colors[val - 1]} text-white`
              : 'bg-gray-200 text-gray-500'
          } ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          {val}
        </button>
      ))}
      {value > 0 && (
        <span className="text-sm text-gray-600 ml-2">{labels[value - 1]}</span>
      )}
    </div>
  )
}
