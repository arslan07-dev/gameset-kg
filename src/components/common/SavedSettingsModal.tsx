import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFavorites } from '../../context/FavoritesContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Bookmark,
  Trash2,
  Copy,
  Check,
  Download,
  History,
  GitCompare,
} from 'lucide-react';

export const SavedSettingsModal: React.FC = () => {
  const {
    isSavedModalOpen,
    setIsSavedModalOpen,
    savedSettings,
    removeSetting,
    clearAllSettings,
    settingsHistory,
    clearHistory,
    addToCompare,
  } = useFavorites();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'saved' | 'history'>('saved');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isSavedModalOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isSavedModalOpen]);

  if (!isSavedModalOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJSON = () => {
    const dataToExport = activeTab === 'saved' ? savedSettings : settingsHistory;
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gameset_kg_${activeTab}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCompareItem = (item: any) => {
    addToCompare({
      ...item,
      title: item.title || `${item.model} (${item.playStyle})`,
    });
    setIsSavedModalOpen(false);
    navigate('/compare');
  };

  const currentItems = activeTab === 'saved' ? savedSettings : settingsHistory;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#0B0F16] border border-[#192332] rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#16202C]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 text-sm font-bold pb-0.5 border-b-2 transition-all ${
                activeTab === 'saved'
                  ? 'border-[#00FF87] text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4 text-[#00FF87]" />
              <span>{t('saved_title')}</span>
              <span className="text-[10px] bg-[#121822] text-slate-300 px-1.5 py-0.5 rounded font-mono border border-[#1A2536]">
                {savedSettings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 text-sm font-bold pb-0.5 border-b-2 transition-all ${
                activeTab === 'history'
                  ? 'border-[#00FF87] text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-4 h-4 text-[#00FF87]" />
              <span>{t('nav_history')}</span>
              <span className="text-[10px] bg-[#121822] text-slate-300 px-1.5 py-0.5 rounded font-mono border border-[#1A2536]">
                {settingsHistory.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {currentItems.length > 0 && (
              <button
                onClick={handleExportJSON}
                className="p-1.5 text-xs text-slate-400 hover:text-white hover:bg-[#121822] rounded-lg transition-colors flex items-center gap-1 border border-transparent hover:border-[#1A2536]"
                title="Экспорт в JSON"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">JSON</span>
              </button>
            )}
            <button
              onClick={() => setIsSavedModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#121822] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {currentItems.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#101622] text-slate-500 flex items-center justify-center mx-auto border border-[#182333]">
                {activeTab === 'saved' ? <Bookmark className="w-6 h-6" /> : <History className="w-6 h-6" />}
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {activeTab === 'saved'
                  ? t('saved_empty')
                  : language === 'ru'
                  ? 'История генераций пуста. Новые настройки из генератора будут отображаться здесь.'
                  : 'History is empty. Generated settings will appear here.'}
              </p>
            </div>
          ) : (
            currentItems.map((item: any) => {
              const formattedData = JSON.stringify(item.data, null, 2);
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#0E131C] border border-[#192332] hover:border-[#00FF87]/40 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{item.title || item.model}</span>
                        <span className="text-[10px] text-[#00FF87] font-mono font-semibold uppercase px-1.5 py-0.5 bg-[#00FF87]/10 rounded border border-[#00FF87]/20">
                          {item.gameId}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {item.brand} {item.model} · {item.playStyle} · {new Date(item.timestamp).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCompareItem(item)}
                        className="p-1.5 rounded bg-[#121822] hover:bg-[#00FF87] hover:text-[#05070A] text-slate-300 transition-colors"
                        title={t('btn_add_compare')}
                      >
                        <GitCompare className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleCopy(item.id, formattedData)}
                        className="p-1.5 rounded bg-[#121822] hover:bg-[#00FF87] hover:text-[#05070A] text-slate-300 transition-colors"
                        title={language === 'ru' ? 'Копировать' : 'Copy'}
                      >
                        {copiedId === item.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>

                      {activeTab === 'saved' && (
                        <button
                          onClick={() => removeSetting(item.id)}
                          className="p-1.5 rounded bg-[#121822] hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors"
                          title={language === 'ru' ? 'Удалить' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Summary preview */}
                  <div className="p-3 bg-[#080B10] rounded-lg border border-[#151D28] font-mono text-[11px] text-slate-300 max-h-32 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{formattedData}</pre>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {currentItems.length > 0 && (
          <div className="px-6 py-3 border-t border-[#16202C] bg-[#07090D] flex items-center justify-between">
            <button
              onClick={activeTab === 'saved' ? clearAllSettings : clearHistory}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
            >
              {activeTab === 'saved' ? t('saved_clear_all') : 'Очистить историю'}
            </button>
            <button
              onClick={() => setIsSavedModalOpen(false)}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#121822] hover:bg-[#1A2333] border border-[#1C2636] rounded-md transition-colors"
            >
              {t('btn_close')}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
