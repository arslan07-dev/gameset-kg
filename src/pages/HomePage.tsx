import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { GAMES_DATA, RECENT_PRESETS } from '../data/games';
import { DEVICES_DATA } from '../data/devices';
import { AdBannerSlot } from '../components/common/AdBannerSlot';
import { SEO } from '../components/common/SEO';
import {
  Sliders,
  Smartphone,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  ArrowRight,
  Zap,
  Target,
  Sparkles,
  Layers,
  Thermometer,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { t, language } = useLanguage();

  // Top 6 popular devices
  const popularDevices = DEVICES_DATA.filter((d) =>
    [
      'poco-x6-pro',
      'apple-iphone-15-pro',
      'samsung-galaxy-s24-ultra',
      'redmi-note-13-pro-plus',
      'infinix-gt-20-pro',
      'realme-gt-6',
    ].includes(d.id)
  );

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      <SEO
        title={
          language === 'ru'
            ? 'GAMESET KG — Профессиональные игровые настройки и чувствительность'
            : 'GAMESET KG — Professional Gaming Settings & Sensitivity'
        }
        description={
          language === 'ru'
            ? 'Киберспортивная платформа игровых настроек и чувствительности для Free Fire (шкала 0–200), PUBG Mobile, Mobile Legends и Call of Duty Mobile.'
            : 'Esports platform for calibrated game settings and sensitivities for Free Fire (0–200 scale), PUBG Mobile, Mobile Legends, and Call of Duty Mobile.'
        }
        keywords="gameset kg, настройки фри фаер 0-200, настройки пубг мобайл, калибровка сенсора, чувствительность для телефона"
        canonicalPath="/"
      />

      {/* 1. Large Hero Section */}
      <section className="relative pt-6 sm:pt-12 overflow-hidden border-b border-[#141C28]/80 pb-12 sm:pb-16 bg-gradient-to-b from-[#070A0F] via-[#05070A] to-[#05070A]">
        {/* Subtle background tech grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#15202D_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-5xl h-72 bg-[#00FF87]/5 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#0F1622] border border-[#1E2B3E] text-xs font-mono font-bold text-[#00FF87] tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF87] shadow-[0_0_8px_#00FF87]" />
                <span>{t('hero_badge')}</span>
              </div>

              {/* Main Heading requested by user: "Настройки для твоего устройства" */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] text-balance">
                {t('hero_title')}
              </h1>

              {/* Subtitle explaining platform */}
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                {t('hero_subtitle')}
              </p>

              {/* Main Button: "Подобрать настройки" */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/generator"
                  className="px-6 py-3.5 bg-[#00FF87] hover:bg-[#10E760] text-[#05070A] font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,135,0.3)] transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
                >
                  <Sliders className="w-4 h-4" />
                  <span>{t('btn_find_settings')}</span>
                </Link>

                <Link
                  to="/devices"
                  className="px-5 py-3.5 bg-[#0E131C] hover:bg-[#151D2A] text-slate-200 font-bold text-xs sm:text-sm rounded-xl border border-[#1D2738] hover:border-slate-500 transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <Smartphone className="w-4 h-4 text-slate-400" />
                  <span>{t('btn_explore_devices')}</span>
                </Link>
              </div>

              {/* Verified Trust Strip */}
              <div className="pt-6 border-t border-[#16202E] grid grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="font-mono text-base font-bold text-white">150+</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{language === 'ru' ? 'Моделей смартфонов' : 'Phone Models'}</div>
                </div>
                <div>
                  <div className="font-mono text-base font-bold text-[#00FF87]">20</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{language === 'ru' ? 'Брендов устройств' : 'Supported Brands'}</div>
                </div>
                <div>
                  <div className="font-mono text-base font-bold text-white">0–200</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{language === 'ru' ? 'Точная шкала FF' : 'FF 0-200 Scale'}</div>
                </div>
              </div>
            </div>

            {/* Right Visual Banner */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-[#1A2536] bg-[#0E131B] shadow-2xl group">
                <img
                  src="/src/assets/images/hero_gaming_esports_1793642581057.jpg"
                  alt="Esports Gaming Setup"
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070A0F] via-transparent to-transparent opacity-90" />
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-[#090D14]/90 backdrop-blur-md border border-[#192434] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Esports Hardware Calibration</div>
                    <div className="text-[11px] text-slate-400">Touch sampling rate & gyro curve verified</div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#00FF87] px-2 py-0.5 rounded bg-[#00FF87]/10 border border-[#00FF87]/30">
                    2026 METRIC
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Games Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-[#00FF87] uppercase tracking-wider mb-1">
              Дисциплины / Esports Titles
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {t('home_popular_games')}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {t('home_popular_games_sub')}
            </p>
          </div>
          <Link
            to="/games"
            className="text-xs font-bold text-slate-300 hover:text-[#00FF87] flex items-center gap-1 transition-colors"
          >
            <span>{t('btn_all_games')}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {GAMES_DATA.map((game) => (
            <div
              key={game.id}
              className="rounded-xl bg-[#0B0F16] border border-[#192332] hover:border-[#00FF87]/50 transition-all duration-300 overflow-hidden flex flex-col group shadow-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#101622]">
                <img
                  src={game.image}
                  alt={game.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F16] via-[#0B0F16]/25 to-transparent" />
                <div className="absolute top-2.5 left-2.5 text-[10px] font-mono font-bold text-slate-200 bg-[#070A0F]/85 backdrop-blur-sm px-2 py-0.5 rounded border border-white/10">
                  {game.genre}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-base font-black text-white group-hover:text-[#00FF87] transition-colors">
                    {game.name}
                  </h3>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    {game.activePlayers}
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2 mt-2 leading-relaxed">
                    {game.overview[language]}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#141C28] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">
                    {game.latestPatch}
                  </span>
                  <Link
                    to={game.path}
                    className="text-xs font-bold text-[#00FF87] hover:underline flex items-center gap-1"
                  >
                    <span>Параметры</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Popular Devices Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-[#00FF87] uppercase tracking-wider mb-1">
              База смартфонов / Device Database
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {t('home_popular_devices')}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {t('home_popular_devices_sub')}
            </p>
          </div>
          <Link
            to="/devices"
            className="text-xs font-bold text-slate-300 hover:text-[#00FF87] flex items-center gap-1 transition-colors"
          >
            <span>{t('btn_explore_devices')}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {popularDevices.map((device) => (
            <div
              key={device.id}
              className="p-5 rounded-xl bg-[#0B0F16] border border-[#192332] hover:border-[#00FF87]/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-semibold text-slate-300">{device.brand}</span>
                  <span className="font-mono text-[#00FF87] font-bold text-[11px] px-2 py-0.5 rounded bg-[#00FF87]/10 border border-[#00FF87]/20">
                    {device.refreshRate}Hz Display
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{device.model}</h3>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  {device.chipset}
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-[#141C28] text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>{t('spec_touch')}:</span>
                  <span className="text-slate-200 font-mono">{device.touchSamplingRate}Hz</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{t('spec_dpi_range')}:</span>
                  <span className="text-[#00FF87] font-mono text-[11px] truncate max-w-[190px]">
                    {device.recommendedDpiRange}
                  </span>
                </div>
              </div>

              <Link
                to={`/generator?brand=${encodeURIComponent(device.brand)}&model=${encodeURIComponent(device.model)}`}
                className="w-full py-2.5 bg-[#111722] hover:bg-[#00FF87] hover:text-[#05070A] text-slate-200 text-xs font-bold rounded-lg text-center transition-all border border-[#1C2635] hover:border-[#00FF87]"
              >
                {t('btn_find_settings')}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Recently Added / Verified Presets Section (Requested in Requirement 3) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="text-xs font-bold text-[#00FF87] uppercase tracking-wider mb-1">
            Проверено комьюнити / Verified Meta
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {t('home_recent_presets')}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {t('home_recent_presets_sub')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RECENT_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="p-4 rounded-xl bg-[#0B0F16] border border-[#192332] hover:border-[#00FF87]/30 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#00FF87] uppercase px-1.5 py-0.5 rounded bg-[#00FF87]/10 border border-[#00FF87]/20">
                    {preset.gameName}
                  </span>
                  <div className="font-bold text-white text-sm mt-1.5">{preset.device}</div>
                  <div className="text-xs text-slate-400">{preset.style}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-emerald-400">{preset.rating}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{preset.date}</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0E131C] border border-[#16202C] flex items-center justify-between text-xs">
                <span className="text-slate-400">{preset.keyMetricLabel}:</span>
                <span className="font-mono font-bold text-[#00FF87]">{preset.keyMetric}</span>
              </div>

              <Link
                to={`/generator?game=${preset.gameId}&brand=${encodeURIComponent(preset.brand)}&model=${encodeURIComponent(preset.device)}`}
                className="w-full block py-2 bg-[#101622] hover:bg-[#16202E] text-slate-300 hover:text-white text-xs font-semibold rounded-lg text-center transition-colors border border-[#1B2535]"
              >
                {t('btn_view_preset')}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Useful Gaming Guides Section (Requested in Requirement 3) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-[#00FF87] uppercase tracking-wider mb-1">
              Оптимизация / FPS & Touch Optimization
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {t('home_guides_title')}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {t('home_guides_sub')}
            </p>
          </div>
          <Link
            to="/performance-guide"
            className="text-xs font-bold text-slate-300 hover:text-[#00FF87] flex items-center gap-1 transition-colors"
          >
            <span>{t('btn_view_guide')}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link
            to="/performance-guide#xiaomi"
            className="p-5 rounded-xl bg-[#0B0F16] border border-[#192332] hover:border-[#00FF87]/40 transition-all space-y-3 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#00FF87]/10 text-[#00FF87] flex items-center justify-center border border-[#00FF87]/20 group-hover:scale-110 transition-transform">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-[#00FF87] transition-colors">
              HyperOS Game Turbo
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Отклик сенсора на 100%, отключение виртуальной памяти RAM и снятие лимита батареи.
            </p>
          </Link>

          <Link
            to="/performance-guide#samsung"
            className="p-5 rounded-xl bg-[#0B0F16] border border-[#192332] hover:border-[#00FF87]/40 transition-all space-y-3 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#00FF87]/10 text-[#00FF87] flex items-center justify-center border border-[#00FF87]/20 group-hover:scale-110 transition-transform">
              <Smartphone className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-[#00FF87] transition-colors">
              Samsung Game Booster Labs
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Альтернативная производительность процессора и повышение чувствительности сенсора экрана.
            </p>
          </Link>

          <Link
            to="/performance-guide#ios"
            className="p-5 rounded-xl bg-[#0B0F16] border border-[#192332] hover:border-[#00FF87]/40 transition-all space-y-3 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#00FF87]/10 text-[#00FF87] flex items-center justify-center border border-[#00FF87]/20 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-[#00FF87] transition-colors">
              iPhone Guided Access 120Hz
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Блокировка случайных свайпов шторки уведомлений и фиксация полной частоты ProMotion.
            </p>
          </Link>

          <Link
            to="/performance-guide#transsion"
            className="p-5 rounded-xl bg-[#0B0F16] border border-[#192332] hover:border-[#00FF87]/40 transition-all space-y-3 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#00FF87]/10 text-[#00FF87] flex items-center justify-center border border-[#00FF87]/20 group-hover:scale-110 transition-transform">
              <Thermometer className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-[#00FF87] transition-colors">
              Термоконтроль и кулеры
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Устранение падения FPS от перегрева батареи и выбор напальчников с серебряным волокном.
            </p>
          </Link>
        </div>
      </section>

      {/* Monetization Slot */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdBannerSlot slotId="home-leaderboard" format="horizontal" />
      </section>

      {/* Transparent Disclaimer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-5 rounded-xl bg-[#0B0F16] border border-[#192332] flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-[#00FF87]/10 text-[#00FF87] shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-white text-sm">
              {t('disclaimer_title')}
            </h4>
            <p className="text-slate-400 leading-relaxed">
              {t('disclaimer_text')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
