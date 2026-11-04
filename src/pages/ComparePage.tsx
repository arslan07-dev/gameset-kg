import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';
import { SavedSetting, FreeFireSettings } from '../types';
import { AdBannerSlot } from '../components/common/AdBannerSlot';
import { SEO } from '../components/common/SEO';
import {
  GitCompare,
  Sliders,
  Copy,
  Check,
  Trash2,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  PlusCircle,
} from 'lucide-react';

export const ComparePage: React.FC = () => {
  const { t, language } = useLanguage();
  const { compareList, removeFromCompare, clearCompare, savedSettings, settingsHistory, addToCompare } = useFavorites();
  const [copied, setCopied] = useState(false);

  // Default presets if compare list has fewer than 2 items
  const defaultSlot1: SavedSetting = compareList[0] || {
    id: 'sample_poco',
    title: 'POCO X6 Pro 5G (Rusher)',
    gameId: 'free-fire',
    brand: 'POCO',
    model: 'POCO X6 Pro 5G',
    playStyle: 'rusher',
    timestamp: Date.now() - 3600000,
    data: {
      general: 194,
      redDot: 188,
      scope2x: 176,
      scope4x: 164,
      sniperScope: 98,
      freeLook: 170,
      fireButtonSize: 44,
      fireButtonPosition: 'Right (28%)',
      dpi: 440,
      graphicPreset: 'Smooth (Ultra FPS)',
      highFps: true,
      notes: '120Hz Fast Drag Flick',
    } as FreeFireSettings,
  };

  const defaultSlot2: SavedSetting = compareList[1] || {
    id: 'sample_iphone',
    title: 'iPhone 15 Pro (Balanced)',
    gameId: 'free-fire',
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    playStyle: 'balanced',
    timestamp: Date.now(),
    data: {
      general: 180,
      redDot: 172,
      scope2x: 160,
      scope4x: 148,
      sniperScope: 88,
      freeLook: 150,
      fireButtonSize: 48,
      fireButtonPosition: 'Right (30%)',
      dpi: 0,
      graphicPreset: 'Ultra (Max FPS)',
      highFps: true,
      notes: 'ProMotion Dynamic Touch',
    } as FreeFireSettings,
  };

  const slot1 = compareList[0] || defaultSlot1;
  const slot2 = compareList[1] || defaultSlot2;

  // Comparison metrics for Free Fire
  const getDiff = (val1: number, val2: number) => {
    const diff = val1 - val2;
    if (diff > 0) return { text: `+${diff}`, color: 'text-[#00FF87]' };
    if (diff < 0) return { text: `${diff}`, color: 'text-amber-400' };
    return { text: '0', color: 'text-slate-400' };
  };

  const handleCopyComparison = () => {
    const d1 = slot1.data as any;
    const d2 = slot2.data as any;

    const report = `=== GAMESET KG: SENSITIVITY COMPARISON ===
Slot A: ${slot1.model} (${slot1.playStyle})
Slot B: ${slot2.model} (${slot2.playStyle})
-----------------------------------------
General Look:  [A: ${d1.general ?? 'N/A'}] vs [B: ${d2.general ?? 'N/A'}] (Diff: ${d1.general && d2.general ? d1.general - d2.general : 'N/A'})
Red Dot Scope: [A: ${d1.redDot ?? 'N/A'}] vs [B: ${d2.redDot ?? 'N/A'}] (Diff: ${d1.redDot && d2.redDot ? d1.redDot - d2.redDot : 'N/A'})
2X Scope:      [A: ${d1.scope2x ?? 'N/A'}] vs [B: ${d2.scope2x ?? 'N/A'}]
4X Scope:      [A: ${d1.scope4x ?? 'N/A'}] vs [B: ${d2.scope4x ?? 'N/A'}]
Sniper Scope:  [A: ${d1.sniperScope ?? 'N/A'}] vs [B: ${d2.sniperScope ?? 'N/A'}]
Fire Button:   [A: ${d1.fireButtonSize ?? 'N/A'}%] vs [B: ${d2.fireButtonSize ?? 'N/A'}%]
DPI:           [A: ${d1.dpi || 'iOS'}] vs [B: ${d2.dpi || 'iOS'}]
Generated via gameset.kg`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const d1 = slot1.data as any;
  const d2 = slot2.data as any;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <SEO
        title={
          language === 'ru'
            ? 'Сравнение игровых настроек и чувствительности | GAMESET KG'
            : 'Compare Gaming Settings & Sensitivities | GAMESET KG'
        }
        description={
          language === 'ru'
            ? 'Интерактивное сравнение двух игровых профилей и пресетов бок о бок. Разница DPI, размера кнопки огня, прицелов и калибровки оттяжки.'
            : 'Interactive side-by-side comparison of two sensitivity configurations. DPI deltas, scope zoom multipliers, and fire button geometry.'
        }
        canonicalPath="/compare"
        breadcrumbs={[
          { name: language === 'ru' ? 'Главная' : 'Home', item: '/' },
          { name: language === 'ru' ? 'Сравнение' : 'Compare', item: '/compare' },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#182332] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00FF87]/10 border border-[#00FF87]/30 text-xs font-mono font-bold text-[#00FF87] uppercase mb-2">
            <GitCompare className="w-3.5 h-3.5" />
            <span>Dual Configuration Benchmark</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            {t('compare_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {t('compare_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleCopyComparison}
            className="px-4 py-2 bg-[#00FF87] hover:bg-[#10E760] text-[#05070A] font-black text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,255,135,0.2)]"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? t('btn_copied') : 'Экспорт сравнения'}</span>
          </button>

          {compareList.length > 0 && (
            <button
              onClick={clearCompare}
              className="px-3 py-2 text-xs text-rose-400 hover:text-white bg-[#121822] hover:bg-rose-500/20 border border-[#1E293B] rounded-lg transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Очистить</span>
            </button>
          )}
        </div>
      </div>

      {/* Side-by-side Configuration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SLOT 1 */}
        <div className="rounded-2xl bg-[#0B0F16] border border-[#192332] p-6 space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-[#16202C] pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/30">
                {t('compare_slot_1')}
              </span>
              <h3 className="text-xl font-black text-white mt-1.5">{slot1.model}</h3>
              <div className="text-xs text-slate-400 mt-0.5">
                {slot1.brand} · <span className="text-slate-200 font-semibold">{slot1.playStyle}</span>
              </div>
            </div>
            {compareList[0] && (
              <button
                onClick={() => removeFromCompare(slot1.id)}
                className="text-xs text-slate-500 hover:text-rose-400 p-1"
                title="Удалить из слота"
              >
                ✕
              </button>
            )}
          </div>

          {/* Metrics List */}
          <div className="space-y-3 text-xs">
            {slot1.gameId === 'free-fire' && (
              <>
                <div className="p-3 rounded-lg bg-[#0F141F] border border-[#182333] flex justify-between items-center">
                  <span className="text-slate-300 font-bold">{t('ff_general')}</span>
                  <span className="font-mono text-base font-bold text-[#00FF87]">{d1.general ?? '—'}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#0F141F] border border-[#182333] flex justify-between items-center">
                  <span className="text-slate-300 font-bold">{t('ff_red_dot')}</span>
                  <span className="font-mono text-base font-bold text-[#00FF87]">{d1.redDot ?? '—'}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#0F141F] border border-[#182333] flex justify-between items-center">
                  <span className="text-slate-300 font-bold">{t('ff_scope_2x')}</span>
                  <span className="font-mono text-base font-bold text-[#00FF87]">{d1.scope2x ?? '—'}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#0F141F] border border-[#182333] flex justify-between items-center">
                  <span className="text-slate-300 font-bold">{t('ff_scope_4x')}</span>
                  <span className="font-mono text-base font-bold text-[#00FF87]">{d1.scope4x ?? '—'}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#0F141F] border border-[#182333] flex justify-between items-center">
                  <span className="text-slate-300 font-bold">{t('ff_sniper')}</span>
                  <span className="font-mono text-base font-bold text-[#00FF87]">{d1.sniperScope ?? '—'}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#0F141F] border border-[#182333] flex justify-between items-center">
                  <span className="text-slate-300 font-bold">{t('ff_fire_button')}</span>
                  <span className="font-mono text-sm font-bold text-white">{d1.fireButtonSize ? `${d1.fireButtonSize}%` : '—'}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#0F141F] border border-[#182333] flex justify-between items-center">
                  <span className="text-slate-300 font-bold">{t('ff_dpi')}</span>
                  <span className="font-mono text-sm font-bold text-white">{d1.dpi ? `${d1.dpi} DPI` : 'Standard'}</span>
                </div>
              </>
            )}

            {slot1.gameId !== 'free-fire' && (
              <div className="p-4 rounded-lg bg-[#0F141F] text-slate-300 leading-relaxed font-mono text-xs">
                {JSON.stringify(d1, null, 2)}
              </div>
            )}
          </div>
        </div>

        {/* SLOT 2 */}
        <div className="rounded-2xl bg-[#0B0F16] border border-[#192332] p-6 space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-[#16202C] pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                {t('compare_slot_2')}
              </span>
              <h3 className="text-xl font-black text-white mt-1.5">{slot2.model}</h3>
              <div className="text-xs text-slate-400 mt-0.5">
                {slot2.brand} · <span className="text-slate-200 font-semibold">{slot2.playStyle}</span>
              </div>
            </div>
            {compareList[1] && (
              <button
                onClick={() => removeFromCompare(slot2.id)}
                className="text-xs text-slate-500 hover:text-rose-400 p-1"
                title="Удалить из слота"
              >
                ✕
              </button>
            )}
          </div>

          {/* Metrics List with Difference from Slot 1 */}
          <div className="space-y-3 text-xs">
            {slot2.gameId === 'free-fire' && (
              <>
                <div className="p-3 rounded-lg bg-[#0F141F] border border-[#182333] flex justify-between items-center">
                  <span className="text-slate-300 font-bold">{t('ff_general')}</span>
                  <div className="flex items-center gap-3">
                    {d1.general && d2.general && (
                      <span className={`font-mono text-xs font-bold ${getDiff(d2.general, d1.general).color}`}>
                        {getDiff(d2.general, d1.general).text}
                      </span>
                    )}
                    <span className="font-mono text-base font-bold text-[#00FF87]">{d2.general ?? '—'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#0F141F] border border-[#182333] flex justify-between items-center">
                  <span className="text-slate-300 font-bold">{t('ff_red_dot')}</span>
                  <div className="flex items-center gap-3">
                    {d1.redDot && d2.redDot && (
                      <span className={`font-mono text-xs font-bold ${getDiff(d2.redDot, d1.redDot).color}`}>
                        {getDiff(d2.redDot, d1.redDot).text}
                      </span>
                    )}
                    <span className="font-mono text-base font-bold text-[#00FF87]">{d2.redDot ?? '—'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#0F141F] border border-[#182333] flex justify-between items-center">
                  <span className="text-slate-300 font-bold">{t('ff_scope_2x')}</span>
                  <div className="flex items-center gap-3">
                    {d1.scope2x && d2.scope2x && (
                      <span className={`font-mono text-xs font-bold ${getDiff(d2.scope2x, d1.scope2x).color}`}>
                        {getDiff(d2.scope2x, d1.scope2x).text}
                      </span>
                    )}
                    <span className="font-mono text-base font-bold text-[#00FF87]">{d2.scope2x ?? '—'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#0F141F] border border-[#182333] flex justify-between items-center">
                  <span className="text-slate-300 font-bold">{t('ff_scope_4x')}</span>
                  <div className="flex items-center gap-3">
                    {d1.scope4x && d2.scope4x && (
                      <span className={`font-mono text-xs font-bold ${getDiff(d2.scope4x, d1.scope4x).color}`}>
                        {getDiff(d2.scope4x, d1.scope4x).text}
                      </span>
                    )}
                    <span className="font-mono text-base font-bold text-[#00FF87]">{d2.scope4x ?? '—'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#0F141F] border border-[#182333] flex justify-between items-center">
                  <span className="text-slate-300 font-bold">{t('ff_sniper')}</span>
                  <div className="flex items-center gap-3">
                    {d1.sniperScope && d2.sniperScope && (
                      <span className={`font-mono text-xs font-bold ${getDiff(d2.sniperScope, d1.sniperScope).color}`}>
                        {getDiff(d2.sniperScope, d1.sniperScope).text}
                      </span>
                    )}
                    <span className="font-mono text-base font-bold text-[#00FF87]">{d2.sniperScope ?? '—'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#0F141F] border border-[#182333] flex justify-between items-center">
                  <span className="text-slate-300 font-bold">{t('ff_fire_button')}</span>
                  <span className="font-mono text-sm font-bold text-white">{d2.fireButtonSize ? `${d2.fireButtonSize}%` : '—'}</span>
                </div>

                <div className="p-3 rounded-lg bg-[#0F141F] border border-[#182333] flex justify-between items-center">
                  <span className="text-slate-300 font-bold">{t('ff_dpi')}</span>
                  <span className="font-mono text-sm font-bold text-white">{d2.dpi ? `${d2.dpi} DPI` : 'Standard'}</span>
                </div>
              </>
            )}

            {slot2.gameId !== 'free-fire' && (
              <div className="p-4 rounded-lg bg-[#0F141F] text-slate-300 leading-relaxed font-mono text-xs">
                {JSON.stringify(d2, null, 2)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Select from Library or Recent History to load into comparison */}
      <div className="rounded-2xl bg-[#0B0F16] border border-[#192332] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#16202C] pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00FF87]" />
              <span>{language === 'ru' ? 'Добавить конфигурацию из библиотеки' : 'Add from Saved / History'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'ru'
                ? 'Нажмите на кнопку пресета, чтобы загрузить его в слот сравнения.'
                : 'Click any configuration to populate the comparison slots.'}
            </p>
          </div>
          <Link
            to="/generator"
            className="text-xs text-[#00FF87] hover:underline font-bold flex items-center gap-1"
          >
            <span>{language === 'ru' ? 'Открыть генератор' : 'Open generator'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Saved sets or history items */}
        {savedSettings.length === 0 && settingsHistory.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            {language === 'ru'
              ? 'В истории пока нет записей. Сгенерируйте или сохраните настройки в генераторе.'
              : 'No items in history yet. Generate or save a preset in the generator.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[...savedSettings, ...settingsHistory.map((h) => ({ ...h, title: `${h.model} (${h.playStyle})` }))]
              .slice(0, 6)
              .map((item, idx) => (
                <button
                  key={item.id + '_' + idx}
                  onClick={() => addToCompare(item as SavedSetting)}
                  className="p-3 rounded-xl bg-[#0F141F] border border-[#1A2536] hover:border-[#00FF87]/50 text-left transition-all flex items-center justify-between group"
                >
                  <div className="truncate pr-2">
                    <div className="text-xs font-bold text-white group-hover:text-[#00FF87] transition-colors truncate">
                      {item.model}
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize">
                      {item.brand} · {item.playStyle}
                    </div>
                  </div>
                  <PlusCircle className="w-4 h-4 text-slate-500 group-hover:text-[#00FF87] shrink-0" />
                </button>
              ))}
          </div>
        )}
      </div>

      <AdBannerSlot slotId="compare-bottom" format="horizontal" />
    </div>
  );
};
