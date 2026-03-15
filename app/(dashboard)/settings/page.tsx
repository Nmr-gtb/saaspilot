export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, ExternalLink, RefreshCw, Unlink } from 'lucide-react'
import { NotificationsSection } from './notifications-section'

const INTEGRATIONS = [
  {
    id: 'stripe',
    name: 'Stripe',
    icon: '💳',
    description: 'Revenus, MRR, churn, clients',
    status: 'active' as const,
  },
  {
    id: 'google-ads',
    name: 'Google Ads',
    icon: '📢',
    description: 'Campagnes, dépenses, conversions, ROI',
    status: 'soon' as const,
  },
  {
    id: 'tiktok-ads',
    name: 'TikTok Ads',
    icon: '🎵',
    description: 'Performances publicitaires TikTok',
    status: 'soon' as const,
  },
  {
    id: 'meta-ads',
    name: 'Meta Ads',
    icon: '📘',
    description: 'Campagnes Meta, audiences, conversions',
    status: 'soon' as const,
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    icon: '📊',
    description: 'Trafic, sources, comportement, conversions',
    status: 'soon' as const,
  },
  {
    id: 'crisp',
    name: 'Crisp',
    icon: '💬',
    description: 'Support client, tickets, satisfaction',
    status: 'soon' as const,
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    icon: '🔗',
    description: 'CRM, contacts, pipeline commercial',
    status: 'soon' as const,
  },
  {
    id: 'plausible',
    name: 'Plausible',
    icon: '📈',
    description: 'Analytics respectueux de la vie privée',
    status: 'soon' as const,
  },
]

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: integration } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', user?.id ?? '')
    .eq('provider', 'stripe')
    .eq('is_active', true)
    .maybeSingle()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id ?? '')
    .single()

  const isStripeConnected = !!integration

  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Paramètres</h2>
        <p className="text-muted-foreground">Gérez vos intégrations et votre compte</p>
      </div>

      {/* ── Intégrations ───────────────────────────────────────────────────── */}
      <section id="integrations">
        <h3 className="text-lg font-semibold mb-4">Intégrations</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {INTEGRATIONS.map((tool) => {
            const isConnected = tool.id === 'stripe' && isStripeConnected
            const isSoon = tool.status === 'soon'

            return (
              <Card
                key={tool.id}
                className={isSoon ? 'opacity-60' : isConnected ? 'border-green-600/25 bg-green-600/5' : ''}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tool.icon}</span>
                      <div>
                        <CardTitle className="text-base">{tool.name}</CardTitle>
                        <CardDescription className="text-xs mt-0.5">{tool.description}</CardDescription>
                      </div>
                    </div>
                    {isSoon ? (
                      <Badge variant="secondary" className="text-xs shrink-0">Bientôt</Badge>
                    ) : isConnected ? (
                      <Badge className="gap-1 text-xs text-green-600 border-green-600/30 bg-green-600/10 shrink-0">
                        <CheckCircle className="h-3 w-3" />
                        Connecté
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-xs text-muted-foreground shrink-0">
                        <AlertCircle className="h-3 w-3" />
                        Non connecté
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {isConnected ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border bg-muted/40 px-3 py-2 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">ID du compte</span>
                          <span className="font-mono">{integration.stripe_account_id}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Connecté le</span>
                          <span>{new Date(integration.connected_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <form action="/api/stripe/sync" method="POST">
                          <Button type="submit" variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs">
                            <RefreshCw className="h-3 w-3" />
                            Synchroniser
                          </Button>
                        </form>
                        <form action="/api/stripe/connect" method="POST">
                          <input type="hidden" name="action" value="disconnect" />
                          <Button
                            type="submit"
                            variant="outline"
                            size="sm"
                            className="gap-1.5 rounded-xl text-xs text-destructive border-destructive/30"
                          >
                            <Unlink className="h-3 w-3" />
                            Déconnecter
                          </Button>
                        </form>
                      </div>
                    </div>
                  ) : !isSoon ? (
                    <a href="/api/stripe/connect">
                      <Button size="sm" className="gap-2 rounded-xl text-xs">
                        <ExternalLink className="h-3 w-3" />
                        Connecter
                      </Button>
                    </a>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* ── Compte ─────────────────────────────────────────────────────────── */}
      <section id="compte">
        <h3 className="text-lg font-semibold mb-4">Compte</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-xl border bg-muted/40 p-4 text-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email</span>
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Plan actuel</span>
                <Badge variant="secondary" className="capitalize">
                  {profile?.plan ?? 'gratuit'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Membre depuis</span>
                <span>
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('fr-FR')
                    : '—'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Notifications ──────────────────────────────────────────────────── */}
      <section id="notifications">
        <h3 className="text-lg font-semibold mb-4">Notifications</h3>
        <Card>
          <CardContent className="pt-6">
            <NotificationsSection />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
