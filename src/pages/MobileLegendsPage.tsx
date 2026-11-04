import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';
import { MlbbSettings } from '../types';
import { AdBannerSlot } from '../components/common/AdBannerSlot';
import { SEO } from '../components/common/SEO';
import {
  Sparkles,
  Sliders,
  Copy,
  Check,
  Bookmark,
  Target,
  Layers,
  Zap,
} from 'lucide-react';

const DEFAULT_MLBB: MlbbSettings = {
  cameraSensitivity: 72,
  aimingMethod: 'Advanced Aim',
  targetingPriority: 'Lowest HP',
  skillSmartTargeting: true,
  heroLockMode: true,
  refreshRate: 'Ultra (120Hz)',
  graphics: 'High',
};

export const MobileLegendsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { saveSetting } = useFavorites();
  const [settings, setSettings] = useState<MlbbSettings>(DEFAULT_MLBB);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCopyAll = () => {
    const text = `=== GAMESET KG: MOBILE LEGENDS PRO SETTINGS ===
Camera Pan Sensitivity: ${settings.cameraSensitivity}%
Aiming Method: ${settings.aimingMethod}
Targeting Priority: ${settings.targetingPriority}
Hero Lock Mode: ${settings.heroLockMode ? 'ENABLED' : 'DISABLED'}
Smart Skill Targeting: ${settings.skillSmartTargeting ? 'ENABLED' : 'DISABLED'}
Refresh Rate: ${settings.refreshRate}
Graphics: ${settings.graphics}

Optimized for Project NEXT 2026 (gameset.kg)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    saveSetting({
      title: 'MLBB Tournament Aim & Lock',
      gameId: 'mobile-legends',
      brand: 'Universal Flagship',
      model: 'Custom MOBA Preset',
      playStyle: 'balanced',
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
            ? 'Mobile Legends (MLBB) — Настройки камеры, таргетинг и 120 FPS | GAMESET KG'
            : 'Mobile Legends (MLBB) — Camera Sensitivity, Targeting & 120 FPS Settings | GAMESET KG'
        }
        description={
          language === 'ru'
            ? 'Профессиональные настройки управления Mobile Legends. Плавное панорамирование миникарты, приоритет целей Lowest HP, Hero Lock Mode и ультра-режим 120 FPS.'
            : 'Pro Mobile Legends (MLBB) control settings. Smooth minimap camera panning, Lowest HP target priority, Hero Lock Mode, and 120 FPS ultra refresh optimization.'
        }
        keywords="настройки мобайл легендс, чувствительность камеры млбб, hero lock mode mlbb, 120 fps mobile legends, таргетинг mlbb, gameset kg"
        canonicalPath="/games/mobile-legends"
        ogType="game"
        ogImage="/src/assets/images/game_mobile_legends_1793642583034.jpg"
        gameData={{
          name: 'Mobile Legends: Bang Bang',
          genre: 'Mobile MOBA Esports',
          patchVersion: 'Project NEXT 2026',
          activePlayers: '280K+ активных игроков',
        }}
        breadcrumbs={[
          { name: language === 'ru' ? 'Главная' : 'Home', item: '/' },
          { name: language === 'ru' ? 'Игры' : 'Games', item: '/games' },
          { name: 'Mobile Legends', item: '/games/mobile-legends' },
        ]}
      />

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden border border-[#192434] bg-[#0A0E16] shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#00FF87]/10 border border-[#00FF87]/30 text-xs font-mono font-bold text-[#00FF87] uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mobile Legends: Bang Bang · Project NEXT</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              {language === 'ru' ? 'Mobile Legends: Управление и камера' : 'Mobile Legends: Controls & Camera'}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              {language === 'ru'
                ? 'Режим захвата героя (Hero Lock Mode), приоритет низкого здоровья и калибровка скорости движения свободной камеры для мгновенного чека кустов.'
                : 'Hero lock mode configuration, lowest HP targeting priority matrix, and smooth minimap pan sensitivity for instant bush scouting.'}
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
              src="/src/assets/images/game_mobile_legends_1793642583034.jpg"
              alt="Mobile Legends Hero"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#0A0E16] via-transparent to-transparent" />
          </div>
        </div>
      </div>

      {/* Control Matrix */}
      <div className="rounded-2xl bg-[#0B0F16] border border-[#192332] p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-black text-white flex items-center gap-2 border-b border-[#16202C] pb-4">
          <Target className="w-5 h-5 text-[#00FF87]" />
          <span>{language === 'ru' ? 'Параметры таргетинга и интерфейса' : 'Targeting & Interface Settings'}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Camera Sensitivity */}
          <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">{t('mlbb_cam_sens')}</span>
              <span className="font-mono text-sm font-bold text-[#00FF87]">{settings.cameraSensitivity}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={settings.cameraSensitivity}
              onChange={(e) => setSettings({ ...settings, cameraSensitivity: Number(e.target.value) })}
              className="w-full accent-[#00FF87] cursor-pointer"
            />
            <div className="text-[11px] text-slate-400">
              {language === 'ru' ? 'Скорость перемещения камеры по карте при свайпе' : 'Minimap drag pan velocity across the battlefield'}
            </div>
          </div>

          {/* Aiming Method */}
          <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
            <span className="text-xs font-bold text-white">{t('mlbb_target_mode')}</span>
            <div className="grid grid-cols-3 gap-2 pt-1 text-xs font-semibold">
              {(['Free Aim', 'Advanced Aim', 'Auto Aim'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setSettings({ ...settings, aimingMethod: method })}
                  className={`p-2 rounded-lg border transition-colors ${
                    settings.aimingMethod === method
                      ? 'bg-[#00FF87]/15 border-[#00FF87] text-[#00FF87]'
                      : 'border-[#1C2636] text-slate-400 hover:text-white'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Targeting Priority */}
          <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
            <span className="text-xs font-bold text-white">{t('mlbb_priority')}</span>
            <div className="grid grid-cols-3 gap-2 pt-1 text-xs font-semibold">
              {(['Lowest HP', 'Closest Target', 'Lowest HP %'] as const).map((priority) => (
                <button
                  key={priority}
                  onClick={() => setSettings({ ...settings, targetingPriority: priority })}
                  className={`p-2 rounded-lg border transition-colors text-center ${
                    settings.targetingPriority === priority
                      ? 'bg-[#00FF87]/15 border-[#00FF87] text-[#00FF87]'
                      : 'border-[#1C2636] text-slate-400 hover:text-white'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Refresh Rate & Hero Lock */}
          <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">{t('mlbb_hero_lock')}</span>
              <button
                onClick={() => setSettings({ ...settings, heroLockMode: !settings.heroLockMode })}
                className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-colors ${
                  settings.heroLockMode ? 'bg-[#00FF87] text-[#05070A]' : 'bg-[#1C2636] text-slate-400'
                }`}
              >
                {settings.heroLockMode ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-[#182333]">
              <span className="font-bold text-white">
                {language === 'ru' ? 'Частота обновления экрана' : 'Display Refresh Rate'}
              </span>
              <span className="font-mono text-[#00FF87] font-bold">{settings.refreshRate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ad slot */}
      <AdBannerSlot slotId="mlbb-bottom" format="horizontal" />
    </div>
  );
};
