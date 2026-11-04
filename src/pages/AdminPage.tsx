import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SEO } from '../components/common/SEO';
import { CommunitySubmission, GameId, DeviceBrand } from '../types';
import {
  Shield,
  Lock,
  User,
  CheckCircle,
  XCircle,
  Trash2,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Sliders,
  Smartphone,
  MessageSquare,
  Megaphone,
  Star,
  Plus,
  Eye,
  Clock,
  KeyRound,
  FileCheck,
  Search,
  ExternalLink,
  Save,
  Check,
} from 'lucide-react';
import { DEVICE_BRANDS } from '../data/devices';

const ADMIN_STORAGE_KEY = 'gameset_admin_session_v2';
const INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutes client auto-logout

interface CommentItem {
  id: string;
  submissionId: string;
  author: string;
  text: string;
  createdAt: string;
  submissionModel?: string;
}

interface ReportItem {
  id: string;
  submissionId: string;
  reason: string;
  reportedBy: string;
  status: 'open' | 'resolved';
  createdAt: string;
  submissionModel?: string;
  submissionAuthor?: string;
}

interface ManagedDeviceItem {
  id: string;
  brand: string;
  model: string;
  refreshRate: number;
  touchSamplingRate: number;
  chipset: string;
  screenSize: string;
  ram: string;
  screenType: string;
  sensitivityModifier: number;
  recommendedDpiRange: string;
  createdAt: string;
}

interface SiteAnnouncementState {
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

export const AdminPage: React.FC = () => {
  const { t, language } = useLanguage();

  // Authentication & Security State
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem(ADMIN_STORAGE_KEY) || localStorage.getItem(ADMIN_STORAGE_KEY);
  });
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(() => {
    return Boolean(sessionStorage.getItem(ADMIN_STORAGE_KEY) || localStorage.getItem(ADMIN_STORAGE_KEY));
  });
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [lockoutRemaining, setLockoutRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionAdminUser, setSessionAdminUser] = useState<string>('admin');
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Dashboard Tabs
  type AdminTab = 'submissions' | 'games' | 'devices' | 'comments' | 'reports' | 'announcements' | 'security';
  const [activeTab, setActiveTab] = useState<AdminTab>('submissions');

  // Submissions State
  const [submissions, setSubmissions] = useState<CommunitySubmission[]>([]);
  const [subFilter, setSubFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'official'>('all');
  const [subSearch, setSubSearch] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Некорректные параметры / спам');

  // Comments & Reports State
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [securityStats, setSecurityStats] = useState<any>(null);

  // Managed Devices State
  const [devices, setDevices] = useState<ManagedDeviceItem[]>([]);
  const [newDevice, setNewDevice] = useState({
    brand: 'POCO' as DeviceBrand,
    model: '',
    refreshRate: 120,
    touchSamplingRate: 240,
    chipset: '',
    screenSize: '6.67" AMOLED',
    ram: '8 GB / 12 GB',
    screenType: 'AMOLED',
    sensitivityModifier: 1.05,
    recommendedDpiRange: '440 - 480',
  });
  const [deviceSuccessMsg, setDeviceSuccessMsg] = useState('');

  // Announcement State
  const [announcement, setAnnouncement] = useState<SiteAnnouncementState>({
    enabled: true,
    type: 'success',
    titleRu: 'Сезон 2026: Обновление Free Fire OB48',
    titleEn: 'Season 2026: Free Fire OB48 Calibration',
    messageRu: 'Все пресеты Free Fire обновлены до новой шкалы 0–200! Проверьте новые настройки для своего смартфона.',
    messageEn: 'All Free Fire presets have been updated to the new 0–200 scale! Check calibrated settings for your phone.',
    badge: 'NEW 0-200',
    linkText: 'Открыть Free Fire',
    linkUrl: '/games/free-fire',
  });
  const [annSaveMsg, setAnnSaveMsg] = useState('');

  // New Game Preset State (Direct Creator)
  const [newPresetGame, setNewPresetGame] = useState<GameId>('free-fire');
  const [newPresetBrand, setNewPresetBrand] = useState<DeviceBrand>('Apple');
  const [newPresetModel, setNewPresetModel] = useState('');
  const [newPresetAuthor, setNewPresetAuthor] = useState('GAMESET KG Pro Staff');
  const [newPresetStyle, setNewPresetStyle] = useState('One-Tap Headshot');
  const [newPresetDpi, setNewPresetDpi] = useState<number>(440);
  const [newPresetGraphics, setNewPresetGraphics] = useState('Smooth + Max FPS');
  const [newPresetDesc, setNewPresetDesc] = useState('Официально протестированный соревновательный пресет.');
  const [newPresetIsOfficial, setNewPresetIsOfficial] = useState(true);
  const [newPresetSuccessMsg, setNewPresetSuccessMsg] = useState('');

  // Free Fire Sensitivities (0-200)
  const [ffGeneral, setFfGeneral] = useState(190);
  const [ffRedDot, setFfRedDot] = useState(185);
  const [ff2x, setFf2x] = useState(175);
  const [ff4x, setFf4x] = useState(165);
  const [ffSniper, setFfSniper] = useState(110);
  const [ffFreeLook, setFfFreeLook] = useState(160);
  const [ffButtonSize, setFfButtonSize] = useState(45);

  // PUBG Sensitivities
  const [pubgLayoutCode, setPubgLayoutCode] = useState('7249-8812-4910-3329-84');
  const [pubgGyroNoScope, setPubgGyroNoScope] = useState(380);
  const [pubgGyroRedDot, setPubgGyroRedDot] = useState(390);

  // Inactivity Timer Hook
  const resetInactivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  useEffect(() => {
    if (!token) return;

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((evt) => window.addEventListener(evt, resetInactivity, { passive: true }));

    const interval = setInterval(() => {
      const inactiveFor = Date.now() - lastActivity;
      if (inactiveFor >= INACTIVITY_LIMIT_MS) {
        handleLogout('Сессия завершена автоматически из-за 30 минут неактивности.');
      }
    }, 15000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, resetInactivity));
      clearInterval(interval);
    };
  }, [token, lastActivity, resetInactivity]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutRemaining === null || lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev === null || prev <= 1) return null;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  // Verify token on mount
  useEffect(() => {
    if (token) {
      verifyAndLoadData();
    }
  }, [token]);

  const verifyAndLoadData = async () => {
    if (!token) {
      setIsCheckingAuth(false);
      setIsVerified(false);
      return;
    }
    setLoading(true);
    setIsCheckingAuth(true);
    try {
      const verifyRes = await fetch('/api/admin/verify', {
        headers: { 'x-admin-token': token },
      });
      if (!verifyRes.ok) {
        setIsVerified(false);
        setIsCheckingAuth(false);
        handleLogout('Сессия истекла или недействительна.');
        return;
      }
      const verifyData = await verifyRes.json();
      setSessionAdminUser(verifyData.username || 'admin');
      setIsVerified(true);
      setIsCheckingAuth(false);

      // Load all admin datasets in parallel
      await Promise.all([
        fetchStats(),
        fetchSubmissions(),
        fetchComments(),
        fetchReports(),
        fetchDevices(),
        fetchAnnouncement(),
        fetchSecurityStatus(),
      ]);
    } catch (e) {
      console.error('Failed to verify or load admin data', e);
      setIsVerified(false);
      setIsCheckingAuth(false);
    } finally {
      setLoading(false);
      setIsCheckingAuth(false);
    }
  };

  const fetchStats = async () => {
    if (!token) return;
    const res = await fetch('/api/admin/stats', { headers: { 'x-admin-token': token } });
    if (res.ok) setStats(await res.json());
  };

  const fetchSubmissions = async () => {
    if (!token) return;
    const res = await fetch('/api/submissions', { headers: { 'x-admin-token': token } });
    if (res.ok) setSubmissions(await res.json());
  };

  const fetchComments = async () => {
    if (!token) return;
    const res = await fetch('/api/admin/comments', { headers: { 'x-admin-token': token } });
    if (res.ok) setComments(await res.json());
  };

  const fetchReports = async () => {
    if (!token) return;
    const res = await fetch('/api/admin/reports', { headers: { 'x-admin-token': token } });
    if (res.ok) setReports(await res.json());
  };

  const fetchDevices = async () => {
    if (!token) return;
    const res = await fetch('/api/admin/devices', { headers: { 'x-admin-token': token } });
    if (res.ok) setDevices(await res.json());
  };

  const fetchAnnouncement = async () => {
    const res = await fetch('/api/announcement');
    if (res.ok) setAnnouncement(await res.json());
  };

  const fetchSecurityStatus = async () => {
    if (!token) return;
    const res = await fetch('/api/admin/security-status', { headers: { 'x-admin-token': token } });
    if (res.ok) setSecurityStats(await res.json());
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 && data.remainingSeconds) {
          setLockoutRemaining(data.remainingSeconds);
        }
        throw new Error(data.error || 'Ошибка входа');
      }

      setToken(data.token);
      sessionStorage.setItem(ADMIN_STORAGE_KEY, data.token);
      localStorage.setItem(ADMIN_STORAGE_KEY, data.token);
      setPassword('');
      setSessionAdminUser(data.username || 'admin');
      setIsVerified(true);
      setIsCheckingAuth(false);
      setLastActivity(Date.now());
    } catch (err: any) {
      setIsVerified(false);
      setIsCheckingAuth(false);
      setLoginError(err.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = (message?: string) => {
    if (token) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'x-admin-token': token },
      }).catch(() => {});
    }
    setToken(null);
    setIsVerified(false);
    setIsCheckingAuth(false);
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    if (message) {
      setLoginError(message);
    }
  };

  // Actions on Submissions
  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected', reason?: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/submissions/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({
          status: newStatus,
          rejectionReason: reason,
        }),
      });
      if (res.ok) {
        fetchSubmissions();
        fetchStats();
        setRejectingId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleOfficial = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/submissions/${id}/official`, {
        method: 'PATCH',
        headers: { 'x-admin-token': token },
      });
      if (res.ok) {
        fetchSubmissions();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (!token) return;
    if (!window.confirm('Вы действительно хотите удалить этот пресет?')) return;
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token },
      });
      if (res.ok) {
        fetchSubmissions();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Comments Actions
  const handleDeleteComment = async (id: string) => {
    if (!token) return;
    if (!window.confirm('Удалить этот комментарий?')) return;
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token },
      });
      if (res.ok) {
        fetchComments();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reports Actions
  const handleResolveReport = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/reports/${id}/resolve`, {
        method: 'POST',
        headers: { 'x-admin-token': token },
      });
      if (res.ok) {
        fetchReports();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Smartphone Action
  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch('/api/admin/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify(newDevice),
      });
      if (res.ok) {
        setDeviceSuccessMsg('Смартфон успешно добавлен в базу!');
        fetchDevices();
        fetchStats();
        setNewDevice({
          ...newDevice,
          model: '',
          chipset: '',
        });
        setTimeout(() => setDeviceSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDevice = async (id: string) => {
    if (!token) return;
    if (!window.confirm('Удалить эту модель из базы?')) return;
    try {
      const res = await fetch(`/api/admin/devices/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token },
      });
      if (res.ok) {
        fetchDevices();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Announcement
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch('/api/admin/announcement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify(announcement),
      });
      if (res.ok) {
        setAnnSaveMsg('Объявление сохранено и активно на сайте!');
        setTimeout(() => setAnnSaveMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Preset Action
  const handleCreatePreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      let sensitivityData: Record<string, any> = {};

      if (newPresetGame === 'free-fire') {
        sensitivityData = {
          general: Number(ffGeneral),
          redDot: Number(ffRedDot),
          scope2x: Number(ff2x),
          scope4x: Number(ff4x),
          sniperScope: Number(ffSniper),
          freeLook: Number(ffFreeLook),
          fireButtonSize: Number(ffButtonSize),
          fireButtonPosition: 'Нижний правый угол (28%)',
        };
      } else if (newPresetGame === 'pubg-mobile') {
        sensitivityData = {
          layoutCode: pubgLayoutCode,
          gyroscope: { noScope: pubgGyroNoScope, redDot: pubgGyroRedDot, scope3x: 310, scope4x: 260 },
          ads: { redDot: 60, scope3x: 32 },
        };
      } else {
        sensitivityData = {
          cameraSensitivity: 88,
          targetingPriority: 'Lowest HP',
          highFps: true,
        };
      }

      const res = await fetch('/api/admin/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({
          gameId: newPresetGame,
          gameName:
            newPresetGame === 'free-fire'
              ? 'Free Fire MAX'
              : newPresetGame === 'pubg-mobile'
              ? 'PUBG Mobile'
              : newPresetGame === 'mobile-legends'
              ? 'Mobile Legends'
              : 'Call of Duty Mobile',
          brand: newPresetBrand,
          model: newPresetModel || `${newPresetBrand} Flagship Pro`,
          author: newPresetAuthor,
          style: newPresetStyle,
          description: newPresetDesc,
          dpi: newPresetDpi,
          graphics: newPresetGraphics,
          sensitivity: sensitivityData,
          isOfficialRecommendation: newPresetIsOfficial,
        }),
      });

      if (res.ok) {
        setNewPresetSuccessMsg('Официальный пресет успешно опубликован!');
        fetchSubmissions();
        fetchStats();
        setTimeout(() => setNewPresetSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------------------------------------
  // Checking Auth State (Verifying cryptographic token with server)
  // -------------------------------------------------------------
  if (isCheckingAuth) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#00FF87] animate-spin mx-auto" />
          <div className="text-sm font-bold text-white">Проверка сессии администратора...</div>
          <div className="text-xs text-slate-400 font-mono">Верификация криптографического токена на сервере</div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Unauthenticated: Protected Login View
  // -------------------------------------------------------------
  if (!token || !isVerified) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <SEO
          title="Админ-панель | GAMESET KG"
          description="Закрытый шлюз управления GAMESET KG"
          noindex={true}
        />
        <div className="max-w-md w-full bg-[#0B0F16] border border-[#192332] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          {/* Neon background accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF87]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center space-y-2 relative">
            <div className="w-14 h-14 rounded-2xl bg-[#00FF87]/10 border border-[#00FF87]/30 text-[#00FF87] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(0,255,135,0.15)]">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide">Панель Администратора</h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Закрытый шлюз управления GAMESET KG. Доступ разрешён исключительно владельцу сайта.
            </p>
          </div>

          {/* Lockout Banner */}
          {lockoutRemaining !== null && lockoutRemaining > 0 && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Доступ заблокирован (защита от перебора)</span>
              </div>
              <p>
                Повторная попытка будет доступна через{' '}
                <span className="font-mono font-bold text-white">{lockoutRemaining}</span> сек.
              </p>
            </div>
          )}

          {/* Login Error Notice */}
          {loginError && !lockoutRemaining && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-bold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 relative">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#00FF87]" />
                <span>Логин администратора</span>
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-4 py-2.5 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF87] transition-colors"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#00FF87]" />
                <span>Пароль администратора</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full px-4 py-2.5 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF87] transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || Boolean(lockoutRemaining && lockoutRemaining > 0)}
              className="w-full py-3 bg-[#00FF87] hover:bg-[#10E760] disabled:opacity-50 text-[#05070A] font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(0,255,135,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Проверка криптографического токена...' : 'Войти в панель'}</span>
            </button>
          </form>

          {/* Security Notice */}
          <div className="pt-2 border-t border-[#182332] text-[11px] text-slate-500 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-[#00FF87]/80">
              <Shield className="w-3 h-3" />
              <span>Server-Side Rate Limiter & Timing-Safe SHA-256</span>
            </div>
            <p>Регистрация обычных пользователей отключена в ядре безопасности.</p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Filtered Submissions
  // -------------------------------------------------------------
  const filteredSubmissions = submissions.filter((sub) => {
    if (subFilter === 'pending' && sub.status !== 'pending') return false;
    if (subFilter === 'approved' && sub.status !== 'approved') return false;
    if (subFilter === 'rejected' && sub.status !== 'rejected') return false;
    if (subFilter === 'official' && !sub.isOfficialRecommendation) return false;

    if (subSearch) {
      const q = subSearch.toLowerCase();
      const match =
        sub.model.toLowerCase().includes(q) ||
        sub.brand.toLowerCase().includes(q) ||
        sub.author.toLowerCase().includes(q) ||
        sub.gameName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <SEO
        title="Панель управления | GAMESET KG"
        description="Закрытый шлюз управления GAMESET KG"
        noindex={true}
      />
      {/* Top Header & Session Bar */}
      <div className="bg-[#0B0F16] border border-[#192332] rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00FF87]/10 border border-[#00FF87]/30 text-xs font-mono font-bold text-[#00FF87] uppercase">
              <Shield className="w-3.5 h-3.5" />
              <span>Root Administrator</span>
            </span>
            <span className="text-xs font-mono text-slate-400">
              Пользователь: <strong className="text-white">{sessionAdminUser}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
              ● Сессия активна (таймаут 30 мин)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Панель Управления GAMESET KG</h1>
          <p className="text-xs text-slate-400">
            Полный контроль над базой пресетов, моделями смартфонов, объявлениями и модерацией сообщества.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={verifyAndLoadData}
            disabled={loading}
            className="px-3.5 py-2 bg-[#121822] hover:bg-[#1A2330] text-slate-200 border border-[#1E293B] rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            title="Обновить данные"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00FF87]' : ''}`} />
            <span>Обновить</span>
          </button>

          {/* Prominent Red Log Out Button */}
          <button
            onClick={() => handleLogout()}
            className="px-4 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-white border border-rose-500/40 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_12px_rgba(244,63,94,0.15)] cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Выйти из аккаунта</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Counters */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-[#0B0F16] border border-amber-500/20">
            <div className="text-[11px] text-slate-400 uppercase font-mono">На проверке</div>
            <div className="text-2xl font-black font-mono text-amber-400 mt-0.5">{stats.pending}</div>
          </div>
          <div className="p-4 rounded-xl bg-[#0B0F16] border border-[#00FF87]/20">
            <div className="text-[11px] text-slate-400 uppercase font-mono">Одобрено</div>
            <div className="text-2xl font-black font-mono text-[#00FF87] mt-0.5">{stats.approved}</div>
          </div>
          <div className="p-4 rounded-xl bg-[#0B0F16] border border-cyan-500/20">
            <div className="text-[11px] text-slate-400 uppercase font-mono">Официальные</div>
            <div className="text-2xl font-black font-mono text-cyan-400 mt-0.5">{stats.official || 0}</div>
          </div>
          <div className="p-4 rounded-xl bg-[#0B0F16] border border-rose-500/20">
            <div className="text-[11px] text-slate-400 uppercase font-mono">Жалобы</div>
            <div className="text-2xl font-black font-mono text-rose-400 mt-0.5">{stats.reportsCount}</div>
          </div>
          <div className="p-4 rounded-xl bg-[#0B0F16] border border-[#192332]">
            <div className="text-[11px] text-slate-400 uppercase font-mono">Комментарии</div>
            <div className="text-2xl font-black font-mono text-slate-200 mt-0.5">{stats.commentsCount}</div>
          </div>
          <div className="p-4 rounded-xl bg-[#0B0F16] border border-[#192332]">
            <div className="text-[11px] text-slate-400 uppercase font-mono">Смартфоны</div>
            <div className="text-2xl font-black font-mono text-purple-400 mt-0.5">{stats.devicesCount || devices.length}</div>
          </div>
        </div>
      )}

      {/* Main Tabbed Navigation */}
      <div className="flex items-center gap-1.5 border-b border-[#182332] pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'submissions'
              ? 'bg-[#00FF87] text-[#05070A] shadow-[0_0_12px_rgba(0,255,135,0.2)]'
              : 'text-slate-400 hover:text-white bg-[#0F141F]'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Модерация заявок</span>
          <span className="px-1.5 py-0.2 rounded bg-black/30 text-[10px]">{submissions.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('games')}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'games'
              ? 'bg-[#00FF87] text-[#05070A] shadow-[0_0_12px_rgba(0,255,135,0.2)]'
              : 'text-slate-400 hover:text-white bg-[#0F141F]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Создать пресет</span>
        </button>

        <button
          onClick={() => setActiveTab('devices')}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'devices'
              ? 'bg-[#00FF87] text-[#05070A] shadow-[0_0_12px_rgba(0,255,135,0.2)]'
              : 'text-slate-400 hover:text-white bg-[#0F141F]'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>База смартфонов</span>
          <span className="px-1.5 py-0.2 rounded bg-black/30 text-[10px]">{devices.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'comments'
              ? 'bg-[#00FF87] text-[#05070A] shadow-[0_0_12px_rgba(0,255,135,0.2)]'
              : 'text-slate-400 hover:text-white bg-[#0F141F]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Комментарии</span>
          <span className="px-1.5 py-0.2 rounded bg-black/30 text-[10px]">{comments.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-[#00FF87] text-[#05070A] shadow-[0_0_12px_rgba(0,255,135,0.2)]'
              : 'text-slate-400 hover:text-white bg-[#0F141F]'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Жалобы игроков</span>
          {reports.filter((r) => r.status === 'open').length > 0 && (
            <span className="px-1.5 py-0.2 rounded bg-rose-500 text-white text-[10px]">
              {reports.filter((r) => r.status === 'open').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'announcements'
              ? 'bg-[#00FF87] text-[#05070A] shadow-[0_0_12px_rgba(0,255,135,0.2)]'
              : 'text-slate-400 hover:text-white bg-[#0F141F]'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Объявления сайта</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'security'
              ? 'bg-[#00FF87] text-[#05070A] shadow-[0_0_12px_rgba(0,255,135,0.2)]'
              : 'text-slate-400 hover:text-white bg-[#0F141F]'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Безопасность и аудит</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: SUBMISSIONS MODERATION */}
      {/* ========================================================= */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          {/* Controls: Search and Sub-filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {(['all', 'pending', 'approved', 'rejected', 'official'] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => setSubFilter(filterKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    subFilter === filterKey
                      ? 'bg-[#182332] text-[#00FF87] border border-[#00FF87]/40'
                      : 'text-slate-400 hover:text-white bg-[#0B0F16] border border-[#192332]'
                  }`}
                >
                  {filterKey === 'all'
                    ? 'Все заявки'
                    : filterKey === 'pending'
                    ? 'Ожидают проверки'
                    : filterKey === 'approved'
                    ? 'Одобренные'
                    : filterKey === 'rejected'
                    ? 'Отклонённые'
                    : '★ Официальные'}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                placeholder="Поиск по модели или нику..."
                className="w-full pl-9 pr-3 py-2 bg-[#0B0F16] border border-[#192332] rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF87]"
              />
            </div>
          </div>

          {/* Submissions List */}
          {filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 rounded-xl bg-[#0B0F16] border border-[#192332]">
              Заявок по выбранному фильтру не найдено.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className={`p-5 rounded-xl bg-[#0B0F16] border transition-all space-y-4 ${
                    sub.isOfficialRecommendation
                      ? 'border-[#00FF87]/40 shadow-[0_0_15px_rgba(0,255,135,0.05)]'
                      : 'border-[#192332]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#16202C] pb-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                            sub.status === 'pending'
                              ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                              : sub.status === 'approved'
                              ? 'bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/30'
                              : 'bg-rose-400/10 text-rose-400 border border-rose-400/30'
                          }`}
                        >
                          {sub.status === 'pending'
                            ? 'На проверке'
                            : sub.status === 'approved'
                            ? 'Одобрено'
                            : 'Отклонено'}
                        </span>

                        {sub.isOfficialRecommendation && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 font-bold">
                            <Star className="w-3 h-3 fill-cyan-300" />
                            <span>Официальный пресет</span>
                          </span>
                        )}

                        <span className="text-xs font-mono text-slate-400">{sub.gameName}</span>
                      </div>

                      <h3 className="text-lg font-bold text-white">
                        {sub.model} <span className="text-slate-400 font-normal">({sub.brand})</span>
                      </h3>
                      <div className="text-xs text-slate-400">
                        Автор: <strong className="text-white">{sub.author}</strong> · Стиль: {sub.style} ·{' '}
                        {new Date(sub.createdAt).toLocaleString()} · Голосов: {sub.upvotes}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      {sub.status !== 'approved' && (
                        <button
                          onClick={() => handleUpdateStatus(sub.id, 'approved')}
                          className="px-3 py-1.5 bg-[#00FF87] hover:bg-[#10E760] text-[#05070A] font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Одобрить</span>
                        </button>
                      )}

                      {sub.status !== 'rejected' && (
                        <button
                          onClick={() => setRejectingId(sub.id)}
                          className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Отклонить</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleOfficial(sub.id)}
                        className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          sub.isOfficialRecommendation
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-[#121822] text-slate-400 border-[#1E293B] hover:text-cyan-300'
                        }`}
                        title="Переключить официальный статус"
                      >
                        <Star className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteSubmission(sub.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Удалить заявку"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {sub.description && (
                    <p className="text-xs text-slate-300 italic bg-[#0F141F] p-3 rounded-lg border border-[#182333]">
                      «{sub.description}»
                    </p>
                  )}

                  {/* Technical Parameters Display */}
                  <div className="p-3.5 rounded-lg bg-[#0F141F] border border-[#182333] font-mono text-xs text-slate-300 space-y-1.5">
                    <div className="text-[11px] font-bold text-[#00FF87] uppercase">Параметры чувствительности:</div>
                    <pre className="text-[11px] text-slate-300 whitespace-pre-wrap break-all overflow-x-auto">
                      {JSON.stringify(sub.sensitivity, null, 2)}
                    </pre>
                    <div className="flex flex-wrap gap-4 pt-1 text-slate-400 text-[11px]">
                      {sub.dpi && <span>DPI: <strong className="text-white">{sub.dpi}</strong></span>}
                      {sub.graphics && <span>Графика: <strong className="text-white">{sub.graphics}</strong></span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CREATE / EDIT GAME PRESET */}
      {/* ========================================================= */}
      {activeTab === 'games' && (
        <div className="bg-[#0B0F16] border border-[#192332] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#182332] pb-4">
            <h2 className="text-xl font-black text-white">Создание официального игрового пресета</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Публикация проверенных параметров от администрации GAMESET KG с поддержкой калибровки 0–200.
            </p>
          </div>

          {newPresetSuccessMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{newPresetSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreatePreset} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">Дисциплина</label>
                <select
                  value={newPresetGame}
                  onChange={(e) => setNewPresetGame(e.target.value as GameId)}
                  className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF87]"
                >
                  <option value="free-fire">Free Fire MAX (шкала 0-200)</option>
                  <option value="pubg-mobile">PUBG Mobile (Гироскоп & ADS)</option>
                  <option value="mobile-legends">Mobile Legends</option>
                  <option value="cod-mobile">Call of Duty Mobile</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">Бренд смартфона</label>
                <select
                  value={newPresetBrand}
                  onChange={(e) => setNewPresetBrand(e.target.value as DeviceBrand)}
                  className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF87]"
                >
                  {DEVICE_BRANDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">Название модели</label>
                <input
                  type="text"
                  required
                  value={newPresetModel}
                  onChange={(e) => setNewPresetModel(e.target.value)}
                  placeholder="Например: POCO X6 Pro 5G"
                  className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white focus:outline-none focus:border-[#00FF87]"
                />
              </div>
            </div>

            {/* Game-specific parameters */}
            {newPresetGame === 'free-fire' && (
              <div className="p-4 rounded-xl bg-[#0F141F] border border-[#1A2536] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#00FF87] uppercase">
                    Free Fire Чувствительность (Строго 0 – 200)
                  </span>
                  <span className="text-[11px] text-slate-400">Патч OB48 / 2026</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Обзор (General)', val: ffGeneral, set: setFfGeneral },
                    { label: 'Коллиматор (Red Dot)', val: ffRedDot, set: setFfRedDot },
                    { label: 'Прицел 2X', val: ff2x, set: setFf2x },
                    { label: 'Прицел 4X', val: ff4x, set: setFf4x },
                    { label: 'Снайперский прицел', val: ffSniper, set: setFfSniper },
                    { label: 'Свободный обзор', val: ffFreeLook, set: setFfFreeLook },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">{item.label}</span>
                        <span className="font-mono font-bold text-[#00FF87]">{item.val} / 200</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={item.val}
                        onChange={(e) => item.set(Number(e.target.value))}
                        className="w-full accent-[#00FF87] h-1.5 bg-[#16202C] rounded-lg"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center gap-4">
                  <div className="space-y-1 w-48">
                    <label className="text-xs text-slate-300">Кнопка огня (%)</label>
                    <input
                      type="number"
                      min="30"
                      max="80"
                      value={ffButtonSize}
                      onChange={(e) => setFfButtonSize(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-[#0B0F16] border border-[#1C2534] rounded text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {newPresetGame === 'pubg-mobile' && (
              <div className="p-4 rounded-xl bg-[#0F141F] border border-[#1A2536] space-y-4">
                <span className="text-xs font-mono font-bold text-[#00FF87] uppercase">
                  PUBG Mobile Параметры
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-300 mb-1 block">Код раскладки</label>
                    <input
                      type="text"
                      value={pubgLayoutCode}
                      onChange={(e) => setPubgLayoutCode(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0B0F16] border border-[#1C2534] rounded text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 mb-1 block">Гироскоп без прицела (%)</label>
                    <input
                      type="number"
                      value={pubgGyroNoScope}
                      onChange={(e) => setPubgGyroNoScope(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#0B0F16] border border-[#1C2534] rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 mb-1 block">Гироскоп коллиматор (%)</label>
                    <input
                      type="number"
                      value={pubgGyroRedDot}
                      onChange={(e) => setPubgGyroRedDot(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#0B0F16] border border-[#1C2534] rounded text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">Рекомендуемый DPI</label>
                <input
                  type="number"
                  value={newPresetDpi}
                  onChange={(e) => setNewPresetDpi(Number(e.target.value))}
                  placeholder="440"
                  className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">Стиль игры</label>
                <input
                  type="text"
                  value={newPresetStyle}
                  onChange={(e) => setNewPresetStyle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">Автор пресета</label>
                <input
                  type="text"
                  value={newPresetAuthor}
                  onChange={(e) => setNewPresetAuthor(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">Описание и советы</label>
              <textarea
                rows={2}
                value={newPresetDesc}
                onChange={(e) => setNewPresetDesc(e.target.value)}
                className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isOfficial"
                checked={newPresetIsOfficial}
                onChange={(e) => setNewPresetIsOfficial(e.target.checked)}
                className="w-4 h-4 accent-[#00FF87]"
              />
              <label htmlFor="isOfficial" className="text-xs font-bold text-white cursor-pointer">
                Отметить как официальную киберспортивную рекомендацию GAMESET KG
              </label>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#00FF87] hover:bg-[#10E760] text-[#05070A] font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(0,255,135,0.25)] flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Опубликовать пресет в каталог</span>
            </button>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SMARTPHONE DATABASE MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'devices' && (
        <div className="space-y-6">
          <div className="bg-[#0B0F16] border border-[#192332] rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-black text-white">Добавить смартфон в каталог</h2>
            <p className="text-xs text-slate-400">
              Позволяет расширять базу смартфонов новыми актуальными моделями прямо из админки.
            </p>

            {deviceSuccessMsg && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                {deviceSuccessMsg}
              </div>
            )}

            <form onSubmit={handleAddDevice} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Бренд</label>
                <select
                  value={newDevice.brand}
                  onChange={(e) => setNewDevice({ ...newDevice, brand: e.target.value as DeviceBrand })}
                  className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white"
                >
                  {DEVICE_BRANDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Модель</label>
                <input
                  type="text"
                  required
                  value={newDevice.model}
                  onChange={(e) => setNewDevice({ ...newDevice, model: e.target.value })}
                  placeholder="Например: POCO F6 Pro"
                  className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Процессор (Чипсет)</label>
                <input
                  type="text"
                  value={newDevice.chipset}
                  onChange={(e) => setNewDevice({ ...newDevice, chipset: e.target.value })}
                  placeholder="Snapdragon 8 Gen 2"
                  className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Частота экрана (Hz)</label>
                <input
                  type="number"
                  value={newDevice.refreshRate}
                  onChange={(e) => setNewDevice({ ...newDevice, refreshRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Частота сенсора (Touch Hz)</label>
                <input
                  type="number"
                  value={newDevice.touchSamplingRate}
                  onChange={(e) => setNewDevice({ ...newDevice, touchSamplingRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Рекомендуемый DPI</label>
                <input
                  type="text"
                  value={newDevice.recommendedDpiRange}
                  onChange={(e) => setNewDevice({ ...newDevice, recommendedDpiRange: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white"
                />
              </div>

              <div className="sm:col-span-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#00FF87] hover:bg-[#10E760] text-[#05070A] font-black text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить смартфон в каталог</span>
                </button>
              </div>
            </form>
          </div>

          {/* Managed Devices List */}
          <div className="bg-[#0B0F16] border border-[#192332] rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Добавленные администратором устройства ({devices.length})</h3>
            {devices.length === 0 ? (
              <p className="text-xs text-slate-500">Дополнительных устройств пока не добавлено.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {devices.map((d) => (
                  <div key={d.id} className="p-4 rounded-xl bg-[#0F141F] border border-[#182333] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00FF87]/10 text-[#00FF87]">
                        {d.brand}
                      </span>
                      <button
                        onClick={() => handleDeleteDevice(d.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="font-bold text-white text-sm">{d.model}</div>
                    <div className="text-xs text-slate-400 space-y-0.5">
                      <div>Чипсет: {d.chipset}</div>
                      <div>Экран: {d.refreshRate}Hz / Сенсор: {d.touchSamplingRate}Hz</div>
                      <div>DPI: {d.recommendedDpiRange}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: COMMENTS MODERATION */}
      {/* ========================================================= */}
      {activeTab === 'comments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Модерация комментариев и отзывов ({comments.length})</h2>
          </div>

          {comments.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 rounded-xl bg-[#0B0F16] border border-[#192332]">
              Комментариев пока нет.
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-[#0B0F16] border border-[#192332] flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <strong className="text-[#00FF87]">{c.author}</strong>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{new Date(c.createdAt).toLocaleString()}</span>
                      {c.submissionModel && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/40 text-slate-300">
                          К пресету: {c.submissionModel}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-200 mt-1">{c.text}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Удалить спам/оскорбление"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: REPORTS MODERATION */}
      {/* ========================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Жалобы игроков на пресеты ({reports.length})</h2>
          </div>

          {reports.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 rounded-xl bg-[#0B0F16] border border-[#192332]">
              Жалоб от пользователей не поступало.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className={`p-5 rounded-xl bg-[#0B0F16] border space-y-3 ${
                    rep.status === 'open' ? 'border-rose-500/30' : 'border-[#192332] opacity-70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#182332] pb-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded font-mono uppercase font-bold text-[10px] ${
                          rep.status === 'open'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {rep.status === 'open' ? 'Активная жалоба' : 'Рассмотрено'}
                      </span>
                      <span className="font-bold text-white">Пресет: {rep.submissionModel || rep.submissionId}</span>
                    </div>

                    <span className="text-slate-500">{new Date(rep.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="text-slate-400">
                      Отправитель: <span className="text-slate-200">{rep.reportedBy}</span>
                    </div>
                    <p className="text-slate-200 bg-[#0F141F] p-3 rounded-lg border border-[#1A2536]">
                      Причина: {rep.reason}
                    </p>
                  </div>

                  {rep.status === 'open' && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleResolveReport(rep.id)}
                        className="px-3 py-1.5 bg-[#121822] hover:bg-[#1A2330] text-slate-300 border border-[#1E293B] rounded-lg text-xs font-bold cursor-pointer transition-colors"
                      >
                        Закрыть жалобу (Без нарушений)
                      </button>

                      <button
                        onClick={() => handleDeleteSubmission(rep.submissionId)}
                        className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Удалить нарушающий пресет</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: SITE ANNOUNCEMENT BANNER */}
      {/* ========================================================= */}
      {activeTab === 'announcements' && (
        <div className="bg-[#0B0F16] border border-[#192332] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#182332] pb-4">
            <h2 className="text-xl font-black text-white">Управление глобальным объявлением на сайте</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Баннер отображается вверху всех страниц сайта GAMESET KG для каждого посетителя.
            </p>
          </div>

          {annSaveMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{annSaveMsg}</span>
            </div>
          )}

          {/* Live Preview Box */}
          <div className="space-y-2">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase">Живой предпросмотр на сайте:</div>
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                announcement.type === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : announcement.type === 'info'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                  : 'bg-[#00FF87]/10 border-[#00FF87]/30 text-[#00FF87]'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  {announcement.badge && (
                    <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded bg-black/40 border border-current">
                      {announcement.badge}
                    </span>
                  )}
                  <strong className="font-bold text-white">{announcement.titleRu}</strong>
                </div>
                <p className="text-slate-300">{announcement.messageRu}</p>
              </div>

              {announcement.linkUrl && (
                <span className="px-2.5 py-1 rounded bg-black/40 text-white font-bold text-[11px] shrink-0 border border-white/20">
                  {announcement.linkText || 'Подробнее'}
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSaveAnnouncement} className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="annEnabled"
                checked={announcement.enabled}
                onChange={(e) => setAnnouncement({ ...announcement, enabled: e.target.checked })}
                className="w-4 h-4 accent-[#00FF87]"
              />
              <label htmlFor="annEnabled" className="text-xs font-bold text-white cursor-pointer">
                Включить отображение объявления на сайте
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Тип баннера</label>
                <select
                  value={announcement.type}
                  onChange={(e) => setAnnouncement({ ...announcement, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white"
                >
                  <option value="success">Киберспортивный / Успех (Зелёный #00FF87)</option>
                  <option value="info">Информационный (Синий / Cyan)</option>
                  <option value="warning">Внимание / Патч (Янтарный / Amber)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Бейдж (Метка)</label>
                <input
                  type="text"
                  value={announcement.badge || ''}
                  onChange={(e) => setAnnouncement({ ...announcement, badge: e.target.value })}
                  placeholder="NEW 0-200"
                  className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Ссылка (URL)</label>
                <input
                  type="text"
                  value={announcement.linkUrl || ''}
                  onChange={(e) => setAnnouncement({ ...announcement, linkUrl: e.target.value })}
                  placeholder="/games/free-fire"
                  className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Заголовок (Русский)</label>
                <input
                  type="text"
                  required
                  value={announcement.titleRu}
                  onChange={(e) => setAnnouncement({ ...announcement, titleRu: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Заголовок (English)</label>
                <input
                  type="text"
                  required
                  value={announcement.titleEn}
                  onChange={(e) => setAnnouncement({ ...announcement, titleEn: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Текст сообщения (Русский)</label>
                <textarea
                  rows={2}
                  required
                  value={announcement.messageRu}
                  onChange={(e) => setAnnouncement({ ...announcement, messageRu: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Message text (English)</label>
                <textarea
                  rows={2}
                  required
                  value={announcement.messageEn}
                  onChange={(e) => setAnnouncement({ ...announcement, messageEn: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#00FF87] hover:bg-[#10E760] text-[#05070A] font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(0,255,135,0.25)] flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Сохранить настройки объявления</span>
            </button>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: SECURITY & RATE LIMIT AUDIT */}
      {/* ========================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-[#0B0F16] border border-[#192332] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#182332] pb-4">
              <h2 className="text-xl font-black text-white">Статус серверной безопасности</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Мониторинг активных сессий, защита от подбора паролей и аудит целостности доступа.
              </p>
            </div>

            {securityStats && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#0F141F] border border-[#1C2534]">
                  <div className="text-xs text-slate-400">Активные сессии admin</div>
                  <div className="text-2xl font-black font-mono text-[#00FF87] mt-1">
                    {securityStats.activeAdminSessions}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#0F141F] border border-[#1C2534]">
                  <div className="text-xs text-slate-400">Заблокированные IP</div>
                  <div className="text-2xl font-black font-mono text-rose-400 mt-1">
                    {securityStats.lockedIps?.length || 0}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#0F141F] border border-[#1C2534]">
                  <div className="text-xs text-slate-400">Таймаут неактивности</div>
                  <div className="text-2xl font-black font-mono text-white mt-1">
                    {securityStats.inactivityTimeoutMinutes} мин
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#0F141F] border border-[#1C2534]">
                  <div className="text-xs text-slate-400">Лимит попыток входа</div>
                  <div className="text-2xl font-black font-mono text-amber-400 mt-1">
                    {securityStats.maxFailedAttempts} попыток
                  </div>
                </div>
              </div>
            )}

            {/* Security checklist */}
            <div className="p-5 rounded-xl bg-[#0F141F] border border-[#1A2536] space-y-3">
              <h3 className="text-xs font-mono font-bold text-[#00FF87] uppercase">
                Реализованные механизмы защиты ядра
              </h3>
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00FF87] shrink-0" />
                  <span>
                    <strong>Серверная аутентификация:</strong> Все маршруты <code className="text-white">/api/admin/*</code> проверяются на сервере Express.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00FF87] shrink-0" />
                  <span>
                    <strong>Защита от подбора (Brute-Force):</strong> Ограничение до 5 неудачных попыток с автоматической блокировкой IP на 15 минут.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00FF87] shrink-0" />
                  <span>
                    <strong>Timing-Safe проверка пароля:</strong> Используется <code className="text-white">crypto.timingSafeEqual</code> с SHA-256 хешами, исключая утечки по времени ответа.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00FF87] shrink-0" />
                  <span>
                    <strong>Безопасные крипто-токены:</strong> 64-символьные криптографические токены <code className="text-white">crypto.randomBytes(32)</code>.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00FF87] shrink-0" />
                  <span>
                    <strong>Таймаут неактивности:</strong> Автоматический выход из системы при отсутствии активности более 30 минут.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00FF87] shrink-0" />
                  <span>
                    <strong>Изоляция прав:</strong> Регистрация обычных пользователей в качестве администратора заблокирована. Пароль не передаётся в клиентский бандл.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F16] border border-[#192434] rounded-2xl max-w-md w-full p-6 space-y-4">
            <h4 className="font-bold text-white text-sm">Укажите причину отклонения заявки</h4>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 bg-[#0F141F] border border-[#1C2534] rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectingId(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={() => handleUpdateStatus(rejectingId, 'rejected', rejectReason)}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-[#05070A] font-bold text-xs rounded-lg cursor-pointer"
              >
                Отклонить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
