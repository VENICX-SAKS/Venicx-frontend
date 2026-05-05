'use client'
import { ArrowRight, Wallet, BarChart3, Zap, Users } from 'lucide-react'

export default function Capabilities() {
  return (
    <section id="what-we-do" className="py-32 bg-slate-50 scroll-mt-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
          <div className="max-w-2xl space-y-4">
            <h4 className="text-vibrant_orange font-black uppercase tracking-[0.3em] text-sm">Capabilities</h4>
            <h2 className="font-outfit text-4xl md:text-6xl font-black text-royal_blue leading-tight">
              We connect you to what{' '}
              <span className="text-slate-300">actually works.</span>
            </h2>
          </div>
          <a href="#apply" className="hidden md:flex items-center gap-2 text-royal_blue font-black uppercase tracking-widest text-sm hover:text-vibrant_orange transition-colors">
            Explore All Matches <ArrowRight size={16} />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Find Funding — wide */}
          <div className="md:col-span-8 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between group hover:-translate-y-1 transition-transform">
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                <Wallet size={32} />
              </div>
              <div>
                <h3 className="font-outfit text-3xl font-black text-royal_blue mb-2">Find Funding</h3>
                <p className="text-slate-500 font-medium text-lg max-w-md">Access verified funding options tailored to your business stage and industry. No more guessing.</p>
              </div>
            </div>
            <div className="mt-10 flex gap-4">
              {['Grants', 'Loans', 'Equity'].map(t => (
                <span key={t} className="px-4 py-2 bg-slate-50 rounded-full text-xs font-bold text-slate-400 uppercase tracking-widest">{t}</span>
              ))}
            </div>
          </div>

          {/* Get Customers — narrow dark */}
          <div className="md:col-span-4 bg-royal_blue p-10 rounded-[3rem] shadow-xl text-white flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 text-vibrant_orange flex items-center justify-center">
                <BarChart3 size={32} />
              </div>
              <div>
                <h3 className="font-outfit text-3xl font-black mb-2">Get Customers</h3>
                <p className="text-white/60 font-medium text-lg">Scale your acquisition with our proven distribution engine.</p>
              </div>
            </div>
            <ArrowRight className="text-vibrant_orange mt-8" size={32} />
          </div>

          {/* AI Tools — narrow orange */}
          <div className="md:col-span-4 bg-vibrant_orange p-10 rounded-[3rem] shadow-xl text-white flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 text-white flex items-center justify-center">
                <Zap size={32} />
              </div>
              <div>
                <h3 className="font-outfit text-3xl font-black mb-2">AI Tools</h3>
                <p className="text-white/80 font-medium text-lg">Save hours every week with simple, effective AI automation.</p>
              </div>
            </div>
            <div className="mt-8 h-1 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-white rounded-full animate-[slide_3s_linear_infinite]" />
            </div>
          </div>

          {/* Partner Network — wide */}
          <div className="md:col-span-8 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-10 hover:-translate-y-1 transition-transform">
            <div className="md:w-1/2 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users size={32} />
              </div>
              <div>
                <h3 className="font-outfit text-3xl font-black text-royal_blue mb-2">Partner Network</h3>
                <p className="text-slate-500 font-medium text-lg">Join a community of founders and experts dedicated to African growth.</p>
              </div>
            </div>
            <div className="md:w-1/2 grid grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-slate-50 rounded-2xl flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-slate-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
