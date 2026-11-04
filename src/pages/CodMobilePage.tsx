import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';
import { CodmSettings } from '../types';
import { AdBannerSlot } from '../components/common/AdBannerSlot';
import { SEO } from '../components/common/SEO';
import {
  Crosshair,
  Sliders,
  Copy,
  Check,
  Bookmark,
  Zap,
  RotateCcw,
  Eye,
} from 'lucide-react';

const DEFAULT_CODM: CodmSettings = {
  standardSens: 95,
  adsSens: 110,
  tacticalScope: 90,
  sniperScopeSens: 65,
  fov: 78,
  accelerationType: 'Speed Acceleration',
  accelValue: 120,
  frameRate: 'Ultra (120 FPS)',
};

export const CodMobilePage: React.FC = () => {
  const { t, language } = useLanguage();
  const { saveSetting } = useFavorites();
  const [settings, setSettings] = useState<CodmSettings>(DEFAULT_CODM);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCopyAll = () => {
    const text = `=== GAMESET KG: CALL OF DUTY MOBILE SETTINGS ===
Standard Sens: ${settings.standardSens}%
ADS Sens: ${settings.adsSens}%
Tactical Scope: ${settings.tacticalScope}%
Sniper Scope Sens: ${settings.sniperScopeSens}%
Camera FOV: ${settings.fov}
Rotation Mode: ${settings.accelerationType}
Acceleration Value: ${settings.accelValue || 'N/A'}
Frame Rate Target: ${settings.frameRate}

Season 2026 Competitive Tuning (gameset.kg)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    saveSetting({
      title: 'CODM Speed Accel & Quickscope',
      gameId: 'cod-mobile',
      brand: 'Universal Flagship',
      model: 'Custom FPS Preset',
      playStyle: 'rusher',
      data: settings,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SEO
        title={
          language === 'ru'
            ? 'Call of Duty: Mobile — Настройки чувствительности, FOV и акселерация | GAMESET KG'
            : 'Call of Duty: Mobile — Sensitivity, FOV & Speed Acceleration Settings | GAMESET KG'
        }
        description={
          language === 'ru'
            ? 'Киберспортивные настройки Call of Duty: Mobile. Скоростная акселерация, снайперский прицел для DL Q33 и Locus, угол обзора FOV и калибровка 120 FPS.'
            : 'Competitive Call of Duty: Mobile settings. Speed acceleration curves, sniper quickscope calibrations for DL Q33 & Locus, FOV optimization, and 120 FPS mode.'
        }
        keywords="настройки cod mobile, чувствительность codm, акселерация cod mobile, снайперский прицел codm, fov cod mobile, gameset kg"
        canonicalPath="/games/cod-mobile"
        ogType="game"
        ogImage="/src/assets/images/game_cod_mobile_1793642582897.jpg"
        gameData={{
          name: 'Call of Duty: Mobile',
          genre: 'High-Octane First-Person Tactical Shooter',
          patchVersion: 'Season 2026 Tactical Update',
          activePlayers: '190K+ активных игроков',
        }}
        breadcrumbs={[
          { name: language === 'ru' ? 'Главная' : 'Home', item: '/' },
          { name: language === 'ru' ? 'Игры' : 'Games', item: '/games' },
          { name: 'Call of Duty: Mobile', item: '/games/cod-mobile' },
        ]}
      />

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden border border-[#192434] bg-[#0A0E16] shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#00FF87]/10 border border-[#00FF87]/30 text-xs font-mono font-bold text-[#00FF87] uppercase">
              <Zap className="w-3.5 h-3.5" />
              <span>Call of Duty: Mobile · Season 2026</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              {language === 'ru' ? 'COD Mobile: Акселерация и флик' : 'COD Mobile: Speed Acceleration & Flicks'}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              {language === 'ru'
                ? 'Слайд-кенсел, скоростное разворачивание камеры и прицельная снайперская калибровка для винтовок DL Q33 и Locus при 120 FPS.'
                : 'Slide cancel mobility, speed acceleration thresholds, and quickscope flick calibrations for DL Q33 and Locus at 120 FPS.'}
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={handleCopyAll}
                className="px-5 py-2.5 bg-[#00FF87] hover:bg-[#10E760] text-[#05070A] font-black text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(0,255,135,0.25)]"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? t('btn_copied') : t('btn_copy_all')}</span>
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2.5 bg-[#101622] hover:bg-[#16202E] text-slate-200 border border-[#1C2636] font-bold text-xs rounded-lg flex items-center gap-2 transition-colors"
              >
                <Bookmark className="w-4 h-4 text-[#00FF87]" />
                <span>{savedSuccess ? t('btn_saved_success') : t('btn_save')}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 h-56 sm:h-72 lg:h-full lg:min-h-[340px] relative overflow-hidden bg-[#0F141F]">
            <img
              src="/src/assets/images/game_cod_mobile_1793642582897.jpg"
              alt="COD Mobile Hero"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#0A0E16] via-transparent to-transparent" />
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="rounded-2xl bg-[#0B0F16] border border-[#192332] p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-black text-white flex items-center gap-2 border-b border-[#16202C] pb-4">
          <Crosshair className="w-5 h-5 text-[#00FF87]" />
          <span>{language === 'ru' ? 'Параметры сенсорной чувствительности' : 'Sensor Sensitivity Parameters'}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Standard Sens */}
          <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">{t('codm_std')}</span>
              <span className="font-mono text-sm font-bold text-[#00FF87]">{settings.standardSens}</span>
            </div>
            <input
              type="range"
              min="40"
              max="200"
              value={settings.standardSens}
              onChange={(e) => setSettings({ ...settings, standardSens: Number(e.target.value) })}
              className="w-full accent-[#00FF87] cursor-pointer"
            />
            <div className="text-[11px] text-slate-400">
              {language === 'ru' ? 'Обычное движение и вращение камеры от бедра' : 'Hipfire movement and sprint camera rotation'}
            </div>
          </div>

          {/* ADS Sens */}
          <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">{t('codm_ads')}</span>
              <span className="font-mono text-sm font-bold text-[#00FF87]">{settings.adsSens}</span>
            </div>
            <input
              type="range"
              min="40"
              max="200"
              value={settings.adsSens}
              onChange={(e) => setSettings({ ...settings, adsSens: Number(e.target.value) })}
              className="w-full accent-[#00FF87] cursor-pointer"
            />
            <div className="text-[11px] text-slate-400">
              {language === 'ru' ? 'Скорость поворота прицела во время прицеливания' : 'Aiming speed while holding aim-down-sights'}
            </div>
          </div>

          {/* Sniper Scope Sens */}
          <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">{t('codm_sniper')}</span>
              <span className="font-mono text-sm font-bold text-[#00FF87]">{settings.sniperScopeSens}</span>
            </div>
            <input
              type="range"
              min="20"
              max="150"
              value={settings.sniperScopeSens}
              onChange={(e) => setSettings({ ...settings, sniperScopeSens: Number(e.target.value) })}
              className="w-full accent-[#00FF87] cursor-pointer"
            />
            <div className="text-[11px] text-slate-400">
              {language === 'ru' ? 'Быстрый снайперский флик для DL Q33 и Locus' : 'Quickscope flick speed for DL Q33 & Locus'}
            </div>
          </div>

          {/* FOV */}
          <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#00FF87]" />
                <span>{language === 'ru' ? 'Угол обзора камеры (FOV)' : 'Camera FOV'}</span>
              </span>
              <span className="font-mono text-sm font-bold text-white">{settings.fov}</span>
            </div>
            <input
              type="range"
              min="60"
              max="90"
              value={settings.fov}
              onChange={(e) => setSettings({ ...settings, fov: Number(e.target.value) })}
              className="w-full accent-[#00FF87] cursor-pointer"
            />
            <div className="text-[11px] text-slate-400">
              {language === 'ru' ? 'Рекомендованное значение: 75 – 82' : 'Recommended range: 75 to 82'}
            </div>
          </div>

          {/* Acceleration Type */}
          <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
            <span className="text-xs font-bold text-white">{t('codm_accel')}</span>
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <button
                onClick={() => setSettings({ ...settings, accelerationType: 'Speed Acceleration' })}
                className={`p-2 rounded-lg border text-left transition-colors ${
                  settings.accelerationType === 'Speed Acceleration'
                    ? 'bg-[#00FF87]/15 border-[#00FF87] text-[#00FF87] font-bold'
                    : 'border-[#1C2636] text-slate-400 hover:text-white'
                }`}
              >
                {language === 'ru' ? 'Акселерация скорости' : 'Speed Acceleration'}
              </button>
              <button
                onClick={() => setSettings({ ...settings, accelerationType: 'Fixed Speed' })}
                className={`p-2 rounded-lg border text-left transition-colors ${
                  settings.accelerationType === 'Fixed Speed'
                    ? 'bg-[#00FF87]/15 border-[#00FF87] text-[#00FF87] font-bold'
                    : 'border-[#1C2636] text-slate-400 hover:text-white'
                }`}
              >
                {language === 'ru' ? 'Фиксированная скорость' : 'Fixed Speed'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ad slot */}
      <AdBannerSlot slotId="codm-bottom" format="horizontal" />
    </div>
  );
};
