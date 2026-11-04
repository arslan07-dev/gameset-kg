import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AdBannerSlot } from '../components/common/AdBannerSlot';
import { SEO } from '../components/common/SEO';
import {
  Zap,
  Cpu,
  Flame,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  ChevronDown,
  Thermometer,
} from 'lucide-react';

export const PerformanceGuidePage: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeAccordion, setActiveAccordion] = useState<string>('xiaomi');

  const guides = [
    {
      id: 'xiaomi',
      title: 'Xiaomi, Redmi & POCO (HyperOS / Game Turbo)',
      icon: Cpu,
      subtitle: language === 'ru'
        ? 'Снижение задержки сенсора и фиксация стабильных 120 FPS'
        : 'Touch latency reduction and locked 120 FPS',
      steps: [
        {
          title: language === 'ru' ? '1. Повышение отклика в Game Turbo' : '1. Maximize Touch Response in Game Turbo',
          desc: language === 'ru'
            ? 'Безопасность -> Game Turbo -> Дополнительные настройки для игры. Установите ползунок «Отклик на непрерывные нажатия» на 100% и чувствительность к повторным нажатиям на максимум.'
            : 'Security -> Game Turbo -> Additional settings. Set "Continuous touch response" to 100% and touch sensitivity to maximum.',
        },
        {
          title: language === 'ru' ? '2. Отключение расширения памяти (Виртуальный RAM)' : '2. Disable Virtual Memory Extension',
          desc: language === 'ru'
            ? 'Настройки -> Расширенные настройки -> Расширение памяти. Отключите эту функцию! Она использует медленную флеш-память вместо быстрой RAM, что вызывает фризы и микро-лаги во время тимфайтов.'
            : 'Settings -> Additional settings -> Memory extension. Disable this feature to prevent sudden frame drops during chaotic combat.',
        },
        {
          title: language === 'ru' ? '3. Снятие ограничений батареи' : '3. Battery Saver Exemption',
          desc: language === 'ru'
            ? 'Зажмите иконку игры -> «О приложении» -> «Контроль активности» -> выберите режим «Без ограничений».'
            : 'Long press game icon -> App info -> Battery saver -> Select "No restrictions".',
        },
      ],
    },
    {
      id: 'samsung',
      title: 'Samsung Galaxy (One UI / Game Booster)',
      icon: Smartphone,
      subtitle: language === 'ru'
        ? 'Game Plugins и альтернативное управление производительностью'
        : 'Game Plugins and alternate performance management',
      steps: [
        {
          title: language === 'ru' ? '1. Game Booster Labs: Альтернативное управление' : '1. Game Booster Labs Performance',
          desc: language === 'ru'
            ? 'В настройках Game Booster откройте раздел «Labs» и включите тумблер «Альтернативное управление производительностью». Это предотвратит агрессивный троттлинг процессора.'
            : 'Inside Game Booster settings, navigate to Labs and enable "Alternate game performance management" to prevent CPU throttling.',
        },
        {
          title: language === 'ru' ? '2. Включение высокой чувствительности сенсора' : '2. Enable Touch Sensitivity',
          desc: language === 'ru'
            ? 'Настройки -> Дисплей -> «Чувствительность». Включение этой опции компенсирует толщину защитных стекол и ускоряет регистрацию быстрых нажатий.'
            : 'Settings -> Display -> Touch sensitivity. Crucial for devices with screen protectors to ensure instant touch registration.',
        },
        {
          title: language === 'ru' ? '3. Фиксация максимального FPS через Game Plugins' : '3. Lock Max FPS with Game Plugins',
          desc: language === 'ru'
            ? 'Установите из Galaxy Store бесплатный плагин Game Plugins и модуль Game Booster Plus, выбрав профиль «Макс. FPS» для соревновательного шутера.'
            : 'Download Game Plugins from Galaxy Store and set the active profile to "Max FPS".',
        },
      ],
    },
    {
      id: 'ios',
      title: 'Apple iPhone (iOS Гид-доступ / Guided Access)',
      icon: ShieldCheck,
      subtitle: language === 'ru'
        ? 'Блокировка шторки уведомлений и фиксация 120Hz ProMotion'
        : 'Locking notification gestures and 120Hz ProMotion',
      steps: [
        {
          title: language === 'ru' ? '1. Активация Гид-доступа (Guided Access)' : '1. Guided Access Activation',
          desc: language === 'ru'
            ? 'Настройки -> Универсальный доступ -> Гид-доступ. В игре трижды нажмите кнопку питания. Это заблокирует случайный вызов шторки Центра уведомлений и панели Home при свайпе снизу.'
            : 'Settings -> Accessibility -> Guided Access. Triple-click the side button in-game to disable unintentional notification pull-downs.',
        },
        {
          title: language === 'ru' ? '2. Проверка лимита частоты кадров ProMotion' : '2. ProMotion Frame Rate Check',
          desc: language === 'ru'
            ? 'На моделях iPhone Pro убедитесь, что в Настройки -> Универсальный доступ -> Движение отключен пункт «Ограничение частоты кадров» (должно быть до 120 FPS).'
            : 'Ensure "Limit Frame Rate" is disabled under Accessibility -> Motion on iPhone Pro models.',
        },
        {
          title: language === 'ru' ? '3. Стандартный масштаб интерфейса' : '3. Standard Display Zoom',
          desc: language === 'ru'
            ? 'Настройки -> Экран и яркость -> Масштаб: установите «Стандартный», чтобы элементы управления в шутерах не сдвигались.'
            : 'Set Display Zoom to Standard to preserve layout button positions.',
        },
      ],
    },
    {
      id: 'transsion',
      title: 'Infinix & Tecno (Dar-link Engine & Game Space)',
      icon: Flame,
      subtitle: language === 'ru'
        ? 'Увеличение частоты сенсора и устранение троттлинга'
        : 'Touch sampling rate prioritization and thermal stabilization',
      steps: [
        {
          title: language === 'ru' ? '1. Активация Dar-link Engine' : '1. Activate Dar-link Engine',
          desc: language === 'ru'
            ? 'Вызовите боковую панель Game Space во время игры и переключитесь в режим «Performance / Соревновательный». Это выделит максимальные ресурсы графическому чипу.'
            : 'Pull up the Game Space sidebar in-game and toggle Performance mode to allocate full GPU horsepower.',
        },
        {
          title: language === 'ru' ? '2. Режим Touch Sampling Boost' : '2. Touch Sampling Rate Boost',
          desc: language === 'ru'
            ? 'В настройках Game Space выберите ускорение отклика экрана на максимум (до 360-480Hz instant touch).'
            : 'Maximize the Touch Boost slider inside Game Space parameters.',
        },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SEO
        title={
          language === 'ru'
            ? 'Гайд по оптимизации смартфонов — 120 FPS, отклик сенсора и Game Turbo | GAMESET KG'
            : 'Smartphone Performance Guide — 120 FPS, Touch Latency & Game Turbo | GAMESET KG'
        }
        description={
          language === 'ru'
            ? 'Руководство по оптимизации Xiaomi, POCO, Samsung, Apple и Realme. Снижение инпут-лага, фиксация 120 FPS, отключение виртуальной памяти и предотвращение троттлинга.'
            : 'Hardware optimization guides for Xiaomi, POCO, Samsung, Apple, and Realme. Eliminate touch latency, lock 120 FPS, and prevent thermal throttling.'
        }
        keywords="оптимизация hyperos для игр, как включить 120 фпс, game turbo poco, троттлинг телефона, задержка сенсора андроид, gameset kg"
        canonicalPath="/guides"
        breadcrumbs={[
          { name: language === 'ru' ? 'Главная' : 'Home', item: '/' },
          { name: language === 'ru' ? 'Гайды' : 'Guides', item: '/guides' },
        ]}
      />

      {/* Header */}
      <div className="space-y-3">
        <div className="text-xs font-mono font-bold text-[#00FF87] uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" />
          <span>{language === 'ru' ? 'Аппаратная оптимизация' : 'Hardware Optimization'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          {t('guide_title')}
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          {t('guide_subtitle')}
        </p>
      </div>

      {/* Accordion / Tab Guide Sections */}
      <div className="space-y-4">
        {guides.map((guide) => {
          const Icon = guide.icon;
          const isOpen = activeAccordion === guide.id;
          return (
            <div
              key={guide.id}
              className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                isOpen
                  ? 'bg-[#0E131C] border-[#00FF87]/40 shadow-xl'
                  : 'bg-[#0B0F16] border-[#182333] hover:border-slate-700'
              }`}
            >
              <button
                onClick={() => setActiveAccordion(isOpen ? '' : guide.id)}
                className="w-full p-5 sm:p-6 flex items-center justify-between text-left gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-lg ${isOpen ? 'bg-[#00FF87] text-[#05070A]' : 'bg-[#121822] text-slate-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {guide.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{guide.subtitle}</p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#00FF87]' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-[#141C28] space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {guide.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-[#0A0D14] border border-[#17212F] space-y-2 text-xs"
                      >
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#00FF87] shrink-0" />
                          <span>{step.title}</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed text-[11px]">
                          {step.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hardware & Temperature Management Tips */}
      <div className="rounded-xl bg-[#0B0F16] border border-[#192332] p-6 sm:p-8 space-y-6">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-emerald-400" />
          <span>{language === 'ru' ? 'Борьба с тепловым троттлингом (Thermal Throttling Guide)' : 'Thermal Throttling Prevention'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
            <div className="font-bold text-white">
              {language === 'ru' ? '1. Не играйте на быстрой зарядке' : '1. Avoid Fast Charging While Playing'}
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {language === 'ru'
                ? 'Быстрая зарядка нагревает аккумулятор до 44°C+. При такой температуре система защиты смартфона моментально снижает частоту процессора на 40-50%, вызывая резкие просадки FPS.'
                : 'Fast charging heats battery cells above 44°C, triggering aggressive SoC throttling and severe frame drops.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
            <div className="font-bold text-white">
              {language === 'ru' ? '2. Игровые напальчники (Finger Sleeves)' : '2. Conductive Finger Sleeves'}
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {language === 'ru'
                ? 'Напальчники из серебряного проводящего волокна гарантируют постоянный коэффициент трения по стеклу независимо от влажности пальцев во время потных клатчей.'
                : 'Silver fiber conductive finger sleeves maintain zero friction variance and prevent screen stickiness during high-intensity clutches.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
            <div className="font-bold text-white">
              {language === 'ru' ? '3. Полупроводниковые кулеры (Peltier Cooler)' : '3. Semiconductor Peltier Coolers'}
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {language === 'ru'
                ? 'Внешний кулер с элементом Пельтье охлаждает заднюю крышку смартфона до 20-25°C, позволяя процессору непрерывно держать максимальные частоты 120 FPS.'
                : 'Peltier element cooling radiators keep chassis temperature near 22°C, sustaining locked 120 FPS across extended tournament matches.'}
            </p>
          </div>
        </div>
      </div>

      {/* Ad slot */}
      <AdBannerSlot slotId="guide-bottom" format="horizontal" />
    </div>
  );
};
