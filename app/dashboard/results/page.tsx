import { redirect } from 'next/navigation'

interface ResultsPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function ResultsPage({ searchParams }: ResultsPageProps) {
  // Preserve query parameters when redirecting to summary page
  const scan = searchParams.scan
  const queryString = scan ? `?scan=${scan}` : ''
  redirect(`/dashboard/results/summary${queryString}`)
}