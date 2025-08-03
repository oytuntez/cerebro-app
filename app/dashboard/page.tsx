import { redirect } from 'next/navigation'

export default function DashboardPage() {
  // Redirect to summary page as the main dashboard
  redirect('/dashboard/results/summary')
}
