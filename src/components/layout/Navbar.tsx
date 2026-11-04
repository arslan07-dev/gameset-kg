import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useFavorites } from '../../context/FavoritesContext';
import { Language } from '../../types';
import {
  Menu,
  X,
  Search,
  Bookmark,
  Sparkles,
  ChevronRight,
  Sliders,
  Terminal,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { savedSettings, setIsSavedModalOpen, setIsProModalOpen, setIsSearchModalOpen } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: t('nav_home') },
    { to: '/games', label: t('nav_games') },
    { to: '/devices', label: t('nav_devices') },
    { to: '/generator', label: t('nav_generator') },
    { to: '/compare', label: t('nav_compare') },
    { to: '/guides', label: t('nav_guide') },
    { to: '/submit', label: t('nav_submit') },
    { to: '/about', label: t('nav_about') },
    { to: '/contact', label: t('nav_contact') },
  ];

  const handleLangToggle = (newLang: Language) => {
    setLanguage(newLang);
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#18212E] bg-[#07090D]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8 px-4 sm:px-6 lg:px-8 h-16">
        {/* Zone 1: Single text element wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2 group whitespace-nowrap shrink-0 text-lg sm:text-xl font-black tracking-wider text-white"
        >
          <div className="w-2.5 h-5 bg-[#00FF87] rounded-sm group-hover:shadow-[0_0_12px_#00FF87] transition-all" />
          <span className="tracking-tight">GAMESET</span>
          <span className="text-[#00FF87] font-mono font-bold text-xs px-1.5 py-0.5 rounded bg-[#00FF87]/10 border border-[#00FF87]/30">
            KG
          </span>
        </Link>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden xl:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-slate-300">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`transition-colors whitespace-nowrap shrink-0 py-1 hover:text-[#00FF87] ${
                isActive(link.to)
                  ? 'text-[#00FF87] font-bold border-b-2 border-[#00FF87]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Zone 3: Actions (Search, Saved, RU/EN Switcher, PRO & Mobile Toggle) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Search */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            aria-label="Search"
            className="p-2 text-slate-400 hover:text-white hover:bg-[#121822] rounded-lg transition-colors border border-transparent hover:border-slate-800"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Saved Settings Button with Counter */}
          <button
            onClick={() => setIsSavedModalOpen(true)}
            aria-label="Saved Sets"
            className="relative p-2 text-slate-400 hover:text-[#00FF87] hover:bg-[#121822] rounded-lg transition-colors border border-transparent hover:border-slate-800"
            title={t('nav_saved')}
          >
            <Bookmark className="w-4 h-4" />
            {savedSettings.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00FF87] text-[#05070A] text-[10px] font-black flex items-center justify-center">
                {savedSettings.length}
              </span>
            )}
          </button>

          {/* RU / EN Language Switcher (Clean segmented button with flags) */}
          <div className="flex items-center bg-[#0F141D] border border-[#1C2534] rounded-lg p-0.5 text-xs font-bold">
            <button
              onClick={() => handleLangToggle('ru')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                language === 'ru'
                  ? 'bg-[#00FF87] text-[#05070A] shadow-[0_0_10px_rgba(0,255,135,0.25)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>RU</span>
              <span className="text-[10px] opacity-80">🇷🇺</span>
            </button>
            <button
              onClick={() => handleLangToggle('en')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                language === 'en'
                  ? 'bg-[#00FF87] text-[#05070A] shadow-[0_0_10px_rgba(0,255,135,0.25)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>EN</span>
              <span className="text-[10px] opacity-80">🇬🇧</span>
            </button>
          </div>

          {/* Pro Membership Trigger */}
          <button
            onClick={() => setIsProModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#00FF87] bg-[#00FF87]/10 hover:bg-[#00FF87]/20 border border-[#00FF87]/40 rounded-lg transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>PRO</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 text-slate-300 hover:text-white hover:bg-[#121822] rounded-lg"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Absolute overlay with backdrop to never push page down) */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 top-16 bg-black/75 backdrop-blur-sm z-40 xl:hidden animate-in fade-in duration-150"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer container */}
          <div className="absolute top-16 left-0 right-0 max-h-[calc(100dvh-4rem)] overflow-y-auto bg-[#07090D]/98 border-b border-[#18212E] px-4 pt-3 pb-6 space-y-3 shadow-2xl z-50 xl:hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                    isActive(link.to)
                      ? 'bg-[#00FF87]/10 text-[#00FF87]'
                      : 'text-slate-300 hover:bg-[#121822] hover:text-white'
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-[#18212E] flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsProModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#00FF87] bg-[#00FF87]/10 rounded-lg border border-[#00FF87]/30"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>GAMESET PRO</span>
              </button>

              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-white bg-[#121822] border border-[#1C2534] rounded-lg"
              >
                Admin
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsSavedModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#121822] border border-[#1C2534] rounded-lg"
              >
                <Bookmark className="w-3.5 h-3.5 text-[#00FF87]" />
                <span>{t('nav_saved')} ({savedSettings.length})</span>
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
