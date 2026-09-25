import React, { useState, useMemo } from 'react';
import { useTheatre } from '../context/TheatreContext';
import { Order, OrderStatus } from '../types';
import {
  Armchair,
  Clock,
  CheckCircle2,
  ChefHat,
  Search,
  RefreshCw,
  QrCode,
  UtensilsCrossed,
  Wifi,
  Loader2,
  AlertCircle,
  Check,
  User,
  Phone,
  Film,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    theatreName,
    navigateTo,
    setIsQrModalOpen,
    isFirestoreLoading,
    firestoreError,
    isOnlineFirestore,
  } = useTheatre();

  // Order filters
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterScreen, setFilterScreen] = useState<string>('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Status counts directly from existing Firestore ORDERS collection
  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.orderStatus === 'Pending' || o.status === 'Pending').length,
      preparing: orders.filter((o) => o.orderStatus === 'Preparing' || o.status === 'Preparing').length,
      ready: orders.filter((o) => o.orderStatus === 'Ready' || o.status === 'Ready').length,
      delivered: orders.filter((o) => o.orderStatus === 'Delivered' || o.status === 'Delivered').length,
      cancelled: orders.filter((o) => o.orderStatus === 'Cancelled' || o.status === 'Cancelled').length,
    };
  }, [orders]);

  // Total sales calculation
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.orderStatus !== 'Cancelled' && o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const currentSt = order.orderStatus || order.status || 'Pending';
      const matchesTab = activeTab === 'all' || currentSt === activeTab;
      const matchesScreen = filterScreen === 'all' || order.screenNumber === filterScreen;
      const matchesSearch =
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.seatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (order.phoneNumber && order.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        order.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesTab && matchesScreen && matchesSearch;
    });
  }, [orders, activeTab, filterScreen, searchQuery]);

  const getTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / (1000 * 60));
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-28 space-y-6">
      {/* Top Bar / Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
                Live Orders Management
              </span>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                <Wifi className="w-2.5 h-2.5" />
                Firestore ORDERS Connected
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {theatreName} Console
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="Generate Seat QR Codes"
          >
            <QrCode className="w-4 h-4" />
            <span>Seat QRs</span>
          </button>
        </div>
      </div>

      {/* Revenue and Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5">
          <span className="text-[11px] font-semibold text-zinc-400 block uppercase">
            Total Orders
          </span>
          <span className="text-xl sm:text-2xl font-black text-white font-mono-num">
            {counts.all}
          </span>
        </div>
        <div className="bg-zinc-900/80 border border-amber-500/30 rounded-2xl p-3.5">
          <span className="text-[11px] font-semibold text-amber-300 block uppercase flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Pending
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono-num">
            {counts.pending}
          </span>
        </div>
        <div className="bg-zinc-900/80 border border-blue-500/30 rounded-2xl p-3.5">
          <span className="text-[11px] font-semibold text-blue-300 block uppercase">
            Preparing
          </span>
          <span className="text-xl sm:text-2xl font-black text-blue-400 font-mono-num">
            {counts.preparing}
          </span>
        </div>
        <div className="bg-zinc-900/80 border border-emerald-500/30 rounded-2xl p-3.5">
          <span className="text-[11px] font-semibold text-emerald-300 block uppercase">
            Ready
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono-num">
            {counts.ready}
          </span>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-700 rounded-2xl p-3.5">
          <span className="text-[11px] font-semibold text-zinc-400 block uppercase">
            Delivered
          </span>
          <span className="text-xl sm:text-2xl font-black text-zinc-300 font-mono-num">
            {counts.delivered}
          </span>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5">
          <span className="text-[11px] font-semibold text-zinc-400 block uppercase">
            Total Revenue
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono-num">
            ₹{totalRevenue.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Search & Screen Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID, seat (e.g. B12), customer name or phone..."
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 transition-colors"
          />
        </div>

        {/* Screen Dropdown */}
        <select
          value={filterScreen}
          onChange={(e) => setFilterScreen(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 text-xs text-white rounded-xl px-3 py-2.5 focus:border-amber-400"
        >
          <option value="all">All Screens</option>
          <option value="1">Screen 1</option>
          <option value="2">Screen 2</option>
          <option value="3">Screen 3</option>
        </select>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-800">
        {(
          [
            { id: 'all', label: 'All Orders', count: counts.all },
            { id: 'Pending', label: 'Pending', count: counts.pending },
            { id: 'Preparing', label: 'Preparing', count: counts.preparing },
            { id: 'Ready', label: 'Ready', count: counts.ready },
            { id: 'Delivered', label: 'Delivered', count: counts.delivered },
            { id: 'Cancelled', label: 'Cancelled', count: counts.cancelled },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                isActive
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm'
                  : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Cards Listing */}
      {isFirestoreLoading && orders.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/40 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-zinc-400 text-sm">Loading orders from Firestore...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/40 rounded-2xl border border-zinc-800">
          <p className="text-zinc-400 text-sm font-medium">No orders found matching this filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const isUpdating = updatingOrderId === order.orderId;
            const currentStatus = order.orderStatus || order.status || 'Pending';
            const formattedTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={order.orderId}
                className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xl transition-all"
              >
                {/* Top Row: Order ID, Seat, Time */}
                <div>
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-amber-400 text-base">
                          #{order.orderId}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          {formattedTime} ({getTimeAgo(order.createdAt)})
                        </span>
                      </div>

                      {/* Customer Name & Phone */}
                      {(order.customerName || order.phoneNumber) && (
                        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300 mt-1">
                          {order.customerName && (
                            <span className="flex items-center gap-1 font-semibold text-white">
                              <User className="w-3 h-3 text-amber-400" />
                              {order.customerName}
                            </span>
                          )}
                          {order.phoneNumber && (
                            <span className="flex items-center gap-1 text-zinc-400 font-mono">
                              <Phone className="w-3 h-3 text-amber-400" />
                              {order.phoneNumber}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Seat Badge */}
                    <div className="text-right">
                      <span className="text-xs uppercase font-extrabold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl font-mono block">
                        Screen {order.screenNumber} · Seat {order.seatNumber}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="py-3 space-y-1.5 border-b border-zinc-800/80">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-zinc-200">
                          <strong className="font-mono text-amber-400 mr-1.5 font-bold">
                            {item.quantity}x
                          </strong>
                          {item.name}
                        </span>
                        <span className="font-mono text-zinc-400">
                          ₹{item.total}
                        </span>
                      </div>
                    ))}

                    {order.customerNotes && (
                      <p className="text-[11px] text-amber-300/90 italic pt-1">
                        Note: "{order.customerNotes}"
                      </p>
                    )}
                  </div>

                  {/* Price Row */}
                  <div className="pt-2.5 flex items-center justify-between text-xs">
                    <span className="text-zinc-400">
                      {order.paymentMethod}
                    </span>
                    <div className="text-right">
                      <span className="text-[11px] text-zinc-400 mr-2">Total</span>
                      <span className="text-base font-black text-amber-400 font-mono">
                        ₹{order.totalAmount || order.total}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Changer Buttons (Pending, Preparing, Ready, Delivered, Cancelled) */}
                <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                    Change Order Status:
                  </span>

                  <div className="grid grid-cols-5 gap-1">
                    {(
                      ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'] as OrderStatus[]
                    ).map((status) => {
                      const isCurrent = currentStatus === status;
                      return (
                        <button
                          key={status}
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(order.orderId, status)}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-all truncate text-center ${
                            isCurrent
                              ? status === 'Pending'
                                ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm'
                                : status === 'Preparing'
                                ? 'bg-blue-500 text-white border-blue-400 shadow-sm'
                                : status === 'Ready'
                                ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-sm'
                                : status === 'Delivered'
                                ? 'bg-zinc-700 text-white border-zinc-600'
                                : 'bg-rose-600 text-white border-rose-500'
                              : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                          }`}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
