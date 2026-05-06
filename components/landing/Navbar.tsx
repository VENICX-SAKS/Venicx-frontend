'use client'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : 'unset'
  }, [menuOpen])

  const links = [
    { label: 'Our Story', href: '#story' },
    { label: 'What We Do', href: '#what-we-do' },
    { label: 'How It Works', href: '#how-it-works' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled || menuOpen ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
    }`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Logo variant={scrolled || menuOpen ? 'dark' : 'light'} size="md" />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.href} href={l.href} className={`font-semibold transition-colors ${
              scrolled ? 'text-slate-600 hover:text-royal_blue' : 'text-white/80 hover:text-white'
            }`}>{l.label}</a>
          ))}
          <a href="/login" className={`font-semibold transition-colors ${
            scrolled ? 'text-slate-600 hover:text-royal_blue' : 'text-white/80 hover:text-white'
          }`}>Login</a>
          <a href="#apply" className="bg-vibrant_orange hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold transition-all hover:scale-105 shadow-lg text-sm">
            Partner Access
          </a>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen
            ? <X size={26} className="text-royal_blue" />
            : <Menu size={26} className={scrolled ? 'text-royal_blue' : 'text-white'} />
          }
        </button>
      </div>

      {/* Mobile overlay */}
      <div className={`fixed inset-0 bg-white z-40 md:hidden transition-all duration-500 ${
        menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="flex flex-col h-full pt-24 pb-12 px-8 justify-between">
          <div className="flex flex-col gap-8">
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="text-3xl font-black text-royal_blue">{l.label}</a>
            ))}
          </div>
          <div className="space-y-4">
            <a href="#apply" onClick={() => setMenuOpen(false)}
              className="block w-full bg-vibrant_orange text-white text-center py-5 rounded-2xl font-black text-xl shadow-xl">
              Request Partner Access
            </a>
            <a href="/login" onClick={() => setMenuOpen(false)}
              className="block w-full border-2 border-royal_blue text-royal_blue text-center py-5 rounded-2xl font-black text-xl">
              Partner Login
            </a>
            <p className="text-center text-slate-400 text-sm">Infrastructure for Financial Growth</p>
          </div>
        </div>
      </div>
    </nav>
  )
}
