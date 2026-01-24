'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Save, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setFormData({
        fullName: profile?.full_name || user.user_metadata?.full_name || '',
        email: user.email || ''
      })
    }
    setIsLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please sign in first')
        return
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: formData.fullName }
      })

      if (authError) throw authError

      toast.success('Profile updated!')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>

        <form onSubmit={handleSave} className="space-y-5">
          <Input
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Your name"
            leftIcon={<User className="w-5 h-5" />}
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            disabled
            leftIcon={<Mail className="w-5 h-5" />}
            helperText="Email cannot be changed"
          />

          <Button type="submit" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>
        </form>
      </div>

      <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Password</h2>
        <p className="text-gray-600 mb-4">
          To change your password, use the password reset flow.
        </p>
        <Button
          variant="outline"
          onClick={async () => {
            const supabase = createClient()
            const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
              redirectTo: `${window.location.origin}/auth/update-password`
            })
            if (error) {
              toast.error(error.message)
            } else {
              toast.success('Check your email for a password reset link')
            }
          }}
        >
          Send Password Reset Email
        </Button>
      </div>
    </div>
  )
}
