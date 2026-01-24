'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
  ArrowLeft, MapPin, ExternalLink, Star, DollarSign, Calendar,
  Users, Plus, Edit2, Trash2, ThumbsUp, ThumbsDown
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { StarRating, ValueRating } from '@/components/ui/StarRating'
import { RestaurantForm } from './RestaurantForm'
import { VisitForm } from './VisitForm'
import toast from 'react-hot-toast'

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
}

interface Visit {
  id: string
  date: string
  overall_rating: number | null
  value_for_money: number | null
  total_bill: number | null
  number_of_people: number | null
  would_recommend: boolean | null
  notes: string | null
  created_by: string
  profiles: { full_name: string | null; email: string }
  dishes: Array<{
    id: string
    name: string
    rating: number | null
    price: number | null
    notes: string | null
  }>
  visit_attendees: Array<{
    user_id: string
    profiles: { full_name: string | null; email: string }
  }>
}

interface RestaurantDetailProps {
  restaurant: Restaurant
  familyId: string
  onBack: () => void
}

export function RestaurantDetail({ restaurant, familyId, onBack }: RestaurantDetailProps) {
  const router = useRouter()
  const [visits, setVisits] = useState<Visit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showVisitForm, setShowVisitForm] = useState(false)
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    loadVisits()
  }, [restaurant.id])

  const loadVisits = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('visits')
      .select(`
        *,
        profiles:created_by(full_name, email),
        dishes(*),
        visit_attendees(user_id, profiles(full_name, email))
      `)
      .eq('restaurant_id', restaurant.id)
      .order('date', { ascending: false })

    if (!error && data) {
      setVisits(data as Visit[])
    }
    setIsLoading(false)
  }

  const handleDeleteRestaurant = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', restaurant.id)

      if (error) throw error

      toast.success('Restaurant deleted')
      onBack()
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete restaurant')
    }
  }

  const handleDeleteVisit = async (visitId: string) => {
    if (!confirm('Delete this visit?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('visits')
        .delete()
        .eq('id', visitId)

      if (error) throw error

      toast.success('Visit deleted')
      loadVisits()
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete visit')
    }
  }

  // Calculate stats from loaded visits
  const avgRating = visits.length > 0
    ? visits.filter(v => v.overall_rating).reduce((sum, v) => sum + (v.overall_rating || 0), 0) / visits.filter(v => v.overall_rating).length
    : null

  const avgPrice = visits.filter(v => v.total_bill).length > 0
    ? visits.filter(v => v.total_bill).reduce((sum, v) => sum + (v.total_bill || 0), 0) / visits.filter(v => v.total_bill).length
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
          {restaurant.cuisine && (
            <span className="text-gray-500">{restaurant.cuisine}</span>
          )}
        </div>
        <button
          onClick={() => setShowEditForm(true)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <Edit2 className="w-5 h-5 text-gray-500" />
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="p-2 hover:bg-red-50 rounded-full"
        >
          <Trash2 className="w-5 h-5 text-red-500" />
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        {restaurant.address && (
          <div className="flex items-start gap-3 mb-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <span className="text-gray-700">{restaurant.address}</span>
          </div>
        )}
        {restaurant.website && (
          <div className="flex items-center gap-3 mb-3">
            <ExternalLink className="w-5 h-5 text-gray-400" />
            <a
              href={restaurant.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              View Menu / Website
            </a>
          </div>
        )}
        {restaurant.notes && (
          <p className="text-gray-600 mt-3 pt-3 border-t border-gray-100">
            {restaurant.notes}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900">
            {avgRating !== null && !isNaN(avgRating) ? (
              <>
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                {avgRating.toFixed(1)}
              </>
            ) : (
              <span className="text-gray-400 text-lg">—</span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">Avg Rating</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {avgPrice !== null && !isNaN(avgPrice) ? `$${avgPrice.toFixed(0)}` : '—'}
          </div>
          <div className="text-xs text-gray-500 mt-1">Avg Bill</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-gray-900">{visits.length}</div>
          <div className="text-xs text-gray-500 mt-1">Visits</div>
        </div>
      </div>

      {/* Add Visit Button */}
      <Button
        onClick={() => setShowVisitForm(true)}
        leftIcon={<Plus className="w-4 h-4" />}
        className="w-full"
        size="lg"
      >
        Log New Visit
      </Button>

      {/* Visits List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Visit History</h2>

        {isLoading ? (
          <div className="bg-white rounded-xl p-8 border border-gray-100 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : visits.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-gray-100 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>No visits recorded yet.</p>
            <p className="text-sm mt-1">Tap the button above to log your first visit!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visits.map((visit) => (
              <div key={visit.id} className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-medium text-gray-900">
                      {format(new Date(visit.date), 'MMMM d, yyyy')}
                    </div>
                    {visit.visit_attendees?.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Users className="w-4 h-4" />
                        {visit.visit_attendees.map(a =>
                          a.profiles.full_name || a.profiles.email.split('@')[0]
                        ).join(', ')}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      Added by {visit.profiles?.full_name || visit.profiles?.email?.split('@')[0]}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingVisit(visit)
                        setShowVisitForm(true)
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-full"
                    >
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteVisit(visit.id)}
                      className="p-1.5 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-3">
                  {visit.overall_rating && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Rating:</span>
                      <StarRating rating={visit.overall_rating} size="sm" readOnly />
                    </div>
                  )}
                  {visit.value_for_money && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Value:</span>
                      <ValueRating value={visit.value_for_money} readOnly />
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 text-sm">
                  {visit.total_bill && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>${visit.total_bill}</span>
                      {visit.number_of_people && (
                        <span className="text-gray-400">
                          (${(visit.total_bill / visit.number_of_people).toFixed(0)}/person)
                        </span>
                      )}
                    </div>
                  )}
                  {visit.would_recommend !== null && (
                    <div className="flex items-center gap-1">
                      {visit.would_recommend ? (
                        <>
                          <ThumbsUp className="w-4 h-4 text-green-500" />
                          <span className="text-green-600">Recommended</span>
                        </>
                      ) : (
                        <>
                          <ThumbsDown className="w-4 h-4 text-red-500" />
                          <span className="text-red-600">Not recommended</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Dishes */}
                {visit.dishes?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-sm font-medium text-gray-700 mb-2">Dishes ordered:</div>
                    <div className="space-y-1">
                      {visit.dishes.map((dish) => (
                        <div key={dish.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900">{dish.name}</span>
                            {dish.rating && (
                              <StarRating rating={dish.rating} size="sm" readOnly />
                            )}
                          </div>
                          {dish.price && (
                            <span className="text-gray-500">${dish.price}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {visit.notes && (
                  <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
                    {visit.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Restaurant Modal */}
      {showEditForm && (
        <RestaurantForm
          familyId={familyId}
          restaurant={restaurant}
          onClose={() => {
            setShowEditForm(false)
            router.refresh()
          }}
        />
      )}

      {/* Visit Form Modal */}
      {showVisitForm && (
        <VisitForm
          restaurantId={restaurant.id}
          familyId={familyId}
          visit={editingVisit}
          onClose={() => {
            setShowVisitForm(false)
            setEditingVisit(null)
            loadVisits()
            router.refresh()
          }}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Restaurant?</h3>
            <p className="text-gray-600 mb-6">
              This will permanently delete &quot;{restaurant.name}&quot; and all its visit history.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteRestaurant}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
