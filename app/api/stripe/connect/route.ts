import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.STRIPE_CLIENT_ID
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!clientId) {
    return NextResponse.json({ error: 'Stripe OAuth not configured' }, { status: 500 })
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: 'read_write',
    redirect_uri: `${appUrl}/api/stripe/connect/callback`,
  })

  return NextResponse.redirect(`https://connect.stripe.com/oauth/authorize?${params}`)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.formData()
  const action = body.get('action')

  if (action === 'disconnect') {
    await supabase
      .from('integrations')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('provider', 'stripe')

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`)
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
