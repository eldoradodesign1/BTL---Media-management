import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { CommandPalette } from './components/command/CommandPalette';
import { ShortcutsModal } from './components/common/ShortcutsModal';
import { ExcelPdfExportModal } from './components/common/ExcelPdfExportModal';

import { DashboardView } from './components/dashboard/DashboardView';
import { EventsView } from './components/events/EventsView';
import { MediaEventsView } from './components/mediaEvents/MediaEventsView';
import { PaymentsView } from './components/payments/PaymentsView';
import { MediasView } from './components/medias/MediasView';
import { ClientsView } from './components/clients/ClientsView';
import { PricingMatrixView } from './components/pricing/PricingMatrixView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { SettingsView } from './components/settings/SettingsView';

import { AddEventModal } from './components/modals/AddEventModal';
import { AddDiffusionModal } from './components/modals/AddDiffusionModal';
import { AddPaymentModal } from './components/modals/AddPaymentModal';
import { SupabaseConfigModal } from './components/modals/SupabaseConfigModal';
import { UserProfileModal } from './components/modals/UserProfileModal';
import { AuthLoginModal } from './components/modals/AuthLoginModal';

const AppContent: React.FC = () => {
  const { activeTab, getBgImage, theme, isSupabaseModalOpen, setIsSupabaseModalOpen } = useApp();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isAddDiffusionModalOpen, setIsAddDiffusionModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);

  const bgImage = getBgImage();

  return (
    <div className="btl-app-shell relative min-h-screen font-sans text-slate-100 antialiased selection:bg-violet-300 selection:text-slate-950 overflow-x-hidden">
      {/* Quiet atmospheric background: lavalamp motion, Bézier beam and restrained artwork. */}
      <div className="btl-atmosphere">
        <div className="btl-atmosphere__grid"></div>
        <div className="btl-aero-glow btl-aero-glow--one"></div>
        <div className="btl-aero-glow btl-aero-glow--two"></div>
        <div className="btl-aero-glow btl-aero-glow--three"></div>
        <div className="btl-bezier-beam"></div>
        <img
          src={bgImage}
          alt="Background theme artwork"
          referrerPolicy="no-referrer"
          className="btl-theme-art transition-all duration-700"
        />
        <div className="btl-atmosphere__veil"></div>
      </div>

      {/* Foreground Container */}
      <div className="relative z-10 flex flex-col min-h-screen p-4 max-w-[1600px] mx-auto gap-4">
        <Navbar onOpenExportModal={() => setIsExportModalOpen(true)} />

        <div className="btl-workspace flex flex-1 gap-4">
          <Sidebar />

          <main className="flex-1 min-w-0 btl-view-transition" key={activeTab}>
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'events' && (
              <EventsView onOpenAddModal={() => setIsAddEventModalOpen(true)} />
            )}
            {activeTab === 'diffusions' && (
              <MediaEventsView onOpenAddModal={() => setIsAddDiffusionModalOpen(true)} />
            )}
            {activeTab === 'payments' && (
              <PaymentsView onOpenAddModal={() => setIsAddPaymentModalOpen(true)} />
            )}
            {activeTab === 'medias' && <MediasView />}
            {activeTab === 'clients' && <ClientsView />}
            {activeTab === 'pricing' && <PricingMatrixView />}
            {activeTab === 'audit' && <AuditLogsView />}
            {activeTab === 'settings' && <SettingsView />}
          </main>
        </div>
      </div>

      {/* Command Palette & Global Modals */}
      <CommandPalette
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenAddEventModal={() => setIsAddEventModalOpen(true)}
        onOpenAddDiffusionModal={() => setIsAddDiffusionModalOpen(true)}
        onOpenAddPaymentModal={() => setIsAddPaymentModalOpen(true)}
      />

      <ShortcutsModal />

      <ExcelPdfExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={() => setIsAddEventModalOpen(false)}
      />

      <AddDiffusionModal
        isOpen={isAddDiffusionModalOpen}
        onClose={() => setIsAddDiffusionModalOpen(false)}
      />

      <AddPaymentModal
        isOpen={isAddPaymentModalOpen}
        onClose={() => setIsAddPaymentModalOpen(false)}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      <UserProfileModal />
      <AuthLoginModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
