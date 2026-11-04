import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useFavorites } from '../../context/FavoritesContext';
import { DEVICES_DATA } from '../../data/devices';
import { GAMES_DATA } from '../../data/games';
import { Search, X, Smartphone, Gamepad2, BookOpen, ArrowRight } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const { isSearchModalOpen, setIsSearchModalOpen } = useFavorites();
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchModalOpen]);

  useEffect(() => {
    if (isSearchModalOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  const normalized = query.trim().toLowerCase();

  const matchingGames = GAMES_DATA.filter((g) =>
    g.name.toLowerCase().includes(normalized) ||
    g.subtitle.toLowerCase().includes(normalized)
  );

  const matchingDevices = DEVICES_DATA.filter((d) =>
    d.model.toLowerCase().includes(normalized) ||
    d.brand.toLowerCase().includes(normalized) ||
    d.chipset.toLowerCase().includes(normalized)
  ).slice(0, 8);

  const guideTopics = [
    { title: 'MIUI / HyperOS Touch & Game Turbo Boost', path: '/performance-guide#xiaomi' },
    { title: 'Samsung Game Booster & Touch Sensitivity 120Hz', path: '/performance-guide#samsung' },
    { title: 'iPhone Guided Access & ProMotion Lock', path: '/performance-guide#ios' },
    { title: 'Infinix & Tecno Dar-link Touch Sampling', path: '/performance-guide#transsion' },
  ].filter((item) => item.title.toLowerCase().includes(normalized));

  const handleSelect = (url: string) => {
    setIsSearchModalOpen(false);
    setQuery('');
    navigate(url);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#0B0F16] border border-[#192332] rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#16202C]">
          <Search className="w-5 h-5 text-[#00FF87] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('spec_search_placeholder')}
            className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
          />
          <button
            onClick={() => setIsSearchModalOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#16202C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {query.trim() === '' && (
            <div className="text-center py-6 text-slate-500 text-xs">
              {language === 'ru'
                ? 'Начните ввод, чтобы найти игры, модели телефонов или гайды по оптимизации'
                : 'Type a phone model, game, or guide title to search'}
            </div>
          )}

          {/* Games matches */}
          {matchingGames.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-[#00FF87]" />
                <span>{t('nav_games')}</span>
              </div>
              <div className="space-y-1.5">
                {matchingGames.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => handleSelect(game.path)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#0E131C] hover:bg-[#141B26] border border-transparent hover:border-[#00FF87]/30 transition-all text-left text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{game.name}</div>
                      <div className="text-slate-400 text-[11px]">{game.subtitle}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Devices matches */}
          {matchingDevices.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#00FF87]" />
                <span>{t('nav_devices')}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {matchingDevices.map((device) => (
                  <button
                    key={device.id}
                    onClick={() => handleSelect(`/generator?brand=${encodeURIComponent(device.brand)}&model=${encodeURIComponent(device.model)}`)}
                    className="flex flex-col p-2.5 rounded-lg bg-[#0E131C] hover:bg-[#141B26] border border-transparent hover:border-[#00FF87]/30 transition-all text-left text-xs"
                  >
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span>{device.model}</span>
                      <span className="text-[10px] text-[#00FF87] font-mono">{device.refreshRate}Hz</span>
                    </div>
                    <div className="text-slate-400 text-[11px] truncate mt-0.5">
                      {device.chipset}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Guide matches */}
          {guideTopics.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#00FF87]" />
                <span>{t('nav_guide')}</span>
              </div>
              <div className="space-y-1.5">
                {guideTopics.map((g, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(g.path)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#0E131C] hover:bg-[#141B26] border border-transparent hover:border-[#00FF87]/30 transition-all text-left text-xs text-slate-300 hover:text-white"
                  >
                    <span>{g.title}</span>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim() !== '' &&
            matchingGames.length === 0 &&
            matchingDevices.length === 0 &&
            guideTopics.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs">
                {language === 'ru'
                  ? `По запросу «${query}» ничего не найдено.`
                  : `No results found for "${query}".`}
              </div>
            )}
        </div>
      </div>
    </div>,
    document.body
  );
};
