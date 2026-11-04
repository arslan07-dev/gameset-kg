import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';
import {
  GameId,
  DeviceBrand,
  DeviceSpec,
  PlayStyle,
  FreeFireSettings,
  PubgSettings,
  CodmSettings,
  MlbbSettings,
} from '../types';
import { DEVICE_BRANDS, DEVICES_DATA } from '../data/devices';
import { GAMES_DATA } from '../data/games';
import {
  generateFreeFireSettings,
  generatePubgSettings,
  generateCodmSettings,
  generateMlbbSettings,
} from '../utils/generatorLogic';
import { AdBannerSlot } from '../components/common/AdBannerSlot';
import { SEO } from '../components/common/SEO';
import {
  Sliders,
  Gamepad2,
  Smartphone,
  Crosshair,
  Copy,
  Check,
  Bookmark,
  RotateCcw,
  Sparkles,
  Info,
  ShieldCheck,
  Share2,
  GitCompare,
  Search,
} from 'lucide-react';

export const GeneratorPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { saveSetting, addToHistory, addToCompare } = useFavorites();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [compareSuccess, setCompareSuccess] = useState(false);

  // Wizard state: Steps 1-4
  const [selectedGame, setSelectedGame] = useState<GameId>(() => {
    const g = searchParams.get('game') as GameId;
    return g && ['free-fire', 'pubg-mobile', 'mobile-legends', 'cod-mobile'].includes(g)
      ? g
      : 'free-fire';
  });

  const [selectedBrand, setSelectedBrand] = useState<DeviceBrand>(() => {
    const b = searchParams.get('brand') as DeviceBrand;
    return b && DEVICE_BRANDS.includes(b) ? b : 'POCO';
  });

  const [selectedDevice, setSelectedDevice] = useState<DeviceSpec>(() => {
    const modelParam = searchParams.get('model');
    if (modelParam) {
      const found = DEVICES_DATA.find((d) => d.model.toLowerCase() === modelParam.toLowerCase());
      if (found) return found;
    }
    return DEVICES_DATA.find((d) => d.id === 'poco-x6-pro') || DEVICES_DATA[0];
  });

  const [selectedStyle, setSelectedStyle] = useState<PlayStyle>('rusher');
  const [modelSearchQuery, setModelSearchQuery] = useState('');

  // Generated settings state
  const [ffSettings, setFfSettings] = useState<FreeFireSettings>(() =>
    generateFreeFireSettings(selectedDevice, 'rusher')
  );
  const [pubgSettings, setPubgSettings] = useState<PubgSettings>(() =>
    generatePubgSettings(selectedDevice, 'rusher')
  );
  const [codmSettings, setCodmSettings] = useState<CodmSettings>(() =>
    generateCodmSettings(selectedDevice, 'rusher')
  );
  const [mlbbSettings, setMlbbSettings] = useState<MlbbSettings>(() =>
    generateMlbbSettings(selectedDevice, 'rusher')
  );

  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [shared, setShared] = useState(false);

  const handleBrandChange = (brand: DeviceBrand) => {
    setSelectedBrand(brand);
    const firstOfBrand = DEVICES_DATA.find((d) => d.brand === brand);
    if (firstOfBrand) {
      setSelectedDevice(firstOfBrand);
    }
  };

  const handleGenerate = () => {
    let payload: any = null;
    if (selectedGame === 'free-fire') {
      const generated = generateFreeFireSettings(selectedDevice, selectedStyle);
      setFfSettings(generated);
      payload = generated;
    } else if (selectedGame === 'pubg-mobile') {
      const generated = generatePubgSettings(selectedDevice, selectedStyle);
      setPubgSettings(generated);
      payload = generated;
    } else if (selectedGame === 'cod-mobile') {
      const generated = generateCodmSettings(selectedDevice, selectedStyle);
      setCodmSettings(generated);
      payload = generated;
    } else if (selectedGame === 'mobile-legends') {
      const generated = generateMlbbSettings(selectedDevice, selectedStyle);
      setMlbbSettings(generated);
      payload = generated;
    }

    if (payload) {
      addToHistory({
        gameId: selectedGame,
        brand: selectedDevice.brand,
        model: selectedDevice.model,
        playStyle: selectedStyle,
        data: payload,
      });
    }
  };

  const handleReset = () => {
    handleGenerate();
  };

  const handleCopyAll = () => {
    let text = '';
    if (selectedGame === 'free-fire') {
      text = `=== GAMESET KG: FREE FIRE SETTINGS ===
Device: ${selectedDevice.brand} ${selectedDevice.model}
Play Style: ${selectedStyle}
Range: 0 – 200 (OB48 2026)
${t('ff_general')}: ${ffSettings.general}
${t('ff_red_dot')}: ${ffSettings.redDot}
${t('ff_scope_2x')}: ${ffSettings.scope2x}
${t('ff_scope_4x')}: ${ffSettings.scope4x}
${t('ff_sniper')}: ${ffSettings.sniperScope}
${t('ff_free_look')}: ${ffSettings.freeLook}
${t('ff_fire_button')}: ${ffSettings.fireButtonSize}%
${t('ff_dpi')}: ${ffSettings.dpi > 0 ? ffSettings.dpi : 'Default iOS'}
${t('ff_graphics')}: ${ffSettings.graphicPreset}
Verified baseline (gameset.kg)`;
    } else if (selectedGame === 'pubg-mobile') {
      text = `=== GAMESET KG: PUBG MOBILE SETTINGS ===
Device: ${selectedDevice.brand} ${selectedDevice.model}
Layout Code: ${pubgSettings.layoutCode}
Gyroscope No Scope: ${pubgSettings.gyroNoScope}%
Gyroscope Red Dot: ${pubgSettings.gyroRedDot}%
Gyroscope 3X: ${pubgSettings.gyro3x}%
Gyroscope 4X: ${pubgSettings.gyro4x}%
ADS Red Dot: ${pubgSettings.adsRedDot}%
ADS 3X: ${pubgSettings.ads3x}%
Graphics: ${pubgSettings.graphics}`;
    } else if (selectedGame === 'cod-mobile') {
      text = `=== GAMESET KG: CALL OF DUTY MOBILE SETTINGS ===
Device: ${selectedDevice.brand} ${selectedDevice.model}
Standard Sens: ${codmSettings.standardSens}%
ADS Sens: ${codmSettings.adsSens}%
Sniper Scope: ${codmSettings.sniperScopeSens}%
Camera FOV: ${codmSettings.fov}
Rotation Mode: ${codmSettings.accelerationType}
Frame Rate: ${codmSettings.frameRate}`;
    } else {
      text = `=== GAMESET KG: MOBILE LEGENDS SETTINGS ===
Device: ${selectedDevice.brand} ${selectedDevice.model}
Camera Pan: ${mlbbSettings.cameraSensitivity}%
Aiming Method: ${mlbbSettings.aimingMethod}
Target Priority: ${mlbbSettings.targetingPriority}
Refresh Rate: ${mlbbSettings.refreshRate}`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCurrentData = () => {
    if (selectedGame === 'pubg-mobile') return pubgSettings;
    if (selectedGame === 'cod-mobile') return codmSettings;
    if (selectedGame === 'mobile-legends') return mlbbSettings;
    return ffSettings;
  };

  const handleSave = () => {
    const dataPayload = getCurrentData();
    const entry = {
      title: `${selectedDevice.model} (${selectedGame})`,
      gameId: selectedGame,
      brand: selectedDevice.brand,
      model: selectedDevice.model,
      playStyle: selectedStyle,
      data: dataPayload,
    };
    saveSetting(entry);
    addToHistory(entry);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAddToCompare = () => {
    const dataPayload = getCurrentData();
    const entry = {
      id: 'gen_' + Date.now(),
      title: `${selectedDevice.model} (${selectedGame})`,
      gameId: selectedGame,
      brand: selectedDevice.brand,
      model: selectedDevice.model,
      playStyle: selectedStyle,
      timestamp: Date.now(),
      data: dataPayload,
    };
    addToCompare(entry);
    setCompareSuccess(true);
    setTimeout(() => {
      setCompareSuccess(false);
      navigate('/compare');
    }, 800);
  };

  const handleShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('game', selectedGame);
    url.searchParams.set('brand', selectedDevice.brand);
    url.searchParams.set('model', selectedDevice.model);
    navigator.clipboard.writeText(url.toString());
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const availableModels = useMemo(() => {
    return DEVICES_DATA.filter((d) => {
      const matchBrand = d.brand === selectedBrand;
      const q = modelSearchQuery.toLowerCase().trim();
      const matchQuery = q === '' || d.model.toLowerCase().includes(q) || d.chipset.toLowerCase().includes(q);
      return matchBrand && matchQuery;
    });
  }, [selectedBrand, modelSearchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SEO
        title={
          language === 'ru'
            ? 'Интерактивный генератор настроек чувствительности под смартфоны | GAMESET KG'
            : 'Interactive Gaming Settings Generator for Smartphones | GAMESET KG'
        }
        description={
          language === 'ru'
            ? 'Генератор чувствительности и настроек под точную модель смартфона и стиль игры. Free Fire (0–200), PUBG Mobile (гироскоп), MLBB и COD Mobile.'
            : 'Interactive sensitivity generator calibrated for your exact smartphone model and playstyle. Free Fire (0–200), PUBG Mobile, MLBB, and COD Mobile.'
        }
        keywords="генератор чувствительности, подобрать настройки для телефона, генератор фри фаер, генератор pubg mobile, калибровка сенсора, gameset kg"
        canonicalPath="/generator"
        breadcrumbs={[
          { name: language === 'ru' ? 'Главная' : 'Home', item: '/' },
          { name: language === 'ru' ? 'Генератор' : 'Generator', item: '/generator' },
        ]}
      />

      {/* Header */}
      <div className="space-y-3">
        <div className="text-xs font-mono font-bold text-[#00FF87] uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{language === 'ru' ? 'Интерактивный генератор' : 'Interactive Generator'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          {language === 'ru' ? 'Генератор настроек чувствительности' : 'Game Settings Generator'}
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          {language === 'ru'
            ? 'Выберите игру, бренд из 20 доступных, точную модель смартфона и стиль управления для генерации точной калибровки.'
            : 'Select game, brand from 20 supported OEMs, verified phone model, and preferred grip style for calibrated baseline values.'}
        </p>
      </div>

      {/* Step Wizard Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: 4 Configuration Steps */}
        <div className="lg:col-span-5 space-y-5">
          {/* STEP 1: Select Game */}
          <div className="p-5 rounded-xl bg-[#0B0F16] border border-[#192332] space-y-3">
            <div className="text-xs font-bold text-[#00FF87] uppercase tracking-wider flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4" />
              <span>{t('gen_step_1')}</span>
            </div>
            <div className="text-xs text-slate-400">{t('gen_select_game_desc')}</div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {GAMES_DATA.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGame(g.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedGame === g.id
                      ? 'bg-[#00FF87]/15 border-[#00FF87] text-white shadow-[0_0_12px_rgba(0,255,135,0.15)] font-bold'
                      : 'bg-[#0E131C] border-[#1A2536] text-slate-300 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{g.name}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{g.subtitle}</div>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: Select Brand */}
          <div className="p-5 rounded-xl bg-[#0B0F16] border border-[#192332] space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-[#00FF87] uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                <span>{t('gen_step_2')} (20 брендов)</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {selectedBrand} ({DEVICES_DATA.filter((d) => d.brand === selectedBrand).length} моделей)
              </span>
            </div>
            <div className="text-xs text-slate-400">{t('gen_select_brand_desc')}</div>

            {/* Quick Dropdown for 20 Brands */}
            <select
              value={selectedBrand}
              onChange={(e) => handleBrandChange(e.target.value as DeviceBrand)}
              className="w-full bg-[#0E131C] border border-[#1A2536] focus:border-[#00FF87] rounded-lg px-3 py-2 text-xs text-white focus:outline-none mb-2"
            >
              {DEVICE_BRANDS.map((brand) => (
                <option key={brand} value={brand} className="bg-[#0B0F16]">
                  {brand} ({DEVICES_DATA.filter((d) => d.brand === brand).length} моделей)
                </option>
              ))}
            </select>

            {/* Scrollable brand pills */}
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {DEVICE_BRANDS.map((brand) => (
                <button
                  key={brand}
                  onClick={() => handleBrandChange(brand)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                    selectedBrand === brand
                      ? 'bg-[#00FF87] text-[#05070A] font-bold shadow-sm'
                      : 'bg-[#0E131C] border border-[#1A2536] text-slate-300 hover:text-white'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 3: Select Model */}
          <div className="p-5 rounded-xl bg-[#0B0F16] border border-[#192332] space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-[#00FF87] uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                <span>{t('gen_step_3')}</span>
              </div>
              <span className="text-[10px] font-mono text-[#00FF87]">
                {availableModels.length} найдено
              </span>
            </div>

            {/* Model Search Box */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={modelSearchQuery}
                onChange={(e) => setModelSearchQuery(e.target.value)}
                placeholder={language === 'ru' ? `Поиск среди моделей ${selectedBrand}...` : `Search ${selectedBrand} models...`}
                className="w-full pl-8 pr-3 py-1.5 bg-[#0E131C] border border-[#1A2536] focus:border-[#00FF87] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              {modelSearchQuery && (
                <button
                  onClick={() => setModelSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
              {availableModels.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  {language === 'ru' ? 'Модель не найдена в этом бренде' : 'No matching models in this brand'}
                </div>
              ) : (
                availableModels.map((device: DeviceSpec) => (
                  <button
                    key={device.id}
                    onClick={() => setSelectedDevice(device)}
                    className={`p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                      selectedDevice.id === device.id
                        ? 'bg-[#00FF87]/15 border-[#00FF87] text-white font-semibold shadow-[0_0_10px_rgba(0,255,135,0.1)]'
                        : 'bg-[#0E131C] border-[#1A2536] text-slate-300 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{device.model}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[210px]">
                        {device.chipset}
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#00FF87] shrink-0">
                      {device.refreshRate}Hz
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* STEP 4: Select Play Style */}
          <div className="p-5 rounded-xl bg-[#0B0F16] border border-[#192332] space-y-3">
            <div className="text-xs font-bold text-[#00FF87] uppercase tracking-wider flex items-center gap-1.5">
              <Crosshair className="w-4 h-4" />
              <span>{t('gen_step_4')}</span>
            </div>
            <div className="text-xs text-slate-400">{t('gen_select_style_desc')}</div>
            <div className="space-y-2 pt-1">
              {[
                { id: 'rusher' as const, title: t('style_rusher'), desc: t('style_rusher_desc') },
                { id: 'balanced' as const, title: t('style_balanced'), desc: t('style_balanced_desc') },
                { id: 'sniper' as const, title: t('style_sniper'), desc: t('style_sniper_desc') },
                { id: 'gyro' as const, title: t('style_gyro'), desc: t('style_gyro_desc') },
                { id: 'claw' as const, title: t('style_claw'), desc: t('style_claw_desc') },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStyle(st.id)}
                  className={`w-full p-2.5 rounded-lg border text-left transition-all ${
                    selectedStyle === st.id
                      ? 'bg-[#00FF87]/15 border-[#00FF87] text-white font-semibold'
                      : 'bg-[#0E131C] border-[#1A2536] text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{st.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{st.desc}</div>
                </button>
              ))}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              className="w-full mt-4 py-3 bg-[#00FF87] hover:bg-[#10E760] text-[#05070A] font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(0,255,135,0.25)] flex items-center justify-center gap-2"
            >
              <Sliders className="w-4 h-4" />
              <span>{t('btn_generate')}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Step 5 Output */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-xl bg-[#0B0F16] border border-[#192332] p-6 sm:p-8 space-y-6 shadow-xl">
            {/* Output Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#16202C] pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-xs font-mono font-bold text-[#00FF87] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>{t('gen_step_5')}</span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#00FF87]/10 border border-[#00FF87]/30 text-[10px] font-mono font-bold text-[#00FF87] uppercase">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{language === 'ru' ? 'Рекомендовано (Hardware)' : 'Recommended (Hardware)'}</span>
                  </div>
                </div>
                <h2 className="text-xl font-black text-white mt-1">
                  {selectedDevice.model} · {selectedGame.toUpperCase()}
                </h2>
                <div className="text-xs text-slate-400 mt-0.5">
                  {language === 'ru' ? 'Стиль' : 'Style'}: <span className="text-slate-200 font-semibold">{selectedStyle}</span> · {selectedDevice.refreshRate}Hz / {selectedDevice.touchSamplingRate}Hz
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyAll}
                  className="px-3.5 py-2 bg-[#00FF87] hover:bg-[#10E760] text-[#05070A] font-black text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                  title="Копировать всё"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? t('btn_copied') : t('btn_copy_all')}</span>
                </button>

                <button
                  onClick={handleSave}
                  className="px-3 py-2 bg-[#101622] hover:bg-[#16202E] text-slate-200 border border-[#1C2636] font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                  title="Сохранить"
                >
                  <Bookmark className="w-3.5 h-3.5 text-[#00FF87]" />
                  <span>{savedSuccess ? t('btn_saved_success') : t('btn_save')}</span>
                </button>

                <button
                  onClick={handleAddToCompare}
                  className="px-3 py-2 bg-[#101622] hover:bg-[#16202E] text-slate-200 border border-[#1C2636] font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                  title="Добавить в сравнение"
                >
                  <GitCompare className="w-3.5 h-3.5 text-[#00FF87]" />
                  <span>{compareSuccess ? 'Добавлено!' : t('btn_add_compare')}</span>
                </button>

                <button
                  onClick={handleShareLink}
                  className="p-2 bg-[#101622] hover:bg-[#16202E] text-slate-300 rounded-lg border border-[#1C2636] transition-colors"
                  title="Поделиться ссылкой"
                >
                  {shared ? <Check className="w-4 h-4 text-[#00FF87]" /> : <Share2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleReset}
                  className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
                  title="Сброс"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Generated Sliders: Free Fire (Strict 0–200 Range) */}
            {selectedGame === 'free-fire' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1 text-xs">
                  <span className="font-mono font-bold text-[#00FF87] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Free Fire OB48 · Шкала чувствительности: 0 — 200</span>
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {language === 'ru' ? 'Ползунок или прямой ввод числа' : 'Slider or direct number input'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* General */}
                  <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{t('ff_general')}</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={200}
                          value={ffSettings.general}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(200, Number(e.target.value) || 0));
                            setFfSettings({ ...ffSettings, general: val });
                          }}
                          className="w-16 px-1.5 py-0.5 bg-[#090C12] border border-[#1E293B] rounded text-right font-mono font-bold text-sm text-[#00FF87] focus:border-[#00FF87] focus:outline-none"
                        />
                        <span className="text-[10px] font-mono text-slate-500">/200</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="1"
                      value={ffSettings.general}
                      onChange={(e) => setFfSettings({ ...ffSettings, general: Number(e.target.value) })}
                      className="w-full accent-[#00FF87] cursor-pointer"
                    />
                  </div>

                  {/* Red Dot */}
                  <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{t('ff_red_dot')}</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={200}
                          value={ffSettings.redDot}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(200, Number(e.target.value) || 0));
                            setFfSettings({ ...ffSettings, redDot: val });
                          }}
                          className="w-16 px-1.5 py-0.5 bg-[#090C12] border border-[#1E293B] rounded text-right font-mono font-bold text-sm text-[#00FF87] focus:border-[#00FF87] focus:outline-none"
                        />
                        <span className="text-[10px] font-mono text-slate-500">/200</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="1"
                      value={ffSettings.redDot}
                      onChange={(e) => setFfSettings({ ...ffSettings, redDot: Number(e.target.value) })}
                      className="w-full accent-[#00FF87] cursor-pointer"
                    />
                  </div>

                  {/* 2X */}
                  <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{t('ff_scope_2x')}</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={200}
                          value={ffSettings.scope2x}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(200, Number(e.target.value) || 0));
                            setFfSettings({ ...ffSettings, scope2x: val });
                          }}
                          className="w-16 px-1.5 py-0.5 bg-[#090C12] border border-[#1E293B] rounded text-right font-mono font-bold text-sm text-[#00FF87] focus:border-[#00FF87] focus:outline-none"
                        />
                        <span className="text-[10px] font-mono text-slate-500">/200</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="1"
                      value={ffSettings.scope2x}
                      onChange={(e) => setFfSettings({ ...ffSettings, scope2x: Number(e.target.value) })}
                      className="w-full accent-[#00FF87] cursor-pointer"
                    />
                  </div>

                  {/* 4X */}
                  <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{t('ff_scope_4x')}</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={200}
                          value={ffSettings.scope4x}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(200, Number(e.target.value) || 0));
                            setFfSettings({ ...ffSettings, scope4x: val });
                          }}
                          className="w-16 px-1.5 py-0.5 bg-[#090C12] border border-[#1E293B] rounded text-right font-mono font-bold text-sm text-[#00FF87] focus:border-[#00FF87] focus:outline-none"
                        />
                        <span className="text-[10px] font-mono text-slate-500">/200</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="1"
                      value={ffSettings.scope4x}
                      onChange={(e) => setFfSettings({ ...ffSettings, scope4x: Number(e.target.value) })}
                      className="w-full accent-[#00FF87] cursor-pointer"
                    />
                  </div>

                  {/* Sniper */}
                  <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{t('ff_sniper')}</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={200}
                          value={ffSettings.sniperScope}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(200, Number(e.target.value) || 0));
                            setFfSettings({ ...ffSettings, sniperScope: val });
                          }}
                          className="w-16 px-1.5 py-0.5 bg-[#090C12] border border-[#1E293B] rounded text-right font-mono font-bold text-sm text-[#00FF87] focus:border-[#00FF87] focus:outline-none"
                        />
                        <span className="text-[10px] font-mono text-slate-500">/200</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="1"
                      value={ffSettings.sniperScope}
                      onChange={(e) => setFfSettings({ ...ffSettings, sniperScope: Number(e.target.value) })}
                      className="w-full accent-[#00FF87] cursor-pointer"
                    />
                  </div>

                  {/* Free Look */}
                  <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{t('ff_free_look')}</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={200}
                          value={ffSettings.freeLook}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(200, Number(e.target.value) || 0));
                            setFfSettings({ ...ffSettings, freeLook: val });
                          }}
                          className="w-16 px-1.5 py-0.5 bg-[#090C12] border border-[#1E293B] rounded text-right font-mono font-bold text-sm text-[#00FF87] focus:border-[#00FF87] focus:outline-none"
                        />
                        <span className="text-[10px] font-mono text-slate-500">/200</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="1"
                      value={ffSettings.freeLook}
                      onChange={(e) => setFfSettings({ ...ffSettings, freeLook: Number(e.target.value) })}
                      className="w-full accent-[#00FF87] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Additional Free Fire metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#16202C] text-xs">
                  <div className="p-3 rounded-lg bg-[#0F141F] border border-[#182333]">
                    <div className="text-slate-400">{t('ff_fire_button')}</div>
                    <div className="text-lg font-mono font-bold text-[#00FF87] mt-0.5">
                      {ffSettings.fireButtonSize}%
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0F141F] border border-[#182333]">
                    <div className="text-slate-400">{t('ff_dpi')}</div>
                    <div className="text-lg font-mono font-bold text-white mt-0.5">
                      {ffSettings.dpi > 0 ? `${ffSettings.dpi} DPI` : 'iOS Standard'}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0F141F] border border-[#182333]">
                    <div className="text-slate-400">{t('ff_graphics')}</div>
                    <div className="text-xs font-bold text-slate-200 mt-1">
                      {ffSettings.graphicPreset}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Generated Sliders: PUBG Mobile */}
            {selectedGame === 'pubg-mobile' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-[#0F141F] border border-[#182333] flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-400">{t('pubg_layout_code')}: </span>
                    <span className="font-mono text-white font-bold">{pubgSettings.layoutCode}</span>
                  </div>
                  <span className="text-xs font-mono text-[#00FF87]">{pubgSettings.graphics}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-white">Гироскоп: 3X Прицел</span>
                      <span className="font-mono text-[#00FF87]">{pubgSettings.gyro3x}%</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="400"
                      value={pubgSettings.gyro3x}
                      onChange={(e) => setPubgSettings({ ...pubgSettings, gyro3x: Number(e.target.value) })}
                      className="w-full accent-[#00FF87]"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-white">Гироскоп: Red Dot</span>
                      <span className="font-mono text-[#00FF87]">{pubgSettings.gyroRedDot}%</span>
                    </div>
                    <input
                      type="range"
                      min="150"
                      max="400"
                      value={pubgSettings.gyroRedDot}
                      onChange={(e) => setPubgSettings({ ...pubgSettings, gyroRedDot: Number(e.target.value) })}
                      className="w-full accent-[#00FF87]"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-white">ADS: 3X Прицел</span>
                      <span className="font-mono text-[#00FF87]">{pubgSettings.ads3x}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      value={pubgSettings.ads3x}
                      onChange={(e) => setPubgSettings({ ...pubgSettings, ads3x: Number(e.target.value) })}
                      className="w-full accent-[#00FF87]"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-white">Камера: Red Dot</span>
                      <span className="font-mono text-[#00FF87]">{pubgSettings.cameraRedDot}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={pubgSettings.cameraRedDot}
                      onChange={(e) => setPubgSettings({ ...pubgSettings, cameraRedDot: Number(e.target.value) })}
                      className="w-full accent-[#00FF87]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Generated Sliders: COD Mobile */}
            {selectedGame === 'cod-mobile' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">Standard Sens</span>
                    <span className="font-mono text-[#00FF87]">{codmSettings.standardSens}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="180"
                    value={codmSettings.standardSens}
                    onChange={(e) => setCodmSettings({ ...codmSettings, standardSens: Number(e.target.value) })}
                    className="w-full accent-[#00FF87]"
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">ADS Sens</span>
                    <span className="font-mono text-[#00FF87]">{codmSettings.adsSens}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="180"
                    value={codmSettings.adsSens}
                    onChange={(e) => setCodmSettings({ ...codmSettings, adsSens: Number(e.target.value) })}
                    className="w-full accent-[#00FF87]"
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">Sniper Scope Sens</span>
                    <span className="font-mono text-[#00FF87]">{codmSettings.sniperScopeSens}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="140"
                    value={codmSettings.sniperScopeSens}
                    onChange={(e) => setCodmSettings({ ...codmSettings, sniperScopeSens: Number(e.target.value) })}
                    className="w-full accent-[#00FF87]"
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">Camera FOV</span>
                    <span className="font-mono text-[#00FF87]">{codmSettings.fov}</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="90"
                    value={codmSettings.fov}
                    onChange={(e) => setCodmSettings({ ...codmSettings, fov: Number(e.target.value) })}
                    className="w-full accent-[#00FF87]"
                  />
                </div>
              </div>
            )}

            {/* Generated: Mobile Legends */}
            {selectedGame === 'mobile-legends' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">Camera Pan Speed</span>
                    <span className="font-mono text-[#00FF87]">{mlbbSettings.cameraSensitivity}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={mlbbSettings.cameraSensitivity}
                    onChange={(e) => setMlbbSettings({ ...mlbbSettings, cameraSensitivity: Number(e.target.value) })}
                    className="w-full accent-[#00FF87]"
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                  <div className="text-xs font-bold text-white">Targeting Priority</div>
                  <div className="text-sm font-semibold text-[#00FF87]">{mlbbSettings.targetingPriority}</div>
                  <div className="text-[11px] text-slate-400">Aiming: {mlbbSettings.aimingMethod}</div>
                </div>
              </div>
            )}

            {/* Safe Disclaimer inside Generator */}
            <div className="p-4 rounded-xl bg-[#080B10] border border-[#151D28] flex items-start gap-3 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-[#00FF87] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-slate-300">
                  {t('disclaimer_title')}
                </div>
                <div className="text-[11px] leading-relaxed">
                  {t('disclaimer_text')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ad slot */}
      <AdBannerSlot slotId="generator-bottom" format="horizontal" />
    </div>
  );
};
