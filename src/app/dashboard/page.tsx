import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RestaurantList } from '@/components/restaurants/RestaurantList'
import { NoFamily } from '@/components/family/NoFamily'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user's family membership
  const { data: membership } = await supabase
    .from('family_members')
    .select('family_id, role, families(id, name, invite_code)')
    .eq('user_id', user.id)
    .single()

  // If user has no family, show create/join options
  if (!membership?.family_id) {
    return <NoFamily />
  }

  // Get restaurants for this family
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select(`
      *,
      visits(id, overall_rating, total_bill, date)
    `)
    .eq('family_id', membership.family_id)
    .order('created_at', { ascending: false })

  // Calculate stats for each restaurant
  const restaurantsWithStats = restaurants?.map(restaurant => {
    const visits = restaurant.visits || []
    const ratings = visits.filter((v: any) => v.overall_rating).map((v: any) => v.overall_rating)
    const bills = visits.filter((v: any) => v.total_bill).map((v: any) => v.total_bill)

    return {
      ...restaurant,
      visit_count: visits.length,
      avg_rating: ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : null,
      avg_price: bills.length > 0 ? bills.reduce((a: number, b: number) => a + b, 0) / bills.length : null,
      last_visit: visits.length > 0 ? visits.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date : null
    }
  }) || []

  return (
    <RestaurantList
      restaurants={restaurantsWithStats}
      familyId={membership.family_id}
      familyName={membership.families?.name || 'Family'}
    />
  )
}
