'use client'
import { useState } from 'react'
import { ArrowRight, CheckCircle2, Wallet, Users, Zap } from 'lucide-react'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://partner.venicx.com'

type FormData = {
  businessStage: string
  primaryNeed: string
  name: string
  email: string
  mobile: string
  consent: boolean
}

export default function LeadForm() {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormData>({
    businessStage: '',
    primaryNeed: '',
    name: '',
    email: '',
    mobile: '',
    consent: true,
  })

  const set = (field: keyof FormData, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/public/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VeniCX-Source': 'website-v1',
        },
        body: JSON.stringify({
          full_name: form.name,
          email: form.email || undefined,
          mobile: form.mobile || undefined,
          business_stage: form.businessStage,
          primary_need: form.primaryNeed,
          sms_consent: true,  // always true
          email_consent: true, // always true
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error?.message || 'Something went wrong. Please try again.')

      if (data.customer_id) {
        localStorage.setItem('venicx_customer_id', data.customer_id)
      }

      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <section id="apply" className="py-32 bg-slate-50 scroll-mt-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto bg-white p-16 rounded-[3rem] shadow-2xl text-center space-y-8 border border-slate-100">
            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={64} />
            </div>
            <div className="space-y-4">
              <h2 className="font-outfit text-4xl md:text-5xl font-black text-royal_blue">You&apos;re in!</h2>
              <p className="text-xl text-slate-500 font-medium">
                Check your phone in the next few minutes — we&apos;ll send you your business score and what to do next.
              </p>
            </div>
            <button
              onClick={() => { setSubmitted(false); setStep(1); setError('') }}
              className="bg-royal_blue text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-royal_blue/90 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </section>
    )
  }

  const stageOptions = [
    'Starting out',
    'Growing (under R50k/month)',
    'Growing (R50k–R500k/month)',
    'Established',
  ]

  const needOptions = [
    { id: 'Funding', label: 'Funding & Investment', icon: <Wallet size={20} /> },
    { id: 'More customers', label: 'More Customers', icon: <Users size={20} /> },
    { id: 'Better tools', label: 'Better Digital Tools', icon: <Zap size={20} /> },
  ]

  return (
    <section id="apply" className="py-32 bg-slate-50 scroll-mt-20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Left copy */}
            <div className="lg:w-1/2 space-y-8">
              <h4 className="text-vibrant_orange font-black uppercase tracking-[0.3em] text-sm">Get Started</h4>
              <h2 className="font-outfit text-4xl md:text-6xl font-black text-royal_blue leading-tight">
                Ready to scale your business?
              </h2>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                Join thousands of South African SMEs using Veni CX to find funding and customers.
              </p>
              <div className="space-y-4 pt-4">
                {['Personalized growth matches', 'Direct access to funding partners', 'Simplified AI tool integration'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-royal_blue font-bold">
                    <div className="bg-royal_blue/10 p-1 rounded-full">
                      <CheckCircle2 size={16} className="text-royal_blue" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right form card */}
            <div className="lg:w-1/2 w-full">
              <div className="bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">
                {/* Progress bar */}
                <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
                  <div
                    className="h-full bg-vibrant_orange transition-all duration-500"
                    style={{ width: `${(step / 3) * 100}%` }}
                  />
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 pt-4">
                  {/* Step 1 */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <h3 className="font-outfit text-2xl font-black text-royal_blue">What best describes your business?</h3>
                      <div className="grid gap-4">
                        {stageOptions.map(opt => (
                          <label key={opt} className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                            form.businessStage === opt ? 'border-vibrant_orange bg-orange-50' : 'border-slate-100 hover:border-slate-200'
                          }`}>
                            <input type="radio" name="stage" value={opt}
                              checked={form.businessStage === opt}
                              onChange={e => set('businessStage', e.target.value)}
                              className="w-5 h-5 accent-vibrant_orange" required />
                            <span className="font-bold text-slate-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                      <button type="button" onClick={() => setStep(2)} disabled={!form.businessStage}
                        className="w-full bg-royal_blue text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-royal_blue/90 transition-colors">
                        Continue <ArrowRight size={24} />
                      </button>
                    </div>
                  )}

                  {/* Step 2 */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <h3 className="font-outfit text-2xl font-black text-royal_blue">What do you need most right now?</h3>
                      <div className="grid gap-4">
                        {needOptions.map(opt => (
                          <label key={opt.id} className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                            form.primaryNeed === opt.id ? 'border-vibrant_orange bg-orange-50' : 'border-slate-100 hover:border-slate-200'
                          }`}>
                            <input type="radio" name="need" value={opt.id}
                              checked={form.primaryNeed === opt.id}
                              onChange={e => set('primaryNeed', e.target.value)}
                              className="w-5 h-5 accent-vibrant_orange" required />
                            <div className="flex items-center gap-3 font-bold text-slate-700">
                              {opt.icon} {opt.label}
                            </div>
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-4">
                        <button type="button" onClick={() => setStep(1)}
                          className="flex-1 border-2 border-slate-100 py-5 rounded-2xl font-black text-slate-400 hover:border-slate-200 transition-colors">
                          Back
                        </button>
                        <button type="button" onClick={() => setStep(3)} disabled={!form.primaryNeed}
                          className="flex-[2] bg-royal_blue text-white py-5 rounded-2xl font-black text-xl disabled:opacity-50 hover:bg-royal_blue/90 transition-colors">
                          Almost There
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3 */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <h3 className="font-outfit text-2xl font-black text-royal_blue">Final Step</h3>
                      <div className="space-y-4">
                        <input type="text" placeholder="Full Name" required
                          value={form.name} onChange={e => set('name', e.target.value)}
                          className="w-full p-5 rounded-2xl border-2 border-slate-100 focus:border-vibrant_orange outline-none font-bold transition-colors" />
                        <input type="email" placeholder="Email Address"
                          value={form.email} onChange={e => set('email', e.target.value)}
                          className="w-full p-5 rounded-2xl border-2 border-slate-100 focus:border-vibrant_orange outline-none font-bold transition-colors" />
                        <input type="tel" placeholder="Mobile Number"
                          value={form.mobile} onChange={e => set('mobile', e.target.value)}
                          className="w-full p-5 rounded-2xl border-2 border-slate-100 focus:border-vibrant_orange outline-none font-bold transition-colors" />
                        <label className="flex items-start gap-3">
                          <input type="checkbox"
                            checked={true}
                            readOnly
                            className="mt-1 w-5 h-5 accent-vibrant_orange cursor-default" />
                          <span className="text-sm font-medium text-slate-500">
                            I consent to Veni CX contacting me about business opportunities. By submitting this form you agree to be contacted.
                          </span>
                        </label>
                      </div>

                      {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-bold text-sm">
                          {error}
                        </div>
                      )}

                      <div className="flex gap-4">
                        <button type="button" onClick={() => setStep(2)}
                          className="flex-1 border-2 border-slate-100 py-5 rounded-2xl font-black text-slate-400 hover:border-slate-200 transition-colors">
                          Back
                        </button>
                        <button type="submit" disabled={loading}
                          className="flex-[2] bg-vibrant_orange text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-orange-500/20 disabled:opacity-50 hover:bg-orange-600 transition-colors">
                          {loading ? 'Processing...' : 'See My Matches'}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
