import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'SaaSPilot <noreply@saaspilot.app>'

interface WeeklyReportData {
  product_name: string
  period: string
  mrr: number
  mrr_change: number
  new_customers: number
  churned_customers: number
  churn_rate: number
  arpu: number
  revenue: number
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

export async function sendWeeklyReport(to: string, data: WeeklyReportData) {
  const mrrChangeColor = data.mrr_change >= 0 ? '#16a34a' : '#dc2626'
  const mrrChangeText = formatPercent(data.mrr_change)

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Weekly Report — ${data.product_name}</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; background: #f9fafb; margin: 0; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
    <!-- Header -->
    <div style="background: #111827; padding: 24px 32px;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">📊 Weekly Report</h1>
      <p style="color: #9ca3af; margin: 4px 0 0; font-size: 14px;">${data.product_name} · ${data.period}</p>
    </div>

    <!-- KPIs -->
    <div style="padding: 32px; display: grid; gap: 16px;">
      <h2 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #111827;">Key Metrics</h2>

      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
            <span style="color: #6b7280; font-size: 14px;">Monthly Recurring Revenue</span>
          </td>
          <td align="right" style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
            <span style="font-weight: 700; font-size: 16px; color: #111827;">${formatMoney(data.mrr)}</span>
            <span style="margin-left: 8px; font-size: 12px; color: ${mrrChangeColor};">${mrrChangeText}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
            <span style="color: #6b7280; font-size: 14px;">Total Revenue</span>
          </td>
          <td align="right" style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
            <span style="font-weight: 600; color: #111827;">${formatMoney(data.revenue)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
            <span style="color: #6b7280; font-size: 14px;">New Customers</span>
          </td>
          <td align="right" style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
            <span style="font-weight: 600; color: #16a34a;">+${data.new_customers}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
            <span style="color: #6b7280; font-size: 14px;">Churned Customers</span>
          </td>
          <td align="right" style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
            <span style="font-weight: 600; color: ${data.churned_customers > 0 ? '#dc2626' : '#111827'};">-${data.churned_customers}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
            <span style="color: #6b7280; font-size: 14px;">Churn Rate</span>
          </td>
          <td align="right" style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
            <span style="font-weight: 600; color: #111827;">${data.churn_rate.toFixed(1)}%</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0;">
            <span style="color: #6b7280; font-size: 14px;">ARPU</span>
          </td>
          <td align="right" style="padding: 12px 0;">
            <span style="font-weight: 600; color: #111827;">${formatMoney(data.arpu)}</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Footer -->
    <div style="padding: 16px 32px; border-top: 1px solid #f3f4f6; background: #f9fafb;">
      <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
        Sent by <strong>SaaSPilot</strong> · <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color: #6366f1;">View Dashboard</a>
      </p>
    </div>
  </div>
</body>
</html>`

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Weekly Report: ${data.product_name} — MRR ${formatMoney(data.mrr)} (${mrrChangeText})`,
    html,
  })
}

interface AlertEmailData {
  metric: string
  condition: string
  threshold: number
  currentValue: number
  productName: string
}

export async function sendAlertEmail(to: string, data: AlertEmailData) {
  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; background: #f9fafb; margin: 0; padding: 24px;">
  <div style="max-width: 500px; margin: 0 auto; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
    <div style="background: #dc2626; padding: 16px 24px;">
      <h1 style="color: #fff; margin: 0; font-size: 16px;">🚨 Alert Triggered</h1>
    </div>
    <div style="padding: 24px;">
      <p style="margin: 0 0 16px; color: #374151;">
        Your alert for <strong>${data.metric}</strong> on <strong>${data.productName}</strong> has been triggered.
      </p>
      <div style="background: #f9fafb; border-radius: 8px; padding: 16px; font-size: 14px; color: #374151;">
        <div style="margin-bottom: 8px;"><strong>Condition:</strong> ${data.metric} ${data.condition} ${data.threshold}</div>
        <div><strong>Current value:</strong> ${data.currentValue}</div>
      </div>
      <p style="margin: 16px 0 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: #111827; color: #fff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px;">
          View Dashboard
        </a>
      </p>
    </div>
  </div>
</body>
</html>`

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Alert: ${data.metric} ${data.condition} ${data.threshold} on ${data.productName}`,
    html,
  })
}
