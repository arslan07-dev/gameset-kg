import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { DEVICE_BRANDS, DEVICES_DATA } from '../data/devices';
import { GAMES_DATA } from '../data/games';
import { DeviceBrand, DeviceSpec, GameId } from '../types';
import { AdBannerSlot } from '../components/common/AdBannerSlot';
import { SEO } from '../components/common/SEO';
import {
  Search,
  Smartphone,
  Sliders,
  Cpu,
  Tv,
  Zap,
  Info,
  ShieldCheck,
  CheckCircle2,
  Users,
  UserCheck,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Gamepad2,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

const ITEMS_PER_PAGE = 18;

export const DevicesPage: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search, Brand, Sort, Refresh Filter states
  const [selectedBrand, setSelectedBrand] = useState<string>(() => {
    return searchParams.get('brand') || 'All';
  });
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    return searchParams.get('q') || '';
  });
  const [refreshFilter, setRefreshFilter] = useState<number | 'All'>('All');
  const [sortBy, setSortBy] = useState<'alpha-asc' | 'alpha-desc' | 'refresh-desc' | 'touch-desc'>('alpha-asc');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Fast Selection UX (Brand -> Model -> Game -> Settings)
  const [quickBrand, setQuickBrand] = useState<DeviceBrand>('Samsung');
  const [quickModelId, setQuickModelId] = useState<string>('samsung-galaxy-a55');
  const [quickGame, setQuickGame] = useState<GameId>('free-fire');

  // Sync quick brand change
  const handleQuickBrandChange = (brand: DeviceBrand) => {
    setQuickBrand(brand);
    const firstModel = DEVICES_DATA.find((d) => d.brand === brand);
    if (firstModel) {
      setQuickModelId(firstModel.id);
    }
  };

  const availableQuickModels = useMemo(() => {
    return DEVICES_DATA.filter((d) => d.brand === quickBrand);
  }, [quickBrand]);

  const selectedQuickDevice = useMemo(() => {
    return DEVICES_DATA.find((d) => d.id === quickModelId) || availableQuickModels[0];
  }, [quickModelId, availableQuickModels]);

  const handleLaunchQuickSettings = () => {
    if (!selectedQuickDevice) return;
    navigate(
      `/generator?game=${quickGame}&brand=${encodeURIComponent(selectedQuickDevice.brand)}&model=${encodeURIComponent(selectedQuickDevice.model)}`
    );
  };

  // Filter & Sort list
  const filteredAndSortedDevices = useMemo(() => {
    const filtered = DEVICES_DATA.filter((device) => {
      const matchBrand = selectedBrand === 'All' || device.brand === selectedBrand;
      const matchRefresh = refreshFilter === 'All' || device.refreshRate === refreshFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        q === '' ||
        device.model.toLowerCase().includes(q) ||
        device.brand.toLowerCase().includes(q) ||
        device.chipset.toLowerCase().includes(q) ||
        device.screenType.toLowerCase().includes(q);

      return matchBrand && matchRefresh && matchQuery;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'alpha-asc') {
        return a.model.localeCompare(b.model);
      }
      if (sortBy === 'alpha-desc') {
        return b.model.localeCompare(a.model);
      }
      if (sortBy === 'refresh-desc') {
        return b.refreshRate - a.refreshRate || a.model.localeCompare(b.model);
      }
      if (sortBy === 'touch-desc') {
        return b.touchSamplingRate - a.touchSamplingRate || a.model.localeCompare(b.model);
      }
      return 0;
    });
  }, [selectedBrand, refreshFilter, searchQuery, sortBy]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBrand, refreshFilter, searchQuery, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAndSortedDevices.length / ITEMS_PER_PAGE) || 1;
  const paginatedDevices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedDevices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedDevices, currentPage]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10 w-full max-w-full overflow-x-hidden">
      <SEO
        title={
          language === 'ru'
            ? 'База смартфонов (150+ моделей, 20 брендов) — Частота экрана, сенсор и DPI | GAMESET KG'
            : 'Smartphone Database (150+ models, 20 brands) — Screen Refresh, Touch & DPI | GAMESET KG'
        }
        description={
          language === 'ru'
            ? 'Полный каталог мобильных устройств для киберспорта: Apple, Samsung, Xiaomi, POCO, Redmi, Realme, Infinix и др. Частота экрана до 165Hz, сенсор до 2000Hz, DPI.'
            : 'Comprehensive esports mobile device database: Apple, Samsung, Xiaomi, POCO, Redmi, Realme, Infinix, etc. Up to 165Hz refresh, 2000Hz touch rate, and tested DPI.'
        }
        keywords="база смартфонов для игр, 120 герц телефоны, частота дискретизации сенсора, poco x6 pro dpi, iphone 16 pro sensivity, gameset kg"
        canonicalPath="/devices"
        breadcrumbs={[
          { name: language === 'ru' ? 'Главная' : 'Home', item: '/' },
          { name: language === 'ru' ? 'Устройства' : 'Devices', item: '/devices' },
        ]}
      />

      {/* Page Header */}
      <div className="space-y-3">
        <div className="text-xs font-mono font-bold text-[#00FF87] uppercase tracking-wider flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          <span>
            {language === 'ru'
              ? `База данных устройств (${DEVICES_DATA.length} моделей · 20 брендов)`
              : `Device Database (${DEVICES_DATA.length} models · 20 brands)`}
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          {language === 'ru' ? 'Каталог смартфонов и калибровка сенсоров' : 'Smartphone Catalog & Touch Calibration'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          {language === 'ru'
            ? 'Проверенные технические параметры смартфонов: частота обновления экрана до 165Hz, частота дискретизации сенсора до 2000Hz, чипсет и протестированные диапазоны DPI для идеальной оттяжки и отдачи.'
            : 'Verified technical specifications: refresh rates up to 165Hz, touch sampling up to 2000Hz, chipsets, and calibrated safe DPI ranges for headshot drag and recoil stability.'}
        </p>
      </div>

      {/* FAST SELECTION UX WIZARD: Brand -> Model -> Game -> Settings */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0B0F16] via-[#0E1420] to-[#07090E] border border-[#00FF87]/30 p-5 sm:p-7 shadow-[0_0_35px_rgba(0,255,135,0.08)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#182333] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-[#00FF87]/15 text-[#00FF87] border border-[#00FF87]/30">
              <Zap className="w-4 h-4" />
            </span>
            <div>
              <div className="text-xs font-mono font-bold text-[#00FF87] uppercase tracking-wider">
                {language === 'ru' ? 'Быстрый подбор' : 'Express Configurator'}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {language === 'ru'
                  ? 'Бренд → Модель → Игра → Рекомендованные настройки'
                  : 'Brand → Model → Game → Recommended Settings'}
              </h2>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-[#121926] px-2.5 py-1 rounded border border-[#1A2536] self-start sm:self-auto">
            ⚡ {language === 'ru' ? 'Мгновенная калибровка' : 'Instant Baseline'}
          </span>
        </div>

        {/* 4-Step Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Brand */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase text-slate-400 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#00FF87]/20 text-[#00FF87] text-[10px] flex items-center justify-center font-bold">
                1
              </span>
              <span>{language === 'ru' ? 'Бренд смартфона' : 'Device Brand'}</span>
            </label>
            <select
              value={quickBrand}
              onChange={(e) => handleQuickBrandChange(e.target.value as DeviceBrand)}
              className="w-full bg-[#0E131C] border border-[#1C2636] focus:border-[#00FF87] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-colors"
            >
              {DEVICE_BRANDS.map((brand) => (
                <option key={brand} value={brand} className="bg-[#0B0F16]">
                  {brand} ({DEVICES_DATA.filter((d) => d.brand === brand).length} моделей)
                </option>
              ))}
            </select>
          </div>

          {/* 2. Model */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase text-slate-400 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#00FF87]/20 text-[#00FF87] text-[10px] flex items-center justify-center font-bold">
                2
              </span>
              <span>{language === 'ru' ? 'Точная модель' : 'Exact Model'}</span>
            </label>
            <select
              value={quickModelId}
              onChange={(e) => setQuickModelId(e.target.value)}
              className="w-full bg-[#0E131C] border border-[#1C2636] focus:border-[#00FF87] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-colors truncate"
            >
              {availableQuickModels.map((d) => (
                <option key={d.id} value={d.id} className="bg-[#0B0F16]">
                  {d.model} ({d.refreshRate}Hz)
                </option>
              ))}
            </select>
          </div>

          {/* 3. Game */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase text-slate-400 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#00FF87]/20 text-[#00FF87] text-[10px] flex items-center justify-center font-bold">
                3
              </span>
              <span>{language === 'ru' ? 'Дисциплина / Игра' : 'Game Title'}</span>
            </label>
            <select
              value={quickGame}
              onChange={(e) => setQuickGame(e.target.value as GameId)}
              className="w-full bg-[#0E131C] border border-[#1C2636] focus:border-[#00FF87] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-colors"
            >
              {GAMES_DATA.map((g) => (
                <option key={g.id} value={g.id} className="bg-[#0B0F16]">
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Action */}
          <div className="space-y-1.5 flex flex-col justify-end">
            <label className="text-[11px] font-mono font-bold uppercase text-transparent hidden lg:block">
              Submit
            </label>
            <button
              onClick={handleLaunchQuickSettings}
              className="w-full py-2.5 bg-[#00FF87] hover:bg-[#10E760] text-[#05070A] font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,135,0.25)] transition-all"
            >
              <Sliders className="w-4 h-4" />
              <span>{language === 'ru' ? 'Получить настройки' : 'Get Settings'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selected device quick spec highlight preview */}
        {selectedQuickDevice && (
          <div className="pt-3 border-t border-[#16202C] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF87]" />
                <span>{selectedQuickDevice.model}:</span>
              </span>
              <span className="font-mono text-[#00FF87]">{selectedQuickDevice.refreshRate}Hz Display</span>
              <span>·</span>
              <span className="font-mono text-slate-300">{selectedQuickDevice.touchSamplingRate}Hz Touch</span>
              <span>·</span>
              <span className="text-slate-300">{selectedQuickDevice.chipset}</span>
            </div>
            <div className="text-[11px] font-mono text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              DPI: {selectedQuickDevice.recommendedDpiRange}
            </div>
          </div>
        )}
      </div>

      {/* CLARITY SECTION: Explanation of Settings Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tier 1: Recommended */}
        <div className="p-4 rounded-xl bg-[#0B0F16] border border-[#00FF87]/30 space-y-2">
          <div className="flex items-center gap-2 text-[#00FF87] text-xs font-bold uppercase tracking-wider font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>{language === 'ru' ? 'Рекомендованные (Recommended)' : 'Recommended (Hardware)'}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {language === 'ru'
              ? 'Рассчитываются автоматически алгоритмом GAMESET KG на базе точных спецификаций сенсора (Hz), частоты экрана, диагонали и чипсета.'
              : 'Hardware-calibrated baselines calculated from screen refresh rate, touch sampling rate, display size, and sensor density.'}
          </p>
        </div>

        {/* Tier 2: Community Verified */}
        <div className="p-4 rounded-xl bg-[#0B0F16] border border-[#1A2536] space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider font-mono">
            <UserCheck className="w-4 h-4" />
            <span>{language === 'ru' ? 'Сообщество (Community Verified)' : 'Community Verified'}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {language === 'ru'
              ? 'Конфигурации турнирных игроков и создателей контента, проверенные сотнями матчей и подтвержденные оценками игроков.'
              : 'Presets from tournament finalists and verified players with confirmed upvotes and proven competitive track records.'}
          </p>
        </div>

        {/* Tier 3: User Submissions */}
        <div className="p-4 rounded-xl bg-[#0B0F16] border border-[#1A2536] space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider font-mono">
            <Users className="w-4 h-4" />
            <span>{language === 'ru' ? 'Пользовательские (User Submitted)' : 'User Submitted'}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {language === 'ru'
              ? 'Пресеты, загруженные игроками через форму отправки. Проходят базовую проверку на корректность диапазонов перед публикацией.'
              : 'Submissions from gamers awaiting moderation or undergoing community testing and feedback.'}
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="space-y-4">
        {/* Search input + Sort options */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'ru'
                  ? 'Поиск модели, чипсета или бренда (напр. A55, 16 Pro, X6, Dimensity)...'
                  : 'Search by model, chipset, or brand (e.g. A55, 16 Pro, X6, Dimensity)...'
              }
              className="w-full pl-10 pr-4 py-3 bg-[#0B0F16] border border-[#192332] focus:border-[#00FF87] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-[#16202E]"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-[#0B0F16] border border-[#192332] rounded-xl px-3 py-2 text-xs text-slate-300 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#00FF87]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-white focus:outline-none text-xs font-semibold"
              >
                <option value="alpha-asc" className="bg-[#0B0F16]">
                  {language === 'ru' ? 'По алфавиту (A–Z / А–Я)' : 'Alphabetical (A–Z)'}
                </option>
                <option value="alpha-desc" className="bg-[#0B0F16]">
                  {language === 'ru' ? 'По алфавиту (Z–A / Я–А)' : 'Alphabetical (Z–A)'}
                </option>
                <option value="refresh-desc" className="bg-[#0B0F16]">
                  {language === 'ru' ? 'Экран: сначала 165Hz/144Hz' : 'Screen: High Refresh First'}
                </option>
                <option value="touch-desc" className="bg-[#0B0F16]">
                  {language === 'ru' ? 'Сенсор: сначала быстрый отклик' : 'Touch: Fastest First'}
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* 20 Brand Selector Pills */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono uppercase font-bold text-[#00FF87] flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              <span>{language === 'ru' ? 'Фильтр по брендам (20)' : 'Filter by Brand (20)'}:</span>
            </span>
            <span className="text-slate-400">
              {language === 'ru'
                ? `Найдено: ${filteredAndSortedDevices.length}`
                : `Matches: ${filteredAndSortedDevices.length}`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs font-semibold scrollbar-none">
            <button
              onClick={() => setSelectedBrand('All')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedBrand === 'All'
                  ? 'bg-[#00FF87] text-[#05070A] font-bold shadow-sm'
                  : 'bg-[#0E131C] text-slate-300 hover:text-white border border-[#1A2536]'
              }`}
            >
              <span>{language === 'ru' ? 'Все устройства' : 'All Devices'}</span>
              <span className="text-[10px] opacity-75 font-mono">({DEVICES_DATA.length})</span>
            </button>

            {DEVICE_BRANDS.map((brand) => {
              const count = DEVICES_DATA.filter((d) => d.brand === brand).length;
              return (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    selectedBrand === brand
                      ? 'bg-[#00FF87] text-[#05070A] font-bold shadow-sm'
                      : 'bg-[#0E131C] text-slate-300 hover:text-white border border-[#1A2536]'
                  }`}
                >
                  <span>{brand}</span>
                  <span className="text-[10px] opacity-75 font-mono">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Refresh Rate Quick Filters */}
        <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
          <span>{language === 'ru' ? 'Частота экрана:' : 'Screen Refresh:'}</span>
          {[('All' as const), 165, 144, 120, 90, 60].map((rate) => (
            <button
              key={rate}
              onClick={() => setRefreshFilter(rate)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition-colors ${
                refreshFilter === rate
                  ? 'bg-[#00FF87] text-[#05070A] font-bold'
                  : 'bg-[#0E131C] text-slate-400 hover:text-white border border-[#1A2536]'
              }`}
            >
              {rate === 'All' ? (language === 'ru' ? 'Все' : 'All') : `${rate}Hz`}
            </button>
          ))}
        </div>
      </div>

      {/* DEVICES GRID (PAGINATED FOR OPTIMAL MOBILE PERFORMANCE) */}
      {filteredAndSortedDevices.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0B0F16] border border-[#192332] space-y-3">
          <Smartphone className="w-10 h-10 text-slate-500 mx-auto" />
          <div className="text-sm font-bold text-white">
            {language === 'ru' ? 'Модели не найдены' : 'No smartphone models found'}
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {language === 'ru'
              ? 'По запросу ничего не найдено. Сбросьте фильтры или обратитесь к создателю сайта (@arslan_019).'
              : 'No devices matching this query. Reset your filter or suggest a phone to creator @arslan_019.'}
          </p>
          <button
            onClick={() => {
              setSelectedBrand('All');
              setSearchQuery('');
              setRefreshFilter('All');
            }}
            className="mt-2 px-4 py-2 bg-[#00FF87] text-[#05070A] text-xs font-bold rounded-lg hover:bg-[#10E760] transition-colors"
          >
            {language === 'ru' ? 'Сбросить все фильтры' : 'Reset all filters'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedDevices.map((device) => (
              <div
                key={device.id}
                className="rounded-xl bg-[#0B0F16] border border-[#192332] p-5 hover:border-[#00FF87]/40 transition-all flex flex-col justify-between space-y-4 group shadow-lg"
              >
                <div className="space-y-3">
                  {/* Top Bar: Brand & Display Specs */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-400">{device.brand}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-[#00FF87] bg-[#00FF87]/10 px-2 py-0.5 rounded border border-[#00FF87]/20">
                        {device.refreshRate}Hz
                      </span>
                      <span className="font-mono text-[11px] text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded border border-cyan-400/20">
                        {device.touchSamplingRate}Hz
                      </span>
                    </div>
                  </div>

                  {/* Model Name */}
                  <h3 className="text-base font-bold text-white group-hover:text-[#00FF87] transition-colors leading-snug">
                    {device.model}
                  </h3>

                  {/* Specifications Details */}
                  <div className="space-y-2 pt-2 border-t border-[#141C28] text-xs text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{language === 'ru' ? 'Чипсет' : 'Chipset'}:</span>
                      </span>
                      <span className="font-medium text-slate-200 text-right truncate max-w-[170px]">
                        {device.chipset}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Tv className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{language === 'ru' ? 'Дисплей' : 'Screen'}:</span>
                      </span>
                      <span className="text-slate-200 truncate max-w-[170px]">{device.screenSize}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{language === 'ru' ? 'Сенсорный отклик' : 'Touch Sampling'}:</span>
                      </span>
                      <span className="font-mono font-bold text-[#00FF87]">{device.touchSamplingRate} Hz</span>
                    </div>

                    <div className="pt-2 border-t border-[#141C28] flex items-center justify-between text-xs">
                      <span className="text-slate-400">{language === 'ru' ? 'Диапазон DPI' : 'Safe DPI'}:</span>
                      <span className="font-mono text-[11px] text-amber-300 truncate max-w-[170px]">
                        {device.recommendedDpiRange}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons per Game */}
                <div className="space-y-2 pt-2 border-t border-[#141C28]">
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <Link
                      to={`/generator?game=free-fire&brand=${encodeURIComponent(device.brand)}&model=${encodeURIComponent(device.model)}`}
                      className="py-1.5 px-2 bg-[#121822] hover:bg-[#00FF87] hover:text-[#05070A] text-slate-300 font-semibold rounded text-center transition-colors truncate"
                    >
                      Free Fire (0–200)
                    </Link>
                    <Link
                      to={`/generator?game=pubg-mobile&brand=${encodeURIComponent(device.brand)}&model=${encodeURIComponent(device.model)}`}
                      className="py-1.5 px-2 bg-[#121822] hover:bg-[#00FF87] hover:text-[#05070A] text-slate-300 font-semibold rounded text-center transition-colors truncate"
                    >
                      PUBG Mobile
                    </Link>
                  </div>

                  <Link
                    to={`/generator?brand=${encodeURIComponent(device.brand)}&model=${encodeURIComponent(device.model)}`}
                    className="w-full py-2 bg-[#101622] hover:bg-[#00FF87] hover:text-[#05070A] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 border border-[#1C2636] hover:border-[#00FF87] transition-all"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{language === 'ru' ? 'Все настройки для модели' : 'Calibrate All Games'}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="pt-6 border-t border-[#16202C] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                {language === 'ru'
                  ? `Показано ${paginatedDevices.length} из ${filteredAndSortedDevices.length} устройств · Страница ${currentPage} из ${totalPages}`
                  : `Showing ${paginatedDevices.length} of ${filteredAndSortedDevices.length} devices · Page ${currentPage} of ${totalPages}`}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg bg-[#0E131C] border border-[#1A2536] text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  {language === 'ru' ? 'Назад' : 'Previous'}
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                  .map((page, idx, arr) => {
                    const prev = arr[idx - 1];
                    return (
                      <React.Fragment key={page}>
                        {prev && page - prev > 1 && (
                          <span className="text-slate-500 px-1 text-xs">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-colors ${
                            currentPage === page
                              ? 'bg-[#00FF87] text-[#05070A]'
                              : 'bg-[#0E131C] text-slate-300 hover:text-white border border-[#1A2536]'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg bg-[#0E131C] border border-[#1A2536] text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  {language === 'ru' ? 'Вперед' : 'Next'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ad slot */}
      <AdBannerSlot slotId="devices-bottom" format="horizontal" />
    </div>
  );
};
