'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
  Users,
  Copy,
  RefreshCw,
  Crown,
  Shield,
  User,
  MoreVertical,
  UserMinus,
  LogOut
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface Member {
  id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  nickname: string | null
  joined_at: string
  profiles: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  }
}

interface Family {
  id: string
  name: string
  invite_code: string
  created_at: string
}

interface FamilyManagementProps {
  family: Family
  members: Member[]
  currentUserId: string
  currentUserRole: string
}

export function FamilyManagement({
  family,
  members,
  currentUserId,
  currentUserRole
}: FamilyManagementProps) {
  const router = useRouter()
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const isOwner = currentUserRole === 'owner'
  const isAdmin = currentUserRole === 'admin' || isOwner

  const copyInviteCode = () => {
    navigator.clipboard.writeText(family.invite_code)
    toast.success('Invite code copied!')
  }

  const copyInviteLink = () => {
    const link = `${window.location.origin}/auth/signup?invite=${family.invite_code}`
    navigator.clipboard.writeText(link)
    toast.success('Invite link copied!')
  }

  const regenerateCode = async () => {
    if (!isOwner) return
    setIsRegenerating(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('regenerate_invite_code', {
        family_uuid: family.id
      })

      if (error) throw error

      toast.success('New invite code generated!')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to regenerate code')
    } finally {
      setIsRegenerating(false)
    }
  }

  const removeMember = async (memberId: string, memberName: string) => {
    if (!isAdmin) return

    if (!confirm(`Are you sure you want to remove ${memberName} from the family?`)) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      toast.success(`${memberName} has been removed`)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove member')
    }
  }

  const leaveFamily = async () => {
    if (isOwner) {
      toast.error('Owners cannot leave. Transfer ownership first or delete the family.')
      return
    }

    if (!confirm('Are you sure you want to leave this family?')) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('family_id', family.id)
        .eq('user_id', currentUserId)

      if (error) throw error

      toast.success('You have left the family')
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to leave family')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />
      default:
        return <User className="w-4 h-4 text-gray-400" />
    }
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      owner: 'bg-yellow-100 text-yellow-800',
      admin: 'bg-blue-100 text-blue-800',
      member: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[role as keyof typeof styles]}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    )
  }

  return (
    <div className="space-y-8">
      {/* Family Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{family.name}</h1>
            <p className="text-gray-500 text-sm">
              Created {format(new Date(family.created_at), 'MMMM d, yyyy')}
            </p>
          </div>
          <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
            <Users className="w-7 h-7 text-primary-600" />
          </div>
        </div>

        {/* Invite Code Section */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Invite Code</span>
            {isOwner && (
              <button
                onClick={regenerateCode}
                disabled={isRegenerating}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-white px-4 py-3 rounded-lg border border-gray-200 font-mono text-lg tracking-widest">
              {family.invite_code}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={copyInviteCode}
              leftIcon={<Copy className="w-4 h-4" />}
            >
              Copy
            </Button>
          </div>
          <button
            onClick={copyInviteLink}
            className="mt-3 text-sm text-primary-600 hover:text-primary-700"
          >
            Or copy signup link with code →
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Family Members ({members.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {members.map((member) => {
            const isCurrentUser = member.user_id === currentUserId
            const canManage = isAdmin && !isCurrentUser && member.role !== 'owner'

            return (
              <div
                key={member.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-medium text-lg">
                      {(member.profiles.full_name || member.profiles.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {member.profiles.full_name || member.profiles.email.split('@')[0]}
                      </span>
                      {isCurrentUser && (
                        <span className="text-xs text-gray-400">(you)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleBadge(member.role)}
                      <span className="text-sm text-gray-500">
                        Joined {format(new Date(member.joined_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>

                {canManage && (
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                    {openMenuId === member.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                          <button
                            onClick={() => {
                              removeMember(member.id, member.profiles.full_name || 'this member')
                              setOpenMenuId(null)
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                          >
                            <UserMinus className="w-4 h-4" />
                            Remove from family
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Leave Family */}
      {!isOwner && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Leave Family</h3>
          <p className="text-gray-600 mb-4">
            You will no longer have access to this family&apos;s restaurants and visits.
          </p>
          <Button
            variant="outline"
            onClick={leaveFamily}
            leftIcon={<LogOut className="w-4 h-4" />}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Leave {family.name}
          </Button>
        </div>
      )}
    </div>
  )
}
