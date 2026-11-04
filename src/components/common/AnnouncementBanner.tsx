import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import { Megaphone, X, ExternalLink, ShieldAlert, Sparkles } from 'lucide-react';

interface AnnouncementData {
  enabled: boolean;
  type: 'info' | 'warning' | 'success';
  titleRu: string;
  titleEn: string;
  messageRu: string;
  messageEn: string;
  linkText?: string;
  linkUrl?: string;
  badge?: string;
}

export const AnnouncementBanner: React.FC = () => {
  const { language } = useLanguage();
  const [data, setData] = useState<AnnouncementData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/announcement')
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((ann) => {
        if (ann && ann.enabled) {
          setData(ann);
        }
      })
      .catch(() => {});
  }, []);

  if (!data || !data.enabled || dismissed) return null;

  const title = language === 'ru' ? data.titleRu : data.titleEn;
  const message = language === 'ru' ? data.messageRu : data.messageEn;

  const bgStyles =
    data.type === 'warning'
      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
      : data.type === 'info'
      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
      : 'bg-[#00FF87]/10 border-[#00FF87]/30 text-[#00FF87]';

  return (
    <aside aria-label="Служебное объявление" className={`w-full border-b transition-all ${bgStyles} backdrop-blur-md`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1 rounded-md bg-black/30 shrink-0">
            {data.type === 'warning' ? (
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            ) : data.type === 'info' ? (
              <Megaphone className="w-4 h-4 text-cyan-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-[#00FF87]" />
            )}
          </div>

          <div className="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {data.badge && (
              <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded bg-black/40 border border-current">
                {data.badge}
              </span>
            )}
            <strong className="font-bold text-white">{title}</strong>
            <span className="text-slate-300 text-xs hidden md:inline">—</span>
            <span className="text-slate-300 text-xs line-clamp-1">{message}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          {data.linkUrl && (
            <Link
              to={data.linkUrl}
              className="px-2.5 py-1 rounded bg-black/40 hover:bg-black/60 text-white font-bold text-[11px] flex items-center gap-1 border border-white/10 hover:border-white/30 transition-all"
            >
              <span>{data.linkText || (language === 'ru' ? 'Подробнее' : 'Learn more')}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}

          <button
            onClick={() => setDismissed(true)}
            aria-label="Скрыть объявление"
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
