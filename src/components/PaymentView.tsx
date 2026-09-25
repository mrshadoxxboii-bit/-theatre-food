import React, { useState } from 'react';
import { useTheatre } from '../context/TheatreContext';
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  QrCode,
  CheckCircle,
  Loader2,
  Armchair,
  AlertCircle,
  Banknote,
  User,
  Phone,
  Film,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PaymentView: React.FC = () => {
  const {
    cart,
    subtotal,
    taxAmount,
    totalAmount,
    seatNumber,
    screenNumber,
    theatreName,
    customerName,
    phoneNumber,
    setSeatInfo,
    setCustomerDetails,
    navigateTo,
    placeOrder,
  } = useTheatre();

  // Form states
  const [formName, setFormName] = useState(customerName || '');
  const [formPhone, setFormPhone] = useState(phoneNumber || '');
  const [formScreen, setFormScreen] = useState(screenNumber || '1');
  const [formSeat, setFormSeat] = useState(seatNumber || 'B12');
  const [customerNotes, setCustomerNotes] = useState('');

  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'seat_cash'>('upi');
  const [upiApp, setUpiApp] = useState<'gpay' | 'phonepe' | 'paytm'>('gpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (cart.length === 0) {
    navigateTo('menu');
    return null;
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isProcessing) return;

    // Validate checkout details
    const cleanName = formName.trim();
    const cleanPhone = formPhone.trim();
    const cleanSeat = formSeat.trim().toUpperCase();
    const cleanScreen = formScreen.trim() || '1';

    if (!cleanName) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 7) {
      setErrorMessage('Please enter a valid phone number (at least 7 digits).');
      return;
    }
    if (!cleanSeat) {
      setErrorMessage('Please enter your seat number (e.g. B12).');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // Sync context state
    setCustomerDetails(cleanName, cleanPhone);
    setSeatInfo(cleanScreen, cleanSeat);

    const methodLabel =
      selectedMethod === 'upi'
        ? `UPI (${upiApp.toUpperCase()})`
        : selectedMethod === 'card'
        ? 'Credit / Debit Card (Demo)'
        : 'Cash to Runner at Seat';

    try {
      // Place order and save into Firestore ORDERS collection
      await placeOrder({
        customerName: cleanName,
        phoneNumber: cleanPhone,
        screenNumber: cleanScreen,
        seatNumber: cleanSeat,
        paymentMethod: methodLabel,
        customerNotes: customerNotes.trim() || undefined,
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#f43f5e'],
        });
      } catch {
        // ignore
      }

      navigateTo('order-success');
    } catch (error) {
      console.error('Order submission failed:', error);
      const msg = error instanceof Error ? error.message : 'Failed to save order to Firestore.';
      setErrorMessage(`Order could not be saved to Firestore: ${msg}. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-28">
      {/* Back button */}
      <button
        onClick={() => navigateTo('cart')}
        disabled={isProcessing}
        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 font-semibold mb-4 py-1.5 px-2 rounded-lg bg-zinc-900 border border-zinc-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Cart</span>
      </button>

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-white">Checkout & In-Seat Delivery</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Provide your seat & contact details to have your food brought directly to your seat.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="space-y-4">
        {/* Customer & Seat Delivery Details Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-3.5 shadow-lg">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
            <User className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              1. Customer & Seat Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-400" />
                Customer Name <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 transition-colors"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                Phone Number <span className="text-amber-400">*</span>
              </label>
              <input
                type="tel"
                required
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 font-mono transition-colors"
              />
            </div>

            {/* Theatre / Screen */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                <Film className="w-3.5 h-3.5 text-amber-400" />
                Theatre Screen <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formScreen}
                onChange={(e) => setFormScreen(e.target.value)}
                placeholder="e.g. 1"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold transition-colors"
              />
            </div>

            {/* Seat Number */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                <Armchair className="w-3.5 h-3.5 text-amber-400" />
                Seat Number <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formSeat}
                onChange={(e) => setFormSeat(e.target.value.toUpperCase())}
                placeholder="e.g. B12"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 font-mono font-bold uppercase transition-colors"
              />
            </div>
          </div>

          {/* Delivery Note */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
              Instructions for Food Runner (Optional)
            </label>
            <input
              type="text"
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="e.g. Deliver during intermission or extra tissue"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 transition-colors"
            />
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                2. Select Payment Method
              </h2>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
              Instant Confirm
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* UPI Option */}
            <button
              type="button"
              onClick={() => setSelectedMethod('upi')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedMethod === 'upi'
                  ? 'bg-amber-500/10 border-amber-400 shadow-sm'
                  : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <QrCode className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-300">Fast</span>
              </div>
              <p className="text-xs font-bold text-white">UPI Apps</p>
              <p className="text-[10px] text-zinc-400">GPay, PhonePe, Paytm</p>
            </button>

            {/* Card Option */}
            <button
              type="button"
              onClick={() => setSelectedMethod('card')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedMethod === 'card'
                  ? 'bg-amber-500/10 border-amber-400 shadow-sm'
                  : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <CreditCard className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xs font-bold text-white">Debit / Credit</p>
              <p className="text-[10px] text-zinc-400">Visa, Mastercard, RuPay</p>
            </button>

            {/* Pay at Seat Option */}
            <button
              type="button"
              onClick={() => setSelectedMethod('seat_cash')}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedMethod === 'seat_cash'
                  ? 'bg-amber-500/10 border-amber-400 shadow-sm'
                  : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Banknote className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xs font-bold text-white">Pay at Seat</p>
              <p className="text-[10px] text-zinc-400">Cash / UPI to Runner</p>
            </button>
          </div>

          {/* Sub-selector for UPI app */}
          {selectedMethod === 'upi' && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400 block">
                Select UPI Provider:
              </span>
              <div className="flex gap-2">
                {(['gpay', 'phonepe', 'paytm'] as const).map((app) => (
                  <button
                    key={app}
                    type="button"
                    onClick={() => setUpiApp(app)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                      upiApp === app
                        ? 'bg-amber-500 text-zinc-950 border-amber-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {app === 'gpay' ? 'Google Pay' : app === 'phonepe' ? 'PhonePe' : 'Paytm'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-2 shadow-lg">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 pb-1 border-b border-zinc-800">
            3. Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} Items)
          </h2>

          <div className="divide-y divide-zinc-800/60 max-h-40 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.product.id} className="py-2 flex items-center justify-between text-xs">
                <span className="text-zinc-200 truncate max-w-[240px]">
                  {item.quantity}x {item.product.name}
                </span>
                <span className="font-mono-num text-amber-300 font-bold">
                  ₹{item.product.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-zinc-800 space-y-1 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal</span>
              <span className="font-mono-num">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Concession GST (5%)</span>
              <span className="font-mono-num">₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white font-bold pt-1 text-sm">
              <span>Total Amount</span>
              <span className="font-mono-num text-amber-400 text-base">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="bg-rose-950/80 border border-rose-500/50 rounded-xl p-3 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
              <span>Saving Order to Firestore...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 text-zinc-950" />
              <span>
                Place Order for Seat {formSeat || 'B12'} · ₹{totalAmount.toFixed(0)}
              </span>
            </>
          )}
        </button>

        <p className="text-[11px] text-zinc-500 text-center flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Order is immediately saved to Firestore and assigned to the kitchen runner</span>
        </p>
      </form>
    </div>
  );
};
