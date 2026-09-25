import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useTheatre } from '../context/TheatreContext';
import {
  getPublicBaseUrl,
  setCustomPublicBaseUrl,
  resetCustomPublicBaseUrl,
  buildQrDestinationUrl,
  DEFAULT_FIREBASE_HOSTING_URL,
  FIREBASE_APP_URL,
  getQrRoutePrefix,
  setQrRoutePrefix,
  isDevelopmentUrl,
} from '../config/publicUrl';
import {
  X,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Printer,
  Sparkles,
  Armchair,
  Film,
  Globe,
  Settings,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Server,
  Compass,
} from 'lucide-react';

export const QrGeneratorModal: React.FC = () => {
  const { isQrModalOpen, setIsQrModalOpen, setSeatInfo, navigateTo, theatreName } = useTheatre();

  const [screen, setScreen] = useState('1');
  const [seat, setSeat] = useState('B12');
  const [routePrefix, setRoutePrefixState] = useState<'/menu' | '/me'>(
    (getQrRoutePrefix() as '/menu' | '/me') || '/menu'
  );
  const [publicBaseUrl, setPublicBaseUrl] = useState<string>(getPublicBaseUrl());
  const [tempBaseUrl, setTempBaseUrl] = useState<string>(getPublicBaseUrl());
  const [isEditingDomain, setIsEditingDomain] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [savedDomainNotice, setSavedDomainNotice] = useState(false);

  // Clean values
  const cleanSeat = (seat || 'B12').trim().toUpperCase();
  const cleanScreen = (screen || '1').trim() || '1';

  // Computed public QR destination URL: e.g. {PUBLIC_BASE_URL}{routePrefix}?seat=B12&screen=1
  const destinationUrl = buildQrDestinationUrl(cleanSeat, cleanScreen, publicBaseUrl, routePrefix);

  // Generate QR image on input change
  useEffect(() => {
    if (!isQrModalOpen) return;

    QRCode.toDataURL(destinationUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#09090b',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [destinationUrl, isQrModalOpen]);

  if (!isQrModalOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(destinationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveDomain = () => {
    const trimmed = tempBaseUrl.trim().replace(/\/+$/, '');
    if (!trimmed) {
      handleResetDomain();
      return;
    }
    setCustomPublicBaseUrl(trimmed);
    setPublicBaseUrl(trimmed);
    setIsEditingDomain(false);
    setSavedDomainNotice(true);
    setTimeout(() => setSavedDomainNotice(false), 2500);
  };

  const handleResetDomain = () => {
    resetCustomPublicBaseUrl();
    const def = DEFAULT_FIREBASE_HOSTING_URL;
    setPublicBaseUrl(def);
    setTempBaseUrl(def);
    setIsEditingDomain(false);
    setSavedDomainNotice(true);
    setTimeout(() => setSavedDomainNotice(false), 2500);
  };

  const handleSelectPredefinedUrl = (url: string) => {
    setCustomPublicBaseUrl(url);
    setPublicBaseUrl(url);
    setTempBaseUrl(url);
    setSavedDomainNotice(true);
    setTimeout(() => setSavedDomainNotice(false), 2500);
  };

  const handleRouteChange = (newPrefix: '/menu' | '/me') => {
    setRoutePrefixState(newPrefix);
    setQrRoutePrefix(newPrefix);
  };

  // "Test QR" button: activates Screen & Seat in the current app session and opens menu
  const handleTestQr = () => {
    setSeatInfo(cleanScreen, cleanSeat);
    setIsQrModalOpen(false);

    // Sync browser path to selected route e.g. /menu?seat=B12&screen=1 or /me?seat=B12&screen=1
    try {
      const currentUrl = new URL(window.location.href);
      currentUrl.pathname = routePrefix;
      currentUrl.searchParams.set('seat', cleanSeat);
      currentUrl.searchParams.set('screen', cleanScreen);
      window.history.pushState({}, '', currentUrl.toString());
    } catch {
      // ignore
    }

    navigateTo('menu');
  };

  const handleOpenLocalTestTab = () => {
    const localTestUrl = `${window.location.origin}${routePrefix}?seat=${encodeURIComponent(
      cleanSeat
    )}&screen=${encodeURIComponent(cleanScreen)}`;
    window.open(localTestUrl, '_blank');
  };

  const handleOpenGeneratedUrlTab = () => {
    window.open(destinationUrl, '_blank');
  };

  const handlePrintSticker = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Seat QR Sticker - Screen ${cleanScreen} Seat ${cleanSeat}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #f4f4f5;
            }
            .sticker {
              background: white;
              padding: 28px;
              border-radius: 20px;
              border: 3px solid #09090b;
              text-align: center;
              width: 320px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            }
            .brand {
              font-size: 19px;
              font-weight: 800;
              color: #b45309;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              margin: 0 0 4px;
            }
            .sub {
              font-size: 11px;
              color: #52525b;
              margin: 0 0 14px;
              font-weight: 600;
            }
            .seat-badge {
              background: #09090b;
              color: #fbbf24;
              padding: 8px 16px;
              border-radius: 10px;
              font-weight: 900;
              font-size: 18px;
              letter-spacing: 1px;
              display: inline-block;
              margin-bottom: 14px;
              font-family: monospace;
            }
            img {
              width: 220px;
              height: 220px;
              margin: 0 auto;
              display: block;
              border-radius: 8px;
            }
            .instructions {
              font-size: 11px;
              font-weight: 600;
              color: #27272a;
              margin-top: 12px;
            }
            .footer-url {
              font-size: 9.5px;
              color: #71717a;
              margin-top: 8px;
              word-break: break-all;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="sticker">
            <div class="brand">${theatreName || 'Namma Theatre Food'}</div>
            <div class="sub">In-Seat Concession Ordering</div>
            <div class="seat-badge">SCREEN ${cleanScreen} · SEAT ${cleanSeat}</div>
            <img src="${qrDataUrl}" alt="Seat QR Sticker" />
            <div class="instructions">Scan camera to order food & drinks directly to this seat</div>
            <div class="footer-url">${destinationUrl}</div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const isCurrentOriginUsable =
    typeof window !== 'undefined' &&
    window.location.origin &&
    !isDevelopmentUrl(window.location.origin);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 relative my-8 animate-in zoom-in-95">
        {/* Close button */}
        <button
          onClick={() => setIsQrModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Seat QR Code Generator & Routing
            </h3>
            <p className="text-xs text-zinc-400">
              Generate QR stickers linked to your deployed Firebase Hosting site
            </p>
          </div>
        </div>

        {/* Firebase Hosting & SPA Route Info Notice */}
        <div className="bg-zinc-950/90 border border-amber-500/30 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-start gap-2.5">
            <Server className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-amber-300 block">
                Firebase Hosting SPA Routing
              </span>
              <p className="text-zinc-300 leading-relaxed text-[11px]">
                Both <code className="text-amber-300">/menu</code> and <code className="text-amber-300">/me</code> routes are configured in Firebase Hosting SPA rewrites and client router to serve the in-seat food ordering flow with no &ldquo;Site Not Found&rdquo; errors.
              </p>
            </div>
          </div>
        </div>

        {/* Screen & Seat Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-amber-400" />
              Screen Number
            </label>
            <input
              type="text"
              value={screen}
              onChange={(e) => setScreen(e.target.value)}
              placeholder="e.g. 1"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 rounded-xl px-3.5 py-2 text-sm text-white font-mono-num font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
              <Armchair className="w-3.5 h-3.5 text-amber-400" />
              Seat Number
            </label>
            <input
              type="text"
              value={seat}
              onChange={(e) => setSeat(e.target.value.toUpperCase())}
              placeholder="e.g. B12"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 rounded-xl px-3.5 py-2 text-sm text-amber-300 font-mono-num font-bold uppercase"
            />
          </div>
        </div>

        {/* Route Selector: /menu vs /me */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              QR Target Route
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              {routePrefix}?seat={cleanSeat}&screen={cleanScreen}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleRouteChange('/menu')}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                routePrefix === '/menu'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <span>/menu route (Standard)</span>
            </button>
            <button
              type="button"
              onClick={() => handleRouteChange('/me')}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                routePrefix === '/me'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <span>/me route (Short)</span>
            </button>
          </div>
        </div>

        {/* Public Base Domain Config Section */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Target Hosting Domain</span>
            </div>

            <button
              onClick={() => setIsEditingDomain(!isEditingDomain)}
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium hover:underline"
            >
              <Settings className="w-3 h-3" />
              {isEditingDomain ? 'Done' : 'Custom Domain'}
            </button>
          </div>

          {/* Quick Domain Presets */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {/* Active App Host */}
            {typeof window !== 'undefined' && window.location.origin && (
              <button
                type="button"
                onClick={() => handleSelectPredefinedUrl(window.location.origin)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all flex items-center gap-1.5 ${
                  publicBaseUrl === window.location.origin
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Active Server ({window.location.hostname})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSelectPredefinedUrl(DEFAULT_FIREBASE_HOSTING_URL)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                publicBaseUrl === DEFAULT_FIREBASE_HOSTING_URL
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Firebase (.web.app)
            </button>

            <button
              type="button"
              onClick={() => handleSelectPredefinedUrl(FIREBASE_APP_URL)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                publicBaseUrl === FIREBASE_APP_URL
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Firebase (.firebaseapp.com)
            </button>
          </div>

          {/* Active Domain Display */}
          <div className="flex items-center justify-between text-xs bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-800">
            <span className="font-mono text-amber-300 truncate max-w-[320px]">
              {publicBaseUrl}
            </span>
            <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded font-medium shrink-0">
              {publicBaseUrl === DEFAULT_FIREBASE_HOSTING_URL ? 'Firebase Deployed' : 'Configured'}
            </span>
          </div>

          {/* Inline Domain Configuration Form */}
          {isEditingDomain && (
            <div className="space-y-2 pt-2 border-t border-zinc-800/80 animate-in fade-in-50">
              <p className="text-[11px] text-zinc-400">
                Enter your live public domain or custom URL:
              </p>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={tempBaseUrl}
                  onChange={(e) => setTempBaseUrl(e.target.value)}
                  placeholder="https://YOUR-DOMAIN.com"
                  className="flex-1 bg-zinc-900 border border-zinc-700 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
                <button
                  onClick={handleSaveDomain}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-colors shrink-0"
                >
                  Save
                </button>
                <button
                  onClick={handleResetDomain}
                  title="Reset to default Firebase Hosting URL"
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {savedDomainNotice && (
            <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Target domain updated successfully!
            </p>
          )}
        </div>

        {/* QR Destination URL Display */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 space-y-1">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-zinc-400">
            <span>Encoded QR Destination URL:</span>
            <span className="font-mono text-zinc-500">{routePrefix}?seat={cleanSeat}&screen={cleanScreen}</span>
          </div>
          <p className="font-mono text-xs text-amber-300 break-all select-all font-semibold">
            {destinationUrl}
          </p>
        </div>

        {/* QR Code Sticker Preview Card */}
        <div className="bg-white rounded-2xl p-3.5 text-center text-zinc-950 border-2 border-zinc-300 shadow-inner space-y-1.5">
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
            {theatreName || 'Namma Theatre Food'}
          </p>
          <div className="inline-block bg-zinc-950 text-amber-300 px-3 py-1 rounded-lg font-mono-num font-black text-xs">
            SCREEN {cleanScreen} · SEAT {cleanSeat}
          </div>

          <div className="flex justify-center py-1">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Code for Screen ${cleanScreen} Seat ${cleanSeat}`}
                className="w-44 h-44 rounded-lg shadow-sm"
              />
            ) : (
              <div className="w-44 h-44 bg-zinc-200 animate-pulse rounded-lg flex items-center justify-center text-xs text-zinc-500">
                Generating QR...
              </div>
            )}
          </div>

          <p className="text-[10px] text-zinc-600 font-medium">
            Scan camera to order food & drinks directly to this seat
          </p>
        </div>

        {/* Modal Utility Actions */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleCopyLink}
            className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-zinc-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy QR Link</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrintSticker}
            className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-zinc-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Seat Sticker</span>
          </button>
        </div>

        {/* Primary In-App "Test QR" Action */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleTestQr}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all active:scale-[0.99]"
          >
            <QrCode className="w-4 h-4" />
            <span>Test QR Scan Flow (Open Menu as Seat {cleanSeat})</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleOpenLocalTestTab}
              className="py-2 px-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Test Current Host Tab</span>
            </button>

            <button
              onClick={handleOpenGeneratedUrlTab}
              className="py-2 px-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Open Target QR URL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
