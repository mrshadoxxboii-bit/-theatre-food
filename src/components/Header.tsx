import React from 'react';
import { useTheatre } from '../context/TheatreContext';
import { ShoppingBag, QrCode, Shield, UtensilsCrossed, Armchair } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    theatreName,
    screenNumber,
    seatNumber,
    cartCount,
    currentView,
    navigateTo,
    setIsQrModalOpen,
  } = useTheatre();

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Brand */}
        <button
          onClick={() => navigateTo('menu')}
          className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-zinc-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-cinema text-base sm:text-lg font-bold tracking-wider text-amber-400 uppercase">
                Namma Theatre
              </span>
              <span className="text-[10px] tracking-widest text-zinc-400 font-semibold uppercase bg-zinc-800/90 px-1.5 py-0.5 rounded text-amber-200/90 border border-zinc-700/60">
                FOOD
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden xs:block truncate max-w-[170px] sm:max-w-xs">
              {theatreName}
            </p>
          </div>
        </button>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2">
          {/* Seat Tag button (if seat chosen) */}
          {seatNumber ? (
            <button
              onClick={() => navigateTo('landing')}
              title="Change Screen or Seat"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:border-amber-400 transition-colors focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <Armchair className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono-num font-bold">
                S{screenNumber} · {seatNumber}
              </span>
            </button>
          ) : (
            <button
              onClick={() => navigateTo('landing')}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white transition-colors"
            >
              Set Seat
            </button>
          )}

          {/* QR Code generator trigger */}
          <button
            onClick={() => setIsQrModalOpen(true)}
            title="Generate Seat QR Codes"
            aria-label="Generate Seat QR Codes"
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Admin Switcher */}
          <button
            onClick={() => navigateTo(currentView === 'admin' ? 'menu' : 'admin')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              currentView === 'admin'
                ? 'bg-amber-500 text-zinc-950 border-amber-400 font-semibold shadow-sm'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white hover:border-zinc-700'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {currentView === 'admin' ? 'Exit Staff' : 'Staff Admin'}
            </span>
          </button>

          {/* Cart Trigger */}
          {currentView !== 'admin' && (
            <button
              onClick={() => navigateTo('cart')}
              aria-label={`Cart with ${cartCount} items`}
              className="relative p-2 rounded-lg bg-amber-500 text-zinc-950 hover:bg-amber-400 font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-amber-300 shadow-md shadow-amber-500/20 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-red-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-zinc-950 font-mono-num animate-in zoom-in-50">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
