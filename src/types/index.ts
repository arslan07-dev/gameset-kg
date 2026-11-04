export type Language = 'ru' | 'en';

export type GameId = 'free-fire' | 'pubg-mobile' | 'mobile-legends' | 'cod-mobile';

export type DeviceBrand =
  | 'Apple'
  | 'Samsung'
  | 'Xiaomi'
  | 'Redmi'
  | 'POCO'
  | 'Realme'
  | 'Tecno'
  | 'Infinix'
  | 'OnePlus'
  | 'Google Pixel'
  | 'Honor'
  | 'Huawei'
  | 'Motorola'
  | 'Vivo'
  | 'OPPO'
  | 'ASUS'
  | 'Sony'
  | 'Nothing'
  | 'ZTE'
  | 'Nubia';

export type PlayStyle = 'rusher' | 'balanced' | 'sniper' | 'gyro' | 'claw';

export interface DeviceSpec {
  id: string;
  brand: DeviceBrand;
  model: string;
  refreshRate: number; // in Hz: 60, 90, 120, 144, 165
  touchSamplingRate: number; // in Hz: e.g. 180, 240, 360, 480, 720, 960, 2000
  chipset: string;
  screenSize: string;
  ram: string;
  screenType: string;
  sensitivityModifier: number; // baseline multiplier based on screen density & touch sampling
  recommendedDpiRange: string;
}

export interface FreeFireSettings {
  /** Sensitivity values for Free Fire are in the strict range 0 to 200 */
  general: number; // 0-200
  redDot: number; // 0-200
  scope2x: number; // 0-200
  scope4x: number; // 0-200
  sniperScope: number; // 0-200
  freeLook: number; // 0-200
  fireButtonSize: number; // in percentage (e.g. 35-70%)
  fireButtonPosition: string;
  dpi: number;
  graphicPreset: 'Smooth (Ultra FPS)' | 'Standard (High FPS)' | 'Ultra (Max FPS)';
  highFps: boolean;
  notes: string;
}

export interface PubgSettings {
  cameraNoScope: number;
  cameraRedDot: number;
  camera2x: number;
  camera3x: number;
  camera4x: number;
  camera6x: number;
  camera8x: number;
  adsNoScope: number;
  adsRedDot: number;
  ads2x: number;
  ads3x: number;
  ads4x: number;
  ads6x: number;
  ads8x: number;
  gyroscopeEnabled: boolean;
  gyroNoScope?: number;
  gyroRedDot?: number;
  gyro3x?: number;
  gyro4x?: number;
  gyro6x?: number;
  gyro8x?: number;
  graphics: 'Smooth + 90fps' | 'Smooth + 120fps' | 'Smooth + Extreme' | 'HD + 60fps';
  layoutCode: string;
}

export interface CodmSettings {
  standardSens: number;
  adsSens: number;
  tacticalScope: number;
  sniperScopeSens: number;
  fov: number;
  accelerationType: 'Fixed Speed' | 'Distance Acceleration' | 'Speed Acceleration';
  accelValue?: number;
  frameRate: 'Max' | 'Ultra (120 FPS)';
}

export interface MlbbSettings {
  cameraSensitivity: number;
  aimingMethod: 'Free Aim' | 'Advanced Aim' | 'Auto Aim';
  targetingPriority: 'Lowest HP' | 'Closest Target' | 'Lowest HP %';
  skillSmartTargeting: boolean;
  heroLockMode: boolean;
  refreshRate: 'High' | 'Super High' | 'Ultra (120Hz)';
  graphics: 'Smooth' | 'Medium' | 'High';
}

export interface SavedSetting {
  id: string;
  title: string;
  gameId: GameId;
  brand: string;
  model: string;
  playStyle: PlayStyle;
  timestamp: number;
  data: FreeFireSettings | PubgSettings | CodmSettings | MlbbSettings;
}

export interface SettingsHistoryItem {
  id: string;
  gameId: GameId;
  brand: string;
  model: string;
  playStyle: PlayStyle;
  timestamp: number;
  data: FreeFireSettings | PubgSettings | CodmSettings | MlbbSettings;
}

export interface CommunitySubmission {
  id: string;
  gameId: GameId;
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

export interface SubmissionComment {
  id: string;
  submissionId: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface RecentCommunityPreset {
  id: string;
  gameId: GameId;
  gameName: string;
  device: string;
  brand: string;
  style: string;
  rating: string;
  date: string;
  keyMetric: string;
  keyMetricLabel: string;
}

export interface GameInfo {
  id: GameId;
  name: string;
  subtitle: string;
  genre: string;
  image: string;
  path: string;
  activePlayers: string;
  latestPatch: string;
  recommendedDeviceTier: string;
  overview: Record<Language, string>;
  highlights: Record<Language, string[]>;
}
