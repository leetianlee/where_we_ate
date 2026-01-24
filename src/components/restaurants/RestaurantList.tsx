'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Filter, X, ChefHat, Star, DollarSign, Calendar, MapPin, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { RestaurantForm } from './RestaurantForm'
import { RestaurantDetail } from './RestaurantDetail'

interface Restaurant {
  id: string
  name: string
  cuisine: string | null
  address: string | null
  website: string | null
  notes: string | null
  visit_count: number
  avg_rating: number | null
  avg_price: number | null
  last_visit: string | null
}

interface RestaurantListProps {
  restaurants: Restaurant[]
  familyId: string
  familyName: string
}

const CUISINE_FILTERS = [
  'All', 'Chinese', 'Japanese', 'Korean', 'Thai', 'Vietnamese',
  'Indian', 'Italian', 'French', 'Mediterranean', 'Mexican',
  'American', 'Seafood', 'Other'
]

export function RestaurantList({ restaurants, familyId, familyName }: RestaurantListProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [cuisineFilter, setCuisineFilter] = useState('All')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'visits' | 'name'>('recent')

  const filteredRestaurants = useMemo(() => {
    let result = [...restaurants]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.cuisine?.toLowerCase().includes(query) ||
        r.address?.toLowerCase().includes(query)
      )
    }

    // Cuisine filter
    if (cuisineFilter !== 'All') {
      result = result.filter(r =>
        r.cuisine?.toLowerCase() === cuisineFilter.toLowerCase()
      )
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'rating':
          return (b.avg_rating || 0) - (a.avg_rating || 0)
        case 'visits':
          return b.visit_count - a.visit_count
        default:
          return 0 // Keep original order (most recent)
      }
    })

    return result
  }, [restaurants, searchQuery, cuisineFilter, sortBy])

  if (selectedRestaurant) {
    return (
      <RestaurantDetail
        restaurant={selectedRestaurant}
        familyId={familyId}
        onBack={() => setSelectedRestaurant(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurants</h1>
          <p className="text-gray-500">{familyName}&apos;s dining journal</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Add Restaurant
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search restaurants..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              showFilters || cuisineFilter !== 'All'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter
            {cuisineFilter !== 'All' && (
              <span className="bg-primary-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
                1
              </span>
            )}
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1.5 bg-gray-100 border-0 rounded-full text-sm font-medium text-gray-600"
          >
            <option value="recent">Recently Added</option>
            <option value="rating">Highest Rated</option>
            <option value="visits">Most Visited</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>

        {showFilters && (
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuisine Type
            </label>
            <div className="flex flex-wrap gap-2">
              {CUISINE_FILTERS.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => setCuisineFilter(cuisine)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    cuisineFilter === cuisine
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Restaurant List */}
      {filteredRestaurants.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          {restaurants.length === 0 ? (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No restaurants yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start tracking your family&apos;s dining experiences!
              </p>
              <Button onClick={() => setShowAddForm(true)} leftIcon={<Plus className="w-4 h-4" />}>
                Add Your First Restaurant
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No restaurants found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filters
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRestaurants.map((restaurant) => (
            <button
              key={restaurant.id}
              onClick={() => setSelectedRestaurant(restaurant)}
              className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow text-left w-full"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                    {restaurant.cuisine && (
                      <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                        {restaurant.cuisine}
                      </span>
                    )}
                  </div>
                  {restaurant.address && (
                    <div className="flex items-center text-gray-500 text-sm mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {restaurant.address}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    {restaurant.avg_rating !== null ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{restaurant.avg_rating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">No rating</span>
                    )}
                    {restaurant.avg_price !== null && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>${restaurant.avg_price.toFixed(0)} avg</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{restaurant.visit_count} visit{restaurant.visit_count !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      {filteredRestaurants.length > 0 && (
        <p className="text-center text-sm text-gray-500">
          Showing {filteredRestaurants.length} of {restaurants.length} restaurants
        </p>
      )}

      {/* Add Restaurant Modal */}
      {showAddForm && (
        <RestaurantForm
          familyId={familyId}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  )
}
