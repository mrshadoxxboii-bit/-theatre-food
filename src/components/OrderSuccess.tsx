import React from 'react';
import { useTheatre } from '../context/TheatreContext';
import {
  CheckCircle2,
  Receipt,
  Home,
  ChefHat,
  Armchair,
  Clock,
  Sparkles,
  ArrowRight,
  User,
  Phone,
  Film,
  XCircle,
} from 'lucide-react';
import { OrderStatus } from '../types';

export const OrderSuccess: React.FC = () => {
  const { activeOrder, navigateTo, updateOrderStatus } = useTheatre();

  if (!activeOrder) {
    return (
      <div className="max-w-md mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-zinc-400 mb-4">No recent order found</p>
        <button
          onClick={() => navigateTo('menu')}
          className="px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-sm"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  const steps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'Pending', label: 'Pending', desc: 'Order placed & sent to kitchen' },
    { key: 'Preparing', label: 'Preparing', desc: 'Popping fresh & assembling' },
    { key: 'Ready', label: 'Ready', desc: 'Runner assigned for in-seat delivery' },
    { key: 'Delivered', label: 'Delivered', desc: 'Handed to you at your seat' },
  ];

  const currentStepIndex =
    activeOrder.orderStatus === 'Cancelled'
      ? -1
      : activeOrder.orderStatus === 'Pending'
      ? 0
      : activeOrder.orderStatus === 'Preparing'
      ? 1
      : activeOrder.orderStatus === 'Ready'
      ? 2
      : 3;

  const formattedDate = new Date(activeOrder.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6 pb-24">
      {/* Success Hero Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20 animate-in zoom-in-50">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Saved to Cloud Firestore (orders)</span>
        </div>

        <h1 className="font-cinema text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Order Placed Successfully!
        </h1>
        <p className="text-sm text-zinc-400">
          Your snacks are being prepared and will be delivered directly to your seat.
        </p>
      </div>

      {/* Prominent Order & Seat Badge */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-zinc-800">
          <div>
            <span className="text-xs uppercase font-medium text-zinc-400 block">
              Order ID
            </span>
            <span className="text-xl font-extrabold text-amber-400 font-mono-num">
              #{activeOrder.orderId}
            </span>
            <span className="text-[11px] text-zinc-500 block">{formattedDate}</span>
          </div>

          <div className="text-right">
            <span className="text-xs uppercase font-medium text-zinc-400 block">
              Seat Location
            </span>
            <span className="text-base sm:text-lg font-bold text-white font-mono-num bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800 inline-block">
              Screen {activeOrder.screenNumber} · Seat {activeOrder.seatNumber}
            </span>
          </div>
        </div>

        {/* Customer Info Display */}
        {(activeOrder.customerName || activeOrder.phoneNumber) && (
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-zinc-300">
              <User className="w-4 h-4 text-amber-400" />
              <span>
                Customer: <strong className="text-white">{activeOrder.customerName || 'Patron'}</strong>
              </span>
            </div>
            {activeOrder.phoneNumber && (
              <div className="flex items-center gap-2 text-zinc-300">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>
                  Phone: <strong className="text-amber-300 font-mono">{activeOrder.phoneNumber}</strong>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Live Status Tracker */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <ChefHat className="w-4 h-4 text-amber-400" />
              Live Order Status:
            </span>
            <span
              className={`text-xs font-bold font-mono-num uppercase px-2.5 py-0.5 rounded border ${
                activeOrder.orderStatus === 'Cancelled'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : activeOrder.orderStatus === 'Delivered'
                  ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  : activeOrder.orderStatus === 'Ready'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : activeOrder.orderStatus === 'Preparing'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
              }`}
            >
              {activeOrder.orderStatus.toUpperCase()}
            </span>
          </div>

          {activeOrder.orderStatus === 'Cancelled' ? (
            <div className="bg-rose-950/60 border border-rose-800 rounded-xl p-3 text-center text-xs text-rose-300 flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>This order has been cancelled by the concession staff.</span>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1.5 pt-2">
              {steps.map((st, idx) => {
                const isDone = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={st.key} className="space-y-1.5 text-center">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isDone ? 'bg-amber-400 shadow-sm shadow-amber-400/50' : 'bg-zinc-800'
                      } ${isCurrent ? 'animate-pulse' : ''}`}
                    />
                    <p
                      className={`text-[10px] font-semibold truncate ${
                        isDone ? 'text-zinc-200 font-bold' : 'text-zinc-500'
                      }`}
                    >
                      {st.label}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick status cycle for demonstration */}
          {activeOrder.orderStatus !== 'Delivered' && activeOrder.orderStatus !== 'Cancelled' && (
            <div className="pt-2 text-center">
              <button
                onClick={() => {
                  const nextStatus: OrderStatus =
                    activeOrder.orderStatus === 'Pending'
                      ? 'Preparing'
                      : activeOrder.orderStatus === 'Preparing'
                      ? 'Ready'
                      : 'Delivered';
                  updateOrderStatus(activeOrder.orderId, nextStatus);
                }}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-medium hover:underline inline-flex items-center gap-1"
              >
                <span>Advance status (Staff test simulation)</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ordered Items Breakdown */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 pb-1">
          Items Ordered ({activeOrder.items.reduce((s, i) => s + i.quantity, 0)})
        </h3>

        <div className="divide-y divide-zinc-800/80 text-xs">
          {activeOrder.items.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-zinc-800 flex items-center justify-center font-mono-num font-bold text-amber-300 text-[11px]">
                  {item.quantity}x
                </span>
                <span className="font-semibold text-zinc-200">{item.name}</span>
              </div>
              <span className="font-mono-num text-zinc-300 font-medium">
                ₹{item.total.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing Subtotals */}
        <div className="pt-3 border-t border-zinc-800 space-y-1.5 text-xs text-zinc-400">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono-num text-zinc-300">
              ₹{activeOrder.subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>GST (5%)</span>
            <span className="font-mono-num text-zinc-300">
              ₹{activeOrder.taxAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-zinc-800">
            <span>Total Paid</span>
            <span className="font-mono-num text-amber-400 text-base">
              ₹{activeOrder.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigateTo('digital-bill')}
          className="flex-1 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-zinc-700"
        >
          <Receipt className="w-4 h-4 text-amber-400" />
          <span>View Digital GST Invoice</span>
        </button>

        <button
          onClick={() => navigateTo('menu')}
          className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <Home className="w-4 h-4" />
          <span>Order More Snacks</span>
        </button>
      </div>
    </div>
  );
};
