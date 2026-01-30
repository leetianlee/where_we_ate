// @ts-nocheck
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FamilyManagement } from '@/components/family/FamilyManagement'
import { NoFamily } from '@/components/family/NoFamily'

export default async function FamilyPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user's family membership with family details
  const { data: membership, error } = await supabase    .from('family_members')
    .select(`
      family_id,
      role,
      families(id, name, invite_code, created_at)
    `)
    .eq('user_id', user.id)
    .single() as { data: any; error: any }

  if (error || !membership?.family_id) {    return <NoFamily />
  }

  // Get all family members with their profiles
  const { data: members } = await supabase
    .from('family_members')
    .select(`
      id,
      user_id,
      role,
      nickname,
      joined_at,
      profiles(id, email, full_name, avatar_url)
    `)
    .eq('family_id', membership.family_id)
    .order('joined_at', { ascending: true })

  return (
    <FamilyManagement
      family={membership.families}
      members={members || []}
      currentUserId={user.id}
      currentUserRole={membership.role}
    />
  )
}
