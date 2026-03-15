import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { syncStripeMetrics } from '@/lib/stripe/metrics'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: integration } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', user.id)
    .eq('provider', 'stripe')
    .eq('is_active', true)
    .single()

  if (!integration) {
    return NextResponse.json({ error: 'No active Stripe integration' }, { status: 400 })
  }

  const { data: product } = await supabase
    .from('products')
    .select('id')
    .eq('user_id', user.id)
    .eq('stripe_account_id', integration.stripe_account_id)
    .eq('is_active', true)
    .single()

  if (!product) {
    return NextResponse.json({ error: 'No product found for this integration' }, { status: 400 })
  }

  try {
    const metrics = await syncStripeMetrics(integration.access_token, product.id)
    return NextResponse.json({ success: true, metrics })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
