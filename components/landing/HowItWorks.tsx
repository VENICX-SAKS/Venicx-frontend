import { MessageSquare, Target, Rocket } from 'lucide-react'

const steps = [
  { n: '01', title: 'Tell us your story', desc: 'Answer a few simple questions about your business and goals.', icon: <MessageSquare size={24} /> },
  { n: '02', title: 'Get matched', desc: 'Our AI scans our network for the best funding and growth options.', icon: <Target size={24} /> },
  { n: '03', title: 'Scale fast', desc: 'Connect with partners and tools to start growing immediately.', icon: <Rocket size={24} /> },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 bg-white scroll-mt-20">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h4 className="text-vibrant_orange font-black uppercase tracking-[0.3em] text-sm">The Process</h4>
          <h2 className="font-outfit text-4xl md:text-6xl font-black text-royal_blue">Three steps to growth</h2>
          <p className="text-xl text-slate-500 font-medium">We&apos;ve simplified the path to finding what your business needs.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10" />
          {steps.map((s, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 rounded-2xl bg-royal_blue text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  {s.icon}
                </div>
                <span className="font-outfit text-5xl font-black text-slate-100 group-hover:text-vibrant_orange/20 transition-colors">{s.n}</span>
              </div>
              <h3 className="font-outfit text-2xl font-black text-royal_blue mb-3">{s.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
