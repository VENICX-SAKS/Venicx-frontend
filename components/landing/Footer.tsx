'use client'
import { useState } from 'react'
import { Globe, Fingerprint, Lock, X } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md cursor-pointer" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-[2rem] shadow-2xl p-8 md:p-12">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500" aria-label="Close">
          <X size={24} />
        </button>
        <h2 className="text-3xl font-black text-royal_blue mb-6 pr-8">{title}</h2>
        <div className="prose prose-slate max-w-none text-slate-600 space-y-4">{children}</div>
        <div className="mt-10 pt-6 border-t border-slate-100">
          <button onClick={onClose} className="w-full bg-royal_blue text-white py-4 rounded-xl font-bold hover:bg-royal_blue/90 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Footer() {
  const [modal, setModal] = useState<'security' | 'privacy' | null>(null)

  return (
    <footer className="bg-white border-t border-slate-100 pt-16 md:pt-24 pb-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12 mb-16 text-center md:text-left">
          <div className="space-y-6">
            <div className="flex items-center justify-center md:justify-start">
              <Logo size="md" variant="dark" />
            </div>
            <p className="text-slate-400 font-black tracking-[0.2em] text-[10px] uppercase">
              Consented Demand. Allocated Performance.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <button onClick={() => setModal('security')} className="text-slate-400 font-black hover:text-royal_blue transition-colors uppercase tracking-widest text-[10px]">Security</button>
            <button onClick={() => setModal('privacy')} className="text-slate-400 font-black hover:text-royal_blue transition-colors uppercase tracking-widest text-[10px]">Privacy</button>
            <a href="#apply" className="text-slate-400 font-black hover:text-royal_blue transition-colors uppercase tracking-widest text-[10px]">Contact</a>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-center">
          <p className="text-slate-400 text-xs font-medium">© {new Date().getFullYear()} Veni CX. All rights reserved. Built for African Finance.</p>
          <div className="flex gap-6">
            <Globe size={16} className="text-slate-300" />
            <Fingerprint size={16} className="text-slate-300" />
            <Lock size={16} className="text-slate-300" />
          </div>
        </div>
      </div>

      {modal === 'security' && (
        <Modal title="Security & Trust" onClose={() => setModal(null)}>
          <p className="font-bold text-royal_blue">Enterprise-Grade Trust is our foundation.</p>
          <p>Veni CX employs a multi-layered security architecture designed for the strict requirements of financial institutions.</p>
          <ul className="space-y-2 list-disc pl-5">
            <li><strong>Data Encryption:</strong> All data in transit is encrypted using TLS 1.3, and data at rest utilises AES-256 encryption.</li>
            <li><strong>Compliance:</strong> Fully aligned with POPIA (South Africa) and GDPR standards.</li>
            <li><strong>Infrastructure:</strong> Hosted on secure, high-availability cloud infrastructure with 24/7 monitoring.</li>
            <li><strong>Auditability:</strong> Comprehensive logging and immutable audit trails for every consent event.</li>
          </ul>
        </Modal>
      )}

      {modal === 'privacy' && (
        <Modal title="Privacy Policy" onClose={() => setModal(null)}>
          <p className="font-bold text-royal_blue">Your privacy and data sovereignty are paramount.</p>
          <h4 className="font-black text-royal_blue mt-6 uppercase text-sm tracking-widest">1. Consent-First Data</h4>
          <p>We exclusively process data obtained through verifiable, explicit user consent. Opt-out requests are respected immediately and globally.</p>
          <h4 className="font-black text-royal_blue mt-6 uppercase text-sm tracking-widest">2. Usage of Information</h4>
          <p>Information collected is used solely to verify identity and optimise financial acquisition workflows. We never sell raw consumer data.</p>
          <h4 className="font-black text-royal_blue mt-6 uppercase text-sm tracking-widest">3. Data Retention</h4>
          <p>We maintain strict retention schedules. Sensitive identifiers are purged or anonymised according to regulatory requirements.</p>
        </Modal>
      )}
    </footer>
  )
}
