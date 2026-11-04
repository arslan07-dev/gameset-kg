import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Info } from 'lucide-react';

interface AdBannerSlotProps {
  slotId?: string;
  format?: 'horizontal' | 'rectangle';
  className?: string;
}

export const AdBannerSlot: React.FC<AdBannerSlotProps> = ({
  slotId = 'gameset-kg-leaderboard-01',
  format = 'horizontal',
  className = '',
}) => {
  const { t } = useLanguage();

  return (
    <div
      className={`my-8 rounded-xl border border-dashed border-[#1E293B] bg-[#0A0E17]/60 p-4 transition-all ${className}`}
      data-ad-client="ca-pub-gameset-kg-prepared"
      data-ad-slot={slotId}
    >
      <div className="flex flex-col items-center justify-center text-center py-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
          <Info className="w-3.5 h-3.5 text-slate-500" />
          <span>Google AdSense Slot · {format.toUpperCase()}</span>
        </div>
        <p className="text-[11px] text-slate-400 max-w-md">
          {t('ad_disclaimer')}
        </p>
      </div>
    </div>
  );
};
