import {
  GameId,
  DeviceSpec,
  PlayStyle,
  FreeFireSettings,
  PubgSettings,
  CodmSettings,
  MlbbSettings,
} from '../types';

export function generateFreeFireSettings(
  device: DeviceSpec,
  style: PlayStyle
): FreeFireSettings {
  // Free Fire OB48 (2026) Sensitivity scale: 0 - 200
  let general = 175;
  let redDot = 168;
  let scope2x = 158;
  let scope4x = 148;
  let sniperScope = 90;
  let freeLook = 145;
  let fireButtonSize = 46; // %
  let dpi = 411;

  // Touch modifier compensation
  const touchFactor = device.touchSamplingRate >= 360 ? 0.96 : device.touchSamplingRate >= 240 ? 1.0 : 1.05;
  const mod = device.sensitivityModifier * touchFactor;

  switch (style) {
    case 'rusher':
      // Fast flick & high-speed vertical drag for close quarters (M1887, MP40, Desert Eagle)
      general = Math.min(200, Math.max(0, Math.round(194 * mod)));
      redDot = Math.min(200, Math.max(0, Math.round(188 * mod)));
      scope2x = Math.min(200, Math.max(0, Math.round(176 * mod)));
      scope4x = Math.min(200, Math.max(0, Math.round(164 * mod)));
      sniperScope = Math.min(200, Math.max(0, Math.round(98 * mod)));
      freeLook = Math.min(200, Math.max(0, Math.round(170 * mod)));
      fireButtonSize = 44;
      break;
    case 'balanced':
      // All-around stability for mid-range ARs and SMGs
      general = Math.min(200, Math.max(0, Math.round(180 * mod)));
      redDot = Math.min(200, Math.max(0, Math.round(172 * mod)));
      scope2x = Math.min(200, Math.max(0, Math.round(160 * mod)));
      scope4x = Math.min(200, Math.max(0, Math.round(148 * mod)));
      sniperScope = Math.min(200, Math.max(0, Math.round(88 * mod)));
      freeLook = Math.min(200, Math.max(0, Math.round(150 * mod)));
      fireButtonSize = 48;
      break;
    case 'sniper':
      // Steady micro-tracking for precision marksman rifles (AWM, M82B, Kar98k, Woodpecker)
      general = Math.min(200, Math.max(0, Math.round(168 * mod)));
      redDot = Math.min(200, Math.max(0, Math.round(156 * mod)));
      scope2x = Math.min(200, Math.max(0, Math.round(144 * mod)));
      scope4x = Math.min(200, Math.max(0, Math.round(130 * mod)));
      sniperScope = Math.min(200, Math.max(0, Math.round(76 * mod)));
      freeLook = Math.min(200, Math.max(0, Math.round(135 * mod)));
      fireButtonSize = 52;
      break;
    case 'gyro':
    case 'claw':
      // High-mobility tournament multi-finger layout
      general = Math.min(200, Math.max(0, Math.round(188 * mod)));
      redDot = Math.min(200, Math.max(0, Math.round(180 * mod)));
      scope2x = Math.min(200, Math.max(0, Math.round(168 * mod)));
      scope4x = Math.min(200, Math.max(0, Math.round(154 * mod)));
      sniperScope = Math.min(200, Math.max(0, Math.round(102 * mod)));
      freeLook = Math.min(200, Math.max(0, Math.round(165 * mod)));
      fireButtonSize = 46;
      break;
  }

  // DPI computation based on brand
  if (device.brand === 'Apple') {
    dpi = 0; // iOS uses point coordinate system, not developer option DPI
  } else if (device.brand === 'Xiaomi' || device.brand === 'Redmi' || device.brand === 'POCO') {
    dpi = style === 'rusher' ? 440 : 411;
  } else if (device.brand === 'Samsung') {
    dpi = style === 'rusher' ? 450 : 411;
  } else {
    dpi = style === 'rusher' ? 420 : 392;
  }

  const graphicPreset =
    device.refreshRate >= 120
      ? 'Ultra (Max FPS)'
      : device.refreshRate >= 90
      ? 'Standard (High FPS)'
      : 'Smooth (Ultra FPS)';

  return {
    general,
    redDot,
    scope2x,
    scope4x,
    sniperScope,
    freeLook,
    fireButtonSize,
    fireButtonPosition: 'Нижний правый угол (28-30% высоты экрана)',
    dpi,
    graphicPreset,
    highFps: true,
    notes: `Калибровка по шкале 0–200 для экрана ${device.screenSize} (${device.refreshRate}Hz / ${device.touchSamplingRate}Hz сенсор). Проверьте оттяжку на тренировочном полигоне.`,
  };
}

export function generatePubgSettings(
  device: DeviceSpec,
  style: PlayStyle
): PubgSettings {
  const mod = device.sensitivityModifier;

  const isGyro = style === 'gyro';
  const isRusher = style === 'rusher';

  const cameraNoScope = Math.round((isRusher ? 130 : 115) * mod);
  const cameraRedDot = Math.round((isRusher ? 65 : 55) * mod);
  const camera2x = Math.round(42 * mod);
  const camera3x = Math.round(28 * mod);
  const camera4x = Math.round(20 * mod);
  const camera6x = Math.round(14 * mod);
  const camera8x = Math.round(10 * mod);

  // ADS values (compensating recoil)
  const adsNoScope = Math.round(cameraNoScope * 0.98);
  const adsRedDot = Math.round((isRusher ? 68 : 58) * mod);
  const ads2x = Math.round(44 * mod);
  const ads3x = Math.round(30 * mod);
  const ads4x = Math.round(22 * mod);
  const ads6x = Math.round(16 * mod);
  const ads8x = Math.round(11 * mod);

  // Gyroscope values
  const gyroNoScope = isGyro ? 380 : 300;
  const gyroRedDot = isGyro ? 390 : 320;
  const gyro3x = isGyro ? 320 : 260;
  const gyro4x = isGyro ? 270 : 210;
  const gyro6x = isGyro ? 160 : 120;
  const gyro8x = isGyro ? 90 : 65;

  const graphics =
    device.refreshRate >= 120
      ? 'Smooth + 120fps'
      : device.refreshRate >= 90
      ? 'Smooth + 90fps'
      : 'Smooth + Extreme';

  const layoutCode = `7249-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 89)}`;

  return {
    cameraNoScope,
    cameraRedDot,
    camera2x,
    camera3x,
    camera4x,
    camera6x,
    camera8x,
    adsNoScope,
    adsRedDot,
    ads2x,
    ads3x,
    ads4x,
    ads6x,
    ads8x,
    gyroscopeEnabled: isGyro || style === 'claw',
    gyroNoScope,
    gyroRedDot,
    gyro3x,
    gyro4x,
    gyro6x,
    gyro8x,
    graphics,
    layoutCode,
  };
}

export function generateCodmSettings(
  device: DeviceSpec,
  style: PlayStyle
): CodmSettings {
  const mod = device.sensitivityModifier;
  return {
    standardSens: Math.round((style === 'rusher' ? 105 : 90) * mod),
    adsSens: Math.round((style === 'rusher' ? 120 : 100) * mod),
    tacticalScope: Math.round(90 * mod),
    sniperScopeSens: Math.round((style === 'sniper' ? 62 : 75) * mod),
    fov: style === 'rusher' ? 82 : 75,
    accelerationType: style === 'rusher' ? 'Speed Acceleration' : 'Fixed Speed',
    accelValue: style === 'rusher' ? 125 : undefined,
    frameRate: device.refreshRate >= 120 ? 'Ultra (120 FPS)' : 'Max',
  };
}

export function generateMlbbSettings(
  device: DeviceSpec,
  _style: PlayStyle
): MlbbSettings {
  return {
    cameraSensitivity: Math.round(68 * device.sensitivityModifier),
    aimingMethod: 'Advanced Aim',
    targetingPriority: 'Lowest HP',
    skillSmartTargeting: true,
    heroLockMode: true,
    refreshRate: device.refreshRate >= 120 ? 'Ultra (120Hz)' : 'Super High',
    graphics: 'High',
  };
}
