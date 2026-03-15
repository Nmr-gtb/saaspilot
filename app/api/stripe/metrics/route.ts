import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('product_id')
  const limit = parseInt(searchParams.get('limit') ?? '30', 10)

  const { data: products } = await supabase
    .from('products')
    .select('id')
    .eq('user_id', user.id)

  const productIds = products?.map((p) => p.id) ?? []

  if (productIds.length === 0) {
    return NextResponse.json({ metrics: [] })
  }

  let query = supabase
    .from('metrics_stripe')
    .select('*')
    .in('product_id', productIds)
    .order('date', { ascending: false })
    .limit(limit)

  if (productId) {
    query = query.eq('product_id', productId)
  }

  const { data: metrics, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ metrics })
}
