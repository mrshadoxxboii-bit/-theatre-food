import React, { useState, useEffect } from 'react';
import { useTheatre } from '../context/TheatreContext';
import { Armchair, ArrowRight, Film, Sparkles, CheckCircle2, QrCode, Ticket } from 'lucide-react';

export const SeatLanding: React.FC = () => {
  const {
    theatreName,
    screenNumber,
    seatNumber,
    setSeatInfo,
    navigateTo,
    setIsQrModalOpen,
  } = useTheatre();

  const [inputScreen, setInputScreen] = useState<string>(screenNumber || '1');
  const [inputSeat, setInputSeat] = useState<string>(seatNumber || 'B12');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Keep input synchronized with context whenever seatNumber or screenNumber updates
  useEffect(() => {
    if (seatNumber) {
      setInputSeat(seatNumber);
    }
    if (screenNumber) {
      setInputScreen(screenNumber);
    }
  }, [seatNumber, screenNumber]);

  const screens = ['1', '2', '3', '4 (IMAX)'];
  const sampleSeats = ['B12', 'C07', 'D04', 'F14', 'G02'];

  const handleContinue = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputSeat.trim().toUpperCase();
    if (!trimmed) {
      setErrorMsg('Please enter or select your seat number (e.g. B12)');
      return;
    }
    setErrorMsg('');
    setSeatInfo(inputScreen, trimmed);
    navigateTo('menu');
  };

  const handleQuickSelect = (seat: string) => {
    setInputSeat(seat);
    setErrorMsg('');
    setSeatInfo(inputScreen, seat);
  };

  const isAutoDetected = Boolean(seatNumber);

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-between py-6 px-4 max-w-lg mx-auto">
      {/* Top Banner Card */}
      <div className="space-y-5">
        {/* Cinema Marquee Tag */}
        <div className="text-center space-y-2 pt-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>In-Seat Concession Ordering</span>
          </div>
          <h1 className="font-cinema text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {theatreName}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
            Scan QR near seat, select food and drinks, pay online, and receive in-seat delivery!
          </p>
        </div>

        {/* Prominent Auto-Detected Seat Ticket Badge if Seat exists in URL or state */}
        {isAutoDetected && (
          <div className="bg-gradient-to-br from-amber-500/20 via-zinc-900 to-zinc-950 border-2 border-amber-500/60 rounded-2xl p-4 sm:p-5 shadow-xl shadow-amber-500/10 relative overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>QR Seat Auto-Detected: {seatNumber}</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                ?seat={seatNumber}
              </span>
            </div>

            <div className="py-4 flex items-center justify-around text-center">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
                  Auditorium
                </span>
                <span className="text-xl sm:text-2xl font-black text-white font-mono-num">
                  Screen {screenNumber}
                </span>
              </div>

              <div className="h-10 w-px bg-zinc-800" />

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 block">
                  Target Seat
                </span>
                <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono-num tracking-wide">
                  Seat {seatNumber}
                </span>
              </div>
            </div>

            <p className="text-center text-[11px] text-zinc-300 pt-1 border-t border-zinc-800/80">
              Food & drinks ordered will be delivered directly to <strong>Screen {screenNumber} · Seat {seatNumber}</strong>.
            </p>
          </div>
        )}

        {/* Seat Confirmation Box */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl shadow-black/40 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Armchair className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  {isAutoDetected ? 'Verify or Change Seat' : 'Enter Seat Details'}
                </span>
                <p className="text-sm font-semibold text-zinc-200">
                  Screen {inputScreen} · Seat {inputSeat || '---'}
                </p>
              </div>
            </div>

            {isAutoDetected ? (
              <span className="text-[11px] text-zinc-400">
                Editable below
              </span>
            ) : (
              <span className="text-[11px] text-amber-400 font-medium">
                Manual Selection
              </span>
            )}
          </div>

          <form onSubmit={handleContinue} className="space-y-4">
            {/* Screen Selection */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-amber-400" />
                Screen Number
              </label>
              <div className="grid grid-cols-4 gap-2">
                {screens.map((scr) => (
                  <button
                    key={scr}
                    type="button"
                    onClick={() => {
                      setInputScreen(scr);
                      setSeatInfo(scr, inputSeat);
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all text-center ${
                      inputScreen === scr
                        ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                        : 'bg-zinc-800/80 text-zinc-300 border-zinc-700/80 hover:border-zinc-500'
                    }`}
                  >
                    Screen {scr}
                  </button>
                ))}
              </div>
            </div>

            {/* Seat Number Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="seat-input"
                  className="text-xs font-medium text-zinc-300 flex items-center gap-1.5"
                >
                  <Armchair className="w-3.5 h-3.5 text-amber-400" />
                  Seat Number
                </label>
                <span className="text-[11px] text-zinc-500">
                  Check sticker on armrest
                </span>
              </div>

              <div className="relative">
                <input
                  id="seat-input"
                  type="text"
                  value={inputSeat}
                  onChange={(e) => {
                    setInputSeat(e.target.value.toUpperCase());
                    setErrorMsg('');
                  }}
                  placeholder="e.g. B12, C7, F10"
                  maxLength={6}
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-4 py-3 text-lg font-mono-num font-bold text-amber-300 placeholder:text-zinc-600 transition-colors uppercase"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-medium text-zinc-500 bg-zinc-800/80 px-2 py-0.5 rounded">
                  Screen {inputScreen}
                </span>
              </div>
              {errorMsg && (
                <p className="text-xs text-rose-400 mt-1 font-medium">{errorMsg}</p>
              )}
            </div>

            {/* Quick Demo Seats for testing */}
            <div className="pt-1">
              <span className="text-[11px] text-zinc-400 block mb-1.5 font-medium">
                Quick Test Seats:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sampleSeats.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleQuickSelect(s)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-mono-num font-medium border transition-colors ${
                      inputSeat === s
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:text-zinc-200'
                    }`}
                  >
                    Seat {s}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* Delivery Note */}
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3 text-xs text-zinc-400 flex items-start gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0 animate-ping" />
            <p>
              <strong className="text-zinc-200 font-semibold">In-Seat Delivery:</strong>{' '}
              Theatre staff will bring hot snacks directly to{' '}
              <span className="text-amber-300 font-bold font-mono-num">
                Screen {inputScreen} · Seat {inputSeat || '---'}
              </span>{' '}
              within 10-15 minutes or at intermission.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA & QR helper */}
      <div className="pt-5 space-y-3">
        <button
          onClick={() => handleContinue()}
          className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-base shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <span>Continue to Menu</span>
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
          <span className="font-mono">URL: ?seat={inputSeat || 'B12'}</span>
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="text-amber-400 hover:underline flex items-center gap-1 font-medium"
          >
            <QrCode className="w-3.5 h-3.5" />
            Admin QR Generator
          </button>
        </div>
      </div>
    </div>
  );
};
