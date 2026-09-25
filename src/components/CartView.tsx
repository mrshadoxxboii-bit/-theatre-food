import React, { useState } from 'react';
import { useTheatre } from '../context/TheatreContext';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  Armchair,
  FileText,
  ShieldCheck,
} from 'lucide-react';

export const CartView: React.FC = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    taxAmount,
    totalAmount,
    seatNumber,
    screenNumber,
    theatreName,
    navigateTo,
  } = useTheatre();

  const [notes, setNotes] = useState('');

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-12">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Your Cart is Empty</h2>
        <p className="text-sm text-zinc-400 mb-6 max-w-xs">
          Looks like you haven't added any popcorn or drinks to your seat order yet.
        </p>
        <button
          onClick={() => navigateTo('menu')}
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
        >
          Explore Food Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
      {/* Header Back & Clear */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigateTo('menu')}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 font-semibold py-1.5 px-2 rounded-lg bg-zinc-900 border border-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </button>

        <button
          onClick={clearCart}
          className="text-xs text-zinc-500 hover:text-rose-400 transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="space-y-4">
        {/* Delivering To Seat Card */}
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-900/90 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Armchair className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase font-medium text-amber-400/90">
                Delivering to Your Seat
              </p>
              <h3 className="text-base font-bold text-white font-mono-num">
                Screen {screenNumber} · Seat {seatNumber || 'B12'}
              </h3>
              <p className="text-[11px] text-zinc-400">{theatreName}</p>
            </div>
          </div>

          <button
            onClick={() => navigateTo('landing')}
            className="text-xs text-amber-400 hover:underline font-semibold"
          >
            Change
          </button>
        </div>

        {/* Selected Items List */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 divide-y divide-zinc-800/80 shadow-md">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 pb-3">
            Order Items ({cart.reduce((s, i) => s + i.quantity, 0)})
          </h2>

          <div className="divide-y divide-zinc-800/80">
            {cart.map((item) => (
              <div key={item.product.id} className="py-3.5 flex items-center justify-between gap-3">
                {/* Item Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-3 h-3 rounded-xs border flex items-center justify-center p-0.5 shrink-0 ${
                        item.product.isVeg ? 'border-emerald-500' : 'border-rose-600'
                      }`}
                    >
                      <span
                        className={`w-1 h-1 rounded-full ${
                          item.product.isVeg ? 'bg-emerald-500' : 'bg-rose-600'
                        }`}
                      />
                    </span>
                    <h4 className="text-sm font-semibold text-zinc-100 truncate">
                      {item.product.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                    <span className="font-mono-num text-zinc-300">
                      ₹{item.product.price} each
                    </span>
                    <span>·</span>
                    <span className="font-mono-num text-amber-400 font-semibold">
                      Item Total: ₹{item.product.price * item.quantity}
                    </span>
                  </div>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-7 h-7 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold font-mono-num text-amber-300">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-7 h-7 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Special Instructions Note */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4">
          <label
            htmlFor="instructions"
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            Kitchen / Delivery Note (Optional)
          </label>
          <input
            id="instructions"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Please bring extra napkins or deliver at intermission"
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 transition-colors"
          />
        </div>

        {/* Bill Summary */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 pb-1">
            Bill Summary
          </h3>
          <div className="flex justify-between text-xs text-zinc-300">
            <span>Item Subtotal</span>
            <span className="font-mono-num">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-zinc-300">
            <span className="flex items-center gap-1">
              Concession GST (5%)
              <span className="text-[10px] text-zinc-500">(CGST 2.5% + SGST 2.5%)</span>
            </span>
            <span className="font-mono-num">₹{taxAmount.toFixed(2)}</span>
          </div>
          <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline text-white">
            <div>
              <span className="text-sm font-bold">Grand Total</span>
              <p className="text-[10px] text-zinc-400">All taxes included</p>
            </div>
            <span className="text-xl font-extrabold text-amber-400 font-mono-num">
              ₹{totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Trust Note */}
        <div className="flex items-center gap-2 text-[11px] text-zinc-500 justify-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Contactless In-Seat Delivery · Instant Demo Payment Flow</span>
        </div>
      </div>

      {/* Sticky Proceed to Payment CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => navigateTo('payment')}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-base shadow-xl shadow-amber-500/20 flex items-center justify-between transition-all active:scale-[0.99]"
          >
            <div className="text-left">
              <span className="text-xs uppercase tracking-wider text-zinc-900/80 block">
                Screen {screenNumber} · Seat {seatNumber || 'B12'}
              </span>
              <span className="text-lg font-mono-num font-black">
                ₹{totalAmount.toFixed(0)}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-zinc-950 text-amber-400 px-3.5 py-1.5 rounded-lg text-xs font-bold">
              <span>Proceed to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
