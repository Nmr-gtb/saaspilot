import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export interface StripeMetrics {
  mrr: number
  churn_rate: number
  new_customers: number
  churned_customers: number
  active_customers: number
  arpu: number
  ltv: number
  revenue: number
  date: string
}

/**
 * Calculate MRR from active subscriptions
 */
export function calculateMRR(subscriptions: Stripe.Subscription[]): number {
  return subscriptions
    .filter((s) => s.status === 'active')
    .reduce((total, sub) => {
      const monthlyAmount = sub.items.data.reduce((sum, item) => {
        const price = item.price
        const amount = (price.unit_amount ?? 0) * (item.quantity ?? 1)
        // Normalize to monthly
        if (price.recurring?.interval === 'year') {
          return sum + amount / 12
        }
        if (price.recurring?.interval === 'week') {
          return sum + amount * 4
        }
        if (price.recurring?.interval === 'day') {
          return sum + amount * 30
        }
        return sum + amount
      }, 0)
      return total + monthlyAmount
    }, 0) / 100 // Convert from cents
}

/**
 * Calculate churn rate: churned / (churned + active) * 100
 */
export function calculateChurnRate(
  churned: number,
  activeAtStartOfPeriod: number
): number {
  if (activeAtStartOfPeriod === 0) return 0
  return Math.round((churned / activeAtStartOfPeriod) * 100 * 100) / 100
}

/**
 * Calculate ARPU: MRR / active customers
 */
export function calculateARPU(mrr: number, activeCustomers: number): number {
  if (activeCustomers === 0) return 0
  return Math.round((mrr / activeCustomers) * 100) / 100
}

/**
 * Calculate LTV: ARPU / churn rate
 * Using simple LTV = ARPU / monthly_churn_rate
 */
export function calculateLTV(arpu: number, churnRate: number): number {
  if (churnRate === 0) return 0
  const monthlyChurnRate = churnRate / 100
  return Math.round((arpu / monthlyChurnRate) * 100) / 100
}

/**
 * Fetch and sync Stripe metrics to Supabase
 */
export async function syncStripeMetrics(
  accessToken: string,
  productId: string
): Promise<StripeMetrics> {
  const stripe = new Stripe(accessToken, { apiVersion: '2026-02-25.clover' })
  const supabase = createAdminClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  // Fetch all active subscriptions
  const activeSubscriptions: Stripe.Subscription[] = []
  for await (const sub of stripe.subscriptions.list({
    status: 'active',
    limit: 100,
    expand: ['data.items.data.price'],
  })) {
    activeSubscriptions.push(sub)
  }

  // Fetch recently canceled subscriptions (this month)
  const canceledSubscriptions: Stripe.Subscription[] = []
  for await (const sub of stripe.subscriptions.list({
    status: 'canceled',
    limit: 100,
    created: { gte: Math.floor(startOfMonth.getTime() / 1000) },
  })) {
    canceledSubscriptions.push(sub)
  }

  // Fetch new subscriptions this month
  const newSubscriptions = activeSubscriptions.filter(
    (s) => new Date(s.created * 1000) >= startOfMonth
  )

  // Fetch revenue (charges) this month
  let totalRevenue = 0
  for await (const charge of stripe.charges.list({
    limit: 100,
    created: { gte: Math.floor(startOfMonth.getTime() / 1000) },
  })) {
    if (charge.paid && !charge.refunded) {
      totalRevenue += charge.amount
    }
  }

  // Estimate active customers at start of last month for churn calc
  const activeAtStartOfMonth = activeSubscriptions.length + canceledSubscriptions.length

  const mrr = calculateMRR(activeSubscriptions)
  const churned = canceledSubscriptions.length
  const churnRate = calculateChurnRate(churned, activeAtStartOfMonth)
  const activeCustomers = activeSubscriptions.length
  const arpu = calculateARPU(mrr, activeCustomers)
  const ltv = calculateLTV(arpu, churnRate)
  const revenue = totalRevenue / 100

  const metrics: StripeMetrics = {
    mrr,
    churn_rate: churnRate,
    new_customers: newSubscriptions.length,
    churned_customers: churned,
    active_customers: activeCustomers,
    arpu,
    ltv,
    revenue,
    date: now.toISOString().split('T')[0],
  }

  // Upsert metrics into Supabase
  await supabase.from('metrics_stripe').upsert(
    {
      product_id: productId,
      ...metrics,
    },
    { onConflict: 'product_id,date' }
  )

  return metrics
}
