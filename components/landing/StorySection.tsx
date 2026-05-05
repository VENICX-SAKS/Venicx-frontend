import { Target } from 'lucide-react'

export default function StorySection() {
  return (
    <section id="story" className="py-32 bg-white overflow-hidden scroll-mt-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          {/* Images */}
          <div className="lg:w-1/2 relative">
            <div className="grid grid-cols-2 gap-6">
              <img src="https://picsum.photos/seed/business1/400/500" alt="Business owner"
                className="rounded-[3rem] shadow-2xl w-full aspect-[3/4] object-cover border-8 border-white" />
              <img src="https://picsum.photos/seed/growth2/400/500" alt="Business growth"
                className="rounded-[3rem] shadow-2xl w-full aspect-[3/4] object-cover border-8 border-white mt-12" />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-vibrant_orange text-white p-8 rounded-3xl shadow-2xl max-w-xs hidden md:block">
              <p className="font-outfit text-xl font-black leading-tight">&ldquo;Veni CX changed how we think about growth.&rdquo;</p>
              <p className="mt-2 text-sm font-bold opacity-80 uppercase tracking-widest">— Local SME Founder</p>
            </div>
          </div>

          {/* Text */}
          <div className="lg:w-1/2 space-y-10">
            <div className="space-y-4">
              <h4 className="text-vibrant_orange font-black uppercase tracking-[0.3em] text-sm">Our Mission</h4>
              <h2 className="font-outfit text-4xl md:text-6xl font-black text-royal_blue leading-[1.1]">
                Running a business is hard.{' '}
                <span className="text-slate-300">Finding the next step shouldn&apos;t be.</span>
              </h2>
            </div>
            <div className="space-y-8 text-xl text-slate-600 font-medium leading-relaxed">
              <p>You&apos;re trying to grow your business. Maybe you need more customers, funding, or just better tools to compete.</p>
              <p className="text-royal_blue font-black text-3xl leading-tight">
                But everything feels scattered —{' '}
                <span className="text-slate-400 font-bold italic">too many promises, not enough results.</span>
              </p>
              <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="bg-royal_blue text-white p-3 rounded-2xl flex-shrink-0">
                  <Target size={24} />
                </div>
                <p className="text-lg">We built Veni CX to be the <span className="font-black text-royal_blue">Distribution Layer</span> for African SMEs. We connect you to what actually works.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
