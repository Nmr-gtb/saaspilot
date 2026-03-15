import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendWeeklyReport } from '@/lib/email/templates'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (!products || products.length === 0) {
    return NextResponse.json({ error: 'No active products' }, { status: 400 })
  }

  const product = products[0]
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const { data: metrics } = await supabase
    .from('metrics_stripe')
    .select('*')
    .eq('product_id', product.id)
    .gte('date', oneWeekAgo.toISOString().split('T')[0])
    .order('date', { ascending: false })
    .limit(7)

  const latestMetric = metrics?.[0]
  const previousMetric = metrics?.[metrics.length - 1]

  const reportData = {
    product_name: product.name,
    period: `${oneWeekAgo.toLocaleDateString()} - ${new Date().toLocaleDateString()}`,
    mrr: latestMetric?.mrr ?? 0,
    mrr_change: latestMetric && previousMetric
      ? ((latestMetric.mrr - previousMetric.mrr) / previousMetric.mrr) * 100
      : 0,
    new_customers: metrics?.reduce((sum, m) => sum + (m.new_customers ?? 0), 0) ?? 0,
    churned_customers: metrics?.reduce((sum, m) => sum + (m.churned_customers ?? 0), 0) ?? 0,
    churn_rate: latestMetric?.churn_rate ?? 0,
    arpu: latestMetric?.arpu ?? 0,
    revenue: metrics?.reduce((sum, m) => sum + (m.revenue ?? 0), 0) ?? 0,
  }

  // Save report to database
  const { data: report } = await supabase
    .from('reports')
    .insert({
      user_id: user.id,
      product_id: product.id,
      type: 'weekly',
      data: reportData,
      sent_at: new Date().toISOString(),
    })
    .select()
    .single()

  // Send email if Resend is configured
  if (process.env.RESEND_API_KEY && user.email) {
    try {
      await sendWeeklyReport(user.email, reportData)
    } catch {
      // Email sending failed, but report was saved
    }
  }

  return NextResponse.json({ success: true, report })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return NextResponse.json({ reports })
}
