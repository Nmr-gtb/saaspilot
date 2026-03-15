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
import { TrendingUp, TrendingDown, Users, DollarSign, BarChart3, Zap } from 'lucide-react'
import { RevenueChart } from './revenue-chart'

// Données de démo pour les utilisateurs sans Stripe connecté
const DEMO_CHART_DATA = [
  { date: 'Jan', mrr: 12400, revenue: 14200 },
  { date: 'Fév', mrr: 14800, revenue: 16500 },
  { date: 'Mar', mrr: 15200, revenue: 17800 },
  { date: 'Avr', mrr: 17900, revenue: 20100 },
  { date: 'Mai', mrr: 19500, revenue: 22400 },
  { date: 'Jun', mrr: 21800, revenue: 25600 },
  { date: 'Jul', mrr: 24200, revenue: 28900 },
  { date: 'Aoû', mrr: 26700, revenue: 31200 },
]

const DEMO_TRANSACTIONS = [
  { id: '1', customer: 'Acme Corp', amount: 299, plan: 'Pro', status: 'paid', date: '2025-08-01' },
  { id: '2', customer: 'Widget Inc', amount: 99, plan: 'Starter', status: 'paid', date: '2025-08-01' },
  { id: '3', customer: 'TechFlow', amount: 499, plan: 'Enterprise', status: 'paid', date: '2025-07-31' },
  { id: '4', customer: 'Startup XYZ', amount: 99, plan: 'Starter', status: 'failed', date: '2025-07-31' },
  { id: '5', customer: 'Digital Labs', amount: 299, plan: 'Pro', status: 'paid', date: '2025-07-30' },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .eq('user_id', user?.id ?? '')
    .eq('is_active', true)
    .limit(1)

  const productId = products?.[0]?.id

  let latestMetrics = null
  let chartData = DEMO_CHART_DATA

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

  const mrr = latestMetrics?.mrr ?? 26700
  const churnRate = latestMetrics?.churn_rate ?? 2.4
  const arpu = latestMetrics?.arpu ?? 142
  const activeCustomers = latestMetrics?.active_customers ?? 188

  const kpis = [
    {
      title: 'Revenu Mensuel Récurrent',
      value: `$${mrr.toLocaleString('fr-FR')}`,
      change: '+12,3%',
      trend: 'up' as const,
      icon: DollarSign,
      description: 'vs mois dernier',
    },
    {
      title: 'Taux de Churn',
      value: `${churnRate}%`,
      change: '-0,3%',
      trend: 'down' as const,
      icon: TrendingDown,
      description: 'churn mensuel',
    },
    {
      title: 'ARPU',
      value: `$${arpu}`,
      change: '+5,8%',
      trend: 'up' as const,
      icon: BarChart3,
      description: 'revenu moyen / utilisateur',
    },
    {
      title: 'Clients Actifs',
      value: activeCustomers.toLocaleString('fr-FR'),
      change: '+18',
      trend: 'up' as const,
      icon: Users,
      description: 'ce mois-ci',
    },
  ]

  const isDemo = !latestMetrics

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tableau de bord</h2>
          <p className="text-muted-foreground">Vos métriques SaaS en un coup d&apos;œil</p>
        </div>
        {isDemo && (
          <Badge variant="secondary" className="gap-1.5">
            <Zap className="h-3 w-3" />
            Données de démo — connectez Stripe dans les Paramètres
          </Badge>
        )}
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
      <Card>
        <CardHeader>
          <CardTitle>Vue d&apos;ensemble des revenus</CardTitle>
          <CardDescription>MRR et revenus totaux sur les 8 derniers mois</CardDescription>
        </CardHeader>
        <CardContent>
          <RevenueChart data={chartData} />
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions récentes</CardTitle>
          <CardDescription>Derniers paiements enregistrés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            <div className="grid grid-cols-4 py-2 text-xs font-medium text-muted-foreground border-b">
              <span>Client</span>
              <span>Offre</span>
              <span>Date</span>
              <span className="text-right">Montant</span>
            </div>
            {DEMO_TRANSACTIONS.map((tx) => (
              <div key={tx.id} className="grid grid-cols-4 py-3 text-sm items-center border-b last:border-0">
                <span className="font-medium">{tx.customer}</span>
                <span>
                  <Badge variant="secondary" className="text-xs">
                    {tx.plan}
                  </Badge>
                </span>
                <span className="text-muted-foreground">
                  {new Date(tx.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex items-center justify-end gap-2">
                  <span className="font-medium">${tx.amount}</span>
                  <Badge
                    variant={tx.status === 'paid' ? 'secondary' : 'outline'}
                    className={`text-xs ${tx.status === 'failed' ? 'text-destructive border-destructive/30' : 'text-green-600'}`}
                  >
                    {tx.status === 'paid' ? 'payé' : 'échoué'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
