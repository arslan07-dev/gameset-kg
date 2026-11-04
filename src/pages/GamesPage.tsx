import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { GAMES_DATA } from '../data/games';
import { AdBannerSlot } from '../components/common/AdBannerSlot';
import { SEO } from '../components/common/SEO';
import { ArrowRight, CheckCircle2, Shield, Sliders } from 'lucide-react';

export const GamesPage: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SEO
        title={
          language === 'ru'
            ? 'Игры и киберспортивные дисциплины — Каталог настроек | GAMESET KG'
            : 'Games & Esports Titles — Settings Catalog | GAMESET KG'
        }
        description={
          language === 'ru'
            ? 'Профессиональные настройки и калибровка чувствительности для Free Fire, PUBG Mobile, Mobile Legends и Call of Duty Mobile. Коды раскладок и пресеты.'
            : 'Competitive game settings and sensitivity calibration for Free Fire, PUBG Mobile, Mobile Legends, and Call of Duty Mobile. Pro claw layouts and presets.'
        }
        keywords="игры gameset kg, настройки фри фаер, настройки пубг мобайл, настройки млбб, настройки код мобайл, киберспорт мобильный"
        canonicalPath="/games"
        breadcrumbs={[
          { name: language === 'ru' ? 'Главная' : 'Home', item: '/' },
          { name: language === 'ru' ? 'Игры' : 'Games', item: '/games' },
        ]}
      />
      {/* Header */}
      <div className="space-y-3">
        <div className="text-xs font-mono font-bold text-[#00FF87] uppercase tracking-wider">
          {language === 'ru' ? 'Каталог соревновательных дисциплин' : 'Competitive Esports Catalog'}
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          {t('home_popular_games')}
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          {language === 'ru'
            ? 'Выберите дисциплину для детального ознакомления с параметрами чувствительности, кодами турнирных раскладок и калибровкой прицелов.'
            : 'Select an esports title to explore deep sensitivity curves, claw layout share codes, and scope calibrations.'}
        </p>
      </div>

      {/* Grid of All Games */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        {GAMES_DATA.map((game) => (
          <div
            key={game.id}
            className="rounded-xl bg-[#0B0F16] border border-[#192332] overflow-hidden flex flex-col sm:flex-row hover:border-[#00FF87]/40 transition-all duration-300 group shadow-xl"
          >
            {/* Visual Thumbnail */}
            <div className="sm:w-2/5 relative aspect-[4/3] sm:aspect-auto overflow-hidden bg-[#101622]">
              <img
                src={game.image}
                alt={game.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-transparent to-[#0B0F16]/90" />
            </div>

            {/* Content Area */}
            <div className="sm:w-3/5 p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-semibold text-slate-300">{game.genre}</span>
                  <span className="font-mono text-[11px] text-[#00FF87]">{game.latestPatch}</span>
                </div>
                <h2 className="text-xl font-black text-white group-hover:text-[#00FF87] transition-colors">
                  {game.name}
                </h2>
                <div className="text-xs text-slate-400 mt-0.5">{game.subtitle}</div>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  {game.overview[language]}
                </p>

                {/* Highlights */}
                <div className="mt-4 space-y-1.5">
                  {game.highlights[language].slice(0, 2).map((hl, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF87] shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#141C28] flex items-center justify-between gap-3">
                <Link
                  to={`/generator?game=${game.id}`}
                  className="px-3.5 py-2 bg-[#00FF87]/10 hover:bg-[#00FF87] text-[#00FF87] hover:text-[#05070A] text-xs font-bold rounded-lg border border-[#00FF87]/30 transition-all flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{t('btn_generate')}</span>
                </Link>

                <Link
                  to={game.path}
                  className="text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1 group/btn"
                >
                  <span>{language === 'ru' ? 'Подробнее' : 'Details'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ad slot */}
      <AdBannerSlot slotId="games-catalog-ad" format="horizontal" />
    </div>
  );
};
