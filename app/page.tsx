import Link from 'next/link'
import { Rocket, BarChart3, Bell, Mail, Layers, ArrowRight, Check } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                <Rocket className="h-4 w-4 text-primary" />
              </div>
              <span className="text-lg font-bold">SaaSPilot</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                Commencer gratuitement
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-sm font-medium text-primary">
              🚀 Lancement — 50% de réduction les 3 premiers mois
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
              Toutes les métriques de votre SaaS.{' '}
              <span className="text-primary">Un seul dashboard.</span>
            </h1>
            <p className="mb-10 text-lg text-muted-foreground sm:text-xl leading-relaxed">
              Connectez Stripe, vos outils d&apos;analytics et de support en un clic.
              Suivez votre MRR, churn, acquisition et satisfaction client — sans jongler entre 10 onglets.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                Commencer gratuitement
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-6 py-3 text-base font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Voir la démo
              </a>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="mt-16 mx-auto max-w-4xl">
            <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-400/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
                <div className="h-3 w-3 rounded-full bg-green-400/70" />
                <div className="ml-3 h-5 w-48 rounded bg-muted/70" />
              </div>
              {/* Mockup layout */}
              <div className="flex">
                {/* Fake sidebar */}
                <div className="hidden sm:flex w-44 border-r border-border bg-sidebar flex-col p-3 gap-0.5 shrink-0">
                  {[
                    { label: 'Tableau de bord', active: true },
                    { label: 'Revenus', active: false },
                    { label: 'Clients', active: false },
                    { label: 'Alertes', active: false },
                    { label: 'Paramètres', active: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                        item.active
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <div className="h-3 w-3 rounded bg-current opacity-50 shrink-0" />
                      {item.label}
                    </div>
                  ))}
                </div>
                {/* Fake main content */}
                <div className="flex-1 p-5 space-y-4 bg-background min-w-0">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'MRR', value: '26 700 €', change: '+12.3%' },
                      { label: 'Churn', value: '2.4%', change: '-0.3%' },
                      { label: 'ARPU', value: '142 €', change: '+5.8%' },
                      { label: 'Clients', value: '188', change: '+18' },
                    ].map((kpi) => (
                      <div key={kpi.label} className="rounded-xl border border-border bg-card p-3 shadow-sm">
                        <div className="text-xs text-muted-foreground mb-1">{kpi.label}</div>
                        <div className="text-base font-bold">{kpi.value}</div>
                        <div className="text-xs text-green-600 font-medium">{kpi.change}</div>
                      </div>
                    ))}
                  </div>
                  {/* Fake chart */}
                  <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <div className="text-xs font-medium mb-3 text-muted-foreground">Évolution du MRR — 8 derniers mois</div>
                    <div className="flex items-end gap-1 h-20">
                      {[38, 52, 46, 68, 74, 81, 88, 100].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-sm transition-all"
                          style={{
                            height: `${h}%`,
                            backgroundColor: `oklch(0.61 0.155 40 / ${0.25 + i * 0.095})`,
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû'].map((m) => (
                        <span key={m}>{m}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Connectez vos outils en un clic</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Et bien d&apos;autres à venir... Suggérez vos intégrations préférées.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { name: 'Stripe', available: true, icon: '💳' },
              { name: 'Google Analytics', available: false, icon: '📊' },
              { name: 'Crisp', available: false, icon: '💬' },
              { name: 'Intercom', available: false, icon: '🎯' },
              { name: 'Plausible', available: false, icon: '📈' },
              { name: 'HubSpot', available: false, icon: '🔗' },
            ].map((integration) => (
              <div
                key={integration.name}
                className="flex flex-col items-center gap-2.5 rounded-2xl border border-border bg-card p-5 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-2xl">{integration.icon}</span>
                <span className="text-sm font-semibold">{integration.name}</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    integration.available
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {integration.available ? 'Disponible' : 'Bientôt'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-muted-foreground text-lg">Conçu pour les indie makers et les équipes SaaS.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: BarChart3,
                title: 'Métriques Stripe en temps réel',
                description: 'MRR, churn, ARPU, LTV calculés automatiquement depuis vos données Stripe.',
              },
              {
                icon: Bell,
                title: 'Alertes intelligentes',
                description: 'Soyez prévenu par email quand un indicateur dépasse un seuil défini.',
              },
              {
                icon: Mail,
                title: 'Rapport hebdomadaire',
                description: 'Recevez chaque lundi un résumé complet de votre semaine par email.',
              },
              {
                icon: Layers,
                title: 'Multi-produits',
                description: 'Gérez plusieurs SaaS depuis un seul tableau de bord unifié.',
              },
            ].map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Tarifs simples et transparents</h2>
            <p className="text-muted-foreground text-lg">Sans frais cachés. Annulez quand vous voulez.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '19€',
                description: 'Parfait pour lancer votre premier SaaS.',
                features: [
                  '1 produit',
                  'Métriques Stripe complètes',
                  'Alertes par email',
                  'Rapport hebdomadaire',
                ],
                cta: 'Commencer avec Starter',
                highlighted: false,
              },
              {
                name: 'Pro',
                price: '29€',
                description: 'Pour les makers qui gèrent plusieurs produits.',
                features: [
                  'Produits illimités',
                  'Toutes les intégrations',
                  'Alertes avancées',
                  'Accès API',
                ],
                cta: 'Commencer avec Pro',
                highlighted: true,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 shadow-sm ${
                  plan.highlighted
                    ? 'border-primary/40 bg-primary/5 shadow-md'
                    : 'border-border bg-card'
                }`}
              >
                <div className="mb-6">
                  <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
                    Lancement — 50% de réduction les 3 premiers mois
                  </div>
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">/mois</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block w-full rounded-xl py-2.5 text-center text-sm font-semibold transition-colors ${
                    plan.highlighted
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border border-border bg-background hover:bg-muted'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Rocket className="h-4 w-4 text-primary" />
              </div>
              <span className="font-bold">SaaSPilot</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Produit</a>
              <a href="#features" className="hover:text-foreground transition-colors">Intégrations</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Tarifs</a>
              <a href="mailto:hello@saaspilot.app" className="hover:text-foreground transition-colors">Contact</a>
            </nav>
            <div className="text-sm text-muted-foreground text-center space-y-1">
              <p>Fait avec ❤️ pour les indie makers</p>
              <p>© 2026 SaaSPilot</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
