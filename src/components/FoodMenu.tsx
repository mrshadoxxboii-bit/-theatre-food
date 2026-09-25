import React, { useState, useMemo } from 'react';
import { useTheatre } from '../context/TheatreContext';
import {
  Search,
  Plus,
  Minus,
  Armchair,
  Flame,
  ArrowRight,
  Ban,
} from 'lucide-react';

export const FoodMenu: React.FC = () => {
  const {
    menuItems,
    cart,
    addToCart,
    updateQuantity,
    cartCount,
    totalAmount,
    seatNumber,
    screenNumber,
    navigateTo,
  } = useTheatre();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);

  // Dynamically compute categories from menu items
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    menuItems.forEach((item) => {
      const cat = item.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const list: { id: string; label: string; count: number }[] = [
      { id: 'all', label: 'All Items', count: menuItems.length },
    ];

    Object.keys(counts).sort().forEach((cat) => {
      list.push({ id: cat, label: cat, count: counts[cat] });
    });

    return list;
  }, [menuItems]);

  const filteredProducts = useMemo(() => {
    return menuItems.filter((p) => {
      const matchesCat = activeCategory === 'all' || p.category === activeCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVeg = !vegOnly || p.isVeg;
      return matchesCat && matchesSearch && matchesVeg;
    });
  }, [menuItems, activeCategory, searchQuery, vegOnly]);

  const getCartQuantity = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="pb-28 max-w-4xl mx-auto px-4 pt-4">
      {/* Top Banner / Seat Context Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5 mb-4 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Armchair className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-semibold text-zinc-400">Delivering To</span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                IN-SEAT SERVICE
              </span>
            </div>
            <p className="text-sm font-bold text-white font-mono-num">
              Screen {screenNumber} · Seat {seatNumber || 'B12'}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigateTo('landing')}
          className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 self-start sm:self-center py-1 px-2.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 transition-colors border border-zinc-700/60"
        >
          Change Seat
        </button>
      </div>

      {/* Search and Veg Filter Bar */}
      <div className="space-y-3 mb-5">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search popcorn, beverages, snacks, combos..."
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Veg Only Toggle */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all shrink-0 ${
              vegOnly
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <span className="w-3 h-3 rounded-xs border border-emerald-500 flex items-center justify-center p-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </span>
            <span>Veg Only</span>
          </button>
        </div>

        {/* Dynamic Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/20 font-bold'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-num ${
                    isActive ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu items listing */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/40 rounded-2xl border border-zinc-800">
          <p className="text-zinc-400 text-sm font-medium">No items found matching your filters</p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
              setVegOnly(false);
            }}
            className="mt-3 text-xs text-amber-400 font-semibold hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredProducts.map((product) => {
            const qty = getCartQuantity(product.id);
            const isAvailable = product.available !== false;

            return (
              <div
                key={product.id}
                className={`bg-zinc-900/90 border rounded-2xl overflow-hidden transition-all flex flex-col justify-between group shadow-lg shadow-black/20 ${
                  !isAvailable
                    ? 'border-zinc-800/50 opacity-70'
                    : 'border-zinc-800/90 hover:border-zinc-700/80'
                }`}
              >
                <div className="flex gap-3.5 p-3.5">
                  {/* Food Image with Fallback and Availability Badge */}
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=400&auto=format&fit=crop&q=80';
                      }}
                      className={`w-full h-full object-cover transition-transform duration-300 ${
                        isAvailable ? 'group-hover:scale-105' : 'grayscale'
                      }`}
                    />

                    {/* Badge */}
                    {product.badge && isAvailable && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-amber-500/90 text-zinc-950 text-[10px] font-bold tracking-tight shadow-sm flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" />
                        {product.badge}
                      </span>
                    )}

                    {/* Sold out overlay */}
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-2 text-center">
                        <Ban className="w-5 h-5 text-rose-400 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                          Unavailable
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      {/* Dietary Indicator */}
                      <div className="flex items-center gap-1.5 mb-1">
                        {typeof product.isVeg === 'boolean' && (
                          <span
                            className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center p-0.5 shrink-0 ${
                              product.isVeg
                                ? 'border-emerald-500 text-emerald-500'
                                : 'border-rose-600 text-rose-600'
                            }`}
                            title={product.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                product.isVeg ? 'bg-emerald-500' : 'bg-rose-600'
                              }`}
                            />
                          </span>
                        )}
                        <span className="text-[11px] text-zinc-400">
                          {product.calories || 'Cinema Concession'}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-zinc-100 leading-snug line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Price in ₹ */}
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-base sm:text-lg font-bold text-amber-400 font-mono-num">
                        ₹{product.price}
                      </span>
                      {!isAvailable && (
                        <span className="text-[11px] font-semibold text-rose-400">
                          Sold Out
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Row: Add to Cart */}
                <div className="px-3.5 pb-3.5 pt-1 border-t border-zinc-800/60 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-zinc-500">
                    {product.category.toUpperCase()}
                  </span>

                  {!isAvailable ? (
                    <button
                      disabled
                      className="px-3 py-1.5 rounded-xl bg-zinc-800/50 text-zinc-500 text-xs font-semibold cursor-not-allowed border border-zinc-800"
                    >
                      Out of Stock
                    </button>
                  ) : qty === 0 ? (
                    <button
                      onClick={() => addToCart(product)}
                      className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 text-xs font-bold border border-zinc-700/80 hover:border-amber-400 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-0.5">
                      <button
                        onClick={() => updateQuantity(product.id, -1)}
                        className="w-8 h-8 rounded-lg bg-zinc-900 text-amber-400 hover:bg-amber-500 hover:text-zinc-950 flex items-center justify-center transition-colors font-bold text-xs"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono-num font-bold text-sm text-amber-300 w-5 text-center">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, 1)}
                        className="w-8 h-8 rounded-lg bg-amber-500 text-zinc-950 hover:bg-amber-400 flex items-center justify-center transition-colors font-bold text-xs"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-3 sm:p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent">
          <div className="max-w-xl mx-auto bg-amber-500 text-zinc-950 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-2xl shadow-amber-500/30 border border-amber-400 animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-zinc-950 text-amber-400 flex items-center justify-center font-bold text-sm font-mono-num shrink-0">
                {cartCount}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-900/80">
                  {cartCount} {cartCount === 1 ? 'Item' : 'Items'} · Seat {seatNumber || 'B12'}
                </p>
                <p className="text-base font-extrabold text-zinc-950 font-mono-num">
                  ₹{totalAmount.toFixed(0)}{' '}
                  <span className="text-[11px] font-semibold text-zinc-800 font-sans">
                    (incl. GST)
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={() => navigateTo('cart')}
              className="py-2.5 px-4 rounded-xl bg-zinc-950 text-amber-400 hover:bg-zinc-900 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 shrink-0"
            >
              <span>View Cart & Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
