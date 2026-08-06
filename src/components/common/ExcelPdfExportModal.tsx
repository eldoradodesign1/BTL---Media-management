import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Download, Upload, FileSpreadsheet, FileText, FileCode, CheckCircle, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ExcelPdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExcelPdfExportModal: React.FC<ExcelPdfExportModalProps> = ({ isOpen, onClose }) => {
  const { events, mediaByEvents, mediaPayments, medias, clients, regions, pricingRates, addNotification } = useApp();

  const [exportType, setExportType] = useState<'excel' | 'pdf' | 'csv'>('excel');
  const [selectedDataset, setSelectedDataset] = useState<'diffusions' | 'events' | 'payments' | 'pricing' | 'all'>('diffusions');

  if (!isOpen) return null;

  // Export to Excel / CSV
  const handleExportData = () => {
    try {
      const wb = XLSX.utils.book_new();

      if (selectedDataset === 'diffusions' || selectedDataset === 'all') {
        const diffData = mediaByEvents.map((m) => ({
          'Date Événement': m.eventDate,
          'Événement': m.eventName,
          'Média': m.mediaName,
          'Preuve de Diffusion (POD)': m.proofOfDiffusion || 'NON FOURNI',
          'Type de Dépense': m.expenseType,
          'Montant Calculé ($)': m.amount,
          'Payé ($)': m.paid,
          'Reste à Payer ($)': m.pending,
          'Point Focal': m.focalPointName,
          'Téléphone Point Focal': m.phone,
          'Client': m.clientName,
        }));
        const wsDiff = XLSX.utils.json_to_sheet(diffData);
        XLSX.utils.book_append_sheet(wb, wsDiff, 'Media_by_Events');
      }

      if (selectedDataset === 'events' || selectedDataset === 'all') {
        const eventData = events.map((e) => ({
          'Date': e.eventDate,
          'Nom Événement': e.name,
          'Client': e.clientName,
          'Région': e.regionName,
          'Statut': e.status,
          'Montant Total ($)': e.totalAmount || 0,
          'Total Payé ($)': e.totalPaid || 0,
          'Reste à Payer ($)': e.totalPending || 0,
          'Nb Médias': e.mediaCount || 0,
        }));
        const wsEvents = XLSX.utils.json_to_sheet(eventData);
        XLSX.utils.book_append_sheet(wb, wsEvents, 'Events');
      }

      if (selectedDataset === 'payments' || selectedDataset === 'all') {
        const payData = mediaPayments.map((p) => ({
          'Date Paiement': p.paymentDate,
          'Média': p.mediaName,
          'Événement': p.eventName,
          'Client': p.clientName,
          'Point Focal': p.focalPointName,
          'Montant ($)': p.amount,
          'Mode de Paiement': p.paymentMethod,
          'N° Référence': p.referenceNo,
          'Notes': p.notes || '',
        }));
        const wsPay = XLSX.utils.json_to_sheet(payData);
        XLSX.utils.book_append_sheet(wb, wsPay, 'Media_Payments');
      }

      if (selectedDataset === 'pricing' || selectedDataset === 'all') {
        const pricingData = pricingRates.map((pr) => {
          const med = medias.find((m) => m.id === pr.mediaId);
          const cli = clients.find((c) => c.id === pr.clientId);
          return {
            'Média': med?.name || pr.mediaId,
            'Client': cli?.name || pr.clientId,
            'Type Tarif': pr.rateType === 'real' ? 'Coût Réel BTL' : 'Prix Catalogue Client',
            'Tarif Unitaire ($)': pr.rateAmount,
            'Date d\'effet': pr.effectiveDate,
            'Version': pr.version,
          };
        });
        const wsPrice = XLSX.utils.json_to_sheet(pricingData);
        XLSX.utils.book_append_sheet(wb, wsPrice, 'Pricing_Matrix');
      }

      const fileName = `Media_Campaign_Export_${selectedDataset}_${new Date().toISOString().split('T')[0]}`;

      if (exportType === 'excel') {
        XLSX.writeFile(wb, `${fileName}.xlsx`);
      } else if (exportType === 'csv') {
        XLSX.writeFile(wb, `${fileName}.csv`, { bookType: 'csv' });
      }

      addNotification({
        type: 'success',
        title: 'Export Réussi',
        message: `Fichier ${exportType.toUpperCase()} généré avec succès.`,
      });
      onClose();
    } catch (err: any) {
      addNotification({
        type: 'error',
        title: 'Erreur d\'export',
        message: err.message || 'Impossible de générer le fichier.',
      });
    }
  };

  // Export PDF Report
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text('Rapport Synthétique des Campagnes Médias', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')} - Application Media Campaign Manager`, 14, 28);

      // Summary Table
      const totalBudget = mediaByEvents.reduce((s, m) => s + m.amount, 0);
      const totalPaid = mediaByEvents.reduce((s, m) => s + m.paid, 0);
      const totalPending = mediaByEvents.reduce((s, m) => s + m.pending, 0);

      (doc as any).autoTable({
        startY: 35,
        head: [['Indicateur', 'Valeur Total ($)']],
        body: [
          ['Budget Total Engage', `$${totalBudget.toLocaleString('fr-FR')}`],
          ['Montants Payes', `$${totalPaid.toLocaleString('fr-FR')}`],
          ['Restes a Payer', `$${totalPending.toLocaleString('fr-FR')}`],
          ['Nombre total de diffusions', mediaByEvents.length.toString()],
          ['Nombre d\'événements', events.length.toString()],
        ],
        theme: 'grid',
        headStyles: { fillColor: [14, 116, 144] },
      });

      // Table of Media_by_events
      doc.text('Détail des Diffusions Médias:', 14, (doc as any).lastAutoTable.finalY + 12);

      const tableRows = mediaByEvents.map((m) => [
        m.eventDate,
        m.eventName,
        m.mediaName,
        m.expenseType,
        `$${m.amount}`,
        `$${m.paid}`,
        `$${m.pending}`,
      ]);

      (doc as any).autoTable({
        startY: (doc as any).lastAutoTable.finalY + 16,
        head: [['Date', 'Événement', 'Média', 'Type', 'Montant', 'Payé', 'Solde']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [30, 41, 59] },
        styles: { fontSize: 8 },
      });

      doc.save(`Rapport_Campagnes_Medias_${new Date().toISOString().split('T')[0]}.pdf`);

      addNotification({
        type: 'success',
        title: 'Rapport PDF généré',
        message: 'Le document PDF a été téléchargé.',
      });
      onClose();
    } catch (err: any) {
      addNotification({
        type: 'error',
        title: 'Erreur PDF',
        message: err.message || 'Échec de génération PDF.',
      });
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const firstSheet = wb.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(wb.Sheets[firstSheet]);

        addNotification({
          type: 'success',
          title: 'Import Réussi',
          message: `${data.length} enregistrements analysés depuis le fichier Excel!`,
        });
        onClose();
      } catch (err: any) {
        addNotification({
          type: 'error',
          title: 'Erreur Import',
          message: 'Fichier Excel invalide ou corrompu.',
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-lg bg-slate-900/90 border border-white/20 rounded-2xl shadow-2xl p-6 text-slate-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Import / Export de Données</h2>
            <p className="text-xs text-slate-400">Génération de rapports Excel, PDF et import de classeurs</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Export Format selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Format de Fichier Exporter
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setExportType('excel')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                  exportType === 'excel'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={() => setExportType('pdf')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                  exportType === 'pdf'
                    ? 'bg-red-500/20 border-red-500/50 text-red-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>PDF (.pdf)</span>
              </button>

              <button
                type="button"
                onClick={() => setExportType('csv')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                  exportType === 'csv'
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <FileCode className="w-5 h-5" />
                <span>CSV (.csv)</span>
              </button>
            </div>
          </div>

          {/* Dataset selection */}
          {exportType !== 'pdf' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Données à Exporter
              </label>
              <select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value as any)}
                className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-sm text-white outline-none focus:border-cyan-400"
              >
                <option value="diffusions">Media_by_events (Diffusions & Charges)</option>
                <option value="events">Events (Événements de Campagne)</option>
                <option value="payments">Media_payments (Paiements Effectués)</option>
                <option value="pricing">Pricing (Grille Tarifaire Médias/Clients)</option>
                <option value="all">Intégralité des Feuillets (Toutes les Tables)</option>
              </select>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2">
            {exportType === 'pdf' ? (
              <button
                onClick={handleExportPDF}
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
              >
                <FileText className="w-4 h-4" />
                <span>Générer le Rapport PDF</span>
              </button>
            ) : (
              <button
                onClick={handleExportData}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <Download className="w-4 h-4" />
                <span>Exporter vers {exportType.toUpperCase()}</span>
              </button>
            )}
          </div>

          <div className="border-t border-white/10 pt-4">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Importer un Fichier Excel (.xlsx / .csv)
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleImportFile}
                className="hidden"
                id="excel-file-upload"
              />
              <label
                htmlFor="excel-file-upload"
                className="w-full py-3 px-4 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Parcourir un fichier Excel à charger...</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
