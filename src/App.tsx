import React from 'react';
import { TheatreProvider, useTheatre } from './context/TheatreContext';
import { Header } from './components/Header';
import { SeatLanding } from './components/SeatLanding';
import { FoodMenu } from './components/FoodMenu';
import { CartView } from './components/CartView';
import { PaymentView } from './components/PaymentView';
import { OrderSuccess } from './components/OrderSuccess';
import { DigitalBill } from './components/DigitalBill';
import { AdminDashboard } from './components/AdminDashboard';
import { QrGeneratorModal } from './components/QrGeneratorModal';

const AppContent: React.FC = () => {
  const { currentView } = useTheatre();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-amber-500 selection:text-zinc-950">
      {/* Top Bar Header */}
      <Header />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'landing' && <SeatLanding />}
        {currentView === 'menu' && <FoodMenu />}
        {currentView === 'cart' && <CartView />}
        {currentView === 'payment' && <PaymentView />}
        {currentView === 'order-success' && <OrderSuccess />}
        {currentView === 'digital-bill' && <DigitalBill />}
        {currentView === 'admin' && <AdminDashboard />}
      </main>

      {/* QR Generator Modal (Admin & Customer testing utility) */}
      <QrGeneratorModal />
    </div>
  );
};

export default function App() {
  return (
    <TheatreProvider>
      <AppContent />
    </TheatreProvider>
  );
}
