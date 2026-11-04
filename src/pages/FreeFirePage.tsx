import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';
import { FreeFireSettings, PlayStyle, CommunitySubmission, DeviceSpec, DeviceBrand } from '../types';
import { DEVICES_DATA, DEVICE_BRANDS } from '../data/devices';
import { AdBannerSlot } from '../components/common/AdBannerSlot';
import { SEO } from '../components/common/SEO';
import {
  Crosshair,
  Sliders,
  Copy,
  Check,
  Bookmark,
  RotateCcw,
  Zap,
  Flame,
  ArrowRight,
  GitCompare,
  ThumbsUp,
  MessageSquare,
  AlertTriangle,
  Upload,
  UserCheck,
  Smartphone,
  ExternalLink,
  Search,
  Layers,
  Move,
  Target,
  History,
  ShieldAlert,
  Sparkles,
  Info,
  CheckCircle,
  FolderHeart,
} from 'lucide-react';

const FF_BUTTON_STORAGE_KEY = 'gameset_ff_fire_button_size_v2';
const FF_SAVED_PRESET_KEY = 'gameset_ff_user_custom_preset_v2';

export type FreeFireStyle = 'drag' | 'onetap' | 'balanced';
export type FingerCount = '2_fingers' | '3_fingers' | '4_fingers';

export const FreeFirePage: React.FC = () => {
  const { t, language } = useLanguage();
  const { saveSetting, addToHistory, addToCompare, setIsSavedModalOpen } = useFavorites();
  const navigate = useNavigate();

  // Active Navigation Tab
  type FFSection = 'calibrator' | 'fire_button' | 'hud' | 'dpi' | 'devices' | 'community';
  const [activeTab, setActiveTab] = useState<FFSection>('calibrator');

  // Generator & Calibration State
  const [selectedBrand, setSelectedBrand] = useState<DeviceBrand>('POCO');
  const [selectedDevice, setSelectedDevice] = useState<DeviceSpec>(() => {
    return (
      DEVICES_DATA.find((d) => d.brand === 'POCO' && d.model.includes('X6 Pro')) ||
      DEVICES_DATA.find((d) => d.brand === 'POCO') ||
      DEVICES_DATA[0]
    );
  });
  const [ffStyle, setFfStyle] = useState<FreeFireStyle>('drag');
  const [fingerCount, setFingerCount] = useState<FingerCount>('2_fingers');
  const [targetFps, setTargetFps] = useState<'60' | '90' | '120'>('120');

  // Interactive 0–200 Sensitivity Values
  const [general, setGeneral] = useState<number>(188);
  const [redDot, setRedDot] = useState<number>(182);
  const [scope2x, setScope2x] = useState<number>(174);
  const [scope4x, setScope4x] = useState<number>(168);
  const [sniperScope, setSniperScope] = useState<number>(104);
  const [freeLook, setFreeLook] = useState<number>(160);

  // Fire Button State (Range: 1% to 100%, saved to localStorage)
  const [fireButtonSize, setFireButtonSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(FF_BUTTON_STORAGE_KEY);
      if (saved) {
        const val = Number(saved);
        if (!isNaN(val) && val >= 1 && val <= 100) return val;
      }
    } catch {}
    return 44;
  });
  const [fireButtonPosition, setFireButtonPosition] = useState<string>('Нижний правый угол (28-30% высоты)');

  // Fire Button Interactive Test Simulator State
  const [isFlicking, setIsFlicking] = useState(false);
  const [flickScore, setFlickScore] = useState<string | null>(null);

  // DPI state & Graphics
  const [dpiValue, setDpiValue] = useState<number>(440);
  const [graphicPreset, setGraphicPreset] = useState<'Smooth (Ultra FPS)' | 'Standard (High FPS)' | 'Ultra (Max FPS)'>('Smooth (Ultra FPS)');

  // Feedback states
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [compareSuccess, setCompareSuccess] = useState(false);

  // Device Catalog Search & Filter
  const [catalogBrand, setCatalogBrand] = useState<string>('All');
  const [catalogSearch, setCatalogSearch] = useState<string>('');

  // Community Submissions
  const [communityList, setCommunityList] = useState<CommunitySubmission[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  // Report & Comments Modal
  const [reportingSubId, setReportingSubId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const [commentingSub, setCommentingSub] = useState<CommunitySubmission | null>(null);
  const [subComments, setSubComments] = useState<any[]>([]);
  const [newCommentAuthor, setNewCommentAuthor] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  // Local preset history (last viewed/generated presets)
  const [recentFFPresets, setRecentFFPresets] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('gameset_ff_recent_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Persist Fire Button Size whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(FF_BUTTON_STORAGE_KEY, String(fireButtonSize));
    } catch {}
  }, [fireButtonSize]);

  // Load verified community presets on mount
  useEffect(() => {
    fetchCommunityPresets();
  }, []);

  const fetchCommunityPresets = async () => {
    try {
      setLoadingCommunity(true);
      const res = await fetch('/api/submissions?gameId=free-fire&status=approved');
      if (res.ok) {
        const data = await res.json();
        setCommunityList(data);
      }
    } catch (err) {
      console.error('Failed to load community presets', err);
    } finally {
      setLoadingCommunity(false);
    }
  };

  // Algorithmic Calibration Generator: Calculates exact values per device touch sensor & style
  const calculateCalibration = (
    dev: DeviceSpec,
    style: FreeFireStyle,
    fingers: FingerCount,
    fps: '60' | '90' | '120'
  ) => {
    // 1. Base values by style (0-200 scale)
    let baseGen = 188;
    let baseRedDot = 182;
    let base2x = 172;
    let base4x = 164;
    let baseSniper = 100;
    let baseFreeLook = 160;
    let baseButton = 44;

    if (style === 'drag') {
      // Fast vertical flick
      baseGen = 194;
      baseRedDot = 190;
      base2x = 178;
      base4x = 168;
      baseSniper = 104;
      baseFreeLook = 170;
      baseButton = 42;
    } else if (style === 'onetap') {
      // M1887 / Desert Eagle shotgun flick
      baseGen = 190;
      baseRedDot = 196;
      base2x = 174;
      base4x = 160;
      baseSniper = 92;
      baseFreeLook = 175;
      baseButton = 40;
    } else {
      // Balanced tracking
      baseGen = 180;
      baseRedDot = 174;
      base2x = 166;
      base4x = 156;
      baseSniper = 96;
      baseFreeLook = 150;
      baseButton = 48;
    }

    // 2. Hardware adjustment based on Touch Sampling Rate
    // High touch rate (>= 480Hz) means screen receives finger input instantly; slightly lower sens prevents overshooting
    if (dev.touchSamplingRate >= 480) {
      baseGen -= 8;
      baseRedDot -= 6;
      base2x -= 4;
    } else if (dev.touchSamplingRate <= 180) {
      // Low touch rate (budget sensor) needs higher sensitivity to overcome touch lag
      baseGen += 8;
      baseRedDot += 6;
      base2x += 5;
    }

    // 3. Screen refresh rate adjustment
    if (dev.refreshRate === 60 && fps === '60') {
      baseGen += 6;
      baseRedDot += 4;
    } else if (dev.refreshRate >= 120) {
      baseGen -= 3;
    }

    // 4. Screen Size and Fire Button
    // Parse screen diagonal (e.g. 6.67" -> 6.67)
    const matchSize = dev.screenSize.match(/(\d+\.?\d*)/);
    const diag = matchSize ? parseFloat(matchSize[1]) : 6.67;

    if (diag < 6.3) {
      // Small screen: button must be smaller to allow upward drag room
      baseButton = Math.min(baseButton, 42);
    } else if (diag >= 6.7) {
      // Large screen: button can be slightly larger for tactile ease
      baseButton = Math.max(baseButton, 46);
    }

    // 5. Finger Count layout adjustments
    if (fingers === '3_fingers') {
      baseButton = Math.max(38, baseButton - 2);
    } else if (fingers === '4_fingers') {
      baseButton = Math.max(36, baseButton - 4);
    }

    // 6. Safe clamp to strict 0-200 & 1-100 limits
    const clamp200 = (v: number) => Math.max(0, Math.min(200, Math.round(v)));
    const clamp100 = (v: number) => Math.max(1, Math.min(100, Math.round(v)));

    const calGen = clamp200(baseGen);
    const calRed = clamp200(baseRedDot);
    const cal2x = clamp200(base2x);
    const cal4x = clamp200(base4x);
    const calSniper = clamp200(baseSniper);
    const calFree = clamp200(baseFreeLook);
    const calButton = clamp100(baseButton);

    // DPI recommendations
    let recDpi = 440;
    if (dev.brand === 'Apple') {
      recDpi = 0; // iOS native
    } else if (dev.brand === 'Samsung') {
      recDpi = 450;
    } else if (dev.brand === 'POCO' || dev.brand === 'Xiaomi' || dev.brand === 'Redmi') {
      recDpi = 460;
    } else if (dev.brand === 'Realme' || dev.brand === 'OnePlus') {
      recDpi = 430;
    }

    return {
      general: calGen,
      redDot: calRed,
      scope2x: cal2x,
      scope4x: cal4x,
      sniperScope: calSniper,
      freeLook: calFree,
      fireButtonSize: calButton,
      dpi: recDpi,
      notes: `Калибровка для ${dev.brand} ${dev.model} (${dev.refreshRate}Hz / сенсор ${dev.touchSamplingRate}Hz) под стиль ${
        style === 'drag' ? 'Drag Headshot' : style === 'onetap' ? 'One Tap' : 'Balanced'
      }.`,
    };
  };

  // Handler to apply generated calibration
  const applyCalibration = (dev: DeviceSpec, st: FreeFireStyle, fingers: FingerCount, fps: '60' | '90' | '120') => {
    const result = calculateCalibration(dev, st, fingers, fps);
    setGeneral(result.general);
    setRedDot(result.redDot);
    setScope2x(result.scope2x);
    setScope4x(result.scope4x);
    setSniperScope(result.sniperScope);
    setFreeLook(result.freeLook);
    setFireButtonSize(result.fireButtonSize);
    setDpiValue(result.dpi);

    // Add to recent history
    const historyItem = {
      id: 'ff-' + Date.now(),
      model: dev.model,
      brand: dev.brand,
      style: st,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      general: result.general,
      redDot: result.redDot,
      button: result.fireButtonSize,
      dpi: result.dpi,
    };
    const updatedHistory = [historyItem, ...recentFFPresets.filter((h) => h.model !== dev.model)].slice(0, 5);
    setRecentFFPresets(updatedHistory);
    try {
      localStorage.setItem('gameset_ff_recent_history', JSON.stringify(updatedHistory));
    } catch {}
  };

  // Apply device selection
  const handleSelectDevice = (dev: DeviceSpec) => {
    setSelectedBrand(dev.brand);
    setSelectedDevice(dev);
    applyCalibration(dev, ffStyle, fingerCount, targetFps);
  };

  // Filtered devices list for dropdown & catalog
  const filteredCatalogDevices = useMemo(() => {
    return DEVICES_DATA.filter((d) => {
      if (catalogBrand !== 'All' && d.brand !== catalogBrand) return false;
      if (catalogSearch.trim()) {
        const q = catalogSearch.toLowerCase();
        return d.model.toLowerCase().includes(q) || d.brand.toLowerCase().includes(q) || d.chipset.toLowerCase().includes(q);
      }
      return true;
    });
  }, [catalogBrand, catalogSearch]);

  const brandModels = useMemo(() => {
    return DEVICES_DATA.filter((d) => d.brand === selectedBrand);
  }, [selectedBrand]);

  // Safe setter clamped to 0–200
  const clampSens = (val: number) => Math.max(0, Math.min(200, Math.round(val)));

  // Copy full configuration
  const handleCopyAll = () => {
    const text = `=== GAMESET KG: FREE FIRE PRO SETTINGS ===
Устройство: ${selectedDevice.brand} ${selectedDevice.model}
Экран / Сенсор: ${selectedDevice.refreshRate}Hz / ${selectedDevice.touchSamplingRate}Hz
Шкала чувствительности: 0 - 200 (Патч OB48 2026)
----------------------------------------
Обзор (General): ${general} / 200
Красная точка (Red Dot): ${redDot} / 200
Прицел 2X: ${scope2x} / 200
Прицел 4X: ${scope4x} / 200
Снайперский прицел: ${sniperScope} / 200
Свободный обзор: ${freeLook} / 200
----------------------------------------
Размер кнопки огня: ${fireButtonSize}%
Позиция кнопки огня: ${fireButtonPosition}
DPI (Ширина Android): ${dpiValue > 0 ? dpiValue : 'Стандарт iOS'}
Режим графики: ${graphicPreset}
FPS: ${targetFps} FPS
Раскладка: ${fingerCount === '2_fingers' ? '2 пальца' : fingerCount === '3_fingers' ? '3 пальца' : '4 пальца'}
----------------------------------------
Калибровано на платформе GAMESET KG`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Save to Favorites library
  const handleSaveToFavorites = () => {
    const ffSettingsData: FreeFireSettings = {
      general,
      redDot,
      scope2x,
      scope4x,
      sniperScope,
      freeLook,
      fireButtonSize,
      fireButtonPosition,
      dpi: dpiValue,
      graphicPreset,
      highFps: true,
      notes: `Пресет для ${selectedDevice.model} (${ffStyle.toUpperCase()}, 0-200 scale)`,
    };

    const payload = {
      title: `Free Fire: ${selectedDevice.model} (${ffStyle.toUpperCase()})`,
      gameId: 'free-fire' as const,
      brand: selectedDevice.brand,
      model: selectedDevice.model,
      playStyle: ffStyle as PlayStyle,
      data: ffSettingsData,
    };

    saveSetting(payload);
    addToHistory(payload);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2200);
  };

  // Add to Compare
  const handleAddToCompare = () => {
    const ffSettingsData: FreeFireSettings = {
      general,
      redDot,
      scope2x,
      scope4x,
      sniperScope,
      freeLook,
      fireButtonSize,
      fireButtonPosition,
      dpi: dpiValue,
      graphicPreset,
      highFps: true,
      notes: `Сравнение ${selectedDevice.model}`,
    };

    const payload = {
      id: 'ff_compare_' + Date.now(),
      title: `FF: ${selectedDevice.model}`,
      gameId: 'free-fire' as const,
      brand: selectedDevice.brand,
      model: selectedDevice.model,
      playStyle: ffStyle as PlayStyle,
      timestamp: Date.now(),
      data: ffSettingsData,
    };

    addToCompare(payload);
    setCompareSuccess(true);
    setTimeout(() => {
      setCompareSuccess(false);
      navigate('/compare');
    }, 800);
  };

  // Reset to default
  const handleReset = () => {
    applyCalibration(selectedDevice, 'drag', '2_fingers', '120');
  };

  // Upvote submission
  const handleUpvote = async (subId: string) => {
    if (votedIds.has(subId)) return;
    try {
      const res = await fetch(`/api/submissions/${subId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterId: 'client_' + Date.now() }),
      });
      if (res.ok) {
        const data = await res.json();
        setCommunityList((prev) =>
          prev.map((s) => (s.id === subId ? { ...s, upvotes: data.upvotes } : s))
        );
        setVotedIds((prev) => new Set(prev).add(subId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Open comments
  const handleOpenComments = async (sub: CommunitySubmission) => {
    setCommentingSub(sub);
    try {
      const res = await fetch(`/api/submissions/${sub.id}`);
      if (res.ok) {
        const data = await res.json();
        setSubComments(data.comments || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentingSub || !newCommentAuthor.trim() || !newCommentText.trim()) return;
    try {
      const res = await fetch(`/api/submissions/${commentingSub.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: newCommentAuthor.trim(),
          text: newCommentText.trim(),
        }),
      });
      if (res.ok) {
        const added = await res.json();
        setSubComments((prev) => [...prev, added]);
        setNewCommentText('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingSubId || !reportReason.trim()) return;
    try {
      const res = await fetch(`/api/submissions/${reportingSubId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason.trim() }),
      });
      if (res.ok) {
        setReportSuccess(true);
        setTimeout(() => {
          setReportingSubId(null);
          setReportReason('');
          setReportSuccess(false);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Interactive Fire Button Simulator Click Test
  const handleSimulateFlick = () => {
    setIsFlicking(true);
    if (fireButtonSize < 36) {
      setFlickScore('⚠️ Слишком маленькая (возможен срыв пальца мимо кнопки)');
    } else if (fireButtonSize > 56) {
      setFlickScore('⚠️ Слишком большая (не хватает высоты экрана для завершения оттяжки)');
    } else {
      setFlickScore('🎯 Идеальный размер: максимальный запас для вертикальной оттяжки One-Tap!');
    }
    setTimeout(() => {
      setIsFlicking(false);
    }, 700);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <SEO
        title={
          language === 'ru'
            ? 'Free Fire (OB48) — Настройки чувствительности 0–200, кнопка огня 1–100%, HUD и DPI | GAMESET KG'
            : 'Free Fire (OB48) — Sensitivity 0–200, Fire Button 1–100%, HUD & DPI | GAMESET KG'
        }
        description={
          language === 'ru'
            ? 'Профессиональная калибровка Free Fire (OB48 2026): шкала 0–200, точный размер кнопки огня (1–100%), раскладки HUD на 2/3/4 пальца и безопасный DPI для 120+ смартфонов.'
            : 'Professional Free Fire calibration (OB48 2026): 0–200 range, exact fire button slider (1–100%), 2/3/4 finger HUD layouts, and safe DPI tables for 120+ smartphones.'
        }
        keywords="настройки фри фаер 0-200, кнопка огня free fire, чувствительность фри фаер ob48, оттяжка free fire, dpi для free fire, раскладка hud 3 пальца free fire, gameset kg"
        canonicalPath="/games/free-fire"
        ogType="game"
        ogImage="/src/assets/images/game_free_fire_1793642582005.jpg"
        gameData={{
          name: 'Free Fire / FF MAX',
          genre: 'Tactical Battle Royale',
          patchVersion: 'OB48 Spring 2026',
          activePlayers: '350K+ активных игроков',
        }}
        breadcrumbs={[
          { name: language === 'ru' ? 'Главная' : 'Home', item: '/' },
          { name: language === 'ru' ? 'Игры' : 'Games', item: '/games' },
          { name: 'Free Fire', item: '/games/free-fire' },
        ]}
      />

      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden border border-[#192434] bg-[#0A0E16] shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00FF87]/10 border border-[#00FF87]/30 text-xs font-mono font-bold text-[#00FF87] uppercase">
                <Crosshair className="w-3.5 h-3.5" />
                <span>Free Fire & MAX · Патч OB48 2026 · Шкала 0–200</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-[#121926] px-2 py-0.5 rounded border border-[#1A2536]">
                Кнопка огня 1–100%
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              {language === 'ru' ? 'Free Fire: Калибровка и Настройки' : 'Free Fire: Sensitivity & Calibration'}
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              {language === 'ru'
                ? 'Полный инструментарий калибровки чувствительности под официальную шкалу 0–200, интерактивный симулятор кнопки огня (1–100%), киберспортивные раскладки HUD и безопасные значения DPI для вашего смартфона.'
                : 'Complete calibration toolkit under the 0–200 sensitivity scale, interactive fire button simulator (1–100%), competitive HUD layouts, and safe DPI ranges for your smartphone.'}
            </p>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-2.5">
              <button
                onClick={() => setActiveTab('calibrator')}
                className="px-4 py-2.5 bg-[#00FF87] hover:bg-[#10E760] text-[#05070A] font-black text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,135,0.25)] transition-all cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                <span>{language === 'ru' ? 'Генератор и калибратор' : 'Calibrator & Generator'}</span>
              </button>

              <button
                onClick={() => setIsSavedModalOpen(true)}
                className="px-4 py-2.5 bg-[#101622] text-slate-200 border border-[#1C2636] hover:border-[#00FF87]/40 font-bold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
              >
                <FolderHeart className="w-4 h-4 text-[#00FF87]" />
                <span>{language === 'ru' ? 'Мои настройки' : 'My Settings'}</span>
              </button>

              <Link
                to="/submit?game=free-fire"
                className="px-4 py-2.5 bg-[#101622] text-slate-200 border border-[#1C2636] hover:border-[#00FF87]/40 font-bold text-xs rounded-lg flex items-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4 text-[#00FF87]" />
                <span>{language === 'ru' ? 'Предложить пресет' : 'Submit Preset'}</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 h-52 sm:h-64 lg:h-full lg:min-h-[320px] relative overflow-hidden bg-[#0F141F]">
            <img
              src="/src/assets/images/game_free_fire_1793642582005.jpg"
              alt="Free Fire Hero"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#0A0E16] via-transparent to-transparent" />
          </div>
        </div>
      </div>

      {/* Main Sub-Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-[#182332] pb-3 overflow-x-auto text-xs font-bold scrollbar-none">
        {[
          { id: 'calibrator', label: language === 'ru' ? '🎯 Калибратор (0–200)' : '🎯 Calibrator (0–200)' },
          { id: 'fire_button', label: language === 'ru' ? '🔘 Кнопка огня & Симулятор' : '🔘 Fire Button & Test' },
          { id: 'hud', label: language === 'ru' ? '🕹️ Раскладка HUD (2, 3, 4 пальца)' : '🕹️ HUD (2, 3, 4 fingers)' },
          { id: 'dpi', label: language === 'ru' ? '⚡ Настройки DPI' : '⚡ DPI Settings' },
          { id: 'devices', label: language === 'ru' ? '📱 База смартфонов' : '📱 Smartphone Database' },
          { id: 'community', label: language === 'ru' ? '👥 Пресеты игроков' : '👥 Community Presets' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as FFSection)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-[#00FF87] text-[#05070A] font-black shadow-[0_0_12px_rgba(0,255,135,0.25)]'
                : 'bg-[#0F141F] text-slate-400 hover:text-white border border-[#192434]'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: CALIBRATOR & SMARTPHONE GENERATOR */}
      {/* ========================================================= */}
      {activeTab === 'calibrator' && (
        <div className="space-y-8">
          {/* Smart Device Selection & Quick Parameters Generator */}
          <div className="rounded-2xl bg-[#0B0F16] border border-[#192332] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#182332] pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00FF87] font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Алгоритмический генератор чувствительности</span>
                </div>
                <h2 className="text-xl font-black text-white">
                  {language === 'ru' ? 'Генератор настроек под модель смартфона' : 'Device-Specific Sensitivity Generator'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {language === 'ru'
                    ? 'Расчёт коэффициентов сенсора на основе частоты обновления экрана (Hz), дискретизации тач-сенсора и диагонали дисплея.'
                    : 'Sensor ratio calculation based on screen refresh rate (Hz), touch sampling rate, and display dimensions.'}
                </p>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="px-3 py-2 bg-[#121926] hover:bg-[#182233] text-slate-300 border border-[#1E293B] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('btn_reset')}</span>
              </button>
            </div>

            {/* Generator Selection Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Brand */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">1. Производитель (Бренд)</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    const b = e.target.value as DeviceBrand;
                    setSelectedBrand(b);
                    const firstDev = DEVICES_DATA.find((d) => d.brand === b) || DEVICES_DATA[0];
                    setSelectedDevice(firstDev);
                    applyCalibration(firstDev, ffStyle, fingerCount, targetFps);
                  }}
                  className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF87]"
                >
                  {DEVICE_BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Model */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">2. Модель смартфона</label>
                <select
                  value={selectedDevice.id}
                  onChange={(e) => {
                    const dev = DEVICES_DATA.find((d) => d.id === e.target.value) || selectedDevice;
                    handleSelectDevice(dev);
                  }}
                  className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF87]"
                >
                  {brandModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.model}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Style */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">3. Стиль стрельбы</label>
                <select
                  value={ffStyle}
                  onChange={(e) => {
                    const st = e.target.value as FreeFireStyle;
                    setFfStyle(st);
                    applyCalibration(selectedDevice, st, fingerCount, targetFps);
                  }}
                  className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF87]"
                >
                  <option value="drag">Оттяжка (Drag Headshot)</option>
                  <option value="onetap">One-Tap (M1887 / Desert Eagle)</option>
                  <option value="balanced">Сбалансированный (Универсал)</option>
                </select>
              </div>

              {/* 4. Finger layout */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">4. Количество пальцев</label>
                <select
                  value={fingerCount}
                  onChange={(e) => {
                    const f = e.target.value as FingerCount;
                    setFingerCount(f);
                    applyCalibration(selectedDevice, ffStyle, f, targetFps);
                  }}
                  className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF87]"
                >
                  <option value="2_fingers">2 пальца (Классика)</option>
                  <option value="3_fingers">3 пальца (Полупро)</option>
                  <option value="4_fingers">4 пальца (Турнирный)</option>
                </select>
              </div>
            </div>

            {/* Device Hardware Spec Bar */}
            <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#00FF87]" />
                  <span>{selectedDevice.brand} {selectedDevice.model}</span>
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">Экран: <strong>{selectedDevice.refreshRate} Hz</strong></span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">Сенсор: <strong>{selectedDevice.touchSamplingRate} Hz Touch</strong></span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">Диагональ: <strong>{selectedDevice.screenSize}</strong></span>
              </div>

              <div className="text-[11px] font-mono text-[#00FF87] bg-[#00FF87]/10 px-2.5 py-1 rounded border border-[#00FF87]/20">
                Калибровка сенсора активна
              </div>
            </div>
          </div>

          {/* Interactive Sensitivity Controls (Strictly 0–200 Range) */}
          <div className="rounded-2xl bg-[#0B0F16] border border-[#192332] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#182332] pb-4">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#00FF87]" />
                  <span>Калибровка чувствительности (Шкала 0 – 200)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Каждый параметр можно настраивать ползунком от 0 до 200 или вводить точное число в поле справа.
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-[#00FF87] px-2.5 py-1 rounded bg-[#00FF87]/10 border border-[#00FF87]/30 self-start sm:self-auto">
                0 – 200 Calibrated
              </span>
            </div>

            {/* 6 Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* 1. General */}
              <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Обзор (General)</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={200}
                      value={general}
                      onChange={(e) => setGeneral(clampSens(Number(e.target.value)))}
                      className="w-16 px-2 py-1 bg-[#090C12] border border-[#1E293B] rounded text-right font-mono font-bold text-sm text-[#00FF87] focus:border-[#00FF87] focus:outline-none"
                    />
                    <span className="text-[11px] font-mono text-slate-500">/200</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={general}
                  onChange={(e) => setGeneral(clampSens(Number(e.target.value)))}
                  className="w-full accent-[#00FF87] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Вращение камеры и разворот 360°</span>
                  <span className="font-mono text-[10px] text-slate-500">0 – 200</span>
                </div>
              </div>

              {/* 2. Red Dot */}
              <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Красная точка (Red Dot)</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={200}
                      value={redDot}
                      onChange={(e) => setRedDot(clampSens(Number(e.target.value)))}
                      className="w-16 px-2 py-1 bg-[#090C12] border border-[#1E293B] rounded text-right font-mono font-bold text-sm text-[#00FF87] focus:border-[#00FF87] focus:outline-none"
                    />
                    <span className="text-[11px] font-mono text-slate-500">/200</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={redDot}
                  onChange={(e) => setRedDot(clampSens(Number(e.target.value)))}
                  className="w-full accent-[#00FF87] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Физика оттяжки One-Tap в голову</span>
                  <span className="font-mono text-[10px] text-slate-500">0 – 200</span>
                </div>
              </div>

              {/* 3. Scope 2X */}
              <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Прицел 2X</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={200}
                      value={scope2x}
                      onChange={(e) => setScope2x(clampSens(Number(e.target.value)))}
                      className="w-16 px-2 py-1 bg-[#090C12] border border-[#1E293B] rounded text-right font-mono font-bold text-sm text-[#00FF87] focus:border-[#00FF87] focus:outline-none"
                    />
                    <span className="text-[11px] font-mono text-slate-500">/200</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={scope2x}
                  onChange={(e) => setScope2x(clampSens(Number(e.target.value)))}
                  className="w-full accent-[#00FF87] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Средняя дистанция (SCAR / M4A1)</span>
                  <span className="font-mono text-[10px] text-slate-500">0 – 200</span>
                </div>
              </div>

              {/* 4. Scope 4X */}
              <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Прицел 4X</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={200}
                      value={scope4x}
                      onChange={(e) => setScope4x(clampSens(Number(e.target.value)))}
                      className="w-16 px-2 py-1 bg-[#090C12] border border-[#1E293B] rounded text-right font-mono font-bold text-sm text-[#00FF87] focus:border-[#00FF87] focus:outline-none"
                    />
                    <span className="text-[11px] font-mono text-slate-500">/200</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={scope4x}
                  onChange={(e) => setScope4x(clampSens(Number(e.target.value)))}
                  className="w-full accent-[#00FF87] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Дальняя дистанция (SVD / Woodpecker)</span>
                  <span className="font-mono text-[10px] text-slate-500">0 – 200</span>
                </div>
              </div>

              {/* 5. Sniper Scope */}
              <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Снайперский прицел</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={200}
                      value={sniperScope}
                      onChange={(e) => setSniperScope(clampSens(Number(e.target.value)))}
                      className="w-16 px-2 py-1 bg-[#090C12] border border-[#1E293B] rounded text-right font-mono font-bold text-sm text-[#00FF87] focus:border-[#00FF87] focus:outline-none"
                    />
                    <span className="text-[11px] font-mono text-slate-500">/200</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={sniperScope}
                  onChange={(e) => setSniperScope(clampSens(Number(e.target.value)))}
                  className="w-full accent-[#00FF87] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Микроконтроль AWM / M82B / Kar98k</span>
                  <span className="font-mono text-[10px] text-slate-500">0 – 200</span>
                </div>
              </div>

              {/* 6. Free Look */}
              <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Свободный обзор</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={200}
                      value={freeLook}
                      onChange={(e) => setFreeLook(clampSens(Number(e.target.value)))}
                      className="w-16 px-2 py-1 bg-[#090C12] border border-[#1E293B] rounded text-right font-mono font-bold text-sm text-[#00FF87] focus:border-[#00FF87] focus:outline-none"
                    />
                    <span className="text-[11px] font-mono text-slate-500">/200</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={freeLook}
                  onChange={(e) => setFreeLook(clampSens(Number(e.target.value)))}
                  className="w-full accent-[#00FF87] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Кнопка глаза при спринте</span>
                  <span className="font-mono text-[10px] text-slate-500">0 – 200</span>
                </div>
              </div>
            </div>

            {/* Action Bar (Copy, Save, Compare, My Settings) */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-[#182332]">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleCopyAll}
                  className="px-5 py-2.5 bg-[#00FF87] hover:bg-[#10E760] text-[#05070A] font-black text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,255,135,0.25)] cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Скопировано в буфер!' : 'Скопировать все настройки'}</span>
                </button>

                <button
                  onClick={handleSaveToFavorites}
                  className="px-4 py-2.5 bg-[#101622] hover:bg-[#16202E] text-slate-200 border border-[#1C2636] font-bold text-xs rounded-lg flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Bookmark className="w-4 h-4 text-[#00FF87]" />
                  <span>{savedSuccess ? 'Сохранено в библиотеку!' : 'Сохранить в избранное'}</span>
                </button>

                <button
                  onClick={handleAddToCompare}
                  className="px-4 py-2.5 bg-[#101622] hover:bg-[#16202E] text-slate-200 border border-[#1C2636] font-bold text-xs rounded-lg flex items-center gap-2 transition-all cursor-pointer"
                >
                  <GitCompare className="w-4 h-4 text-[#00FF87]" />
                  <span>{compareSuccess ? 'Добавлено!' : 'Сравнить пресет'}</span>
                </button>
              </div>

              <button
                onClick={() => setIsSavedModalOpen(true)}
                className="text-xs font-bold text-[#00FF87] hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <FolderHeart className="w-4 h-4" />
                <span>Открыть «Мои настройки»</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: FIRE BUTTON & INTERACTIVE SIMULATOR (1% - 100%) */}
      {/* ========================================================= */}
      {activeTab === 'fire_button' && (
        <div className="space-y-8">
          <div className="rounded-2xl bg-[#0B0F16] border border-[#192332] p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#182332] pb-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00FF87] font-bold uppercase tracking-wider mb-1">
                <Target className="w-3.5 h-3.5" />
                <span>Геометрия и физика кнопки огня (1% – 100%)</span>
              </div>
              <h2 className="text-xl font-black text-white">
                {language === 'ru' ? 'Калибровка и Симулятор кнопки огня' : 'Fire Button Size & Drag Simulator'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'ru'
                  ? 'Диапазон размера от 1% до 100%. Настройте точный диаметр и проверьте ход пальца в интерактивном симуляторе оттяжки.'
                  : 'Size range strictly from 1% to 100%. Fine-tune the diameter and test your upward flick in the simulator.'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Sliders & Numeric Inputs */}
              <div className="lg:col-span-7 space-y-6">
                {/* Fire Button Size Slider */}
                <div className="p-5 rounded-xl bg-[#0F141F] border border-[#182333] space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-bold text-white">Размер кнопки огня</div>
                      <div className="text-xs text-slate-400">Шкала: 1% – 100% (Сохраняется автоматически)</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={fireButtonSize}
                        onChange={(e) => {
                          const val = Math.max(1, Math.min(100, Number(e.target.value)));
                          setFireButtonSize(val);
                        }}
                        className="w-16 px-2.5 py-1.5 bg-[#090C12] border border-[#1E293B] rounded text-right font-mono font-black text-lg text-[#00FF87] focus:border-[#00FF87] focus:outline-none"
                      />
                      <span className="text-sm font-mono font-bold text-[#00FF87]">%</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={fireButtonSize}
                    onChange={(e) => setFireButtonSize(Number(e.target.value))}
                    className="w-full accent-[#00FF87] cursor-pointer h-2 bg-[#16202C] rounded-lg"
                  />

                  {/* Size recommendations markers */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-center pt-2">
                    <div
                      onClick={() => setFireButtonSize(42)}
                      className="p-2 rounded bg-[#0A0D14] border border-[#182333] hover:border-[#00FF87]/50 cursor-pointer transition-colors"
                    >
                      <div className="font-bold text-[#00FF87]">40% – 44%</div>
                      <div className="text-slate-400 text-[10px]">Экраны 6.1"–6.4" (iPhone / S24)</div>
                    </div>

                    <div
                      onClick={() => setFireButtonSize(46)}
                      className="p-2 rounded bg-[#0A0D14] border border-[#182333] hover:border-[#00FF87]/50 cursor-pointer transition-colors"
                    >
                      <div className="font-bold text-[#00FF87]">45% – 50%</div>
                      <div className="text-slate-400 text-[10px]">Экраны 6.67" (POCO / Redmi)</div>
                    </div>

                    <div
                      onClick={() => setFireButtonSize(52)}
                      className="p-2 rounded bg-[#0A0D14] border border-[#182333] hover:border-[#00FF87]/50 cursor-pointer transition-colors"
                    >
                      <div className="font-bold text-[#00FF87]">51% – 56%</div>
                      <div className="text-slate-400 text-[10px]">Экраны 6.8"+ (Ultra / Pro Max)</div>
                    </div>
                  </div>
                </div>

                {/* Fire Button Position & Height */}
                <div className="p-5 rounded-xl bg-[#0F141F] border border-[#182333] space-y-3">
                  <div className="text-sm font-bold text-white">Рекомендуемое расположение кнопки</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-[#0A0D14] border border-[#16202C] space-y-1">
                      <div className="text-slate-400">По высоте экрана:</div>
                      <div className="text-[#00FF87] font-bold">25% – 30% снизу</div>
                      <div className="text-[11px] text-slate-500">
                        Оставляет максимум пространства для вертикального свайпа вверх
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0A0D14] border border-[#16202C] space-y-1">
                      <div className="text-slate-400">По горизонтали:</div>
                      <div className="text-[#00FF87] font-bold">Правый край (18% – 22%)</div>
                      <div className="text-[11px] text-slate-500">
                        Естественное положение большого пальца правой руки
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Smartphone Screen & Click Test */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-[340px] aspect-[9/16] bg-[#05070A] border-4 border-[#1C2534] rounded-3xl p-4 relative shadow-2xl overflow-hidden flex flex-col justify-between">
                  {/* Top phone bezel indicator */}
                  <div className="w-20 h-3 bg-[#1C2534] rounded-full mx-auto" />

                  {/* Simulator Screen Center Feedback */}
                  <div className="text-center space-y-2 py-4">
                    <div className="text-[10px] font-mono uppercase text-slate-500">Симулятор сенсора смартфона</div>
                    <div className="text-xs font-bold text-slate-300">Нажмите на кнопку огня для проверки оттяжки:</div>

                    {flickScore && (
                      <div className="p-2 rounded bg-black/60 border border-[#00FF87]/40 text-[#00FF87] text-[11px] font-bold animate-in fade-in">
                        {flickScore}
                      </div>
                    )}
                  </div>

                  {/* Fire Button container at bottom-right */}
                  <div className="relative h-44 flex items-end justify-end p-2">
                    {/* Swipe upward guide arrow */}
                    <div className="absolute right-12 bottom-20 flex flex-col items-center text-[#00FF87] opacity-60 pointer-events-none">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider mb-1">One-Tap Swipe</div>
                      <div className="w-0.5 h-16 bg-gradient-to-t from-[#00FF87] to-transparent" />
                      <div className="w-2 h-2 border-t-2 border-l-2 border-[#00FF87] -rotate-45" />
                    </div>

                    {/* Interactive Fire Button Element */}
                    <button
                      onClick={handleSimulateFlick}
                      style={{
                        width: `${Math.max(38, Math.min(108, fireButtonSize * 1.1))}px`,
                        height: `${Math.max(38, Math.min(108, fireButtonSize * 1.1))}px`,
                      }}
                      className={`rounded-full border-2 border-[#00FF87] bg-[#00FF87]/20 flex items-center justify-center text-white font-black text-xs transition-all shadow-[0_0_20px_rgba(0,255,135,0.3)] cursor-pointer select-none active:scale-95 ${
                        isFlicking ? 'scale-110 bg-[#00FF87] text-[#05070A] shadow-[0_0_35px_#00FF87]' : ''
                      }`}
                      title="Нажмите для проверки"
                    >
                      <Crosshair className={`w-5 h-5 ${isFlicking ? 'text-[#05070A]' : 'text-[#00FF87]'}`} />
                    </button>
                  </div>
                </div>

                <div className="text-center text-xs text-slate-400 mt-3 font-mono">
                  Текущий размер кнопки: <strong className="text-[#00FF87]">{fireButtonSize}%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 3: HUD LAYOUTS (2, 3, 4 FINGERS) */}
      {/* ========================================================= */}
      {activeTab === 'hud' && (
        <div className="space-y-8">
          <div className="rounded-2xl bg-[#0B0F16] border border-[#192332] p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#182332] pb-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00FF87] font-bold uppercase tracking-wider mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Турнирные раскладки управления</span>
              </div>
              <h2 className="text-xl font-black text-white">
                {language === 'ru' ? 'Настройки HUD: Раскладки на 2, 3 и 4 пальца' : 'HUD Layouts for 2, 3, and 4 Fingers'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'ru'
                  ? 'Оптимальное позиционирование кнопки огня, ледяной стенки Gloo Wall, приседа, прыжка и джойстика.'
                  : 'Competitive button positioning for Gloo Wall, crouch, jump, fire button, and movement joystick.'}
              </p>
            </div>

            {/* Layout Mode Selector */}
            <div className="flex items-center gap-2 p-1.5 bg-[#0F141F] rounded-xl border border-[#1A2536] w-full sm:w-fit text-xs font-bold">
              {[
                { id: '2_fingers', label: '2 пальца (Классика)' },
                { id: '3_fingers', label: '3 пальца (Полупро)' },
                { id: '4_fingers', label: '4 пальца (Киберспорт)' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setFingerCount(m.id as FingerCount)}
                  className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                    fingerCount === m.id
                      ? 'bg-[#00FF87] text-[#05070A] font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Visual HUD Smartphone Map */}
            <div className="relative aspect-[16/9] max-w-4xl mx-auto rounded-2xl bg-[#05070A] border-4 border-[#1C2534] p-4 shadow-2xl overflow-hidden flex flex-col justify-between">
              {/* Screen Top Bar */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-[#16202C] pb-2 font-mono">
                <span>Free Fire HUD Map · {fingerCount === '2_fingers' ? '2 Fingers' : fingerCount === '3_fingers' ? '3 Fingers' : '4 Fingers Claw'}</span>
                <span className="text-[#00FF87]">Resolution Aspect: 20:9</span>
              </div>

              {/* HUD Screen Layout Interactive Elements */}
              <div className="relative flex-1 w-full h-full">
                {/* Joystick (Bottom Left) */}
                <div className="absolute left-6 bottom-6 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-cyan-400/60 bg-cyan-400/10 flex items-center justify-center text-cyan-300 font-mono text-[10px] font-bold">
                    Джойстик
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 mt-1">
                    {fingerCount === '2_fingers' ? '65%' : '50%'}
                  </span>
                </div>

                {/* Medkit & Backpack (Left Edge) */}
                <div className="absolute left-4 top-16 space-y-2">
                  <div className="w-9 h-9 rounded bg-[#1A2536] border border-slate-600 flex items-center justify-center text-[9px] text-slate-300 font-bold">
                    Аптечка
                  </div>
                  <div className="w-9 h-9 rounded bg-[#1A2536] border border-slate-600 flex items-center justify-center text-[9px] text-slate-300 font-bold">
                    Рюкзак
                  </div>
                </div>

                {/* Gloo Wall (Ледяная стенка) */}
                <div
                  className={`absolute transition-all duration-300 ${
                    fingerCount === '4_fingers'
                      ? 'left-8 top-4'
                      : fingerCount === '3_fingers'
                      ? 'left-8 top-4'
                      : 'left-24 bottom-8'
                  }`}
                >
                  <div className="w-14 h-14 rounded-full border-2 border-amber-400 bg-amber-400/20 flex items-center justify-center text-amber-300 text-[10px] font-bold shadow-lg">
                    Стенка
                  </div>
                  <div className="text-[9px] font-mono text-center text-amber-400 mt-0.5">
                    {fingerCount === '2_fingers' ? 'Большой палец' : 'Указательный L'}
                  </div>
                </div>

                {/* Scope (Прицел) */}
                <div className="absolute right-24 bottom-14">
                  <div className="w-12 h-12 rounded-full border-2 border-cyan-400 bg-cyan-400/20 flex items-center justify-center text-cyan-300 text-[10px] font-bold">
                    Прицел
                  </div>
                </div>

                {/* Jump & Crouch (Прыжок и Присед) */}
                <div
                  className={`absolute space-y-2 transition-all duration-300 ${
                    fingerCount === '4_fingers' ? 'right-6 top-4' : 'right-4 bottom-28'
                  }`}
                >
                  <div className="w-11 h-11 rounded-full border-2 border-purple-400 bg-purple-400/20 flex items-center justify-center text-purple-300 text-[10px] font-bold">
                    Прыжок
                  </div>
                  <div className="w-11 h-11 rounded-full border-2 border-purple-400 bg-purple-400/20 flex items-center justify-center text-purple-300 text-[10px] font-bold">
                    Присед
                  </div>
                </div>

                {/* Main Fire Button (Bottom Right) */}
                <div className="absolute right-8 bottom-6 flex flex-col items-center">
                  <div
                    style={{ width: `${fireButtonSize + 10}px`, height: `${fireButtonSize + 10}px` }}
                    className="rounded-full border-2 border-[#00FF87] bg-[#00FF87]/20 flex items-center justify-center text-[#00FF87] font-black text-[10px] shadow-[0_0_15px_rgba(0,255,135,0.4)]"
                  >
                    Огонь
                  </div>
                  <span className="text-[9px] font-mono text-[#00FF87] mt-1">{fireButtonSize}%</span>
                </div>
              </div>

              {/* Legend Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#16202C] text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00FF87]" /> Кнопка огня ({fireButtonSize}%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Ледяная стенка
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Прыжок / Присед
                  </span>
                </div>
                <span>Прозрачность кнопок: <strong>70% – 85%</strong></span>
              </div>
            </div>

            {/* Tactical Explanations Table */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2 text-xs">
                <div className="font-bold text-white text-sm">2 Пальца (Классика)</div>
                <p className="text-slate-400 leading-relaxed">
                  Простая и привычная раскладка. Большой палец правой руки отвечает за прицеливание, стрельбу и прыжок. Рекомендуемый размер кнопки огня: <strong>46% – 50%</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2 text-xs">
                <div className="font-bold text-white text-sm">3 Пальца (Быстрая стенка)</div>
                <p className="text-slate-400 leading-relaxed">
                  Левый указательный палец ставит стенку или прыгает в верхнем левом углу. Скорость реакции в перестрелке увеличивается в 2 раза. Кнопка огня: <strong>42% – 46%</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2 text-xs">
                <div className="font-bold text-white text-sm">4 Пальца (Турнирный Claw)</div>
                <p className="text-slate-400 leading-relaxed">
                  Киберспортивный стандарт: одновременный прыжок, присед, постановка стенки и вертикальная оттяжка без задержки. Кнопка огня: <strong>40% – 44%</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 4: DPI SETTINGS & ADVISORY */}
      {/* ========================================================= */}
      {activeTab === 'dpi' && (
        <div className="space-y-8">
          <div className="rounded-2xl bg-[#0B0F16] border border-[#192332] p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#182332] pb-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00FF87] font-bold uppercase tracking-wider mb-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Системный множитель Android / iOS</span>
              </div>
              <h2 className="text-xl font-black text-white">
                {language === 'ru' ? 'Рекомендации по DPI и чувствительности сенсора' : 'DPI Recommendations & Touch Guide'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'ru'
                  ? 'DPI (Минимальная ширина) настраивается в параметрах разработчика Android для увеличения скорости свайпа.'
                  : 'DPI (Smallest width) is configured in Android Developer Options to increase flick travel speed.'}
              </p>
            </div>

            {/* Critical Android Warning Banner */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
              <div className="font-bold flex items-center gap-2 text-amber-400 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Внимание: Изменение DPI влияет на весь интерфейс Android!</span>
              </div>
              <p className="leading-relaxed text-slate-300">
                1. DPI (Минимальная ширина) изменяет масштаб системных шрифтов, иконок и клавиатуры.
                <br />
                2. <strong>Никогда не ставьте DPI выше 520 на смартфонах Xiaomi / POCO / Redmi</strong> — это может привести к циклической перезагрузке (Bootloop) оболочки HyperOS / MIUI!
                <br />
                3. Рекомендованные значения ниже являются безопасными киберспортивными ориентирами, а не официальной настройкой Free Fire.
              </p>
            </div>

            {/* DPI Table by Smartphone Brand */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Безопасные диапазоны DPI по брендам:
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                  <div className="flex justify-between font-bold text-white">
                    <span>POCO / Xiaomi / Redmi</span>
                    <span className="text-[#00FF87] font-mono">440 – 480 DPI</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Базовый: 392 DPI. Максимальный безопасный предел: <strong>490 DPI</strong>. Не превышайте 500!
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                  <div className="flex justify-between font-bold text-white">
                    <span>Samsung Galaxy (A / S)</span>
                    <span className="text-[#00FF87] font-mono">430 – 460 DPI</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Базовый: 411 DPI. One UI стабильно работает на 450 DPI без артефактов клавиатуры.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                  <div className="flex justify-between font-bold text-white">
                    <span>Apple iPhone (iOS)</span>
                    <span className="text-cyan-300 font-mono">Стандарт iOS</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    В iOS DPI не меняется. Рекомендуется настроить «Скорость движения указателя» и 3D Haptic Touch.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                  <div className="flex justify-between font-bold text-white">
                    <span>Realme / OnePlus / OPPO</span>
                    <span className="text-[#00FF87] font-mono">420 – 450 DPI</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Базовый: 360–384 DPI. ColorOS / OxygenOS отлично выдерживают 440 DPI для плавной оттяжки.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                  <div className="flex justify-between font-bold text-white">
                    <span>Tecno / Infinix</span>
                    <span className="text-[#00FF87] font-mono">400 – 430 DPI</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Базовый: 360 DPI. HiOS / XOS: безопасный подъем до 420 DPI для ускорения вертикального свайпа.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                  <div className="flex justify-between font-bold text-white">
                    <span>Google Pixel</span>
                    <span className="text-[#00FF87] font-mono">440 – 470 DPI</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Базовый: 411 DPI. Чистый Android выдерживает 460 DPI без сбоев интерфейса.
                  </div>
                </div>
              </div>
            </div>

            {/* Step by Step Guide: How to enable on Android */}
            <div className="p-5 rounded-xl bg-[#0F141F] border border-[#182333] space-y-3 text-xs">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-[#00FF87]" />
                <span>Как включить DPI на Android (Пошагово):</span>
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                <li>Откройте «Настройки» телефона → «О телефоне».</li>
                <li>Нажмите 7 раз подряд на «Номер сборки» (или версию MIUI/HyperOS), пока не появится «Вы стали разработчиком!».</li>
                <li>Вернитесь в «Настройки» → «Расширенные настройки» (или Система) → «Для разработчиков».</li>
                <li>Найдите пункт <strong>«Минимальная ширина»</strong> (Smallest Width) и запишите исходное значение!</li>
                <li>Установите рекомендуемое значение (например, 440–460) и нажмите ОК.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 5: SMARTPHONE DATABASE WITH SEARCH & 1-CLICK APPLY */}
      {/* ========================================================= */}
      {activeTab === 'devices' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#0B0F16] border border-[#192332] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#182332] pb-4">
              <div>
                <h2 className="text-xl font-black text-white">
                  {language === 'ru' ? 'База смартфонов для Free Fire (120+ моделей)' : 'Smartphone Database for Free Fire'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Выберите вашу модель для мгновенной загрузки рассчитанной калибровки чувствительности и кнопки огня.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Поиск модели (например: X6 Pro, S24, iPhone 15)..."
                  className="w-full pl-9 pr-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF87]"
                />
              </div>
            </div>

            {/* Brand Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs scrollbar-none">
              <button
                onClick={() => setCatalogBrand('All')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  catalogBrand === 'All'
                    ? 'bg-[#00FF87] text-[#05070A]'
                    : 'bg-[#0F141F] text-slate-400 hover:text-white border border-[#192434]'
                }`}
              >
                Все бренды
              </button>
              {DEVICE_BRANDS.map((b) => (
                <button
                  key={b}
                  onClick={() => setCatalogBrand(b)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                    catalogBrand === b
                      ? 'bg-[#00FF87] text-[#05070A]'
                      : 'bg-[#0F141F] text-slate-400 hover:text-white border border-[#192434]'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            {/* Devices Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {filteredCatalogDevices.slice(0, 30).map((dev) => {
                const cal = calculateCalibration(dev, ffStyle, fingerCount, targetFps);
                return (
                  <div
                    key={dev.id}
                    className="p-5 rounded-xl bg-[#0F141F] border border-[#182333] hover:border-[#00FF87]/50 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/30">
                          {dev.brand}
                        </span>
                        <h4 className="font-bold text-white text-sm mt-1">{dev.model}</h4>
                      </div>

                      <div className="text-right text-[11px] font-mono text-slate-400">
                        <div>{dev.refreshRate} Hz</div>
                        <div className="text-[#00FF87]">{dev.touchSamplingRate} Hz Touch</div>
                      </div>
                    </div>

                    {/* Calculated preview */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs p-2 rounded-lg bg-[#090C12] border border-[#16202C]">
                      <div>
                        <div className="text-[10px] text-slate-500">Обзор</div>
                        <div className="font-mono font-bold text-[#00FF87]">{cal.general}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Red Dot</div>
                        <div className="font-mono font-bold text-[#00FF87]">{cal.redDot}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Кнопка</div>
                        <div className="font-mono font-bold text-white">{cal.fireButtonSize}%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#182333]">
                      <span className="text-[11px] text-slate-400 font-mono">
                        DPI: {cal.dpi > 0 ? `${cal.dpi}` : 'iOS Native'}
                      </span>

                      <button
                        onClick={() => {
                          handleSelectDevice(dev);
                          setActiveTab('calibrator');
                        }}
                        className="px-3 py-1.5 bg-[#00FF87] hover:bg-[#10E760] text-[#05070A] font-bold text-xs rounded-md transition-colors cursor-pointer"
                      >
                        Применить
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredCatalogDevices.length > 30 && (
              <div className="text-center text-xs text-slate-500 pt-2 font-mono">
                Показано 30 из {filteredCatalogDevices.length} устройств. Используйте поиск для точной фильтрации.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 6: COMMUNITY SUBMISSIONS (0-200) */}
      {/* ========================================================= */}
      {activeTab === 'community' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#0B0F16] border border-[#192332] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#182332] pb-5">
              <div>
                <div className="text-xs font-mono font-bold text-[#00FF87] uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>Верифицированные турнирные пресеты (OB48 0–200)</span>
                </div>
                <h3 className="text-xl font-black text-white mt-1">
                  {language === 'ru' ? 'Конфигурации игроков и киберспортсменов' : 'Tournament Community Submissions'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Реальные протестированные настройки. Все заявки проходят проверку администрацией.
                </p>
              </div>

              <Link
                to="/submit?game=free-fire"
                className="px-4 py-2.5 bg-[#00FF87] hover:bg-[#10E760] text-[#05070A] font-black text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 shrink-0 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>{language === 'ru' ? 'Предложить свои настройки' : 'Submit Preset'}</span>
              </Link>
            </div>

            {loadingCommunity ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Загрузка турнирных пресетов...
              </div>
            ) : communityList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Пресеты пока не загружены. Будьте первым, кто опубликует свои настройки!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {communityList.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-5 rounded-xl bg-[#0F141F] border border-[#182333] hover:border-[#00FF87]/40 transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{sub.model}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/30">
                            {sub.brand}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Автор: <span className="text-slate-200 font-semibold">{sub.author}</span> · {sub.style}
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00FF87]/15 text-[#00FF87] border border-[#00FF87]/40">
                        0–200 Verified
                      </span>
                    </div>

                    {sub.description && (
                      <p className="text-xs text-slate-300 leading-relaxed italic bg-[#090C12] p-2.5 rounded-lg border border-[#16202C]">
                        «{sub.description}»
                      </p>
                    )}

                    {/* Sensitivities preview */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2 rounded bg-[#090C12] border border-[#182333]">
                        <div className="text-[10px] text-slate-400">General</div>
                        <div className="text-sm font-mono font-bold text-[#00FF87]">
                          {sub.sensitivity?.general ?? '188'}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-[#090C12] border border-[#182333]">
                        <div className="text-[10px] text-slate-400">Red Dot</div>
                        <div className="text-sm font-mono font-bold text-[#00FF87]">
                          {sub.sensitivity?.redDot ?? '182'}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-[#090C12] border border-[#182333]">
                        <div className="text-[10px] text-slate-400">2X Scope</div>
                        <div className="text-sm font-mono font-bold text-[#00FF87]">
                          {sub.sensitivity?.scope2x ?? '174'}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-[#090C12] border border-[#182333]">
                        <div className="text-[10px] text-slate-400">Кнопка</div>
                        <div className="text-sm font-mono font-bold text-white">
                          {sub.sensitivity?.fireButtonSize ?? '44'}%
                        </div>
                      </div>
                    </div>

                    {/* Sub Action bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#182333] text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpvote(sub.id)}
                          disabled={votedIds.has(sub.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${
                            votedIds.has(sub.id)
                              ? 'bg-[#00FF87]/20 border-[#00FF87] text-[#00FF87]'
                              : 'bg-[#121822] border-[#1C2534] text-slate-300 hover:text-white hover:border-[#00FF87]/40'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{sub.upvotes}</span>
                        </button>

                        <button
                          onClick={() => handleOpenComments(sub)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#121822] border border-[#1C2534] text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Отзывы</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setReportingSubId(sub.id);
                            setReportSuccess(false);
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Пожаловаться"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            const copyText = `Free Fire 0-200 (${sub.model}): Обзор ${sub.sensitivity?.general}, RedDot ${sub.sensitivity?.redDot}, 2X ${sub.sensitivity?.scope2x}, Кнопка ${sub.sensitivity?.fireButtonSize}%`;
                            navigator.clipboard.writeText(copyText);
                            alert('Пресет скопирован в буфер!');
                          }}
                          className="px-2.5 py-1.5 bg-[#121822] hover:bg-[#18202D] text-slate-200 border border-[#1C2534] rounded-md font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3 text-[#00FF87]" />
                          <span>Копировать</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent History Bar (Local persistence) */}
      {recentFFPresets.length > 0 && (
        <div className="rounded-xl bg-[#0B0F16] border border-[#192332] p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#00FF87]" />
              <span>Недавно проверенные конфигурации</span>
            </span>
            <button
              onClick={() => {
                setRecentFFPresets([]);
                localStorage.removeItem('gameset_ff_recent_history');
              }}
              className="text-[11px] text-slate-500 hover:text-white"
            >
              Очистить историю
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentFFPresets.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  const dev = DEVICES_DATA.find((d) => d.model === item.model);
                  if (dev) {
                    handleSelectDevice(dev);
                    setActiveTab('calibrator');
                  }
                }}
                className="p-3 rounded-lg bg-[#0F141F] border border-[#182333] hover:border-[#00FF87]/40 cursor-pointer transition-all flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white">{item.model}</div>
                  <div className="text-[11px] text-slate-400">
                    Обзор: <span className="text-[#00FF87]">{item.general}</span> · Кнопка: {item.button}%
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{item.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments Drawer / Modal */}
      {commentingSub &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0B0F16] border border-[#192434] rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-[#16202C] pb-3">
                <div>
                  <h4 className="font-bold text-white text-sm">Отзывы о пресете</h4>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {commentingSub.model} ({commentingSub.author})
                  </div>
                </div>
                <button
                  onClick={() => setCommentingSub(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {subComments.length === 0 ? (
                  <div className="text-xs text-slate-500 py-6 text-center">
                    Пока нет отзывов. Будьте первым!
                  </div>
                ) : (
                  subComments.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg bg-[#0F141F] border border-[#182333] text-xs space-y-1">
                      <div className="flex justify-between font-bold text-slate-300">
                        <span>{c.author}</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendComment} className="pt-3 border-t border-[#16202C] space-y-2">
                <input
                  type="text"
                  placeholder="Ваш никнейм..."
                  value={newCommentAuthor}
                  onChange={(e) => setNewCommentAuthor(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF87]"
                />
                <textarea
                  placeholder="Напишите отзыв о чувствительности..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  required
                  rows={2}
                  className="w-full px-3 py-1.5 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF87]"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-[#00FF87] hover:bg-[#10E760] text-[#05070A] font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Отправить отзыв
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Report Modal */}
      {reportingSubId &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0B0F16] border border-[#192434] rounded-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#16202C] pb-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Пожаловаться на пресет</span>
                </h4>
                <button
                  onClick={() => setReportingSubId(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {reportSuccess ? (
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center font-bold">
                  Жалоба передана модераторам GAMESET KG.
                </div>
              ) : (
                <form onSubmit={handleReport} className="space-y-3">
                  <div className="text-xs text-slate-400">
                    Укажите причину жалобы (неработающие значения, спам, оскорбления):
                  </div>
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    required
                    rows={3}
                    placeholder="Опишите проблему..."
                    className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white focus:outline-none focus:border-rose-400"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                  >
                    Отправить жалобу
                  </button>
                </form>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* Ad slot */}
      <AdBannerSlot slotId="free-fire-bottom" format="horizontal" />
    </div>
  );
};
