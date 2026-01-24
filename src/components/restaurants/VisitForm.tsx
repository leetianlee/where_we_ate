'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, DollarSign, Users, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { StarRating, ValueRating } from '@/components/ui/StarRating'
import toast from 'react-hot-toast'

interface Dish {
  id?: string
  name: string
  rating: number
  price: string
  notes: string
}

interface VisitFormProps {
  restaurantId: string
  familyId: string
  visit?: any
  onClose: () => void
}

export function VisitForm({ restaurantId, familyId, visit, onClose }: VisitFormProps) {
  const router = useRouter()
  const isEditing = !!visit

  const [familyMembers, setFamilyMembers] = useState<Array<{ user_id: string; profiles: { full_name: string | null; email: string } }>>([])
  const [formData, setFormData] = useState({
    date: visit?.date || new Date().toISOString().split('T')[0],
    attendees: visit?.visit_attendees?.map((a: any) => a.user_id) || [],
    overallRating: visit?.overall_rating || 0,
    valueForMoney: visit?.value_for_money || 0,
    totalBill: visit?.total_bill?.toString() || '',
    numberOfPeople: visit?.number_of_people?.toString() || '',
    wouldRecommend: visit?.would_recommend ?? null,
    notes: visit?.notes || ''
  })
  const [dishes, setDishes] = useState<Dish[]>(
    visit?.dishes?.map((d: any) => ({
      id: d.id,
      name: d.name,
      rating: d.rating || 0,
      price: d.price?.toString() || '',
      notes: d.notes || ''
    })) || []
  )
  const [newDish, setNewDish] = useState<Dish>({ name: '', rating: 0, price: '', notes: '' })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadFamilyMembers()
  }, [familyId])

  const loadFamilyMembers = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('family_members')
      .select('user_id, profiles(full_name, email)')
      .eq('family_id', familyId)

    if (data) {
      setFamilyMembers(data as any)
    }
  }

  const toggleAttendee = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.includes(userId)
        ? prev.attendees.filter((id: string) => id !== userId)
        : [...prev.attendees, userId]
    }))
  }

  const addDish = () => {
    if (!newDish.name.trim()) return
    setDishes(prev => [...prev, { ...newDish }])
    setNewDish({ name: '', rating: 0, price: '', notes: '' })
  }

  const removeDish = (index: number) => {
    setDishes(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please sign in first')
        return
      }

      const visitData = {
        restaurant_id: restaurantId,
        family_id: familyId,
        date: formData.date,
        overall_rating: formData.overallRating || null,
        value_for_money: formData.valueForMoney || null,
        total_bill: formData.totalBill ? parseFloat(formData.totalBill) : null,
        number_of_people: formData.numberOfPeople ? parseInt(formData.numberOfPeople) : null,
        would_recommend: formData.wouldRecommend,
        notes: formData.notes || null,
        created_by: user.id
      }

      let visitId = visit?.id

      if (isEditing) {
        const { error } = await supabase
          .from('visits')
          .update({
            ...visitData,
            updated_at: new Date().toISOString()
          })
          .eq('id', visit.id)

        if (error) throw error

        // Delete existing dishes and attendees to replace
        await supabase.from('dishes').delete().eq('visit_id', visit.id)
        await supabase.from('visit_attendees').delete().eq('visit_id', visit.id)
      } else {
        const { data: newVisit, error } = await supabase
          .from('visits')
          .insert(visitData)
          .select()
          .single()

        if (error) throw error
        visitId = newVisit.id
      }

      // Add dishes
      if (dishes.length > 0) {
        const dishesToInsert = dishes.map(dish => ({
          visit_id: visitId,
          name: dish.name,
          rating: dish.rating || null,
          price: dish.price ? parseFloat(dish.price) : null,
          notes: dish.notes || null
        }))

        const { error: dishError } = await supabase
          .from('dishes')
          .insert(dishesToInsert)

        if (dishError) throw dishError
      }

      // Add attendees
      if (formData.attendees.length > 0) {
        const attendeesToInsert = formData.attendees.map((userId: string) => ({
          visit_id: visitId,
          user_id: userId
        }))

        const { error: attendeeError } = await supabase
          .from('visit_attendees')
          .insert(attendeesToInsert)

        if (attendeeError) throw attendeeError
      }

      toast.success(isEditing ? 'Visit updated!' : 'Visit logged!')
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const pricePerPerson = formData.totalBill && formData.numberOfPeople
    ? (parseFloat(formData.totalBill) / parseInt(formData.numberOfPeople)).toFixed(2)
    : null

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEditing ? 'Edit Visit' : 'Log New Visit'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Date */}
        <Input
          label="Visit Date *"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
          leftIcon={<Calendar className="w-5 h-5" />}
        />

        {/* Attendees */}
        {familyMembers.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline w-4 h-4 mr-1" />
              Who attended?
            </label>
            <div className="flex flex-wrap gap-2">
              {familyMembers.map((member) => (
                <button
                  key={member.user_id}
                  type="button"
                  onClick={() => toggleAttendee(member.user_id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    formData.attendees.includes(member.user_id)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {member.profiles.full_name || member.profiles.email.split('@')[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Overall Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Rating
          </label>
          <StarRating
            rating={formData.overallRating}
            onChange={(rating) => setFormData({ ...formData, overallRating: rating })}
            size="lg"
          />
        </div>

        {/* Value for Money */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Value for Money
          </label>
          <ValueRating
            value={formData.valueForMoney}
            onChange={(value) => setFormData({ ...formData, valueForMoney: value })}
          />
        </div>

        {/* Price Section */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Total Bill"
            type="number"
            step="0.01"
            min="0"
            value={formData.totalBill}
            onChange={(e) => setFormData({ ...formData, totalBill: e.target.value })}
            placeholder="0.00"
            leftIcon={<DollarSign className="w-5 h-5" />}
          />
          <Input
            label="# of People"
            type="number"
            min="1"
            value={formData.numberOfPeople}
            onChange={(e) => setFormData({ ...formData, numberOfPeople: e.target.value })}
            placeholder="0"
            leftIcon={<Users className="w-5 h-5" />}
          />
        </div>

        {pricePerPerson && (
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <span className="text-gray-600">Price per person: </span>
            <span className="font-semibold text-gray-900">${pricePerPerson}</span>
          </div>
        )}

        {/* Dishes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dishes Ordered
          </label>

          {dishes.length > 0 && (
            <div className="space-y-2 mb-3">
              {dishes.map((dish, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{dish.name}</div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      {dish.rating > 0 && <StarRating rating={dish.rating} size="sm" readOnly />}
                      {dish.price && <span>${dish.price}</span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDish(index)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border border-dashed border-gray-300 rounded-lg p-3 space-y-3">
            <input
              type="text"
              value={newDish.name}
              onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
              placeholder="Dish name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <StarRating
                  rating={newDish.rating}
                  onChange={(rating) => setNewDish({ ...newDish, rating })}
                  size="sm"
                />
              </div>
              <div className="relative w-24">
                <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newDish.price}
                  onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
                  placeholder="Price"
                  className="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addDish}
              disabled={!newDish.name.trim()}
              leftIcon={<Plus className="w-4 h-4" />}
              className="w-full"
            >
              Add Dish
            </Button>
          </div>
        </div>

        {/* Would Recommend */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Would you recommend this restaurant?
          </label>
          <div className="flex gap-3">
            {[
              { value: true, label: 'Yes!', color: 'bg-green-500' },
              { value: false, label: 'No', color: 'bg-red-500' },
              { value: null, label: 'Maybe', color: 'bg-gray-400' }
            ].map((option) => (
              <button
                key={String(option.value)}
                type="button"
                onClick={() => setFormData({ ...formData, wouldRecommend: option.value })}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  formData.wouldRecommend === option.value
                    ? `${option.color} text-white`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Visit Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="How was the experience? Any memorable moments?"
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} className="flex-1">
            {isEditing ? 'Save Changes' : 'Log Visit'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
