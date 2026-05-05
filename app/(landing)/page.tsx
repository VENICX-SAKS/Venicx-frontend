import type { Metadata } from 'next'
import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import StorySection from '@/components/landing/StorySection'
import Capabilities from '@/components/landing/Capabilities'
import HowItWorks from '@/components/landing/HowItWorks'
import TrustSection from '@/components/landing/TrustSection'
import LeadForm from '@/components/landing/LeadForm'
import Footer from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'VeniCX | Get More Customers or Funding — Starting Today',
  description: 'VeniCX helps South African SMEs get more customers, find funding, and access AI tools. Tell us about your business and get matched in 30 seconds.',
}

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <StorySection />
      <Capabilities />
      <HowItWorks />
      <TrustSection />
      <LeadForm />
      <Footer />
    </main>
  )
}
