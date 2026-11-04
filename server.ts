import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Trust proxy for accurate client IP identification in cloud/container environments
app.set('trust proxy', 1);

app.use(express.json());

// Defensive security headers & Netlify URL normalization
app.use((req, res, next) => {
  // Normalize Netlify function path prefix if routed via /.netlify/functions/api
  if (req.url.startsWith('/.netlify/functions/api')) {
    req.url = req.url.replace('/.netlify/functions/api', '/api');
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Allow same-origin and cross-subdomain API calls for published domains
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-token');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// -------------------------------------------------------------
// Security & Admin Configuration
// -------------------------------------------------------------
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'gameset_admin_2026!';

// Maximum failed login attempts before lockout
const MAX_FAILED_ATTEMPTS = 5;
// Lockout duration: 15 minutes (in milliseconds)
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
// Inactivity session timeout: 30 minutes
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
// Max session lifespan: 24 hours
const MAX_SESSION_LIFESPAN_MS = 24 * 60 * 60 * 1000;

interface AttemptRecord {
  failedCount: number;
  lockedUntil: number;
  lastAttempt: number;
}

interface AdminSession {
  token: string;
  username: string;
  createdAt: number;
  lastActiveAt: number;
  ip: string;
  userAgent: string;
}

// In-Memory Security Stores
const loginAttempts = new Map<string, AttemptRecord>();
const adminSessions = new Map<string, AdminSession>();

// Helper to extract client IP safely
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown-client';
}

// Periodic cleanup of expired sessions and old lockout records every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of adminSessions.entries()) {
    if (now - session.lastActiveAt > INACTIVITY_TIMEOUT_MS || now - session.createdAt > MAX_SESSION_LIFESPAN_MS) {
      adminSessions.delete(token);
    }
  }
  for (const [ip, record] of loginAttempts.entries()) {
    if (record.lockedUntil < now && now - record.lastAttempt > LOCKOUT_DURATION_MS * 2) {
      loginAttempts.delete(ip);
    }
  }
}, 10 * 60 * 1000).unref();

// Timing-safe password comparison using SHA-256 digests
// (Guarantees both buffers are exactly 32 bytes, preventing timing leaks and length errors)
function verifyAdminCredentials(username: unknown, pass: unknown): boolean {
  if (typeof username !== 'string' || typeof pass !== 'string') {
    return false;
  }
  if (!username.trim() || username.trim() !== ADMIN_USERNAME) {
    return false;
  }
  const expectedHash = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest();
  const providedHash = crypto.createHash('sha256').update(pass).digest();
  return crypto.timingSafeEqual(expectedHash, providedHash);
}

// Admin Authentication Middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token =
    (req.headers['x-admin-token'] as string) ||
    (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined);

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
  }

  const session = adminSessions.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Session invalid or expired' });
  }

  const now = Date.now();

  // Check 30-minute inactivity timeout
  if (now - session.lastActiveAt > INACTIVITY_TIMEOUT_MS) {
    adminSessions.delete(token);
    return res.status(401).json({
      error: 'Session timed out due to 30 minutes of inactivity. Please log in again.',
      code: 'SESSION_INACTIVITY_TIMEOUT',
    });
  }

  // Check 24-hour absolute lifespan
  if (now - session.createdAt > MAX_SESSION_LIFESPAN_MS) {
    adminSessions.delete(token);
    return res.status(401).json({
      error: 'Session expired after 24 hours. Please log in again.',
      code: 'SESSION_EXPIRED',
    });
  }

  // Touch session activity
  session.lastActiveAt = now;
  (req as any).adminSession = session;
  next();
}

// -------------------------------------------------------------
// Database Interfaces & In-Memory Stores
// -------------------------------------------------------------
export interface CommunitySubmission {
  id: string;
  gameId: 'free-fire' | 'pubg-mobile' | 'mobile-legends' | 'cod-mobile';
  gameName: string;
  brand: string;
  model: string;
  author: string;
  style: string;
  description: string;
  dpi?: number;
  graphics: string;
  sensitivity: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  upvotes: number;
  createdAt: string;
  lastUpdated: string;
  isOfficialRecommendation: boolean;
}

export interface Comment {
  id: string;
  submissionId: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Report {
  id: string;
  submissionId: string;
  reason: string;
  reportedBy: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface SiteAnnouncement {
  enabled: boolean;
  type: 'info' | 'warning' | 'success';
  titleRu: string;
  titleEn: string;
  messageRu: string;
  messageEn: string;
  linkText?: string;
  linkUrl?: string;
  badge?: string;
  updatedAt: string;
}

export interface ManagedDevice {
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

// Initial Seed Submissions
let submissions: CommunitySubmission[] = [
  {
    id: 'sub-ff-001',
    gameId: 'free-fire',
    gameName: 'Free Fire MAX',
    brand: 'POCO',
    model: 'POCO X6 Pro 5G',
    author: 'Arslan_019',
    style: 'One-Tap Headshot',
    description: 'Оптимизированная оттяжка для патча OB48 со шкалой 0-200. Проверено с дробовиком M1887 и Desert Eagle.',
    dpi: 440,
    graphics: 'Smooth + Max FPS',
    sensitivity: {
      general: 188,
      redDot: 182,
      scope2x: 174,
      scope4x: 168,
      sniperScope: 104,
      freeLook: 160,
      fireButtonSize: 44,
      fireButtonPosition: 'Нижний правый угол (28%)',
    },
    status: 'approved',
    upvotes: 48,
    createdAt: '2026-10-25T14:30:00Z',
    lastUpdated: '2026-11-01T10:15:00Z',
    isOfficialRecommendation: true,
  },
  {
    id: 'sub-pubg-002',
    gameId: 'pubg-mobile',
    gameName: 'PUBG Mobile',
    brand: 'Apple',
    model: 'iPhone 15 Pro / Pro Max',
    author: 'T1_Sniper',
    style: 'Full Gyroscope',
    description: 'Турнирный гироскоп 300-400% под дисплей 120Hz ProMotion без микро-тряски.',
    graphics: 'Smooth + 120 FPS',
    sensitivity: {
      gyroscope: { noScope: 390, redDot: 395, scope3x: 315, scope4x: 265, scope6x: 155, scope8x: 88 },
      ads: { redDot: 60, scope3x: 32, scope4x: 24 },
      layoutCode: '7249-8812-4910-3329-84',
    },
    status: 'approved',
    upvotes: 38,
    createdAt: '2026-10-28T09:12:00Z',
    lastUpdated: '2026-10-30T16:00:00Z',
    isOfficialRecommendation: true,
  },
  {
    id: 'sub-ff-003',
    gameId: 'free-fire',
    gameName: 'Free Fire',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    author: 'Apex_Shooter',
    style: 'Balanced Rusher',
    description: 'Калибровка 0-200 для Dynamic AMOLED экрана. Увеличенный Red Dot для средней дистанции.',
    dpi: 450,
    graphics: 'Ultra + High Res',
    sensitivity: {
      general: 178,
      redDot: 172,
      scope2x: 166,
      scope4x: 156,
      sniperScope: 98,
      freeLook: 150,
      fireButtonSize: 48,
    },
    status: 'approved',
    upvotes: 29,
    createdAt: '2026-10-29T18:00:00Z',
    lastUpdated: '2026-11-02T08:00:00Z',
    isOfficialRecommendation: false,
  },
];

let comments: Comment[] = [
  {
    id: 'c-1',
    submissionId: 'sub-ff-001',
    author: 'Kyrgyz_Gamer',
    text: 'Отличная оттяжка на POCO X6 Pro! Прицел перестал улетать выше головы.',
    createdAt: '2026-10-26T11:00:00Z',
  },
  {
    id: 'c-2',
    submissionId: 'sub-pubg-002',
    author: 'Bishkek_Esports',
    text: 'Код раскладки и гироскоп подошли идеально на iPhone 15 Pro.',
    createdAt: '2026-10-29T14:20:00Z',
  },
];

let reports: Report[] = [
  {
    id: 'rep-seed-1',
    submissionId: 'sub-ff-003',
    reason: 'Прошу перепроверить размер кнопки выстрела (слишком большая для 6-дюймовых экранов)',
    reportedBy: 'KGShooter_KG',
    status: 'open',
    createdAt: '2026-11-01T12:00:00Z',
  },
];

// Active global announcement
let siteAnnouncement: SiteAnnouncement = {
  enabled: true,
  type: 'success',
  titleRu: 'Сезон 2026: Обновление Free Fire OB48',
  titleEn: 'Season 2026: Free Fire OB48 Calibration',
  messageRu: 'Все пресеты Free Fire обновлены до новой шкалы 0–200! Проверьте новые настройки для своего смартфона.',
  messageEn: 'All Free Fire presets have been updated to the new 0–200 scale! Check calibrated settings for your phone.',
  badge: 'NEW 0-200',
  linkText: 'Открыть Free Fire',
  linkUrl: '/games/free-fire',
  updatedAt: new Date().toISOString(),
};

// Managed devices store (can be extended by Admin)
let managedDevices: ManagedDevice[] = [
  {
    id: 'dev-custom-1',
    brand: 'POCO',
    model: 'POCO F6 Pro',
    refreshRate: 120,
    touchSamplingRate: 2160,
    chipset: 'Snapdragon 8 Gen 2',
    screenSize: '6.67" WQHD+ AMOLED',
    ram: '12 GB / 16 GB',
    screenType: 'AMOLED',
    sensitivityModifier: 1.08,
    recommendedDpiRange: '440 - 480',
    createdAt: '2026-10-20T00:00:00Z',
  },
];

const votesStore = new Map<string, Set<string>>();

// -------------------------------------------------------------
// Authentication Endpoints (Rate limited + Timing-safe)
// -------------------------------------------------------------

// Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const clientIp = getClientIp(req);
  const now = Date.now();

  // 1. Check Rate Limit / Lockout
  const attemptRecord = loginAttempts.get(clientIp);
  if (attemptRecord && attemptRecord.lockedUntil > now) {
    const remainingSeconds = Math.ceil((attemptRecord.lockedUntil - now) / 1000);
    const remainingMinutes = Math.ceil(remainingSeconds / 60);
    return res.status(429).json({
      error: `Слишком много неудачных попыток входа. Доступ заблокирован на ${remainingMinutes} мин. Повторите попытку через ${remainingSeconds} сек.`,
      locked: true,
      remainingSeconds,
    });
  }

  const { username, password } = req.body;

  // 2. Validate Credentials
  const isValid = verifyAdminCredentials(username, password);

  if (!isValid) {
    // Record failed attempt
    const record = attemptRecord || { failedCount: 0, lockedUntil: 0, lastAttempt: now };
    record.failedCount += 1;
    record.lastAttempt = now;

    if (record.failedCount >= MAX_FAILED_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_DURATION_MS;
      loginAttempts.set(clientIp, record);
      return res.status(429).json({
        error: `Превышен лимит попыток (${MAX_FAILED_ATTEMPTS}). Доступ к панели администратора заблокирован на 15 минут.`,
        locked: true,
        remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
      });
    }

    loginAttempts.set(clientIp, record);
    const attemptsLeft = MAX_FAILED_ATTEMPTS - record.failedCount;

    return res.status(401).json({
      error: `Неверный логин или пароль администратора. Осталось попыток: ${attemptsLeft}`,
      attemptsLeft,
    });
  }

  // 3. Clear failed attempts on success
  loginAttempts.delete(clientIp);

  // 4. Generate cryptographically strong random session token (64 hex characters)
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const sessionData: AdminSession = {
    token: sessionToken,
    username: ADMIN_USERNAME,
    createdAt: now,
    lastActiveAt: now,
    ip: clientIp,
    userAgent: req.headers['user-agent'] || 'unknown',
  };

  adminSessions.set(sessionToken, sessionData);

  return res.json({
    success: true,
    token: sessionToken,
    username: ADMIN_USERNAME,
    inactivityTimeoutMinutes: 30,
    maxLifespanHours: 24,
    message: 'Авторизация администратора успешно подтверждена',
  });
});

// Verify Current Session Status
app.get('/api/admin/verify', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token =
    (req.headers['x-admin-token'] as string) ||
    (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined);

  if (!token) {
    return res.status(401).json({ authenticated: false, error: 'No token' });
  }

  const session = adminSessions.get(token);
  if (!session) {
    return res.status(401).json({ authenticated: false, error: 'Invalid or terminated session' });
  }

  const now = Date.now();
  if (now - session.lastActiveAt > INACTIVITY_TIMEOUT_MS) {
    adminSessions.delete(token);
    return res.status(401).json({ authenticated: false, error: 'Session timed out due to inactivity' });
  }

  // Touch session
  session.lastActiveAt = now;
  const remainingInactivitySec = Math.max(0, Math.floor((INACTIVITY_TIMEOUT_MS - (now - session.lastActiveAt)) / 1000));

  res.json({
    authenticated: true,
    username: session.username,
    createdAt: session.createdAt,
    lastActiveAt: session.lastActiveAt,
    remainingInactivitySeconds: remainingInactivitySec,
  });
});

// Admin Logout
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token =
    (req.headers['x-admin-token'] as string) ||
    (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined);

  if (token) {
    adminSessions.delete(token);
  }
  res.json({ success: true, message: 'Сессия администратора завершена' });
});

// Admin Security Audit Status
app.get('/api/admin/security-status', requireAdmin, (_req: Request, res: Response) => {
  const activeCount = adminSessions.size;
  const lockedIps: { ip: string; remainingSeconds: number; failedCount: number }[] = [];
  const now = Date.now();

  for (const [ip, record] of loginAttempts.entries()) {
    if (record.lockedUntil > now) {
      lockedIps.push({
        ip: ip.replace(/\d+$/, 'xxx'), // partially mask for privacy
        remainingSeconds: Math.ceil((record.lockedUntil - now) / 1000),
        failedCount: record.failedCount,
      });
    }
  }

  res.json({
    activeAdminSessions: activeCount,
    lockedIps,
    totalTrackedIps: loginAttempts.size,
    inactivityTimeoutMinutes: 30,
    lockoutDurationMinutes: 15,
    maxFailedAttempts: MAX_FAILED_ATTEMPTS,
    serverUptime: Math.floor(process.uptime()),
  });
});

// -------------------------------------------------------------
// Site Announcements
// -------------------------------------------------------------
app.get('/api/announcement', (_req: Request, res: Response) => {
  res.json(siteAnnouncement);
});

app.post('/api/admin/announcement', requireAdmin, (req: Request, res: Response) => {
  const { enabled, type, titleRu, titleEn, messageRu, messageEn, linkText, linkUrl, badge } = req.body;

  siteAnnouncement = {
    enabled: Boolean(enabled),
    type: type || 'info',
    titleRu: titleRu || siteAnnouncement.titleRu,
    titleEn: titleEn || siteAnnouncement.titleEn,
    messageRu: messageRu || siteAnnouncement.messageRu,
    messageEn: messageEn || siteAnnouncement.messageEn,
    linkText: linkText || '',
    linkUrl: linkUrl || '',
    badge: badge || '',
    updatedAt: new Date().toISOString(),
  };

  res.json({ success: true, announcement: siteAnnouncement });
});

// -------------------------------------------------------------
// Admin Stats
// -------------------------------------------------------------
app.get('/api/admin/stats', requireAdmin, (_req: Request, res: Response) => {
  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const rejectedCount = submissions.filter((s) => s.status === 'rejected').length;
  const officialCount = submissions.filter((s) => s.isOfficialRecommendation).length;

  res.json({
    total: submissions.length,
    pending: pendingCount,
    approved: approvedCount,
    rejected: rejectedCount,
    official: officialCount,
    reportsCount: reports.filter((r) => r.status === 'open').length,
    commentsCount: comments.length,
    devicesCount: managedDevices.length,
  });
});

// -------------------------------------------------------------
// Submissions API (Public vs Admin)
// -------------------------------------------------------------
app.get('/api/submissions', (req: Request, res: Response) => {
  const { gameId, status, sort } = req.query;
  const token =
    (req.headers['x-admin-token'] as string) ||
    (req.headers['authorization']?.startsWith('Bearer ') ? req.headers['authorization'].slice(7) : undefined);

  const isAdmin = token ? adminSessions.has(token) : false;

  let result = [...submissions];

  if (!isAdmin) {
    result = result.filter((s) => s.status === 'approved');
  } else if (status && status !== 'all') {
    result = result.filter((s) => s.status === status);
  }

  if (gameId && gameId !== 'all') {
    result = result.filter((s) => s.gameId === gameId);
  }

  if (sort === 'popular') {
    result.sort((a, b) => b.upvotes - a.upvotes);
  } else {
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json(result);
});

app.get('/api/submissions/:id', (req: Request, res: Response) => {
  const sub = submissions.find((s) => s.id === req.params.id);
  if (!sub) return res.status(404).json({ error: 'Пресет не найден' });

  const subComments = comments.filter((c) => c.submissionId === req.params.id);
  res.json({ ...sub, comments: subComments });
});

// Public User Submission (Default: status='pending')
app.post('/api/submissions', (req: Request, res: Response) => {
  const { gameId, gameName, brand, model, author, style, description, dpi, graphics, sensitivity } = req.body;

  if (!gameId || !brand || !model || !author || !sensitivity) {
    return res.status(400).json({ error: 'Заполните все обязательные поля' });
  }

  // Strict Free Fire 0-200 validation
  if (gameId === 'free-fire') {
    const { general, redDot, scope2x, scope4x, sniperScope, freeLook } = sensitivity;
    const values = [general, redDot, scope2x, scope4x, sniperScope, freeLook];
    for (const val of values) {
      if (typeof val === 'number' && (val < 0 || val > 200)) {
        return res.status(400).json({ error: 'Значения чувствительности Free Fire должны быть строго от 0 до 200' });
      }
    }
  }

  const newSub: CommunitySubmission = {
    id: 'sub-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    gameId,
    gameName: gameName || gameId,
    brand,
    model,
    author: author.trim(),
    style: style || 'Balanced',
    description: description ? description.trim() : '',
    dpi: dpi ? Number(dpi) : undefined,
    graphics: graphics || 'Standard',
    sensitivity,
    status: 'pending',
    upvotes: 1,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    isOfficialRecommendation: false,
  };

  submissions.unshift(newSub);

  res.status(201).json({
    success: true,
    message: 'Настройки успешно отправлены на проверку администратору!',
    submission: newSub,
  });
});

// Admin Create Official or Custom Preset
app.post('/api/admin/submissions', requireAdmin, (req: Request, res: Response) => {
  const {
    gameId,
    gameName,
    brand,
    model,
    author,
    style,
    description,
    dpi,
    graphics,
    sensitivity,
    isOfficialRecommendation,
  } = req.body;

  if (!gameId || !brand || !model || !author || !sensitivity) {
    return res.status(400).json({ error: 'Заполните обязательные поля пресета' });
  }

  const newSub: CommunitySubmission = {
    id: 'admin-' + Date.now().toString(36),
    gameId,
    gameName: gameName || gameId,
    brand,
    model,
    author: author.trim() || 'GAMESET KG Pro Staff',
    style: style || 'Tournament Official',
    description: description ? description.trim() : 'Официально верифицированные параметры от администрации.',
    dpi: dpi ? Number(dpi) : undefined,
    graphics: graphics || 'Max FPS',
    sensitivity,
    status: 'approved',
    upvotes: 25,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    isOfficialRecommendation: Boolean(isOfficialRecommendation),
  };

  submissions.unshift(newSub);
  res.status(201).json({ success: true, submission: newSub });
});

// Admin Review: Change Status
app.patch('/api/admin/submissions/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { status, rejectionReason } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Некорректный статус' });
  }

  const sub = submissions.find((s) => s.id === req.params.id);
  if (!sub) return res.status(404).json({ error: 'Пресет не найден' });

  sub.status = status;
  if (rejectionReason) sub.rejectionReason = rejectionReason;
  sub.lastUpdated = new Date().toISOString();

  res.json({ success: true, submission: sub });
});

// Admin Review: Toggle Official Recommendation
app.patch('/api/admin/submissions/:id/official', requireAdmin, (req: Request, res: Response) => {
  const sub = submissions.find((s) => s.id === req.params.id);
  if (!sub) return res.status(404).json({ error: 'Пресет не найден' });

  sub.isOfficialRecommendation = !sub.isOfficialRecommendation;
  sub.lastUpdated = new Date().toISOString();

  res.json({ success: true, isOfficialRecommendation: sub.isOfficialRecommendation });
});

// Admin Edit Preset Details
app.put('/api/admin/submissions/:id', requireAdmin, (req: Request, res: Response) => {
  const sub = submissions.find((s) => s.id === req.params.id);
  if (!sub) return res.status(404).json({ error: 'Пресет не найден' });

  const { style, description, dpi, graphics, sensitivity, brand, model } = req.body;

  if (style) sub.style = style;
  if (description !== undefined) sub.description = description;
  if (dpi !== undefined) sub.dpi = dpi ? Number(dpi) : undefined;
  if (graphics) sub.graphics = graphics;
  if (sensitivity) sub.sensitivity = sensitivity;
  if (brand) sub.brand = brand;
  if (model) sub.model = model;
  sub.lastUpdated = new Date().toISOString();

  res.json({ success: true, submission: sub });
});

// Admin Delete Submission
app.delete('/api/admin/submissions/:id', requireAdmin, (req: Request, res: Response) => {
  const index = submissions.findIndex((s) => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Пресет не найден' });

  submissions.splice(index, 1);
  comments = comments.filter((c) => c.submissionId !== req.params.id);
  reports = reports.filter((r) => r.submissionId !== req.params.id);

  res.json({ success: true, message: 'Пресет успешно удалён' });
});

// -------------------------------------------------------------
// Voting & Public Comments
// -------------------------------------------------------------
app.post('/api/submissions/:id/vote', (req: Request, res: Response) => {
  const subId = req.params.id;
  const sub = submissions.find((s) => s.id === subId);
  if (!sub) return res.status(404).json({ error: 'Пресет не найден' });

  const voterKey = getClientIp(req) + '_' + (req.body.voterId || 'anon');

  if (!votesStore.has(subId)) {
    votesStore.set(subId, new Set<string>());
  }

  const votedSet = votesStore.get(subId)!;
  if (votedSet.has(voterKey)) {
    return res.status(409).json({ error: 'Вы уже голосовали за данный пресет' });
  }

  votedSet.add(voterKey);
  sub.upvotes += 1;

  res.json({ success: true, upvotes: sub.upvotes });
});

app.post('/api/submissions/:id/comments', (req: Request, res: Response) => {
  const subId = req.params.id;
  const { author, text } = req.body;
  if (!author || !text || !text.trim()) {
    return res.status(400).json({ error: 'Заполните имя и текст комментария' });
  }

  const newComment: Comment = {
    id: 'c-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    submissionId: subId,
    author: author.trim(),
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  comments.push(newComment);
  res.status(201).json(newComment);
});

// Admin Comments Moderation
app.get('/api/admin/comments', requireAdmin, (_req: Request, res: Response) => {
  const enriched = comments.map((c) => {
    const parentSub = submissions.find((s) => s.id === c.submissionId);
    return {
      ...c,
      submissionModel: parentSub ? `${parentSub.model} (${parentSub.gameName})` : 'Удалённый пресет',
    };
  });
  res.json(enriched.reverse());
});

app.delete('/api/admin/comments/:id', requireAdmin, (req: Request, res: Response) => {
  const idx = comments.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Комментарий не найден' });
  comments.splice(idx, 1);
  res.json({ success: true, message: 'Комментарий удалён' });
});

// -------------------------------------------------------------
// Reports Handling
// -------------------------------------------------------------
app.post('/api/submissions/:id/report', (req: Request, res: Response) => {
  const subId = req.params.id;
  const { reason, reportedBy } = req.body;
  if (!reason) return res.status(400).json({ error: 'Укажите причину жалобы' });

  const newReport: Report = {
    id: 'rep-' + Date.now().toString(36),
    submissionId: subId,
    reason: reason.trim(),
    reportedBy: reportedBy || 'Анонимный игрок',
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  reports.unshift(newReport);
  res.status(201).json({ success: true, message: 'Жалоба передана администрации' });
});

app.get('/api/admin/reports', requireAdmin, (_req: Request, res: Response) => {
  const enriched = reports.map((r) => {
    const sub = submissions.find((s) => s.id === r.submissionId);
    return {
      ...r,
      submissionModel: sub ? `${sub.model} (${sub.gameName})` : 'Удалённый пресет',
      submissionAuthor: sub ? sub.author : '—',
    };
  });
  res.json(enriched);
});

app.post('/api/admin/reports/:id/resolve', requireAdmin, (req: Request, res: Response) => {
  const rep = reports.find((r) => r.id === req.params.id);
  if (!rep) return res.status(404).json({ error: 'Жалоба не найдена' });
  rep.status = 'resolved';
  res.json({ success: true, report: rep });
});

// -------------------------------------------------------------
// Managed Devices Endpoints (Add / Edit / Delete Smartphones)
// -------------------------------------------------------------
app.get('/api/admin/devices', requireAdmin, (_req: Request, res: Response) => {
  res.json(managedDevices);
});

app.post('/api/admin/devices', requireAdmin, (req: Request, res: Response) => {
  const {
    brand,
    model,
    refreshRate,
    touchSamplingRate,
    chipset,
    screenSize,
    ram,
    screenType,
    sensitivityModifier,
    recommendedDpiRange,
  } = req.body;

  if (!brand || !model) {
    return res.status(400).json({ error: 'Укажите бренд и название модели' });
  }

  const newDevice: ManagedDevice = {
    id: 'dev-' + Date.now().toString(36),
    brand: brand.trim(),
    model: model.trim(),
    refreshRate: Number(refreshRate) || 120,
    touchSamplingRate: Number(touchSamplingRate) || 240,
    chipset: chipset ? chipset.trim() : 'Флагманский процессор',
    screenSize: screenSize ? screenSize.trim() : '6.67" AMOLED',
    ram: ram ? ram.trim() : '8 GB / 12 GB',
    screenType: screenType ? screenType.trim() : 'AMOLED',
    sensitivityModifier: Number(sensitivityModifier) || 1.0,
    recommendedDpiRange: recommendedDpiRange ? recommendedDpiRange.trim() : '440 - 460',
    createdAt: new Date().toISOString(),
  };

  managedDevices.unshift(newDevice);
  res.status(201).json({ success: true, device: newDevice });
});

app.put('/api/admin/devices/:id', requireAdmin, (req: Request, res: Response) => {
  const dev = managedDevices.find((d) => d.id === req.params.id);
  if (!dev) return res.status(404).json({ error: 'Устройство не найдено' });

  const {
    brand,
    model,
    refreshRate,
    touchSamplingRate,
    chipset,
    screenSize,
    ram,
    screenType,
    sensitivityModifier,
    recommendedDpiRange,
  } = req.body;

  if (brand) dev.brand = brand.trim();
  if (model) dev.model = model.trim();
  if (refreshRate) dev.refreshRate = Number(refreshRate);
  if (touchSamplingRate) dev.touchSamplingRate = Number(touchSamplingRate);
  if (chipset) dev.chipset = chipset.trim();
  if (screenSize) dev.screenSize = screenSize.trim();
  if (ram) dev.ram = ram.trim();
  if (screenType) dev.screenType = screenType.trim();
  if (sensitivityModifier) dev.sensitivityModifier = Number(sensitivityModifier);
  if (recommendedDpiRange) dev.recommendedDpiRange = recommendedDpiRange.trim();

  res.json({ success: true, device: dev });
});

app.delete('/api/admin/devices/:id', requireAdmin, (req: Request, res: Response) => {
  const idx = managedDevices.findIndex((d) => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Устройство не найдено' });
  managedDevices.splice(idx, 1);
  res.json({ success: true, message: 'Устройство удалено из каталога' });
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    activeSessions: adminSessions.size,
  });
});

// Search Engine SEO files (sitemap.xml & robots.txt fallback routes)
app.get('/robots.txt', (_req: Request, res: Response) => {
  const robotsPath = isProd
    ? path.resolve(__dirname, 'dist', 'robots.txt')
    : path.resolve(__dirname, 'public', 'robots.txt');
  res.type('text/plain').sendFile(robotsPath);
});

app.get('/sitemap.xml', (_req: Request, res: Response) => {
  const sitemapPath = isProd
    ? path.resolve(__dirname, 'dist', 'sitemap.xml')
    : path.resolve(__dirname, 'public', 'sitemap.xml');
  res.type('application/xml').sendFile(sitemapPath);
});

// -------------------------------------------------------------
// Vite Dev Server / Static Production Server Mounting
// -------------------------------------------------------------
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`GAMESET KG Full-Stack Server running on port ${PORT} (isProd: ${isProd})`);
  });
}

// Only launch standalone Express HTTP listener when running standalone (Cloud Run / Docker / dev server)
// In Netlify Functions / AWS Lambda, the serverless handler manages request execution
if (!process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME && !process.env.LAMBDA_TASK_ROOT) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });
}

export { app };
