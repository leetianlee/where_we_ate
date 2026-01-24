'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Utensils, MapPin, Link as LinkIcon, StickyNote } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import toast from 'react-hot-toast'

const CUISINE_OPTIONS = [
  'Chinese', 'Japanese', 'Korean', 'Thai', 'Vietnamese',
  'Indian', 'Italian', 'French', 'Mediterranean', 'Mexican',
  'American', 'Seafood', 'Steakhouse', 'Vegetarian', 'Cafe',
  'Fast Food', 'Dessert', 'Other'
]

interface RestaurantFormProps {
  familyId: string
  restaurant?: {
    id: string
    name: string
    cuisine: string | null
    address: string | null
    website: string | null
    notes: string | null
  }
  onClose: () => void
}

export function RestaurantForm({ familyId, restaurant, onClose }: RestaurantFormProps) {
  const router = useRouter()
  const isEditing = !!restaurant

  const [formData, setFormData] = useState({
    name: restaurant?.name || '',
    cuisine: restaurant?.cuisine || '',
    address: restaurant?.address || '',
    website: restaurant?.website || '',
    notes: restaurant?.notes || ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please sign in first')
        return
      }

      if (isEditing) {
        const { error } = await supabase
          .from('restaurants')
          .update({
            name: formData.name.trim(),
            cuisine: formData.cuisine || null,
            address: formData.address || null,
            website: formData.website || null,
            notes: formData.notes || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', restaurant.id)

        if (error) throw error
        toast.success('Restaurant updated!')
      } else {
        const { error } = await supabase
          .from('restaurants')
          .insert({
            family_id: familyId,
            name: formData.name.trim(),
            cuisine: formData.cuisine || null,
            address: formData.address || null,
            website: formData.website || null,
            notes: formData.notes || null,
            created_by: user.id
          })

        if (error) throw error
        toast.success('Restaurant added!')
      }

      onClose()
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEditing ? 'Edit Restaurant' : 'Add Restaurant'}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <Input
          label="Restaurant Name *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Golden Dragon"
          required
          leftIcon={<Utensils className="w-5 h-5" />}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cuisine Type
          </label>
          <select
            value={formData.cuisine}
            onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select cuisine...</option>
            {CUISINE_OPTIONS.map((cuisine) => (
              <option key={cuisine} value={cuisine}>{cuisine}</option>
            ))}
          </select>
        </div>

        <Input
          label="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="e.g., 123 Main Street, City"
          leftIcon={<MapPin className="w-5 h-5" />}
        />

        <Input
          label="Website / Menu Link"
          type="url"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          placeholder="https://..."
          leftIcon={<LinkIcon className="w-5 h-5" />}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <div className="relative">
            <StickyNote className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any notes about the restaurant..."
              rows={3}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            className="flex-1"
          >
            {isEditing ? 'Save Changes' : 'Add Restaurant'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
