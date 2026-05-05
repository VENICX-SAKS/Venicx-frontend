import { ShieldCheck, Lock, Fingerprint } from 'lucide-react'

const stats = [
  { value: '100%', label: 'Data Privacy', sub: 'Guaranteed' },
  { value: '5k+', label: 'SMEs Helped', sub: 'In South Africa' },
  { value: 'R20M+', label: 'Funding Found', sub: 'Total Matches' },
  { value: '99.9%', label: 'Uptime', sub: 'Reliability' },
]

export default function TrustSection() {
  return (
    <section className="py-24 bg-royal_blue text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-vibrant_orange/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="max-w-xl space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-vibrant_orange font-bold text-xs uppercase tracking-widest border border-white/20">
              <ShieldCheck size={16} /> Enterprise Grade Security
            </div>
            <h2 className="font-outfit text-4xl md:text-6xl font-black leading-tight">
              Built for real businesses{' '}
              <span className="text-white/40">like yours.</span>
            </h2>
            <p className="text-xl text-white/60 font-medium leading-relaxed">
              We understand the value of your data. Veni CX uses bank-level encryption and strict privacy protocols to ensure your business information stays yours.
            </p>
            <div className="flex flex-wrap gap-8 pt-4">
              <div className="flex items-center gap-3">
                <Lock className="text-vibrant_orange" size={24} />
                <span className="font-bold text-sm uppercase tracking-widest">End-to-End Encryption</span>
              </div>
              <div className="flex items-center gap-3">
                <Fingerprint className="text-vibrant_orange" size={24} />
                <span className="font-bold text-sm uppercase tracking-widest">Biometric Security</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
            {stats.map((s, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl text-center space-y-2">
                <div className="font-outfit text-3xl font-black text-vibrant_orange">{s.value}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-white/40">{s.label}</div>
                <div className="text-[10px] text-white/20 font-medium">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
