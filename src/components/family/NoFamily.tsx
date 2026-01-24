'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Plus, KeyRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import toast from 'react-hot-toast'

export function NoFamily() {
  const router = useRouter()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [familyName, setFamilyName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!familyName.trim()) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please sign in first')
        return
      }

      // Create the family
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert({
          name: familyName.trim(),
          created_by: user.id
        })
        .select()
        .single()

      if (familyError) throw familyError

      // Add user as owner
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: family.id,
          user_id: user.id,
          role: 'owner'
        })

      if (memberError) throw memberError

      toast.success('Family created successfully!')
      setShowCreateModal(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create family')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteCode.trim()) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please sign in first')
        return
      }

      // Find family by invite code
      const { data: family, error: findError } = await supabase
        .from('families')
        .select('id, name')
        .eq('invite_code', inviteCode.trim().toUpperCase())
        .single()

      if (findError || !family) {
        toast.error('Invalid invite code')
        return
      }

      // Check if already a member
      const { data: existing } = await supabase
        .from('family_members')
        .select('id')
        .eq('family_id', family.id)
        .eq('user_id', user.id)
        .single()

      if (existing) {
        toast.error('You are already a member of this family')
        return
      }

      // Join the family
      const { error: joinError } = await supabase
        .from('family_members')
        .insert({
          family_id: family.id,
          user_id: user.id,
          role: 'member'
        })

      if (joinError) throw joinError

      toast.success(`Welcome to ${family.name}!`)
      setShowJoinModal(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to join family')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Users className="w-10 h-10 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Where We Ate!
        </h1>
        <p className="text-gray-600 text-lg">
          Get started by creating a family group or joining an existing one with an invite code.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Create Family */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Plus className="w-7 h-7 text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Create a Family
          </h2>
          <p className="text-gray-600 mb-6">
            Start a new family group and invite your family members to join.
          </p>
          <Button onClick={() => setShowCreateModal(true)} className="w-full">
            Create Family
          </Button>
        </div>

        {/* Join Family */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Join a Family
          </h2>
          <p className="text-gray-600 mb-6">
            Have an invite code? Enter it to join your family&apos;s group.
          </p>
          <Button variant="outline" onClick={() => setShowJoinModal(true)} className="w-full">
            Enter Invite Code
          </Button>
        </div>
      </div>

      {/* Create Family Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Your Family"
      >
        <form onSubmit={handleCreateFamily} className="p-6 space-y-6">
          <Input
            label="Family Name"
            placeholder="e.g., The Lee Family"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            required
          />
          <p className="text-sm text-gray-500">
            You&apos;ll get an invite code to share with your family members after creating the group.
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} className="flex-1">
              Create Family
            </Button>
          </div>
        </form>
      </Modal>

      {/* Join Family Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title="Join a Family"
      >
        <form onSubmit={handleJoinFamily} className="p-6 space-y-6">
          <Input
            label="Invite Code"
            placeholder="e.g., ABC12345"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            required
            helperText="Ask your family member for the invite code"
          />
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowJoinModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} className="flex-1">
              Join Family
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
