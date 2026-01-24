import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardNav } from '@/components/DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user's family memberships
  const { data: memberships } = await supabase
    .from('family_members')
    .select('family_id, role, families(id, name)')
    .eq('user_id', user.id)

  const families = memberships?.map(m => ({
    id: m.families?.id,
    name: m.families?.name,
    role: m.role
  })).filter(f => f.id) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={user} families={families} />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
