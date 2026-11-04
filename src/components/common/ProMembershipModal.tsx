import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFavorites } from '../../context/FavoritesContext';
import { useLanguage } from '../../context/LanguageContext';
import { X, Sparkles, Check, ShieldCheck } from 'lucide-react';

export const ProMembershipModal: React.FC = () => {
  const { isProModalOpen, setIsProModalOpen } = useFavorites();
  const { t, language } = useLanguage();
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (isProModalOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isProModalOpen]);

  if (!isProModalOpen) return null;

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setEmailSubmitted(true);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#0B0F16] border border-[#00FF87]/30 rounded-xl shadow-[0_0_40px_rgba(0,255,135,0.12)] overflow-hidden">
        {/* Modal Top Banner */}
        <div className="relative p-6 bg-gradient-to-br from-[#0E1522] to-[#080B10] border-b border-[#16202C]">
          <button
            onClick={() => setIsProModalOpen(false)}
            className="absolute top-4 right-4 p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#16202C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-md bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold text-[#00FF87] uppercase tracking-wider">
              Esports Suite
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            {t('pro_title')}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t('pro_desc')}
          </p>
        </div>

        {/* Feature List */}
        <div className="p-6 space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[#0E131C] border border-[#182333]">
              <div className="p-1 rounded bg-[#00FF87]/10 text-[#00FF87] mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">{t('pro_feat_1')}</div>
                <div className="text-slate-400 mt-0.5">
                  {language === 'ru'
                    ? 'Синхронизация профилей между смартфонами и турнирными планшетами без ограничений.'
                    : 'Cloud sync across smartphones and tournament tablets.'}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-[#0E131C] border border-[#182333]">
              <div className="p-1 rounded bg-[#00FF87]/10 text-[#00FF87] mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">{t('pro_feat_2')}</div>
                <div className="text-slate-400 mt-0.5">
                  {language === 'ru'
                    ? 'Пресеты участников финалов PMGC, Free Fire World Series и международных турниров.'
                    : 'Presets from international champions and tournament finalists.'}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-[#0E131C] border border-[#182333]">
              <div className="p-1 rounded bg-[#00FF87]/10 text-[#00FF87] mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">{t('pro_feat_3')}</div>
                <div className="text-slate-400 mt-0.5">
                  {language === 'ru'
                    ? 'Интерактивный график компенсации отдачи под конкретное оружие.'
                    : 'Interactive recoil compensation curve analyzer.'}
                </div>
              </div>
            </div>
          </div>

          {/* Waitlist for Future Accounts */}
          <div className="mt-5 pt-4 border-t border-[#16202C]">
            {emailSubmitted ? (
              <div className="p-3.5 rounded-lg bg-[#00FF87]/10 border border-[#00FF87]/30 text-center text-xs text-[#00FF87] font-semibold flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {language === 'ru'
                    ? 'Вы добавлены в список раннего доступа к PRO аккаунтам!'
                    : 'You have been registered for early access to PRO accounts!'}
                </span>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">
                  {language === 'ru'
                    ? 'Уведомить о запуске персональных аккаунтов и PRO синхронизации:'
                    : 'Get notified when PRO user accounts and cloud sync launch:'}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Telegram (@username) / Email..."
                    className="flex-1 bg-[#0E131C] border border-[#1A2536] focus:border-[#00FF87] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#00FF87] text-[#05070A] font-bold text-xs rounded-lg hover:bg-[#10E760] transition-colors whitespace-nowrap"
                  >
                    {language === 'ru' ? 'Записаться' : 'Join Waitlist'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
