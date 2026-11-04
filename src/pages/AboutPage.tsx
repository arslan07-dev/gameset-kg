import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AdBannerSlot } from '../components/common/AdBannerSlot';
import { SEO } from '../components/common/SEO';
import {
  ShieldCheck,
  Target,
  Users,
  Compass,
  CheckCircle2,
  Award,
  Zap,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SEO
        title={
          language === 'ru'
            ? 'О проекте GAMESET KG — Лаборатория киберспортивных настроек'
            : 'About GAMESET KG — Esports Gaming Calibration Platform'
        }
        description={
          language === 'ru'
            ? 'История создания и миссия платформы GAMESET KG. Честная калибровка сенсоров смартфонов, помощь игрокам в турнирах и открытый обмен опытом.'
            : 'Mission and engineering philosophy behind GAMESET KG. Scientific touchscreen calibration and competitive mobile gaming settings.'
        }
        canonicalPath="/about"
        breadcrumbs={[
          { name: language === 'ru' ? 'Главная' : 'Home', item: '/' },
          { name: language === 'ru' ? 'О нас' : 'About', item: '/about' },
        ]}
      />
      {/* Header */}
      <div className="space-y-3">
        <div className="text-xs font-mono font-bold text-[#00FF87] uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{language === 'ru' ? 'Киберспортивная лаборатория' : 'Esports Hardware Lab'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          {t('about_title')}
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          {t('about_mission')}
        </p>
      </div>

      {/* Main Philosophy Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-[#0B0F16] border border-[#192332] space-y-3 shadow-lg">
          <div className="p-2.5 rounded-lg bg-[#00FF87]/10 text-[#00FF87] w-fit border border-[#00FF87]/20">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">
            {language === 'ru' ? '100% Открыто и бесплатно' : '100% Transparent & Free'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {language === 'ru'
              ? 'Никаких платных «чудо-файлов» или фейковых скриптов. Все параметры проверены в тренировочных лобби и соревновательных праксах.'
              : 'Zero paid "magic config" files or snake-oil scripts. All configurations are verified on training grounds and scrims.'}
          </p>
        </div>

        <div className="p-6 rounded-xl bg-[#0B0F16] border border-[#192332] space-y-3 shadow-lg">
          <div className="p-2.5 rounded-lg bg-[#00FF87]/10 text-[#00FF87] w-fit border border-[#00FF87]/20">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">
            {language === 'ru' ? 'Инженерный расчет' : 'Calculated Baselines'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t('about_methodology_desc')}
          </p>
        </div>

        <div className="p-6 rounded-xl bg-[#0B0F16] border border-[#192332] space-y-3 shadow-lg">
          <div className="p-2.5 rounded-lg bg-[#00FF87]/10 text-[#00FF87] w-fit border border-[#00FF87]/20">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">
            {language === 'ru' ? 'Создатель & Команда' : 'Creator & Community'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t('about_team')}
          </p>
          <div className="pt-2 border-t border-[#141C28] flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">{language === 'ru' ? 'Создатель: Arslan' : 'Created by Arslan'}</span>
            <a
              href="https://t.me/arslan_019"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] font-semibold text-[#00FF87] hover:underline flex items-center gap-1"
            >
              <span>@arslan_019</span>
            </a>
          </div>
        </div>
      </div>

      {/* Methodology Section */}
      <div className="p-6 sm:p-8 rounded-xl bg-[#0B0F16] border border-[#192332] space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-[#00FF87]" />
          <span>{t('about_methodology_title')}</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            {language === 'ru'
              ? 'Каждый дисплей смартфона обладает индивидуальными физическими свойствами: плотностью пикселей (PPI), частотой опроса сенсора (Touch Sampling Rate 120Hz – 480Hz) и физической диагональю. Например, POCO X6 Pro регистрирует 480 касаний в секунду, в то время как базовый iPhone 11 опрашивает сенсор с частотой 120Hz.'
              : 'Every mobile display operates with distinct physical characteristics: pixel density (PPI), touch sampling frequency (120Hz - 480Hz), and diagonal dimensions. A 480Hz touch layer registers touch data four times as frequently as a 120Hz panel.'}
          </p>
          <p>
            {language === 'ru'
              ? 'Именно поэтому один и тот же числовой параметр чувствительности ощущается совершенно по-разному на разных смартфонах. Наша система рассчитывает нормализующий коэффициент, чтобы прицел двигался предсказуемо и без срывов.'
              : 'This is why identical raw sensitivity numbers feel radically different across different phones. Our algorithm applies normalizing modifiers to guarantee predictable tracking.'}
          </p>
        </div>
      </div>

      {/* Ad slot */}
      <AdBannerSlot slotId="about-bottom" format="horizontal" />
    </div>
  );
};
