import React, { lazy, Suspense, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { I18nProvider } from './i18n';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LavaLampBackground } from './components/layout/LavaLampBackground';
import { CommandPalette } from './components/command/CommandPalette';
import { ShortcutsModal } from './components/common/ShortcutsModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { AddEventModal } from './components/modals/AddEventModal';
import { AddDiffusionModal } from './components/modals/AddDiffusionModal';
import { AddPaymentModal } from './components/modals/AddPaymentModal';
import { SupabaseConfigModal } from './components/modals/SupabaseConfigModal';
import { UserProfileModal } from './components/modals/UserProfileModal';
import { AuthLoginModal } from './components/modals/AuthLoginModal';

const ExcelPdfExportModal = lazy(() => import('./components/common/ExcelPdfExportModal').then(({ ExcelPdfExportModal }) => ({ default: ExcelPdfExportModal })));
const EventsView = lazy(() => import('./components/events/EventsView').then(({ EventsView }) => ({ default: EventsView })));
const MediaEventsView = lazy(() => import('./components/mediaEvents/MediaEventsView').then(({ MediaEventsView }) => ({ default: MediaEventsView })));
const PaymentsView = lazy(() => import('./components/payments/PaymentsView').then(({ PaymentsView }) => ({ default: PaymentsView })));
const MediasView = lazy(() => import('./components/medias/MediasView').then(({ MediasView }) => ({ default: MediasView })));
const ClientsView = lazy(() => import('./components/clients/ClientsView').then(({ ClientsView }) => ({ default: ClientsView })));
const PricingMatrixView = lazy(() => import('./components/pricing/PricingMatrixView').then(({ PricingMatrixView }) => ({ default: PricingMatrixView })));
const AuditLogsView = lazy(() => import('./components/audit/AuditLogsView').then(({ AuditLogsView }) => ({ default: AuditLogsView })));
const SettingsView = lazy(() => import('./components/settings/SettingsView').then(({ SettingsView }) => ({ default: SettingsView })));

const AppContent: React.FC = () => {
  const { activeTab, theme, isSupabaseModalOpen, setIsSupabaseModalOpen } = useApp();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isAddDiffusionModalOpen, setIsAddDiffusionModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);

  const renderActiveView = () => {
    if (activeTab === 'dashboard') return <DashboardView />;
    if (activeTab === 'events') return <EventsView onOpenAddModal={() => setIsAddEventModalOpen(true)} />;
    if (activeTab === 'diffusions') return <MediaEventsView onOpenAddModal={() => setIsAddDiffusionModalOpen(true)} />;
    if (activeTab === 'payments') return <PaymentsView onOpenAddModal={() => setIsAddPaymentModalOpen(true)} />;
    if (activeTab === 'medias') return <MediasView />;
    if (activeTab === 'clients') return <ClientsView />;
    if (activeTab === 'pricing') return <PricingMatrixView />;
    if (activeTab === 'audit') return <AuditLogsView />;
    return <SettingsView />;
  };

  return (
    <div className={`app-shell app-shell--${theme}`}>
      <LavaLampBackground />
      <div className="app-shell__content">
        <Navbar onOpenExportModal={() => setIsExportModalOpen(true)} />
        <div className="app-layout">
          <Sidebar />
          <main className="app-main">
            <div key={activeTab} className="view-transition">
              <Suspense fallback={<div className="glass-card text-sm text-slate-300">Chargement…</div>}>
                {renderActiveView()}
              </Suspense>
            </div>
          </main>
        </div>
      </div>

      <CommandPalette
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenAddEventModal={() => setIsAddEventModalOpen(true)}
        onOpenAddDiffusionModal={() => setIsAddDiffusionModalOpen(true)}
        onOpenAddPaymentModal={() => setIsAddPaymentModalOpen(true)}
      />
      <ShortcutsModal />
      {isExportModalOpen && <Suspense fallback={null}><ExcelPdfExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} /></Suspense>}
      <AddEventModal isOpen={isAddEventModalOpen} onClose={() => setIsAddEventModalOpen(false)} />
      <AddDiffusionModal isOpen={isAddDiffusionModalOpen} onClose={() => setIsAddDiffusionModalOpen(false)} />
      <AddPaymentModal isOpen={isAddPaymentModalOpen} onClose={() => setIsAddPaymentModalOpen(false)} />
      <SupabaseConfigModal isOpen={isSupabaseModalOpen} onClose={() => setIsSupabaseModalOpen(false)} />
      <UserProfileModal />
      <AuthLoginModal />
    </div>
  );
};

export default function App() {
  return (
    <I18nProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </I18nProvider>
  );
}
