import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AdBannerSlot } from '../components/common/AdBannerSlot';
import { SEO } from '../components/common/SEO';
import {
  Send,
  MessageCircle,
  Mail,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [category, setCategory] = useState('device');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !message.trim()) return;
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SEO
        title={
          language === 'ru'
            ? 'Контакты и связь с создателем — Arslan (@arslan_019) | GAMESET KG'
            : 'Contact & Creator Inquiries — Arslan (@arslan_019) | GAMESET KG'
        }
        description={
          language === 'ru'
            ? 'Свяжитесь с создателем платформы GAMESET KG (Arslan, @arslan_019). Предложить модель смартфона, сообщить об ошибке или отправить отзыв.'
            : 'Connect with the creator of GAMESET KG (Arslan, @arslan_019). Suggest new smartphone models, report bugs, or submit esports inquiries.'
        }
        canonicalPath="/contact"
        breadcrumbs={[
          { name: language === 'ru' ? 'Главная' : 'Home', item: '/' },
          { name: language === 'ru' ? 'Контакты' : 'Contact', item: '/contact' },
        ]}
      />
      {/* Header */}
      <div className="space-y-3">
        <div className="text-xs font-mono font-bold text-[#00FF87] uppercase tracking-wider flex items-center gap-2">
          <MessageCircle className="w-3.5 h-3.5" />
          <span>{language === 'ru' ? 'Обратная связь' : 'Feedback & Contact'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          {t('contact_title')}
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          {t('contact_desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Form */}
        <div className="lg:col-span-7 rounded-xl bg-[#0B0F16] border border-[#192332] p-6 sm:p-8">
          {isSubmitted ? (
            <div className="text-center py-12 space-y-4 animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-full bg-[#00FF87]/15 text-[#00FF87] flex items-center justify-center mx-auto border border-[#00FF87]/30">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {t('contact_sent_success')}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {language === 'ru'
                  ? 'Наша команда рассмотрит ваше предложение и при необходимости свяжется в Telegram.'
                  : 'Our engineering team will review your feedback and reach out via Telegram or email.'}
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setMessage('');
                }}
                className="mt-4 px-4 py-2 bg-[#101622] text-slate-200 text-xs font-bold rounded-lg hover:bg-[#16202E] transition-colors"
              >
                {language === 'ru' ? 'Отправить новое сообщение' : 'Send another inquiry'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  {t('contact_name')} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'ru' ? 'Например: Артем или @pro_player' : 'e.g. Alex or @player_tag'}
                  className="w-full px-3.5 py-2.5 bg-[#0E131C] border border-[#1A2536] focus:border-[#00FF87] rounded-lg text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  {t('contact_email')} *
                </label>
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="@username / email@domain.com"
                  className="w-full px-3.5 py-2.5 bg-[#0E131C] border border-[#1A2536] focus:border-[#00FF87] rounded-lg text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  {t('contact_type')}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0E131C] border border-[#1A2536] focus:border-[#00FF87] rounded-lg text-white focus:outline-none transition-colors"
                >
                  <option value="device">{t('contact_type_device')}</option>
                  <option value="feedback">{t('contact_type_feedback')}</option>
                  <option value="sponsor">{t('contact_type_sponsor')}</option>
                  <option value="other">{t('contact_type_other')}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  {t('contact_message')} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={language === 'ru' ? 'Опишите ваше предложение или модель смартфона для добавления в базу...' : 'Describe your suggestion or device model to add...'}
                  className="w-full px-3.5 py-2.5 bg-[#0E131C] border border-[#1A2536] focus:border-[#00FF87] rounded-lg text-white placeholder-slate-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#00FF87] hover:bg-[#10E760] text-[#05070A] font-black uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(0,255,135,0.2)] flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{t('btn_send_message')}</span>
              </button>
            </form>
          )}
        </div>

        {/* Community & Testing Channels */}
        <div className="lg:col-span-5 space-y-4">
          {/* Creator Direct Card */}
          <div className="p-5 rounded-xl bg-[#0B0F16] border border-[#192332] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-[#00FF87] uppercase tracking-wider">
                {language === 'ru' ? 'Создатель платформы' : 'Platform Creator'}
              </span>
              <span className="text-xs font-bold text-white">Arslan</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'ru'
                ? 'Прямая связь по вопросам сотрудничества, турниров и развития платформы GAMESET KG.'
                : 'Direct channel for esports collaborations, sponsorships, and platform inquiries.'}
            </p>
            <a
              href="https://t.me/arslan_019"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-lg bg-[#0E131C] hover:bg-[#151D2A] text-slate-200 border border-[#1A2536] hover:border-[#00FF87] text-xs font-bold flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#00FF87]" />
                <span className="font-mono text-xs">@arslan_019</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
            </a>
          </div>

          <div className="p-6 rounded-xl bg-[#0B0F16] border border-[#192332] space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#00FF87]" />
              <span>{language === 'ru' ? 'Telegram сообщество игроков' : 'Telegram Gaming Community'}</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'ru'
                ? 'Ежедневные праксы, турниры, кастомные комнаты и оперативные обсуждения обновлений патчей.'
                : 'Daily scrims, competitive custom rooms, tournament updates, and patch discussion.'}
            </p>
            <a
              href="https://t.me/arslan_019"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-lg bg-[#101622] hover:bg-[#16202E] text-slate-200 border border-[#1A2536] hover:border-[#00FF87] text-xs font-bold flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#00FF87]" />
                <span className="font-mono text-xs">@arslan_019</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
            </a>
          </div>

          <div className="p-6 rounded-xl bg-[#0B0F16] border border-[#192332] space-y-2.5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>{language === 'ru' ? 'Лаборатория калибровки' : 'Calibration Testing Lab'}</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'ru'
                ? 'Если у вас редкая модель смартфона (Asus ROG, RedMagic, Black Shark или новый флагман), свяжитесь с нами для совместного замера частоты сенсора.'
                : 'If you use specialized gaming hardware (ROG Phone, RedMagic, Black Shark), contact us to benchmark touch response curves together.'}
            </p>
          </div>
        </div>
      </div>

      {/* Ad slot */}
      <AdBannerSlot slotId="contact-bottom" format="horizontal" />
    </div>
  );
};
