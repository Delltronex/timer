import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Sun,
  Moon,
  Palette,
  Sparkles,
  Calendar,
  Clock,
  Flame,
  Hourglass,
  Check,
  Maximize2,
  Volume2,
  VolumeX,
  RotateCcw,
  Sliders,
  Settings,
  ArrowLeft,
  Pipette
} from 'lucide-react';
import './App.css';

// Preset color themes with HSL hue, name and color representation
const PRESET_PALETTES = [
  { id: 'emerald', name: 'Emerald Cyber', hue: 160, sat: '84%', light: '45%', color: '#10b981' },
  { id: 'electric-blue', name: 'Electric Cyan', hue: 195, sat: '95%', light: '50%', color: '#06b6d4' },
  { id: 'violet', name: 'Cosmic Violet', hue: 270, sat: '90%', light: '62%', color: '#8b5cf6' },
  { id: 'neon-rose', name: 'Neon Rose', hue: 330, sat: '88%', light: '58%', color: '#f43f5e' },
  { id: 'sunset', name: 'Solar Sunset', hue: 25, sat: '95%', light: '54%', color: '#f97316' },
  { id: 'amber', name: 'Golden Amber', hue: 45, sat: '96%', light: '52%', color: '#eab308' },
];

export default function App() {
  // Navigation / Page state: 'timer' or 'settings'
  const [currentPage, setCurrentPage] = useState('timer');

  // Target Date state: Default to March 2, 2027 00:00:00 local time
  const [targetDateString, setTargetDateString] = useState('2027-03-02T00:00');
  const [eventName, setEventName] = useState('March 2, 2027 Milestone');

  // Theme state: dark / light
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('timer_theme_mode');
    return saved !== null ? saved === 'dark' : true;
  });

  // Selected Accent color
  const [selectedPalette, setSelectedPalette] = useState(() => {
    return localStorage.getItem('timer_accent_id') || 'emerald';
  });

  const [customHex, setCustomHex] = useState('#10b981');
  const [customHue, setCustomHue] = useState(() => {
    const saved = localStorage.getItem('timer_accent_hue');
    return saved ? parseInt(saved, 10) : 160;
  });

  // UI toggles
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Time remaining calculation
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    isComplete: false,
  });

  // Start milestone calculation from the moment it's tracked (or approx reference point)
  const targetTimestamp = useMemo(() => {
    return new Date(targetDateString).getTime();
  }, [targetDateString]);

  // Apply theme class to document body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('timer_theme_mode', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Dynamic Favicon Generator based on current user color and dark/light mode
  const updateFavicon = (hueVal, isDark) => {
    const primary = `hsl(${hueVal}, 90%, 52%)`;
    const secondary = `hsl(${(hueVal + 40) % 360}, 92%, 58%)`;
    const bgColor = isDark ? '#080b12' : '#ffffff';
    const bgBorder = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.1)';

    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primary}" />
          <stop offset="100%" stop-color="${secondary}" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="92" height="92" rx="26" fill="url(#grad)" />
      <rect x="18" y="18" width="64" height="64" rx="18" fill="${bgColor}" opacity="0.3" stroke="${bgBorder}" stroke-width="2"/>
      <path d="M 32 30 L 68 30 L 53 50 L 68 70 L 32 70 L 47 50 Z" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="50" cy="50" r="3" fill="#ffffff"/>
    </svg>`;

    const dataUrl = `data:image/svg+xml,${encodeURIComponent(svgString)}`;

    // Update all matching favicon links and create one if not found
    let faviconLink = document.querySelector("link[rel='icon']");
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      document.head.appendChild(faviconLink);
    }
    faviconLink.type = 'image/svg+xml';
    faviconLink.href = dataUrl;

    let appleLink = document.querySelector("link[rel='apple-touch-icon']");
    if (appleLink) {
      appleLink.href = dataUrl;
    }
  };

  // Convert Hex to HSL for custom colors
  const hexToHsl = (hex) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      hue: Math.round(h * 360),
      sat: `${Math.round(s * 100)}%`,
      light: `${Math.round(l * 100)}%`
    };
  };

  // Apply accent color CSS variables & update favicon
  const applyPalette = (paletteId, hex = null, explicitHue = null) => {
    let hue, sat, light;
    if (explicitHue !== null) {
      hue = explicitHue;
      sat = '90%';
      light = '52%';
      setSelectedPalette('custom');
      setCustomHue(explicitHue);
      localStorage.setItem('timer_accent_id', 'custom');
      localStorage.setItem('timer_accent_hue', explicitHue.toString());
    } else if (paletteId === 'custom' && hex) {
      const hsl = hexToHsl(hex);
      hue = hsl.hue;
      sat = hsl.sat;
      light = hsl.light;
      setSelectedPalette('custom');
      setCustomHex(hex);
      setCustomHue(hsl.hue);
      localStorage.setItem('timer_accent_id', 'custom');
      localStorage.setItem('timer_custom_hex', hex);
      localStorage.setItem('timer_accent_hue', hsl.hue.toString());
    } else {
      const preset = PRESET_PALETTES.find(p => p.id === paletteId) || PRESET_PALETTES[0];
      hue = preset.hue;
      sat = preset.sat;
      light = preset.light;
      setSelectedPalette(preset.id);
      setCustomHue(preset.hue);
      localStorage.setItem('timer_accent_id', preset.id);
    }

    document.documentElement.style.setProperty('--accent-hue', hue);
    document.documentElement.style.setProperty('--accent-sat', sat);
    document.documentElement.style.setProperty('--accent-light', light);

    updateFavicon(hue, isDarkMode);
  };

  // Update favicon when isDarkMode toggles
  useEffect(() => {
    const currentHue = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--accent-hue') || '160', 10);
    updateFavicon(currentHue, isDarkMode);
  }, [isDarkMode]);

  // Initialize Accent Palette
  useEffect(() => {
    const savedCustomHex = localStorage.getItem('timer_custom_hex');
    if (selectedPalette === 'custom' && savedCustomHex) {
      applyPalette('custom', savedCustomHex);
    } else {
      applyPalette(selectedPalette);
    }
  }, []);

  // Web Audio subtle click / tick generator
  const playTickSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch {
      // AudioContext might be blocked until user interacts
    }
  };

  // Countdown Interval
  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      const difference = targetTimestamp - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
          isComplete: true,
        });
        return;
      }

      const totalSeconds = Math.floor(difference / 1000);
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        totalSeconds,
        isComplete: false,
      });

      playTickSound();
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetTimestamp, soundEnabled]);

  // Trigger celebration confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: [
        `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--accent-hue')}, 90%, 55%)`,
        '#ffffff',
        '#f59e0b',
        '#6366f1'
      ]
    });
  };

  // Copy link / share handler
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!');
    } else {
      showToast('Countdown URL ready to share!');
    }
    triggerConfetti();
  };

  // Helper toast popup
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
    } else {
      document.exitFullscreen().catch(() => { });
    }
  };

  // Start date set to 22 October 2026
  const startTimestamp = useMemo(() => {
    return new Date('2026-10-22T00:00:00').getTime();
  }, []);

  // Calculate days passed since October 22, 2026
  const daysPassed = useMemo(() => {
    const elapsedMs = Math.max(0, Date.now() - startTimestamp);
    return Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  }, [startTimestamp, timeLeft.seconds]);

  // Calculate percentage progression starting from 22 October 2026 towards March 2, 2027 (100%)
  const progressPercentage = useMemo(() => {
    const start = startTimestamp;
    const end = targetTimestamp;
    const now = Date.now();
    if (now >= end) return '100.00';
    if (now <= start) return '0.00';
    const elapsed = now - start;
    const total = end - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100)).toFixed(2);
  }, [startTimestamp, targetTimestamp, timeLeft.seconds]);

  const formattedTargetDate = useMemo(() => {
    const d = new Date(targetDateString);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [targetDateString]);

  return (
    <div className="app-container">
      {/* Dynamic Ambient Background Blobs */}
      <div className="ambient-glow glow-top-left" />
      <div className="ambient-glow glow-bottom-right" />

      {/* Navigation & Controls */}
      <nav className="top-nav">
        <div className="brand-badge">
          <div className="brand-icon-pulse">
            <Hourglass size={18} />
          </div>
          <span className="brand-title">Delltronex 2027</span>
        </div>

        <div className="nav-actions">
          {currentPage === 'settings' ? (
            <button
              className="control-btn"
              onClick={() => setCurrentPage('timer')}
              title="Back to Countdown"
              id="back-to-timer-btn"
            >
              <ArrowLeft size={17} />
              <span className="btn-text">Back</span>
            </button>
          ) : (
            <button
              className="control-btn"
              onClick={() => setCurrentPage('settings')}
              title="Open Settings"
              id="settings-page-btn"
            >
              <Settings size={17} />
              <span className="btn-text">Settings</span>
            </button>
          )}
        </div>
      </nav>

      {/* Settings Page View */}
      {currentPage === 'settings' ? (
        <section className="settings-page">
          <div className="settings-container">
            <div className="settings-page-header">
              <div className="settings-title-group">
                <div className="stat-icon">
                  <Settings size={20} />
                </div>
                <h2>Settings</h2>
              </div>
              <button
                className="control-btn"
                onClick={() => setCurrentPage('timer')}
              >
                <ArrowLeft size={16} /> Back
              </button>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">
                <Palette size={18} /> Accent Color
              </div>
              <div className="palette-picker" style={{ marginTop: '0.65rem' }}>
                {PRESET_PALETTES.map(p => (
                  <button
                    key={p.id}
                    className={`palette-btn ${selectedPalette === p.id ? 'active' : ''}`}
                    style={{ backgroundColor: p.color }}
                    onClick={() => applyPalette(p.id)}
                    title={p.name}
                  >
                    {selectedPalette === p.id && <Check className="palette-check" size={14} />}
                  </button>
                ))}
              </div>

              {/* Premium In-App Color Spectrum Slider */}
              <div className="custom-spectrum-picker">
                <div className="spectrum-header">
                  <span className="spectrum-label">Custom Spectrum</span>
                  <div className="spectrum-badge-group">
                    <span className="spectrum-dot" style={{ backgroundColor: `hsl(${customHue}, 90%, 50%)` }} />
                    {selectedPalette === 'custom' && <span className="spectrum-active-tag">Active</span>}
                  </div>
                </div>

                <div className="hue-slider-track">
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={customHue}
                    onChange={(e) => {
                      const newHue = parseInt(e.target.value, 10);
                      setCustomHue(newHue);
                      applyPalette('custom', null, newHue);
                    }}
                    className="hue-slider-input"
                    aria-label="Color hue slider"
                  />
                </div>

                <div className="spectrum-footer">
                  <div className="custom-hex-inline">
                    <label htmlFor="custom-color-input" className="color-pipette-btn" title="Pick precise color">
                      <Pipette size={14} />
                      <input
                        type="color"
                        value={customHex}
                        onChange={(e) => applyPalette('custom', e.target.value)}
                        id="custom-color-input"
                      />
                    </label>
                    <span className="hex-val-text">
                      Hue: <b>{customHue}°</b>
                    </span>
                  </div>
                  <button
                    className="quick-reset-btn"
                    onClick={() => applyPalette('emerald')}
                  >
                    Reset default
                  </button>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">
                {isDarkMode ? <Moon size={18} /> : <Sun size={18} />} Theme Mode
              </div>
              
              <div className="theme-cards-grid">
                <button
                  type="button"
                  className={`theme-card-option ${!isDarkMode ? 'active' : ''}`}
                  onClick={() => setIsDarkMode(false)}
                >
                  <div className="theme-card-preview light-preview">
                    <div className="preview-header"></div>
                    <div className="preview-card-row">
                      <div className="preview-digit"></div>
                      <div className="preview-digit"></div>
                    </div>
                  </div>
                  <div className="theme-card-label">
                    <div className="theme-card-title">
                      <Sun size={16} /> Light Theme
                    </div>
                  </div>
                  {!isDarkMode && <div className="theme-selected-badge"><Check size={14} /></div>}
                </button>

                <button
                  type="button"
                  className={`theme-card-option ${isDarkMode ? 'active' : ''}`}
                  onClick={() => setIsDarkMode(true)}
                >
                  <div className="theme-card-preview dark-preview">
                    <div className="preview-header"></div>
                    <div className="preview-card-row">
                      <div className="preview-digit"></div>
                      <div className="preview-digit"></div>
                    </div>
                  </div>
                  <div className="theme-card-label">
                    <div className="theme-card-title">
                      <Moon size={16} /> Dark Theme
                    </div>
                  </div>
                  {isDarkMode && <div className="theme-selected-badge"><Check size={14} /></div>}
                </button>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">
                <Volume2 size={18} /> Audio & Display
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.65rem' }}>
                <button
                  className={`control-btn ${soundEnabled ? 'active' : ''}`}
                  onClick={() => {
                    setSoundEnabled(prev => !prev);
                    showToast(!soundEnabled ? 'Tick sound enabled' : 'Tick sound muted');
                  }}
                  style={{ padding: '0.65rem 1.1rem' }}
                >
                  {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  <span>{soundEnabled ? 'Tick: On' : 'Tick: Off'}</span>
                </button>

                <button
                  className="control-btn"
                  onClick={toggleFullscreen}
                  style={{ padding: '0.65rem 1.1rem' }}
                >
                  <Maximize2 size={18} />
                  <span>Fullscreen</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Hero Headline */}
          <section className="hero-content">
            <h1 className="hero-title">{eventName}</h1>
          </section>

      {/* Main Countdown Cards */}
      <main className="countdown-container">
        <div className="countdown-grid">
          {/* Days */}
          <div className="time-card">
            <div className="digit-box digit-font">
              {String(timeLeft.days).padStart(2, '0')}
            </div>
            <div className="digit-label">
              <Calendar size={14} /> Days
            </div>
            <div className="digit-subtext">Remaining</div>
          </div>

          {/* Hours */}
          <div className="time-card">
            <div className="digit-box digit-font">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <div className="digit-label">
              <Clock size={14} /> Hours
            </div>
            <div className="digit-subtext">Cycles</div>
          </div>

          {/* Minutes */}
          <div className="time-card">
            <div className="digit-box digit-font">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <div className="digit-label">
              <Flame size={14} /> Minutes
            </div>
            <div className="digit-subtext">Passing</div>
          </div>

          {/* Seconds */}
          <div className="time-card">
            <div className="digit-box digit-font" style={{ color: 'var(--accent-primary)' }}>
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <div className="digit-label">
              <Sparkles size={14} /> Seconds
            </div>
            <div className="digit-subtext">Live Pulse</div>
          </div>
        </div>
      </main>

      {/* Journey Progress Track */}
      <section className="progress-section">
        <div className="progress-header">
          <span>Overall Journey Progress</span>
          <span style={{ color: 'var(--accent-primary)' }}>{progressPercentage}%</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="progress-meta">
          <span>Started: Oct 22, 2026</span>
          <span className="progress-meta-target">Target: Mar 2, 2027</span>
        </div>
      </section>

      {/* Secondary Quick Metrics Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={22} />
          </div>
          <div className="stat-info">
            <h4>Days Passed</h4>
            <p>{daysPassed} {daysPassed === 1 ? 'day' : 'days'}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={22} />
          </div>
          <div className="stat-info">
            <h4>Total Hours</h4>
            <p>{(timeLeft.days * 24 + timeLeft.hours).toLocaleString()}h</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Hourglass size={22} />
          </div>
          <div className="stat-info">
            <h4>Total Minutes</h4>
            <p>{Math.floor(timeLeft.totalSeconds / 60).toLocaleString()}m</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Sparkles size={22} />
          </div>
          <div className="stat-info">
            <h4>Total Seconds</h4>
            <p>{timeLeft.totalSeconds.toLocaleString()}s</p>
          </div>
        </div>
      </section>
      </>
      )}



      {/* Toast popup */}
      {toastMsg && (
        <div className="toast-notice">
          <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Footer */}

    </div>
  );
}
