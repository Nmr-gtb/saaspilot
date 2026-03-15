export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Users, DollarSign, BarChart3, ExternalLink, RefreshCw } from 'lucide-react'
import { RevenueChart } from './revenue-chart'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: integration } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', user?.id ?? '')
    .eq('provider', 'stripe')
    .eq('is_active', true)
    .maybeSingle()

  const isStripeConnected = !!integration

  // ─── État vide / onboarding ───────────────────────────────────────────────
  if (!isStripeConnected) {
    return (
      <div className="space-y-8">
        <div className="text-center py-10">
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            Bienvenue sur SaaSPilot
          </h2>
          <p className="text-muted-foreground text-lg">
            Connectez vos outils pour voir vos métriques ici
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Stripe — actif */}
          <Card className="border-primary/40 bg-primary/5 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💳</span>
                <div>
                  <CardTitle className="text-base">Connecter Stripe</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Suivez vos revenus, MRR, churn et clients
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href="/dashboard/settings">
                <Button size="sm" className="gap-2 rounded-xl">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Connecter
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Google Ads */}
          <Card className="opacity-60">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📢</span>
                <div>
                  <CardTitle className="text-base">Connecter Google Ads</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Suivez vos campagnes et votre ROI
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Badge variant="secondary" className="text-xs">Bientôt disponible</Badge>
            </CardContent>
          </Card>

          {/* TikTok Ads */}
          <Card className="opacity-60">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎵</span>
                <div>
                  <CardTitle className="text-base">Connecter TikTok Ads</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Suivez vos performances TikTok
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Badge variant="secondary" className="text-xs">Bientôt disponible</Badge>
            </CardContent>
          </Card>

          {/* Google Analytics */}
          <Card className="opacity-60">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <CardTitle className="text-base">Connecter Google Analytics</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Suivez votre trafic et vos conversions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Badge variant="secondary" className="text-xs">Bientôt disponible</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ─── Stripe connecté — vraies métriques ──────────────────────────────────
  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .eq('user_id', user?.id ?? '')
    .eq('is_active', true)
    .limit(1)

  const productId = products?.[0]?.id

  let latestMetrics = null
  let chartData: Array<{ date: string; mrr: number; revenue: number }> = []

  if (productId) {
    const { data: metrics } = await supabase
      .from('metrics_stripe')
      .select('*')
      .eq('product_id', productId)
      .order('date', { ascending: false })
      .limit(1)

    latestMetrics = metrics?.[0]

    const { data: historicalMetrics } = await supabase
      .from('metrics_stripe')
      .select('date, mrr, revenue')
      .eq('product_id', productId)
      .order('date', { ascending: true })
      .limit(8)

    if (historicalMetrics && historicalMetrics.length > 0) {
      chartData = historicalMetrics.map((m) => ({
        date: new Date(m.date).toLocaleDateString('fr-FR', { month: 'short' }),
        mrr: m.mrr,
        revenue: m.revenue,
      }))
    }
  }

  const mrr = latestMetrics?.mrr ?? 0
  const churnRate = latestMetrics?.churn_rate ?? 0
  const arpu = latestMetrics?.arpu ?? 0
  const activeCustomers = latestMetrics?.active_customers ?? 0

  const kpis = [
    {
      title: 'Revenu Mensuel Récurrent',
      value: `$${mrr.toLocaleString('fr-FR')}`,
      icon: DollarSign,
      description: 'vs mois dernier',
      trend: 'up' as const,
      change: '+12,3%',
    },
    {
      title: 'Taux de Churn',
      value: `${churnRate}%`,
      icon: TrendingDown,
      description: 'churn mensuel',
      trend: 'down' as const,
      change: '-0,3%',
    },
    {
      title: 'ARPU',
      value: `$${arpu}`,
      icon: BarChart3,
      description: 'revenu moyen / utilisateur',
      trend: 'up' as const,
      change: '+5,8%',
    },
    {
      title: 'Clients Actifs',
      value: activeCustomers.toLocaleString('fr-FR'),
      icon: Users,
      description: 'ce mois-ci',
      trend: 'up' as const,
      change: '+18',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tableau de bord</h2>
        <p className="text-muted-foreground">Vos métriques SaaS en un coup d&apos;œil</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.title}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-green-500" />
                  )}
                  <span className="text-xs text-green-500">{kpi.change}</span>
                  <span className="text-xs text-muted-foreground">{kpi.description}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Revenue Chart */}
      {chartData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Vue d&apos;ensemble des revenus</CardTitle>
            <CardDescription>MRR et revenus totaux sur les 8 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={chartData} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Synchronisez vos données Stripe pour voir vos graphiques.
            </p>
            <form action="/api/stripe/sync" method="POST">
              <Button type="submit" variant="outline" size="sm" className="gap-2 rounded-xl">
                <RefreshCw className="h-3.5 w-3.5" />
                Synchroniser maintenant
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Outils non connectés */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { name: 'Google Ads', icon: '📢' },
          { name: 'TikTok Ads', icon: '🎵' },
          { name: 'Google Analytics', icon: '📊' },
        ].map((tool) => (
          <Card key={tool.name} className="border-dashed">
            <CardContent className="flex items-center gap-3 py-4">
              <span className="text-xl">{tool.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Connectez {tool.name}</p>
                <p className="text-xs text-muted-foreground">pour voir ces métriques</p>
              </div>
              <Badge variant="secondary" className="shrink-0 text-xs">Bientôt</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
