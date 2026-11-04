import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';
import { FreeFireSettings, PlayStyle, CommunitySubmission } from '../types';
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
} from 'lucide-react';

const DEFAULT_FF_SETTINGS: FreeFireSettings = {
  general: 180,
  redDot: 172,
  scope2x: 160,
  scope4x: 148,
  sniperScope: 88,
  freeLook: 150,
  fireButtonSize: 46,
  fireButtonPosition: 'Нижний правый угол (28-30% высоты)',
  dpi: 420,
  graphicPreset: 'Standard (High FPS)',
  highFps: true,
  notes: 'Универсальный турнирный пресет (OB48 2026, шкала 0–200)',
};

export const FreeFirePage: React.FC = () => {
  const { t, language } = useLanguage();
  const { saveSetting, addToHistory, addToCompare } = useFavorites();
  const navigate = useNavigate();

  const [style, setStyle] = useState<PlayStyle>('rusher');
  const [settings, setSettings] = useState<FreeFireSettings>({
    general: 194,
    redDot: 188,
    scope2x: 176,
    scope4x: 164,
    sniperScope: 98,
    freeLook: 170,
    fireButtonSize: 44,
    fireButtonPosition: 'Нижний правый угол (28% высоты)',
    dpi: 450,
    graphicPreset: 'Smooth (Ultra FPS)',
    highFps: true,
    notes: 'Максимальная скорость для быстрой оттяжки One-Tap Headshot (0–200 scale)',
  });

  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [compareSuccess, setCompareSuccess] = useState(false);

  // Community submissions
  const [communityList, setCommunityList] = useState<CommunitySubmission[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  // Report modal state
  const [reportingSubId, setReportingSubId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Active comments modal / drawer
  const [commentingSub, setCommentingSub] = useState<CommunitySubmission | null>(null);
  const [subComments, setSubComments] = useState<any[]>([]);
  const [newCommentAuthor, setNewCommentAuthor] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  // Load verified community presets
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
      console.error('Failed to load submissions', err);
    } finally {
      setLoadingCommunity(false);
    }
  };

  const handleStyleChange = (newStyle: PlayStyle) => {
    setStyle(newStyle);
    if (newStyle === 'rusher') {
      setSettings({
        general: 194,
        redDot: 188,
        scope2x: 176,
        scope4x: 164,
        sniperScope: 98,
        freeLook: 170,
        fireButtonSize: 44,
        fireButtonPosition: 'Нижний правый угол (28% высоты)',
        dpi: 450,
        graphicPreset: 'Smooth (Ultra FPS)',
        highFps: true,
        notes: 'Максимальная скорость для агрессивной оттяжки One-Tap Headshot',
      });
    } else if (newStyle === 'sniper') {
      setSettings({
        general: 168,
        redDot: 156,
        scope2x: 144,
        scope4x: 130,
        sniperScope: 76,
        freeLook: 135,
        fireButtonSize: 52,
        fireButtonPosition: 'Правая сторона (35% высоты)',
        dpi: 411,
        graphicPreset: 'Standard (High FPS)',
        highFps: true,
        notes: 'Стабильный микроконтроль для AWM / M82B / Kar98k',
      });
    } else {
      setSettings(DEFAULT_FF_SETTINGS);
    }
  };

  // Safe setter clamped to 0–200
  const updateSens = (field: keyof FreeFireSettings, rawValue: number) => {
    const clamped = Math.max(0, Math.min(200, rawValue));
    setSettings((prev) => ({
      ...prev,
      [field]: clamped,
    }));
  };

  const handleCopyAll = () => {
    const text = `=== GAMESET KG: FREE FIRE PRO SETTINGS ===
Range Scale: 0 - 200 (OB48 2026)
${t('ff_general')}: ${settings.general} / 200
${t('ff_red_dot')}: ${settings.redDot} / 200
${t('ff_scope_2x')}: ${settings.scope2x} / 200
${t('ff_scope_4x')}: ${settings.scope4x} / 200
${t('ff_sniper')}: ${settings.sniperScope} / 200
${t('ff_free_look')}: ${settings.freeLook} / 200
${t('ff_fire_button')}: ${settings.fireButtonSize}%
${t('ff_dpi')}: ${settings.dpi > 0 ? settings.dpi : 'Default iOS'}
${t('ff_graphics')}: ${settings.graphicPreset}
High FPS: Enabled
Verified by GAMESET KG`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    const payload = {
      title: `Free Fire (${style.toUpperCase()}) [0-200]`,
      gameId: 'free-fire' as const,
      brand: 'Universal Android/iOS',
      model: 'Calibrated Custom 0-200',
      playStyle: style,
      data: settings,
    };
    saveSetting(payload);
    addToHistory(payload);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAddToCompare = () => {
    const payload = {
      id: 'ff_custom_' + Date.now(),
      title: `Free Fire (${style.toUpperCase()})`,
      gameId: 'free-fire' as const,
      brand: 'Custom',
      model: 'OB48 Calibrated',
      playStyle: style,
      timestamp: Date.now(),
      data: settings,
    };
    addToCompare(payload);
    setCompareSuccess(true);
    setTimeout(() => {
      setCompareSuccess(false);
      navigate('/compare');
    }, 800);
  };

  const handleReset = () => {
    setSettings(DEFAULT_FF_SETTINGS);
    setStyle('balanced');
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SEO
        title={
          language === 'ru'
            ? 'Free Fire (OB48) — Настройки чувствительности 0–200, оттяжка One-Tap и DPI | GAMESET KG'
            : 'Free Fire (OB48) — Sensitivity 0–200, One-Tap Drag & DPI Settings | GAMESET KG'
        }
        description={
          language === 'ru'
            ? 'Официальная шкала чувствительности 0–200 Free Fire (OB48). Точная оттяжка One-Tap Headshot, размер кнопки огня 42–48%, калибровка DPI для Android и iOS.'
            : 'Calibrated Free Fire sensitivity under official 0–200 scale (OB48). One-tap headshot drag ratios, 42-48% fire button geometry, and tested DPI ranges.'
        }
        keywords="настройки фри фаер 0-200, оттяжка free fire, чувствительность free fire ob48, one tap headshot ff, кнопка огня фри фаер, dpi free fire, gameset kg"
        canonicalPath="/games/free-fire"
        ogType="game"
        ogImage="/src/assets/images/game_free_fire_1793642582005.jpg"
        gameData={{
          name: 'Free Fire / FF MAX',
          genre: 'Tactical Shooter / Battle Royale',
          patchVersion: 'OB48 Spring 2026',
          activePlayers: '350K+ активных игроков',
        }}
        breadcrumbs={[
          { name: language === 'ru' ? 'Главная' : 'Home', item: '/' },
          { name: language === 'ru' ? 'Игры' : 'Games', item: '/games' },
          { name: 'Free Fire', item: '/games/free-fire' },
        ]}
      />

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-[#192434] bg-[#0A0E16] shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#00FF87]/10 border border-[#00FF87]/30 text-xs font-mono font-bold text-[#00FF87] uppercase">
              <Crosshair className="w-3.5 h-3.5" />
              <span>Free Fire & MAX · OB48 Update · 0–200 Range</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              {language === 'ru' ? 'Free Fire: Настройки чувствительности' : 'Free Fire: Sensitivity & Settings'}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              {language === 'ru'
                ? 'Полная калибровка под новую официальную шкалу 0–200. Точные коэффициенты для вертикальной оттяжки One-Tap Headshot, диаметр кнопки огня и параметры DPI без срывов сенсора.'
                : 'Calibrated under the official 0–200 sensitivity scale. Precise vertical drag ratios for One-Tap headshots, fire button geometry, and safe DPI values.'}
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/generator?game=free-fire"
                className="px-5 py-2.5 bg-[#00FF87] hover:bg-[#10E760] text-[#05070A] font-black text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,135,0.25)] transition-all"
              >
                <Sliders className="w-4 h-4" />
                <span>{language === 'ru' ? 'Калибровать под свой телефон' : 'Calibrate for my device'}</span>
              </Link>
              <Link
                to="/submit"
                className="px-4 py-2.5 bg-[#101622] text-slate-200 border border-[#1C2636] hover:border-[#00FF87]/50 font-bold text-xs rounded-lg flex items-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4 text-[#00FF87]" />
                <span>{t('nav_submit')}</span>
              </Link>
              <button
                onClick={handleCopyAll}
                className="px-4 py-2.5 bg-[#101622] text-slate-200 border border-[#1C2636] hover:border-slate-500 font-bold text-xs rounded-lg flex items-center gap-2 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-[#00FF87]" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? t('btn_copied') : t('btn_copy_all')}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 h-56 sm:h-72 lg:h-full lg:min-h-[340px] relative overflow-hidden bg-[#0F141F]">
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

      {/* Interactive Settings Calibration Box (Strictly 0–200 Range) */}
      <div className="rounded-2xl bg-[#0B0F16] border border-[#192332] p-6 sm:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#16202C] pb-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#00FF87] font-bold uppercase tracking-wider mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Шкала 0 – 200 (Scale 0 – 200)</span>
            </div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#00FF87]" />
              <span>{language === 'ru' ? 'Интерактивный калибратор чувствительности (0–200)' : 'Interactive Sensitivity Calibrator (0–200)'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'ru'
                ? 'Двойное управление: используйте ползунки от 0 до 200 или вводите точные числа вручную в цифровое поле.'
                : 'Dual controls: drag sliders from 0 to 200 or type precise numbers directly into the numerical fields.'}
            </p>
          </div>

          {/* Style selector pills */}
          <div className="flex items-center gap-1.5 p-1 bg-[#101622] rounded-lg border border-[#1C2636] text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => handleStyleChange('rusher')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                style === 'rusher' ? 'bg-[#00FF87] text-[#05070A] font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              One-Tap Rusher
            </button>
            <button
              onClick={() => handleStyleChange('balanced')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                style === 'balanced' ? 'bg-[#00FF87] text-[#05070A] font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Balanced
            </button>
            <button
              onClick={() => handleStyleChange('sniper')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                style === 'sniper' ? 'bg-[#00FF87] text-[#05070A] font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sniper / Long
            </button>
          </div>
        </div>

        {/* Sliders Grid with Dual Slider + Numeric Input (0–200) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. General (0-200) */}
          <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">{t('ff_general')}</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={settings.general}
                  onChange={(e) => updateSens('general', Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-[#090C12] border border-[#1E293B] rounded text-right font-mono font-bold text-sm text-[#00FF87] focus:border-[#00FF87] focus:outline-none"
                />
                <span className="text-[11px] font-mono text-slate-500">/200</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="1"
              value={settings.general}
              onChange={(e) => updateSens('general', Number(e.target.value))}
              className="w-full accent-[#00FF87] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{language === 'ru' ? 'Вращение камеры и обзор' : 'Camera rotation speed'}</span>
              <span className="font-mono text-[10px] text-slate-500">0 – 200</span>
            </div>
          </div>

          {/* 2. Red Dot (0-200) */}
          <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">{t('ff_red_dot')}</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={settings.redDot}
                  onChange={(e) => updateSens('redDot', Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-[#090C12] border border-[#1E293B] rounded text-right font-mono font-bold text-sm text-[#00FF87] focus:border-[#00FF87] focus:outline-none"
                />
                <span className="text-[11px] font-mono text-slate-500">/200</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="1"
              value={settings.redDot}
              onChange={(e) => updateSens('redDot', Number(e.target.value))}
              className="w-full accent-[#00FF87] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{language === 'ru' ? 'Физика оттяжки One-Tap' : 'One-Tap headshot flick ratio'}</span>
              <span className="font-mono text-[10px] text-slate-500">0 – 200</span>
            </div>
          </div>

          {/* 3. Scope 2X (0-200) */}
          <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">{t('ff_scope_2x')}</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={settings.scope2x}
                  onChange={(e) => updateSens('scope2x', Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-[#090C12] border border-[#1E293B] rounded text-right font-mono font-bold text-sm text-[#00FF87] focus:border-[#00FF87] focus:outline-none"
                />
                <span className="text-[11px] font-mono text-slate-500">/200</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="1"
              value={settings.scope2x}
              onChange={(e) => updateSens('scope2x', Number(e.target.value))}
              className="w-full accent-[#00FF87] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{language === 'ru' ? 'Оптический прицел 2X' : 'Mid-range 2X optical tracking'}</span>
              <span className="font-mono text-[10px] text-slate-500">0 – 200</span>
            </div>
          </div>

          {/* 4. Scope 4X (0-200) */}
          <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">{t('ff_scope_4x')}</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={settings.scope4x}
                  onChange={(e) => updateSens('scope4x', Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-[#090C12] border border-[#1E293B] rounded text-right font-mono font-bold text-sm text-[#00FF87] focus:border-[#00FF87] focus:outline-none"
                />
                <span className="text-[11px] font-mono text-slate-500">/200</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="1"
              value={settings.scope4x}
              onChange={(e) => updateSens('scope4x', Number(e.target.value))}
              className="w-full accent-[#00FF87] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{language === 'ru' ? 'Контроль спрея на 4X' : 'Long-range 4X recoil control'}</span>
              <span className="font-mono text-[10px] text-slate-500">0 – 200</span>
            </div>
          </div>

          {/* 5. Sniper Scope (0-200) */}
          <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">{t('ff_sniper')}</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={settings.sniperScope}
                  onChange={(e) => updateSens('sniperScope', Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-[#090C12] border border-[#1E293B] rounded text-right font-mono font-bold text-sm text-[#00FF87] focus:border-[#00FF87] focus:outline-none"
                />
                <span className="text-[11px] font-mono text-slate-500">/200</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="1"
              value={settings.sniperScope}
              onChange={(e) => updateSens('sniperScope', Number(e.target.value))}
              className="w-full accent-[#00FF87] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{language === 'ru' ? 'Микро-наводка AWM / M82B' : 'Precision micro-aim for AWM / M82B'}</span>
              <span className="font-mono text-[10px] text-slate-500">0 – 200</span>
            </div>
          </div>

          {/* 6. Free Look (0-200) */}
          <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">{t('ff_free_look')}</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={settings.freeLook}
                  onChange={(e) => updateSens('freeLook', Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-[#090C12] border border-[#1E293B] rounded text-right font-mono font-bold text-sm text-[#00FF87] focus:border-[#00FF87] focus:outline-none"
                />
                <span className="text-[11px] font-mono text-slate-500">/200</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="1"
              value={settings.freeLook}
              onChange={(e) => updateSens('freeLook', Number(e.target.value))}
              className="w-full accent-[#00FF87] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{language === 'ru' ? 'Глаз свободного обзора на бегу' : 'Free look eye button during sprint'}</span>
              <span className="font-mono text-[10px] text-slate-500">0 – 200</span>
            </div>
          </div>
        </div>

        {/* Hardware recommendations */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#16202C]">
          <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333]">
            <div className="text-xs text-slate-400">{t('ff_fire_button')}</div>
            <div className="text-xl font-bold font-mono text-[#00FF87] mt-1">
              {settings.fireButtonSize}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {language === 'ru' ? 'Оставляет достаточный ход для свайпа вверх' : 'Adequate vertical room for drag flick'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333]">
            <div className="text-xs text-slate-400">{t('ff_dpi')}</div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {settings.dpi > 0 ? `${settings.dpi} DPI` : 'iOS Standard'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {language === 'ru' ? 'Безопасное значение без перезагрузки системы' : 'Safe range in developer settings'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333]">
            <div className="text-xs text-slate-400">{t('ff_graphics')}</div>
            <div className="text-base font-bold text-white mt-1">
              {settings.graphicPreset}
            </div>
            <div className="text-[11px] text-[#00FF87] font-mono mt-1">
              High FPS: Enabled (90-120 FPS)
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#16202C]">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopyAll}
              className="px-5 py-2.5 bg-[#00FF87] hover:bg-[#10E760] text-[#05070A] font-black text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,255,135,0.25)]"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? t('btn_copied') : t('btn_copy_all')}</span>
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2.5 bg-[#101622] hover:bg-[#16202E] text-slate-200 border border-[#1C2636] font-bold text-xs rounded-lg flex items-center gap-2 transition-all"
            >
              <Bookmark className="w-4 h-4 text-[#00FF87]" />
              <span>{savedSuccess ? t('btn_saved_success') : t('btn_save')}</span>
            </button>

            <button
              onClick={handleAddToCompare}
              className="px-4 py-2.5 bg-[#101622] hover:bg-[#16202E] text-slate-200 border border-[#1C2636] font-bold text-xs rounded-lg flex items-center gap-2 transition-all"
            >
              <GitCompare className="w-4 h-4 text-[#00FF87]" />
              <span>{compareSuccess ? 'Добавлено в сравнение!' : t('btn_add_compare')}</span>
            </button>

            <button
              onClick={handleReset}
              className="px-3.5 py-2.5 text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('btn_reset')}</span>
            </button>
          </div>

          <Link
            to="/generator?game=free-fire"
            className="text-xs font-bold text-[#00FF87] hover:underline flex items-center gap-1"
          >
            <span>{language === 'ru' ? 'Выбрать свою модель телефона' : 'Select phone model in generator'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Community Submitted Presets for Free Fire */}
      <div className="rounded-2xl bg-[#0B0F16] border border-[#192332] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#16202C] pb-5">
          <div>
            <div className="text-xs font-mono font-bold text-[#00FF87] uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              <span>{language === 'ru' ? 'Проверенные пресеты сообщества (OB48 0–200)' : 'Verified Community Presets (OB48 0–200)'}</span>
            </div>
            <h3 className="text-xl font-black text-white mt-1">
              {language === 'ru' ? 'Конфигурации турнирных игроков' : 'Tournament Player Submissions'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'ru'
                ? 'Реальные настройки игроков, проверенные модерацией. Вы можете оценить пресет или предложить свой.'
                : 'Player-submitted settings verified by moderators. Vote for working configurations or submit your own.'}
            </p>
          </div>

          <Link
            to="/submit"
            className="px-4 py-2 bg-[#00FF87] hover:bg-[#10E760] text-[#05070A] font-black text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 shrink-0 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>{language === 'ru' ? 'Опубликовать свои настройки' : 'Submit Your Settings'}</span>
          </Link>
        </div>

        {loadingCommunity ? (
          <div className="p-8 text-center text-xs text-slate-400">
            {language === 'ru' ? 'Загрузка турнирных пресетов...' : 'Loading presets...'}
          </div>
        ) : communityList.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            {language === 'ru' ? 'Пресеты пока не загружены.' : 'No submissions found yet.'}
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
                      {language === 'ru' ? 'Автор' : 'Author'}: <span className="text-slate-200 font-semibold">{sub.author}</span> · {sub.style}
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
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
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
                </div>

                {/* Sub Action bar */}
                <div className="flex items-center justify-between pt-2 border-t border-[#182333] text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpvote(sub.id)}
                      disabled={votedIds.has(sub.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-semibold transition-colors ${
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
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#121822] border border-[#1C2534] text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{language === 'ru' ? 'Отзывы' : 'Comments'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setReportingSubId(sub.id);
                        setReportSuccess(false);
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      title={t('btn_report')}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        const copyText = `Free Fire 0-200 preset (${sub.model}): General ${sub.sensitivity?.general}, RedDot ${sub.sensitivity?.redDot}, 2X ${sub.sensitivity?.scope2x}`;
                        navigator.clipboard.writeText(copyText);
                        alert(language === 'ru' ? 'Пресет скопирован!' : 'Preset copied!');
                      }}
                      className="px-2.5 py-1.5 bg-[#121822] hover:bg-[#18202D] text-slate-200 border border-[#1C2534] rounded-md font-bold text-xs flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3 text-[#00FF87]" />
                      <span>{t('btn_copy_all')}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Free Fire Mechanics & Physics Guide */}
      <div className="rounded-2xl bg-[#0B0F16] border border-[#192332] p-6 sm:p-8 space-y-6">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          <span>{language === 'ru' ? 'Физика оттяжки One-Tap по шкале 0–200' : 'One-Tap Headshot Drag Guide (0–200)'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
            <div className="font-bold text-white text-sm">
              {language === 'ru' ? '1. Прямая оттяжка (Straight Drag)' : '1. Straight Drag'}
            </div>
            <p className="leading-relaxed text-slate-400">
              {language === 'ru'
                ? 'При значениях Обзора 180–195 палец делает резкий вертикальный свайп с нарастанием скорости. Прицел мгновенно поднимается с уровня груди на уровень головы.'
                : 'With General sensitivity at 180–195, swipe vertically upward with rapid acceleration from torso to head level.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
            <div className="font-bold text-white text-sm">
              {language === 'ru' ? '2. J-образная оттяжка (Rotation Drag)' : '2. J-Drag & Rotation'}
            </div>
            <p className="leading-relaxed text-slate-400">
              {language === 'ru'
                ? 'Если враг бежит вбок: траектория кнопки огня повторяет букву «J» в направлении бега соперника. Калибровка Red Dot 170–190 обеспечивает плавный захват цели.'
                : 'When target is sprinting laterally: move the fire button in a swift "J" curve matching opponent velocity.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
            <div className="font-bold text-white text-sm">
              {language === 'ru' ? '3. Диаметр кнопки огня' : '3. Fire Button Geometry'}
            </div>
            <p className="leading-relaxed text-slate-400">
              {language === 'ru'
                ? 'Кнопка более 52% сокращает доступное пространство экрана для свайпа. Оптимальный киберспортивный размер: 42%–48%.'
                : 'Buttons larger than 52% restrict vertical swipe travel. Recommended competitive size: 42%–48%.'}
            </p>
          </div>
        </div>
      </div>

      {/* Comment Drawer / Modal */}
      {commentingSub &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0B0F16] border border-[#192434] rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-[#16202C] pb-3">
                <div>
                  <h4 className="font-bold text-white text-sm">
                    {language === 'ru' ? 'Отзывы о пресете' : 'Preset Comments'}
                  </h4>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {commentingSub.model} ({commentingSub.author})
                  </div>
                </div>
                <button
                  onClick={() => setCommentingSub(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {subComments.length === 0 ? (
                  <div className="text-xs text-slate-500 py-6 text-center">
                    {language === 'ru' ? 'Пока нет отзывов. Будьте первым!' : 'No comments yet. Be the first!'}
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
                  placeholder={language === 'ru' ? 'Ваш никнейм...' : 'Your nickname...'}
                  value={newCommentAuthor}
                  onChange={(e) => setNewCommentAuthor(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF87]"
                />
                <textarea
                  placeholder={language === 'ru' ? 'Напишите отзыв о чувствительности...' : 'Write feedback about this preset...'}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  required
                  rows={2}
                  className="w-full px-3 py-1.5 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF87]"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-[#00FF87] hover:bg-[#10E760] text-[#05070A] font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
                >
                  {language === 'ru' ? 'Отправить отзыв' : 'Post Comment'}
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
                  <span>{language === 'ru' ? 'Пожаловаться на пресет' : 'Report Preset'}</span>
                </h4>
                <button
                  onClick={() => setReportingSubId(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1"
                >
                  ✕
                </button>
              </div>

              {reportSuccess ? (
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center font-bold">
                  {language === 'ru' ? 'Жалоба принята на рассмотрение модератором.' : 'Report submitted to moderators.'}
                </div>
              ) : (
                <form onSubmit={handleReport} className="space-y-3">
                  <div className="text-xs text-slate-400">
                    {language === 'ru'
                      ? 'Укажите причину жалобы (неработающие значения, спам, оскорбления):'
                      : 'Specify reason for reporting (broken values, spam, offensive notes):'}
                  </div>
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    required
                    rows={3}
                    placeholder={language === 'ru' ? 'Опишите проблему...' : 'Describe the issue...'}
                    className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white focus:outline-none focus:border-rose-400"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
                  >
                    {language === 'ru' ? 'Отправить жалобу' : 'Submit Report'}
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
