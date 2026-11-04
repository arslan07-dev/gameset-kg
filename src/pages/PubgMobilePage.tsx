import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';
import { PubgSettings } from '../types';
import { AdBannerSlot } from '../components/common/AdBannerSlot';
import { SEO } from '../components/common/SEO';
import {
  Shield,
  Crosshair,
  Sliders,
  Copy,
  Check,
  Bookmark,
  RotateCcw,
  Compass,
  ArrowRight,
  Code,
} from 'lucide-react';

const DEFAULT_PUBG_SETTINGS: PubgSettings = {
  cameraNoScope: 120,
  cameraRedDot: 58,
  camera2x: 42,
  camera3x: 28,
  camera4x: 20,
  camera6x: 14,
  camera8x: 10,
  adsNoScope: 118,
  adsRedDot: 60,
  ads2x: 44,
  ads3x: 32,
  ads4x: 24,
  ads6x: 18,
  ads8x: 11,
  gyroscopeEnabled: true,
  gyroNoScope: 380,
  gyroRedDot: 390,
  gyro3x: 310,
  gyro4x: 260,
  gyro6x: 150,
  gyro8x: 85,
  graphics: 'Smooth + 90fps',
  layoutCode: '7249-8391-4920-5819-32',
};

export const PubgMobilePage: React.FC = () => {
  const { t, language } = useLanguage();
  const { saveSetting } = useFavorites();
  const [settings, setSettings] = useState<PubgSettings>(DEFAULT_PUBG_SETTINGS);
  const [activeTab, setActiveTab] = useState<'camera' | 'ads' | 'gyro'>('gyro');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(settings.layoutCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyAll = () => {
    const text = `=== GAMESET KG: PUBG MOBILE PRO SENSITIVITY ===
[Layout Code]: ${settings.layoutCode}
[Graphics]: ${settings.graphics}

--- CAMERA SENSITIVITY ---
No Scope: ${settings.cameraNoScope}%
Red Dot/Holo: ${settings.cameraRedDot}%
2X Scope: ${settings.camera2x}%
3X Scope: ${settings.camera3x}%
4X Scope: ${settings.camera4x}%
6X Scope: ${settings.camera6x}%
8X Scope: ${settings.camera8x}%

--- ADS SENSITIVITY (RECOIL) ---
No Scope: ${settings.adsNoScope}%
Red Dot: ${settings.adsRedDot}%
3X Scope: ${settings.ads3x}%
4X Scope: ${settings.ads4x}%
6X Scope: ${settings.ads6x}%

--- GYROSCOPE (FULL GYRO) ---
No Scope: ${settings.gyroNoScope}%
Red Dot: ${settings.gyroRedDot}%
3X Scope: ${settings.gyro3x}%
4X Scope: ${settings.gyro4x}%
6X Scope: ${settings.gyro6x}%
8X Scope: ${settings.gyro8x}%

Season 3.7 Tournament Meta (gameset.kg)`;
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleSave = () => {
    saveSetting({
      title: 'PUBG Mobile Full Gyro',
      gameId: 'pubg-mobile',
      brand: 'Universal Flagship',
      model: 'Custom Gyro Preset',
      playStyle: 'gyro',
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
            ? 'PUBG Mobile (v3.7) — Чувствительность, гироскоп 300–400% и коды раскладок | GAMESET KG'
            : 'PUBG Mobile (v3.7) — Sensitivity, 300–400% Gyroscope & Claw Layouts | GAMESET KG'
        }
        description={
          language === 'ru'
            ? 'Киберспортивные настройки PUBG Mobile (v3.7). Контроль отдачи для M416 и Beryl M762, калибровка гироскопа 300%–400%, турнирный код раскладки под 4 пальца.'
            : 'Competitive PUBG Mobile settings (v3.7). Recoil stabilization for M416 and Beryl, 300%–400% gyroscope curves, and tournament 4-finger claw layout codes.'
        }
        keywords="чувствительность pubg mobile, гироскоп 400 pubg mobile, код раскладки пубг мобайл, зажим m416 пубг, настройки pubg mobile 3.7, gameset kg"
        canonicalPath="/games/pubg-mobile"
        ogType="game"
        ogImage="/src/assets/images/game_pubg_mobile_1793642582783.jpg"
        gameData={{
          name: 'PUBG Mobile',
          genre: 'Tactical Military Shooter / Battle Royale',
          patchVersion: 'Version 3.7 (2026)',
          activePlayers: '420K+ активных игроков',
        }}
        breadcrumbs={[
          { name: language === 'ru' ? 'Главная' : 'Home', item: '/' },
          { name: language === 'ru' ? 'Игры' : 'Games', item: '/games' },
          { name: 'PUBG Mobile', item: '/games/pubg-mobile' },
        ]}
      />

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden border border-[#192434] bg-[#0A0E16] shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#00FF87]/10 border border-[#00FF87]/30 text-xs font-mono font-bold text-[#00FF87] uppercase">
              <Compass className="w-3.5 h-3.5" />
              <span>PUBG Mobile · Season 3.7 Esports Meta</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              {language === 'ru' ? 'PUBG Mobile: Чувствительность и гироскоп' : 'PUBG Mobile: Sensitivity & Gyroscope'}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              {language === 'ru'
                ? 'Контроль отдачи M416, Beryl M762 и снайперских винтовок DMR. Полная калибровка гироскопа 300-400% и готовый турнирный код раскладки под 4 пальца.'
                : 'Recoil stabilization for M416 and Beryl M762. Calibrated 300-400% full gyroscope curves and verified 4-finger claw layout codes.'}
            </p>

            {/* Layout Code Box */}
            <div className="p-3 rounded-xl bg-[#0F141F] border border-[#182333] flex items-center justify-between gap-3 max-w-md">
              <div className="flex items-center gap-2 font-mono text-xs text-white">
                <Code className="w-4 h-4 text-[#00FF87]" />
                <span>{settings.layoutCode}</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 bg-[#00FF87] text-[#05070A] font-bold text-xs rounded-md flex items-center gap-1 hover:bg-[#10E760] transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? (language === 'ru' ? 'Скопировано' : 'Copied') : (language === 'ru' ? 'Копировать код' : 'Copy Code')}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 h-56 sm:h-72 lg:h-full lg:min-h-[340px] relative overflow-hidden bg-[#0F141F]">
            <img
              src="/src/assets/images/game_pubg_mobile_1793642582783.jpg"
              alt="PUBG Mobile Hero"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#0A0E16] via-transparent to-transparent" />
          </div>
        </div>
      </div>

      {/* Tabs and Sliders Box */}
      <div className="rounded-2xl bg-[#0B0F16] border border-[#192332] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#16202C] pb-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('gyro')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'gyro' ? 'bg-[#00FF87] text-[#05070A]' : 'text-slate-400 hover:text-white bg-[#101622]'
              }`}
            >
              {language === 'ru' ? 'Гироскоп (300-400%)' : 'Gyroscope (300-400%)'}
            </button>
            <button
              onClick={() => setActiveTab('ads')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'ads' ? 'bg-[#00FF87] text-[#05070A]' : 'text-slate-400 hover:text-white bg-[#101622]'
              }`}
            >
              {language === 'ru' ? 'ADS Стрельба (Спрей)' : 'ADS Firing (Recoil)'}
            </button>
            <button
              onClick={() => setActiveTab('camera')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'camera' ? 'bg-[#00FF87] text-[#05070A]' : 'text-slate-400 hover:text-white bg-[#101622]'
              }`}
            >
              {language === 'ru' ? 'Камера (Обзор)' : 'Camera (Free Look)'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="px-3.5 py-1.5 text-xs font-bold text-[#00FF87] bg-[#00FF87]/10 hover:bg-[#00FF87]/20 border border-[#00FF87]/30 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? t('btn_copied') : t('btn_copy_all')}</span>
            </button>
            <button
              onClick={handleSave}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-200 bg-[#121824] hover:bg-[#1A2333] border border-[#1E2838] rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#00FF87]" />
              <span>{savedSuccess ? t('btn_saved_success') : t('btn_save')}</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'gyro' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">Гироскоп: 3X Прицел</span>
                <span className="font-mono text-[#00FF87]">{settings.gyro3x}%</span>
              </div>
              <input
                type="range"
                min="100"
                max="400"
                value={settings.gyro3x}
                onChange={(e) => setSettings({ ...settings, gyro3x: Number(e.target.value) })}
                className="w-full accent-[#00FF87]"
              />
              <div className="text-[11px] text-slate-400">Основной прицел для спрея M416 на 100м</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">Гироскоп: 4X Прицел</span>
                <span className="font-mono text-[#00FF87]">{settings.gyro4x}%</span>
              </div>
              <input
                type="range"
                min="100"
                max="400"
                value={settings.gyro4x}
                onChange={(e) => setSettings({ ...settings, gyro4x: Number(e.target.value) })}
                className="w-full accent-[#00FF87]"
              />
              <div className="text-[11px] text-slate-400">Тапы с винтовок Mini14 / SLR / DP-28</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">Гироскоп: 6X Прицел (снижен до 3X)</span>
                <span className="font-mono text-[#00FF87]">{settings.gyro6x}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="300"
                value={settings.gyro6x}
                onChange={(e) => setSettings({ ...settings, gyro6x: Number(e.target.value) })}
                className="w-full accent-[#00FF87]"
              />
              <div className="text-[11px] text-slate-400">Спрей на дальнюю дистанцию без срывов</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">Гироскоп: Red Dot / Коллиматор</span>
                <span className="font-mono text-[#00FF87]">{settings.gyroRedDot}%</span>
              </div>
              <input
                type="range"
                min="150"
                max="400"
                value={settings.gyroRedDot}
                onChange={(e) => setSettings({ ...settings, gyroRedDot: Number(e.target.value) })}
                className="w-full accent-[#00FF87]"
              />
              <div className="text-[11px] text-slate-400">Резкие развороты в ближнем бою</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">Гироскоп: Без прицела</span>
                <span className="font-mono text-[#00FF87]">{settings.gyroNoScope}%</span>
              </div>
              <input
                type="range"
                min="150"
                max="400"
                value={settings.gyroNoScope}
                onChange={(e) => setSettings({ ...settings, gyroNoScope: Number(e.target.value) })}
                className="w-full accent-[#00FF87]"
              />
              <div className="text-[11px] text-slate-400">Стрельба от бедра и резкий вход в укрытие</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">Гироскоп: 8X Снайпер</span>
                <span className="font-mono text-[#00FF87]">{settings.gyro8x}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="150"
                value={settings.gyro8x}
                onChange={(e) => setSettings({ ...settings, gyro8x: Number(e.target.value) })}
                className="w-full accent-[#00FF87]"
              />
              <div className="text-[11px] text-slate-400">Плавное наведение для AWM / M24</div>
            </div>
          </div>
        )}

        {activeTab === 'ads' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">ADS: 3X Прицел</span>
                <span className="font-mono text-[#00FF87]">{settings.ads3x}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={settings.ads3x}
                onChange={(e) => setSettings({ ...settings, ads3x: Number(e.target.value) })}
                className="w-full accent-[#00FF87]"
              />
            </div>
            <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">ADS: Red Dot</span>
                <span className="font-mono text-[#00FF87]">{settings.adsRedDot}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                value={settings.adsRedDot}
                onChange={(e) => setSettings({ ...settings, adsRedDot: Number(e.target.value) })}
                className="w-full accent-[#00FF87]"
              />
            </div>
            <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">ADS: 4X Прицел</span>
                <span className="font-mono text-[#00FF87]">{settings.ads4x}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={settings.ads4x}
                onChange={(e) => setSettings({ ...settings, ads4x: Number(e.target.value) })}
                className="w-full accent-[#00FF87]"
              />
            </div>
          </div>
        )}

        {activeTab === 'camera' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">Камера: Без прицела</span>
                <span className="font-mono text-[#00FF87]">{settings.cameraNoScope}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="200"
                value={settings.cameraNoScope}
                onChange={(e) => setSettings({ ...settings, cameraNoScope: Number(e.target.value) })}
                className="w-full accent-[#00FF87]"
              />
            </div>
            <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">Камера: Red Dot</span>
                <span className="font-mono text-[#00FF87]">{settings.cameraRedDot}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={settings.cameraRedDot}
                onChange={(e) => setSettings({ ...settings, cameraRedDot: Number(e.target.value) })}
                className="w-full accent-[#00FF87]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Ad slot */}
      <AdBannerSlot slotId="pubg-bottom" format="horizontal" />
    </div>
  );
};
