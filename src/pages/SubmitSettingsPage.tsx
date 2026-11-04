import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { GameId, DeviceBrand, PlayStyle } from '../types';
import { DEVICE_BRANDS, DEVICES_DATA } from '../data/devices';
import { GAMES_DATA } from '../data/games';
import { AdBannerSlot } from '../components/common/AdBannerSlot';
import { SEO } from '../components/common/SEO';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Gamepad2,
  Sliders,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const SubmitSettingsPage: React.FC = () => {
  const { t, language } = useLanguage();

  const [gameId, setGameId] = useState<GameId>('free-fire');
  const [brand, setBrand] = useState<DeviceBrand>('POCO');
  const [model, setModel] = useState('POCO X6 Pro 5G');
  const [author, setAuthor] = useState('');
  const [telegram, setTelegram] = useState('');
  const [style, setStyle] = useState<PlayStyle>('rusher');
  const [description, setDescription] = useState('');
  const [dpi, setDpi] = useState('440');
  const [graphics, setGraphics] = useState('Smooth + Max FPS');

  // Free Fire Sensitivities (Strictly 0–200)
  const [ffGeneral, setFfGeneral] = useState(190);
  const [ffRedDot, setFfRedDot] = useState(185);
  const [ffScope2x, setFfScope2x] = useState(170);
  const [ffScope4x, setFfScope4x] = useState(160);
  const [ffSniper, setFfSniper] = useState(95);
  const [ffFreeLook, setFfFreeLook] = useState(165);
  const [ffButtonSize, setFfButtonSize] = useState(44);

  // Status state
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const clamp200 = (val: number) => Math.max(0, Math.min(200, val || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg(false);

    if (!author.trim() || !model.trim()) {
      setErrorMsg(language === 'ru' ? 'Заполните ваш никнейм и модель смартфона' : 'Fill author name and phone model');
      return;
    }

    let sensitivityPayload: any = {};
    if (gameId === 'free-fire') {
      sensitivityPayload = {
        general: clamp200(ffGeneral),
        redDot: clamp200(ffRedDot),
        scope2x: clamp200(ffScope2x),
        scope4x: clamp200(ffScope4x),
        sniperScope: clamp200(ffSniper),
        freeLook: clamp200(ffFreeLook),
        fireButtonSize: ffButtonSize,
      };
    } else {
      sensitivityPayload = {
        generalStandard: 120,
        adsRecoil: 65,
        gyroscope: 320,
      };
    }

    const payload = {
      gameId,
      gameName: GAMES_DATA.find((g) => g.id === gameId)?.name || gameId,
      brand,
      model: model.trim(),
      author: author.trim(),
      telegram: telegram.trim() || undefined,
      style,
      description: description.trim(),
      dpi: dpi ? Number(dpi) : undefined,
      graphics,
      sensitivity: sensitivityPayload,
    };

    try {
      setSubmitting(true);
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit settings');
      }

      setSuccessMsg(true);
      // Reset form
      setAuthor('');
      setDescription('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Ошибка отправки');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBrandSelect = (b: DeviceBrand) => {
    setBrand(b);
    const first = DEVICES_DATA.find((d) => d.brand === b);
    if (first) setModel(first.model);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <SEO
        title={
          language === 'ru'
            ? 'Предложить свои настройки игры — Публикация в сообществе | GAMESET KG'
            : 'Submit Gaming Settings — Community Publication | GAMESET KG'
        }
        description={
          language === 'ru'
            ? 'Поделитесь проверенными настройками чувствительности для Free Fire, PUBG Mobile, MLBB и COD Mobile. Пройдите модерацию и попадите в базу GAMESET KG.'
            : 'Submit your calibrated sensitivity presets for Free Fire, PUBG Mobile, MLBB, and COD Mobile to the verified GAMESET KG database.'
        }
        canonicalPath="/submit"
        breadcrumbs={[
          { name: language === 'ru' ? 'Главная' : 'Home', item: '/' },
          { name: language === 'ru' ? 'Предложить настройки' : 'Submit', item: '/submit' },
        ]}
      />

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00FF87]/10 border border-[#00FF87]/30 text-xs font-mono font-bold text-[#00FF87] uppercase">
          <Upload className="w-3.5 h-3.5" />
          <span>Community Moderation Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          {t('submit_title')}
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          {t('submit_subtitle')}
        </p>
      </div>

      {successMsg ? (
        <div className="rounded-2xl bg-[#0B0F16] border border-[#00FF87]/40 p-8 text-center space-y-4 animate-in fade-in duration-300">
          <div className="w-14 h-14 rounded-full bg-[#00FF87]/15 border border-[#00FF87] text-[#00FF87] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(0,255,135,0.3)]">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">
            {language === 'ru' ? 'Заявка принята на модерацию!' : 'Submitted for Moderation!'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            {t('submit_success')}
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => setSuccessMsg(false)}
              className="px-5 py-2.5 bg-[#00FF87] hover:bg-[#10E760] text-[#05070A] font-black text-xs uppercase tracking-wider rounded-lg transition-all"
            >
              {language === 'ru' ? 'Отправить ещё пресет' : 'Submit Another Preset'}
            </button>
            <Link
              to="/games/free-fire"
              className="px-5 py-2.5 bg-[#121822] hover:bg-[#18202D] text-white border border-[#1E293B] font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
            >
              {language === 'ru' ? 'Перейти в Free Fire' : 'Go to Free Fire'}
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl bg-[#0B0F16] border border-[#192332] p-6 sm:p-8 space-y-8 shadow-xl">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Game Selection */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-bold text-[#00FF87] uppercase tracking-wider flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              <span>1. {language === 'ru' ? 'Выберите игру' : 'Select Game'}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GAMES_DATA.map((g) => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => setGameId(g.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    gameId === g.id
                      ? 'bg-[#00FF87]/15 border-[#00FF87] text-white font-bold'
                      : 'bg-[#0E131C] border-[#1A2536] text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs truncate">{g.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Device Brand & Model */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-bold text-[#00FF87] uppercase tracking-wider flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span>2. {language === 'ru' ? 'Бренд и модель устройства' : 'Device Brand & Model'}</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DEVICE_BRANDS.map((b) => (
                <button
                  type="button"
                  key={b}
                  onClick={() => handleBrandSelect(b)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    brand === b
                      ? 'bg-[#00FF87] text-[#05070A] font-bold'
                      : 'bg-[#0E131C] border border-[#1A2536] text-slate-300 hover:text-white'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Точная модель (например: POCO X6 Pro 5G, Galaxy S24, iPhone 15 Pro)..."
                className="w-full px-4 py-2.5 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00FF87]"
              />
            </div>
          </div>

          {/* 3. Free Fire Sensitivities (Strict 0–200 Range) */}
          {gameId === 'free-fire' && (
            <div className="space-y-4 pt-4 border-t border-[#16202C]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-[#00FF87] uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  <span>3. {language === 'ru' ? 'Чувствительность (шкала 0–200)' : 'Sensitivities (0–200 scale)'}</span>
                </label>
                <span className="text-[11px] font-mono text-slate-400">Strict Range: 0 — 200</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* General */}
                <div className="p-3.5 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">{t('ff_general')}</span>
                    <input
                      type="number"
                      min={0}
                      max={200}
                      value={ffGeneral}
                      onChange={(e) => setFfGeneral(clamp200(Number(e.target.value)))}
                      className="w-14 px-1 py-0.5 bg-[#090C12] border border-[#1E293B] rounded text-right font-mono font-bold text-xs text-[#00FF87]"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={ffGeneral}
                    onChange={(e) => setFfGeneral(clamp200(Number(e.target.value)))}
                    className="w-full accent-[#00FF87]"
                  />
                </div>

                {/* Red Dot */}
                <div className="p-3.5 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">{t('ff_red_dot')}</span>
                    <input
                      type="number"
                      min={0}
                      max={200}
                      value={ffRedDot}
                      onChange={(e) => setFfRedDot(clamp200(Number(e.target.value)))}
                      className="w-14 px-1 py-0.5 bg-[#090C12] border border-[#1E293B] rounded text-right font-mono font-bold text-xs text-[#00FF87]"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={ffRedDot}
                    onChange={(e) => setFfRedDot(clamp200(Number(e.target.value)))}
                    className="w-full accent-[#00FF87]"
                  />
                </div>

                {/* 2X */}
                <div className="p-3.5 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">{t('ff_scope_2x')}</span>
                    <input
                      type="number"
                      min={0}
                      max={200}
                      value={ffScope2x}
                      onChange={(e) => setFfScope2x(clamp200(Number(e.target.value)))}
                      className="w-14 px-1 py-0.5 bg-[#090C12] border border-[#1E293B] rounded text-right font-mono font-bold text-xs text-[#00FF87]"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={ffScope2x}
                    onChange={(e) => setFfScope2x(clamp200(Number(e.target.value)))}
                    className="w-full accent-[#00FF87]"
                  />
                </div>

                {/* 4X */}
                <div className="p-3.5 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">{t('ff_scope_4x')}</span>
                    <input
                      type="number"
                      min={0}
                      max={200}
                      value={ffScope4x}
                      onChange={(e) => setFfScope4x(clamp200(Number(e.target.value)))}
                      className="w-14 px-1 py-0.5 bg-[#090C12] border border-[#1E293B] rounded text-right font-mono font-bold text-xs text-[#00FF87]"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={ffScope4x}
                    onChange={(e) => setFfScope4x(clamp200(Number(e.target.value)))}
                    className="w-full accent-[#00FF87]"
                  />
                </div>

                {/* Sniper */}
                <div className="p-3.5 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">{t('ff_sniper')}</span>
                    <input
                      type="number"
                      min={0}
                      max={200}
                      value={ffSniper}
                      onChange={(e) => setFfSniper(clamp200(Number(e.target.value)))}
                      className="w-14 px-1 py-0.5 bg-[#090C12] border border-[#1E293B] rounded text-right font-mono font-bold text-xs text-[#00FF87]"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={ffSniper}
                    onChange={(e) => setFfSniper(clamp200(Number(e.target.value)))}
                    className="w-full accent-[#00FF87]"
                  />
                </div>

                {/* Free Look */}
                <div className="p-3.5 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">{t('ff_free_look')}</span>
                    <input
                      type="number"
                      min={0}
                      max={200}
                      value={ffFreeLook}
                      onChange={(e) => setFfFreeLook(clamp200(Number(e.target.value)))}
                      className="w-14 px-1 py-0.5 bg-[#090C12] border border-[#1E293B] rounded text-right font-mono font-bold text-xs text-[#00FF87]"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={ffFreeLook}
                    onChange={(e) => setFfFreeLook(clamp200(Number(e.target.value)))}
                    className="w-full accent-[#00FF87]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. Player & Style Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#16202C]">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white">{t('submit_author')} *</label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Ваш никнейм (например: Bishkek_Pro)..."
                className="w-full px-3.5 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF87]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white">{t('submit_telegram')}</label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@username (необязательно)"
                className="w-full px-3.5 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF87]"
              />
            </div>
          </div>

          {/* 5. Notes & Tips */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white">{t('submit_notes')}</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Какое оружие тестировали, комфортна ли оттяжка, рекомендации по DPI..."
              className="w-full px-3.5 py-2.5 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF87]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#00FF87] hover:bg-[#10E760] disabled:opacity-50 text-[#05070A] font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_0_20px_rgba(0,255,135,0.25)] flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Отправка...' : t('submit_btn')}</span>
          </button>
        </form>
      )}

      <AdBannerSlot slotId="submit-bottom" format="horizontal" />
    </div>
  );
};
