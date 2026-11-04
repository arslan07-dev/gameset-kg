import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Shield, Send, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();

  return (
    <footer className="border-t border-[#151D28] bg-[#05070A] text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-white font-black text-lg tracking-wider">
              <span className="w-2.5 h-4 bg-[#00FF87] rounded-sm"></span>
              <span>GAMESET</span>
              <span className="text-[#00FF87] text-xs px-1.5 py-0.5 rounded bg-[#00FF87]/10 border border-[#00FF87]/30">
                KG
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {t('brand_desc')}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://t.me/arslan_019"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                title="Telegram: @arslan_019"
                className="w-7 h-7 rounded-lg bg-[#0F141D] border border-[#1C2534] hover:border-[#00FF87] hover:text-[#00FF87] flex items-center justify-center transition-colors text-slate-300"
              >
                <Send className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                className="w-7 h-7 rounded-lg bg-[#0F141D] border border-[#1C2534] hover:border-[#00FF87] hover:text-[#00FF87] flex items-center justify-center transition-colors text-slate-300"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Col 2: Games */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-white uppercase tracking-wider">
              {t('nav_games')}
            </div>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <Link to="/games/free-fire" className="hover:text-[#00FF87] transition-colors">
                  Free Fire / FF MAX
                </Link>
              </li>
              <li>
                <Link to="/games/pubg-mobile" className="hover:text-[#00FF87] transition-colors">
                  PUBG Mobile
                </Link>
              </li>
              <li>
                <Link to="/games/mobile-legends" className="hover:text-[#00FF87] transition-colors">
                  Mobile Legends: Bang Bang
                </Link>
              </li>
              <li>
                <Link to="/games/cod-mobile" className="hover:text-[#00FF87] transition-colors">
                  Call of Duty: Mobile
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Tools & Resources */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-white uppercase tracking-wider">
              Инструменты / Tools
            </div>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <Link to="/generator" className="hover:text-[#00FF87] transition-colors">
                  {t('nav_generator')}
                </Link>
              </li>
              <li>
                <Link to="/devices" className="hover:text-[#00FF87] transition-colors">
                  {t('nav_devices')}
                </Link>
              </li>
              <li>
                <Link to="/performance-guide" className="hover:text-[#00FF87] transition-colors">
                  {t('nav_guide')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#00FF87] transition-colors">
                  {t('nav_about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#00FF87] transition-colors">
                  {t('nav_contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Language */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#00FF87]" />
              <span>Esports Hardware Lab</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Протестированные калибровки сенсоров для соревновательного мобильного гейминга.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <span className="text-slate-500">Язык / Lang:</span>
              <button
                onClick={() => setLanguage('ru')}
                className={`transition-colors ${language === 'ru' ? 'text-[#00FF87] font-bold underline' : 'text-slate-400 hover:text-white'}`}
              >
                Русский 🇷🇺
              </button>
              <span>·</span>
              <button
                onClick={() => setLanguage('en')}
                className={`transition-colors ${language === 'en' ? 'text-[#00FF87] font-bold underline' : 'text-slate-400 hover:text-white'}`}
              >
                English 🇬🇧
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Creator Section */}
        <div className="pt-6 border-t border-[#151D28] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © 2026 GAMESET KG. All rights reserved.
          </div>

          {/* Creator Credit: Stylish & Minimal */}
          <div className="flex items-center gap-2 text-slate-400">
            <span>{t('creator_credit')}</span>
            <span className="text-slate-600">·</span>
            <a
              href="https://t.me/arslan_019"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#0F141D] hover:bg-[#151D2A] text-slate-300 hover:text-[#00FF87] border border-[#1C2534] hover:border-[#00FF87]/40 transition-colors group"
              title="Telegram: @arslan_019"
            >
              <Send className="w-3 h-3 text-[#00FF87] group-hover:scale-110 transition-transform" />
              <span className="font-mono text-[11px] font-semibold text-slate-200 group-hover:text-[#00FF87]">
                @arslan_019
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
