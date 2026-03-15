import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${origin}/dashboard/settings?error=stripe_connect_failed`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}/login`)
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' })

  try {
    const response = await stripe.oauth.token({ grant_type: 'authorization_code', code })

    await supabase.from('integrations').upsert(
      {
        user_id: user.id,
        provider: 'stripe',
        access_token: response.access_token!,
        stripe_account_id: response.stripe_user_id!,
        scope: response.scope,
        connected_at: new Date().toISOString(),
        is_active: true,
      },
      { onConflict: 'user_id,provider' }
    )

    // Create a product for this Stripe account if none exists
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('user_id', user.id)
      .eq('stripe_account_id', response.stripe_user_id!)
      .single()

    if (!existing) {
      await supabase.from('products').insert({
        user_id: user.id,
        name: 'My Product',
        stripe_account_id: response.stripe_user_id!,
        is_active: true,
      })
    }

    return NextResponse.redirect(`${origin}/dashboard/settings?success=stripe_connected`)
  } catch {
    return NextResponse.redirect(`${origin}/dashboard/settings?error=stripe_token_exchange_failed`)
  }
}
