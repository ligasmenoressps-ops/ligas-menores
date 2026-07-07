'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, User } from 'lucide-react';

interface Category {
  name: string;
  slug?: string; // we'll use name.toLowerCase() if slug is not provided
}

export function PublicHeader({ categories, settings }: { categories: Category[], settings?: { appName: string, appLogoUrl: string | null } }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 bg-brand-dark text-white ${
        isScrolled ? 'shadow-lg py-1' : 'shadow-none py-2'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              {settings?.appLogoUrl ? (
                <img src={settings.appLogoUrl} alt={settings?.appName || 'Logo'} className="w-10 h-10 object-contain rounded-full bg-white p-1" />
              ) : (
                <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white font-black text-xl shadow-sm">
                  {settings?.appName ? settings.appName.substring(0, 2).toUpperCase() : 'LM'}
                </div>
              )}
              <span className="font-black text-2xl tracking-tight hidden sm:block">{settings?.appName || 'Ligas Menores'}</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center h-full">
            <Link href="/" className="text-gray-300 hover:text-white font-medium transition-colors">
              Inicio
            </Link>
            
            <Link href="/calendario" className="text-gray-300 hover:text-white font-medium transition-colors">
              Calendario
            </Link>

            {/* Categorías Dropdown */}
            <div className="relative group h-full flex items-center">
              <button 
                className="flex items-center text-gray-300 group-hover:text-white font-medium transition-colors focus:outline-none"
              >
                Categorías <ChevronDown className="ml-1 w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
              </button>
              
              {/* Dropdown Menu */}
              <div 
                className="absolute left-0 top-[calc(100%-10px)] mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 ease-out"
              >
                <div className="absolute -top-4 left-0 w-full h-4 bg-transparent" />
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    href={`/categoria/${cat.slug || cat.name.toLowerCase()}`}
                    className="block px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-brand-primary/10 hover:text-brand-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/equipos" className="text-gray-300 hover:text-white font-medium transition-colors">
              Equipos
            </Link>
            <Link href="/posiciones" className="text-gray-300 hover:text-white font-medium transition-colors">
              Posiciones
            </Link>
          </nav>

          {/* Right Action */}
          <div className="hidden md:flex items-center">
            <Link 
              href="/login" 
              className="flex items-center gap-2 px-4 py-2 border-2 border-white/20 text-white hover:bg-white hover:text-brand-dark rounded-lg font-bold transition-all duration-200"
            >
              <User className="w-4 h-4" />
              Acceso Admin/Delegado
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Abrir menú principal</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-brand-dark border-t border-white/10 ${
          mobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-1">
          <Link 
            href="/" 
            className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10"
            onClick={() => setMobileMenuOpen(false)}
          >
            Inicio
          </Link>
          
          <Link 
            href="/calendario" 
            className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10"
            onClick={() => setMobileMenuOpen(false)}
          >
            Calendario
          </Link>

          <div className="px-3 py-2">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Categorías</div>
            <div className="pl-3 space-y-1 border-l-2 border-white/10">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/categoria/${cat.slug || cat.name.toLowerCase()}`}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-white/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <Link 
            href="/equipos" 
            className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10"
            onClick={() => setMobileMenuOpen(false)}
          >
            Equipos
          </Link>
          <Link 
            href="/posiciones" 
            className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10"
            onClick={() => setMobileMenuOpen(false)}
          >
            Posiciones
          </Link>
          
          <div className="mt-6 pt-6 border-t border-white/10">
            <Link 
              href="/login" 
              className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-white/20 text-white rounded-lg hover:bg-white hover:text-brand-dark font-bold transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="w-5 h-5" />
              Acceso Admin/Delegado
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
