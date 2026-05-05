'use client'
import { ArrowRight, CheckCircle2, Zap, BarChart3, ShieldCheck } from 'lucide-react'

export default function Hero() {
  return (
    <header className="relative bg-royal_blue text-white pt-24 pb-16 md:pt-40 md:pb-48 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-[40rem] h-[40rem] bg-vibrant_orange/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Honeycomb pattern */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='30' viewBox='0 0 52 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%23ffffff' stroke-width='2'%3E%3Cpath d='M10 0l10 5.773v11.547L10 23.094 0 17.32V5.773z'/%3E%3Cpath d='M36 0l10 5.773v11.547L36 23.094 26 17.32V5.773z'/%3E%3Cpath d='M23 15l10 5.773v11.547L23 38.094 13 32.32V20.773z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '52px 30px'
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="max-w-3xl text-center lg:text-left space-y-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-vibrant_orange font-bold text-xs uppercase tracking-[0.2em] border border-white/20 backdrop-blur-sm">
              <Zap size={14} className="fill-current" /> Limited spots available this week
            </div>

            {/* Heading */}
            <h1 className="font-outfit text-5xl sm:text-6xl md:text-8xl font-black tracking-tight leading-[0.95]">
              Get More Customers or Funding —{' '}
              <span className="text-vibrant_orange">Starting Today</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/70 font-medium leading-relaxed max-w-2xl">
              Tell us about your business and we&apos;ll match you with the right opportunities in minutes.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
              <a href="#apply"
                className="w-full sm:w-auto bg-vibrant_orange hover:bg-orange-500 text-white px-12 py-6 rounded-2xl font-black text-2xl flex items-center justify-center gap-3 transition-all shadow-[0_20px_50px_rgba(255,140,0,0.3)] hover:-translate-y-0.5">
                Check My Options <ArrowRight size={28} />
              </a>
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-white/50 font-bold text-sm uppercase tracking-widest">
                {['No spam', '30 seconds', 'SA SMEs'].map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-vibrant_orange" /> {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Glassmorphism card — desktop only */}
          <div className="hidden lg:block relative w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-vibrant_orange to-transparent opacity-50" />
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-widest text-white/40 uppercase">Veni CX Lab</div>
                </div>
                <div className="space-y-4">
                  <div className="h-8 w-3/4 bg-white/10 rounded-lg animate-pulse" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-2">
                      <BarChart3 className="text-vibrant_orange" size={24} />
                      <div className="h-2 w-12 bg-white/10 rounded" />
                    </div>
                    <div className="h-24 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-2">
                      <ShieldCheck className="text-green-400" size={24} />
                      <div className="h-2 w-12 bg-white/10 rounded" />
                    </div>
                  </div>
                  <div className="h-32 bg-white/5 rounded-2xl border border-white/10 p-4 space-y-3">
                    <div className="h-2 w-full bg-white/10 rounded" />
                    <div className="h-2 w-5/6 bg-white/10 rounded" />
                    <div className="h-2 w-4/6 bg-white/10 rounded" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-vibrant_orange/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-royal_blue/40 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </header>
  )
}
