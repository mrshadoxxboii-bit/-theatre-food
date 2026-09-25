import React from 'react';
import { useTheatre } from '../context/TheatreContext';
import {
  Printer,
  ArrowLeft,
  CheckCircle2,
  Share2,
  Ticket,
  Armchair,
  Receipt,
  Download,
} from 'lucide-react';

export const DigitalBill: React.FC = () => {
  const { activeOrder, orders, navigateTo } = useTheatre();

  // If activeOrder is not present, use the latest order in the list as fallback
  const billOrder = activeOrder || orders[0];

  if (!billOrder) {
    return (
      <div className="max-w-md mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-zinc-400 mb-4">No bill available</p>
        <button
          onClick={() => navigateTo('menu')}
          className="px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-sm"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  const formattedDate = new Date(billOrder.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Namma Theatre Food Bill #${billOrder.orderId}`,
          text: `Digital Bill for Seat ${billOrder.seatNumber}, Screen ${billOrder.screenNumber} - Total: ₹${billOrder.totalAmount}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `Namma Theatre Food Order #${billOrder.orderId}\nSeat: ${billOrder.seatNumber} (Screen ${billOrder.screenNumber})\nTotal Paid: ₹${billOrder.totalAmount}`
      );
      alert('Order details copied to clipboard!');
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-5">
      {/* Top navigation row */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={() => navigateTo('order-success')}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 font-semibold py-1.5 px-2.5 rounded-lg bg-zinc-900 border border-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tracker</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
            title="Share bill"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors shadow-md shadow-amber-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Bill</span>
          </button>
        </div>
      </div>

      {/* Printable Receipt Paper Container */}
      <div
        id="printable-digital-bill"
        className="bg-white text-zinc-950 rounded-2xl p-6 sm:p-7 shadow-2xl shadow-black/60 relative overflow-hidden border border-zinc-200"
      >
        {/* Cinema Watermark / Brand Header */}
        <div className="text-center pb-5 border-b-2 border-dashed border-zinc-300">
          <div className="inline-flex items-center justify-center gap-1.5 mb-1 text-zinc-900">
            <Ticket className="w-5 h-5 text-amber-600" />
            <span className="font-cinema text-xl font-bold tracking-wider uppercase text-zinc-900">
              Namma Theatre Food
            </span>
          </div>
          <p className="text-xs font-semibold text-zinc-700">{billOrder.theatreName}</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            GSTIN: 33AAAAA0000A1Z5 · Concession Tax Invoice
          </p>

          <div className="mt-3 inline-block bg-zinc-100 border border-zinc-300 rounded-lg px-3 py-1 text-xs font-mono font-bold text-zinc-800">
            TAX INVOICE / CASH MEMO
          </div>
        </div>

        {/* Invoice Metadata Grid */}
        <div className="py-4 border-b border-zinc-200 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-zinc-500 block text-[11px]">Invoice / Order No:</span>
            <span className="font-mono-num font-bold text-zinc-900 text-sm">
              #{billOrder.orderId}
            </span>
          </div>

          <div className="text-right">
            <span className="text-zinc-500 block text-[11px]">Date & Time:</span>
            <span className="font-mono-num font-semibold text-zinc-800">{formattedDate}</span>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-2.5">
            <span className="text-zinc-500 block text-[10px] uppercase font-bold">Auditorium</span>
            <span className="font-bold text-zinc-900 font-mono-num text-sm">
              Screen {billOrder.screenNumber}
            </span>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-right">
            <span className="text-amber-800 block text-[10px] uppercase font-bold">
              Delivered To Seat
            </span>
            <span className="font-extrabold text-amber-900 font-mono-num text-base">
              Seat {billOrder.seatNumber}
            </span>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="py-4 border-b border-zinc-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-300 text-zinc-600 font-semibold">
                <th className="pb-2">Item Description</th>
                <th className="pb-2 text-center w-12">Qty</th>
                <th className="pb-2 text-right w-16">Rate</th>
                <th className="pb-2 text-right w-20">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {billOrder.items.map((item, index) => (
                <tr key={index} className="text-zinc-800">
                  <td className="py-2.5 pr-2">
                    <span className="font-medium text-zinc-900">{item.name}</span>
                    <span className="block text-[10px] text-zinc-500">
                      {item.isVeg ? 'Veg Concession' : 'Non-Veg Concession'}
                    </span>
                  </td>
                  <td className="py-2.5 text-center font-mono-num font-bold text-zinc-900">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 text-right font-mono-num text-zinc-600">
                    ₹{item.price.toFixed(2)}
                  </td>
                  <td className="py-2.5 text-right font-mono-num font-bold text-zinc-900">
                    ₹{item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Breakdown */}
        <div className="py-3 space-y-1.5 text-xs text-zinc-600 border-b border-zinc-200">
          <div className="flex justify-between">
            <span>Items Subtotal</span>
            <span className="font-mono-num font-medium text-zinc-900">
              ₹{billOrder.subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>CGST @ 2.5%</span>
            <span className="font-mono-num text-zinc-800">
              ₹{(billOrder.taxAmount / 2).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>SGST @ 2.5%</span>
            <span className="font-mono-num text-zinc-800">
              ₹{(billOrder.taxAmount / 2).toFixed(2)}
            </span>
          </div>

          <div className="pt-2 border-t border-zinc-300 flex justify-between items-baseline text-zinc-950 font-bold">
            <span className="text-sm">Net Total Paid</span>
            <span className="text-xl font-mono-num font-black text-amber-700">
              ₹{billOrder.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment & Audit Verification */}
        <div className="pt-4 flex items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>PAID VIA {billOrder.paymentMethod.toUpperCase()}</span>
            </div>
            <p className="text-[10px] text-zinc-500">
              Payment Status:{' '}
              <span className="font-semibold text-zinc-700">
                {billOrder.paymentStatus === 'demo_paid' ? 'DEMO PAID' : billOrder.paymentStatus.toUpperCase()}
              </span>
            </p>
            <p className="text-[10px] text-zinc-500">
              FSSAI Lic No: <span className="font-mono">12423002000491</span>
            </p>
          </div>

          {/* Verification Barcode Mockup */}
          <div className="text-right">
            <div className="font-mono text-[9px] tracking-widest text-zinc-400">
              ||| | ||||| || |||||| | |||||
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              VERIFIED-{billOrder.orderId}
            </span>
          </div>
        </div>

        {/* Receipt Footer Message */}
        <div className="mt-5 pt-3 border-t-2 border-dashed border-zinc-300 text-center">
          <p className="text-xs font-semibold text-zinc-800">Thank you for ordering with us!</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            Enjoy your movie screening at {billOrder.theatreName}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 no-print">
        <button
          onClick={handlePrint}
          className="flex-1 py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Save / Print Bill (PDF)</span>
        </button>

        <button
          onClick={() => navigateTo('menu')}
          className="py-3.5 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold text-sm border border-zinc-700/80 transition-all active:scale-95"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
};
