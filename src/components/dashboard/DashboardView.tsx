import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PurchaseOrderModal } from '../modals/PurchaseOrderModal';
import { AddPaymentModal } from '../modals/AddPaymentModal';
import { EditEventModal } from '../modals/EditEventModal';
import ReactECharts from 'echarts-for-react';
import {
  DollarSign,
  CheckCircle2,
  Clock,
  TrendingUp,
  Tv,
  Users,
  MapPin,
  Calendar,
  Layers,
  PieChart,
  BarChart3,
  Plus,
  FileSpreadsheet,
  Building2,
  ChevronRight,
  Info,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  Edit
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    mediaByEvents,
    mediaPayments,
    purchaseOrders,
    events,
    clients,
    medias,
    regions,
    currentUser,
    theme
  } = useApp();

  // Filters State
  const isClientRole = currentUser?.role === 'client';
  const defaultClientId = isClientRole ? (currentUser?.clientId || clients[0]?.id || 'all') : 'all';

  const [selectedClientId, setSelectedClientId] = useState<string>(defaultClientId);
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // 'all', '0', '1', ...
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [leftFilterType, setLeftFilterType] = useState<'events' | 'medias'>('events');
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);

  // Modals state
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);

  // Color palette depending on theme
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const subTextColor = isDark ? '#94a3b8' : '#64748b';

  const monthsList = [
    { label: 'Janv', value: '0' },
    { label: 'Févr', value: '1' },
    { label: 'Mars', value: '2' },
    { label: 'Avr', value: '3' },
    { label: 'Mai', value: '4' },
    { label: 'Juin', value: '5' },
    { label: 'Juil', value: '6' },
    { label: 'Août', value: '7' },
    { label: 'Sept', value: '8' },
    { label: 'Oct', value: '9' },
    { label: 'Nov', value: '10' },
    { label: 'Déc', value: '11' }
  ];

  // Filtered Data Sets
  const filteredPOs = useMemo(() => {
    if (selectedClientId === 'all') return purchaseOrders;
    return purchaseOrders.filter((po) => po.clientId === selectedClientId);
  }, [purchaseOrders, selectedClientId]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (selectedClientId !== 'all' && e.clientId !== selectedClientId) return false;
      if (selectedMonth !== 'all') {
        const monthIndex = new Date(e.eventDate).getMonth().toString();
        if (monthIndex !== selectedMonth) return false;
      }
      return true;
    });
  }, [events, selectedClientId, selectedMonth]);

  const filteredMediaEvents = useMemo(() => {
    return mediaByEvents.filter((m) => {
      if (selectedClientId !== 'all') {
        const evt = events.find((e) => e.id === m.eventId);
        if (evt && evt.clientId !== selectedClientId) return false;
      }
      if (selectedMonth !== 'all') {
        const dateStr = m.eventDate || events.find((e) => e.id === m.eventId)?.eventDate;
        if (dateStr) {
          const monthIndex = new Date(dateStr).getMonth().toString();
          if (monthIndex !== selectedMonth) return false;
        }
      }
      return true;
    });
  }, [mediaByEvents, events, selectedClientId, selectedMonth]);

  const filteredPayments = useMemo(() => {
    return mediaPayments.filter((p) => {
      if (selectedClientId !== 'all' && p.clientId && p.clientId !== selectedClientId) return false;
      if (selectedMonth !== 'all' && p.paymentDate) {
        const monthIndex = new Date(p.paymentDate).getMonth().toString();
        if (monthIndex !== selectedMonth) return false;
      }
      return true;
    });
  }, [mediaPayments, selectedClientId, selectedMonth]);

  // Executive Financial Metrics Calculation
  const financialMetrics = useMemo(() => {
    const totalPO = filteredPOs.reduce((sum, po) => sum + po.amount, 0);
    const totalSupport = filteredPOs.reduce((sum, po) => sum + (po.supportAmount || 0), 0);
    const totalFPC = filteredPOs.reduce((sum, po) => sum + (po.amount * (po.fpcPercent || 5)) / 100, 0);
    const totalAgencyFees = filteredPOs.reduce((sum, po) => sum + (po.amount * (po.agencyFeesPercent || 14)) / 100, 0);
    const totalPaymentsExecuted = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const balance = totalPO - totalPaymentsExecuted - totalFPC - totalAgencyFees - totalSupport;
    const totalPending = filteredMediaEvents.reduce((sum, m) => sum + m.pending, 0);
    const totalAmountEngaged = filteredMediaEvents.reduce((sum, m) => sum + m.amount, 0);

    return {
      totalPO,
      totalSupport,
      totalFPC,
      totalAgencyFees,
      totalPaymentsExecuted,
      balance,
      totalPending,
      totalAmountEngaged
    };
  }, [filteredPOs, filteredPayments, filteredMediaEvents]);

  // Selected Event Details Card
  const activeEventDetail = useMemo(() => {
    if (!selectedEventId) {
      return filteredEvents[0] || null;
    }
    return events.find((e) => e.id === selectedEventId) || null;
  }, [selectedEventId, filteredEvents, events]);

  const activeEventDiffusions = useMemo(() => {
    if (!activeEventDetail) return [];
    return mediaByEvents.filter((m) => m.eventId === activeEventDetail.id);
  }, [activeEventDetail, mediaByEvents]);

  const activeEventMetrics = useMemo(() => {
    if (!activeEventDetail) return { mediaCount: 0, total: 0, paid: 0, pending: 0 };
    const total = activeEventDiffusions.reduce((sum, m) => sum + m.amount, 0);
    const paid = activeEventDiffusions.reduce((sum, m) => sum + m.paid, 0);
    const pending = activeEventDiffusions.reduce((sum, m) => sum + m.pending, 0);
    return {
      mediaCount: activeEventDiffusions.length,
      total,
      paid,
      pending
    };
  }, [activeEventDetail, activeEventDiffusions]);

  // Selected Media Details
  const activeMediaDetail = useMemo(() => {
    if (!selectedMediaId) {
      return medias[0] || null;
    }
    return medias.find((m) => m.id === selectedMediaId) || null;
  }, [selectedMediaId, medias]);

  const activeMediaDiffusions = useMemo(() => {
    if (!activeMediaDetail) return [];
    return mediaByEvents.filter((m) => m.mediaId === activeMediaDetail.id);
  }, [activeMediaDetail, mediaByEvents]);

  const activeMediaMetrics = useMemo(() => {
    if (!activeMediaDetail) return { eventCount: 0, total: 0, paid: 0, pending: 0 };
    const total = activeMediaDiffusions.reduce((sum, m) => sum + m.amount, 0);
    const paid = activeMediaDiffusions.reduce((sum, m) => sum + m.paid, 0);
    const pending = activeMediaDiffusions.reduce((sum, m) => sum + m.pending, 0);
    return {
      eventCount: activeMediaDiffusions.length,
      total,
      paid,
      pending
    };
  }, [activeMediaDetail, activeMediaDiffusions]);

  // Chart type logic: Monthly breakdown only if selectedMonth === 'all' and no single event selected
  const isMonthlyView = selectedMonth === 'all' && !selectedEventId;

  const handleChartClick = (params: any) => {
    if (selectedMonth === 'all' && leftFilterType === 'events') {
      const monthIndexMap: Record<string, string> = {
        'JANV': '0', 'FÉVR': '1', 'MARS': '2', 'AVR': '3',
        'MAI': '4', 'JUIN': '5', 'JUIL': '6', 'AOÛT': '7',
        'SEPT': '8', 'OCT': '9', 'NOV': '10', 'DÉC': '11'
      };
      if (params && params.name) {
        const nameUpper = String(params.name).toUpperCase();
        if (monthIndexMap[nameUpper] !== undefined) {
          setSelectedMonth(monthIndexMap[nameUpper]);
          setSelectedEventId(null);
        } else if (typeof params.dataIndex === 'number' && params.dataIndex >= 0 && params.dataIndex < 12) {
          setSelectedMonth(params.dataIndex.toString());
          setSelectedEventId(null);
        }
      } else if (typeof params?.dataIndex === 'number' && params.dataIndex >= 0 && params.dataIndex < 12) {
        setSelectedMonth(params.dataIndex.toString());
        setSelectedEventId(null);
      }
    }
  };

  // Main Bar Chart Option (Monthly OR Media Breakdown OR Event Breakdown for Selected Media)
  const mainChartOption = useMemo(() => {
    // 1. MEDIAS MODE: Histogram shows payments/budget per Event for the selected Media
    if (leftFilterType === 'medias') {
      let relevantDiffusions = mediaByEvents;
      if (selectedMediaId) {
        relevantDiffusions = mediaByEvents.filter((m) => m.mediaId === selectedMediaId);
      } else if (activeMediaDetail) {
        relevantDiffusions = mediaByEvents.filter((m) => m.mediaId === activeMediaDetail.id);
      }

      if (selectedClientId !== 'all') {
        relevantDiffusions = relevantDiffusions.filter((m) => {
          const evt = events.find((e) => e.id === m.eventId);
          return evt && evt.clientId === selectedClientId;
        });
      }

      if (selectedMonth !== 'all') {
        relevantDiffusions = relevantDiffusions.filter((m) => {
          const dateStr = m.eventDate || events.find((e) => e.id === m.eventId)?.eventDate;
          if (dateStr) {
            return new Date(dateStr).getMonth().toString() === selectedMonth;
          }
          return true;
        });
      }

      const eventMap: Record<string, { eventId: string; fullName: string; shortName: string; amount: number; paid: number }> = {};

      relevantDiffusions.forEach((m) => {
        const evt = events.find((e) => e.id === m.eventId);
        const fullName = evt?.name || 'Événement';
        // Truncate long event titles for clean axis labels readability
        const shortName = fullName.length > 14 ? fullName.substring(0, 12) + '...' : fullName;

        if (!eventMap[m.eventId]) {
          eventMap[m.eventId] = {
            eventId: m.eventId,
            fullName,
            shortName,
            amount: 0,
            paid: 0
          };
        }
        eventMap[m.eventId].amount += m.amount;
        eventMap[m.eventId].paid += m.paid || 0;
      });

      if (Object.keys(eventMap).length === 0) {
        filteredEvents.slice(0, 5).forEach((e) => {
          const shortName = e.name.length > 14 ? e.name.substring(0, 12) + '...' : e.name;
          eventMap[e.id] = { eventId: e.id, fullName: e.name, shortName, amount: 0, paid: 0 };
        });
      }

      const items = Object.values(eventMap);
      const axisData = items.map((item) => item.shortName);
      const fullNames = items.map((item) => item.fullName);
      const amountData = items.map((item) => item.amount);
      const paidData = items.map((item) => item.paid);

      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderColor: 'rgba(255, 255, 255, 0.15)',
          textStyle: { color: '#f8fafc', fontSize: 11 },
          formatter: (params: any[]) => {
            const dataIdx = params[0]?.dataIndex ?? 0;
            const fullTitle = fullNames[dataIdx] || params[0]?.axisValue;
            let res = `<div class="font-bold border-b border-white/10 pb-1 mb-1 text-cyan-300">${fullTitle}</div>`;
            params.forEach((item) => {
              res += `<div class="flex items-center justify-between gap-4 text-xs py-0.5">
                <span>${item.marker} ${item.seriesName}:</span>
                <span class="font-mono font-bold">$${item.value.toLocaleString('fr-FR')}</span>
              </div>`;
            });
            return res;
          }
        },
        legend: {
          top: '0',
          right: '10',
          textStyle: { color: textColor, fontSize: 11 }
        },
        grid: { left: '3%', right: '3%', bottom: '20%', top: '18%', containLabel: true },
        xAxis: {
          type: 'category',
          data: axisData,
          axisLabel: { color: textColor, fontSize: 10, fontWeight: 'bold', interval: 0, rotate: axisData.length > 3 ? 15 : 0 },
          axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: textColor, formatter: '${value}' },
          splitLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' } }
        },
        series: [
          {
            name: 'Budget Engagé',
            type: 'bar',
            data: amountData,
            itemStyle: { color: '#38bdf8', borderRadius: [6, 6, 0, 0] }
          },
          {
            name: 'Paiements Effectués',
            type: 'bar',
            data: paidData,
            itemStyle: { color: '#34d399', borderRadius: [6, 6, 0, 0] }
          }
        ]
      };
    }

    // 2. EVENTS MODE: Monthly View OR Media Breakdown
    if (isMonthlyView) {
      const months = ['JANV', 'FÉVR', 'MARS', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛT', 'SEPT', 'OCT', 'NOV', 'DÉC'];
      const amountData = new Array(12).fill(0);
      const paidData = new Array(12).fill(0);

      filteredMediaEvents.forEach((m) => {
        const dateStr = m.eventDate || events.find((e) => e.id === m.eventId)?.eventDate;
        if (dateStr) {
          const mIdx = new Date(dateStr).getMonth();
          if (mIdx >= 0 && mIdx < 12) {
            amountData[mIdx] += m.amount;
          }
        }
      });

      filteredPayments.forEach((p) => {
        if (p.paymentDate) {
          const mIdx = new Date(p.paymentDate).getMonth();
          if (mIdx >= 0 && mIdx < 12) {
            paidData[mIdx] += p.amount;
          }
        }
      });

      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderColor: 'rgba(255, 255, 255, 0.15)',
          textStyle: { color: '#f8fafc', fontSize: 11 },
          formatter: (params: any[]) => {
            let res = `<div class="font-bold border-b border-white/10 pb-1 mb-1 text-blue-300">${params[0].axisValue} (Cliquer pour filtrer)</div>`;
            params.forEach((item) => {
              res += `<div class="flex items-center justify-between gap-4 text-xs py-0.5">
                <span>${item.marker} ${item.seriesName}:</span>
                <span class="font-mono font-bold">$${item.value.toLocaleString('fr-FR')}</span>
              </div>`;
            });
            return res;
          }
        },
        legend: {
          top: '0',
          right: '10',
          textStyle: { color: textColor, fontSize: 11 }
        },
        grid: { left: '3%', right: '3%', bottom: '10%', top: '18%', containLabel: true },
        xAxis: {
          type: 'category',
          data: months,
          axisLabel: { color: textColor, fontSize: 10, fontWeight: 'bold' },
          axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: textColor, formatter: '${value}' },
          splitLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' } }
        },
        series: [
          {
            name: 'Budget Engagé',
            type: 'bar',
            data: amountData,
            itemStyle: {
              color: '#60a5fa',
              borderRadius: [6, 6, 0, 0]
            }
          },
          {
            name: 'Paiements Effectués',
            type: 'bar',
            data: paidData,
            itemStyle: {
              color: '#34d399',
              borderRadius: [6, 6, 0, 0]
            }
          }
        ]
      };
    }

    // Media Breakdown View when a month or specific event is selected
    let relevantDiffusions: typeof mediaByEvents = [];
    if (selectedEventId) {
      relevantDiffusions = mediaByEvents.filter((m) => m.eventId === selectedEventId);
    } else if (activeEventDetail) {
      relevantDiffusions = mediaByEvents.filter((m) => m.eventId === activeEventDetail.id);
    } else {
      const evtIds = new Set(filteredEvents.map((e) => e.id));
      relevantDiffusions = mediaByEvents.filter((m) => evtIds.has(m.eventId));
    }

    const mediaMap: Record<string, { mediaName: string; amount: number; paid: number }> = {};

    relevantDiffusions.forEach((m) => {
      const mName = m.mediaName || medias.find((med) => med.id === m.mediaId)?.name || 'Média';
      if (!mediaMap[mName]) {
        mediaMap[mName] = { mediaName: mName, amount: 0, paid: 0 };
      }
      mediaMap[mName].amount += m.amount;
      mediaMap[mName].paid += m.paid || 0;
    });

    if (Object.keys(mediaMap).length === 0) {
      medias.slice(0, 5).forEach((m) => {
        mediaMap[m.name] = { mediaName: m.name, amount: 0, paid: 0 };
      });
    }

    const finalCategories = Object.keys(mediaMap);
    const amountData = finalCategories.map((k) => mediaMap[k].amount);
    const paidData = finalCategories.map((k) => mediaMap[k].paid);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        textStyle: { color: '#f8fafc', fontSize: 11 },
        formatter: (params: any[]) => {
          let res = `<div class="font-bold border-b border-white/10 pb-1 mb-1 text-cyan-300">${params[0].axisValue}</div>`;
          params.forEach((item) => {
            res += `<div class="flex items-center justify-between gap-4 text-xs py-0.5">
              <span>${item.marker} ${item.seriesName}:</span>
              <span class="font-mono font-bold">$${item.value.toLocaleString('fr-FR')}</span>
            </div>`;
          });
          return res;
        }
      },
      legend: {
        top: '0',
        right: '10',
        textStyle: { color: textColor, fontSize: 11 }
      },
      grid: { left: '3%', right: '3%', bottom: '18%', top: '18%', containLabel: true },
      xAxis: {
        type: 'category',
        data: finalCategories,
        axisLabel: { color: textColor, fontSize: 10, fontWeight: 'bold', interval: 0, rotate: finalCategories.length > 3 ? 20 : 0 },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: textColor, formatter: '${value}' },
        splitLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' } }
      },
      series: [
        {
          name: 'Budget Engagé Média',
          type: 'bar',
          data: amountData,
          itemStyle: { color: '#60a5fa', borderRadius: [6, 6, 0, 0] }
        },
        {
          name: 'Paiements Effectués',
          type: 'bar',
          data: paidData,
          itemStyle: { color: '#34d399', borderRadius: [6, 6, 0, 0] }
        }
      ]
    };
  }, [leftFilterType, selectedMediaId, activeMediaDetail, isMonthlyView, filteredMediaEvents, filteredPayments, filteredEvents, mediaByEvents, events, medias, selectedEventId, activeEventDetail, textColor, isDark, selectedClientId, selectedMonth]);

  // 2. Client Breakdown Donut
  const clientChartOption = useMemo(() => {
    const map: Record<string, number> = {};
    filteredMediaEvents.forEach((m) => {
      const name = m.clientName || 'Inconnu';
      map[name] = (map[name] || 0) + m.amount;
    });
    const data = Object.entries(map).map(([name, value]) => ({ name, value }));

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        textStyle: { color: '#f8fafc', fontSize: 11 },
        formatter: '{b}: ${c} ({d}%)'
      },
      legend: { bottom: '0', textStyle: { color: textColor, fontSize: 10 } },
      series: [
        {
          name: 'Budget par Client',
          type: 'pie',
          radius: ['45%', '75%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 8, borderColor: isDark ? '#0f172a' : '#ffffff', borderWidth: 2 },
          label: { show: false },
          data
        }
      ]
    };
  }, [filteredMediaEvents, textColor, isDark]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header Filter & Actions Bar */}
      <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex-1 md:flex-none">
            <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-0.5">
              Client BTL Sélectionné
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              disabled={isClientRole}
              className="bg-black/50 border border-white/15 text-white font-bold text-xs rounded-xl px-3 py-1.5 outline-none focus:border-blue-400 w-full md:w-72 shadow-inner"
            >
              {!isClientRole && <option value="all">Tous les Clients (Vue Globale)</option>}
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 justify-end">
          {(!isClientRole || currentUser?.role === 'super-admin' || currentUser?.role === 'admin' || currentUser?.role === 'finance') && (
            <button
              onClick={() => setIsPoModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>+ Enregistrer un PO Reçu</span>
            </button>
          )}

          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nouveau Paiement</span>
          </button>
        </div>
      </div>

      {/* EXECUTIVE FINANCIAL SUMMARY GRID (Glassmorphic Elegance) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card 1: Budget Reçu (PO) & Imputations (FPC 5% + Fees 14%) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/80 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col justify-between space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all"></div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-widest flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-400" />
              Budget Client (PO Reçu)
            </span>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono font-bold">
              {filteredPOs.length} PO(s) enregistré(s)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 shadow-inner flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Montant Total des Orders de Paiement
              </span>
              <span className="text-3xl font-black font-mono tracking-tight text-white">
                ${financialMetrics.totalPO.toLocaleString('fr-FR')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Devise</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">USD $</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                Agency Fees (14%)
              </span>
              <span className="text-lg font-bold font-mono text-slate-100">
                ${financialMetrics.totalAgencyFees.toLocaleString('fr-FR')}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-slate-200">
              <span className="text-[10px] text-purple-300 font-semibold block uppercase">
                FPC Agence (5%)
              </span>
              <span className="text-lg font-bold font-mono text-purple-300">
                ${financialMetrics.totalFPC.toLocaleString('fr-FR')}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Suivi, Payments, Support & BALANCE */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900/80 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
              Suivi & Solde Disponible
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              PO - Fees - FPC - Support - Payments
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-red-950/20 border border-red-500/20">
              <span className="text-[10px] text-red-300 font-semibold block uppercase">Support Fixe</span>
              <span className="text-base font-bold font-mono text-red-300">
                ${financialMetrics.totalSupport.toLocaleString('fr-FR')}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-blue-950/20 border border-blue-500/20">
              <span className="text-[10px] text-blue-300 font-semibold block uppercase">Paiements Effectués</span>
              <span className="text-base font-bold font-mono text-blue-300">
                ${financialMetrics.totalPaymentsExecuted.toLocaleString('fr-FR')}
              </span>
            </div>
          </div>

          {/* BALANCE DISPLAY CARD */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 shadow-lg shadow-emerald-500/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest block">
                Balance Restante Disponible
              </span>
              <span className="text-3xl font-black font-mono tracking-tight text-emerald-300">
                ${financialMetrics.balance.toLocaleString('fr-FR')}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 3: Total Pending (Restes à Payer Médias - Refined, No Harsh Red Button) */}
        <div className="lg:col-span-3 space-y-3 flex flex-col justify-between">
          <div className="p-5 rounded-3xl bg-amber-950/20 border border-amber-500/30 backdrop-blur-2xl shadow-xl flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Restes à Payer Médias
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Pending
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mb-1">
                Engagements diffusions non encore réglés aux médias
              </span>
              <div className="text-3xl font-black font-mono text-amber-300 tracking-tight my-2">
                ${financialMetrics.totalPending.toLocaleString('fr-FR')}
              </div>
            </div>

            {/* Month Filter Selector Pills */}
            <div className="pt-3 border-t border-amber-500/20">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
                Mois de Diffusion
              </span>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => {
                    setSelectedMonth('all');
                    setSelectedEventId(null);
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    selectedMonth === 'all'
                      ? 'bg-amber-500/30 text-amber-200 border border-amber-500/40 shadow-sm'
                      : 'bg-black/30 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  Tous
                </button>
                {monthsList.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => {
                      setSelectedMonth(m.value);
                      setSelectedEventId(null);
                    }}
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                      selectedMonth === m.value
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-black/30 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: Events List + Comparative Monthly Chart + Event Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Events / Medias Selector List with Toggle */}
        <div className="lg:col-span-3 p-5 rounded-3xl bg-slate-900/80 border border-white/15 backdrop-blur-2xl flex flex-col justify-between max-h-[440px]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10 gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10 shrink-0">
              <button
                onClick={() => {
                  setLeftFilterType('events');
                  setSelectedMediaId(null);
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                  leftFilterType === 'events'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Événements</span>
              </button>
              <button
                onClick={() => {
                  setLeftFilterType('medias');
                  setSelectedEventId(null);
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                  leftFilterType === 'medias'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Médias</span>
              </button>
            </div>
            <span className="text-[10px] text-slate-400 font-mono font-bold">
              {leftFilterType === 'events' ? `${filteredEvents.length}` : `${medias.length}`}
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto pr-1 flex-1">
            {leftFilterType === 'events' ? (
              filteredEvents.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Aucun événement pour ce critère.
                </div>
              ) : (
                filteredEvents.map((e) => {
                  const isSelected = activeEventDetail?.id === e.id;
                  return (
                    <button
                      key={e.id}
                      onClick={() => setSelectedEventId(e.id)}
                      className={`w-full text-left p-3 rounded-2xl text-xs transition-all flex items-center justify-between border ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white font-bold shadow-md'
                          : 'bg-black/30 border-white/5 text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate font-semibold uppercase">{e.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{e.clientName || 'Client'} • {e.eventDate}</div>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-600'}`} />
                    </button>
                  );
                })
              )
            ) : (
              medias.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Aucun média référencé.
                </div>
              ) : (
                medias.map((m) => {
                  const isSelected = activeMediaDetail?.id === m.id;
                  const diffsCount = mediaByEvents.filter((d) => d.mediaId === m.id).length;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMediaId(m.id)}
                      className={`w-full text-left p-3 rounded-2xl text-xs transition-all flex items-center justify-between border ${
                        isSelected
                          ? 'bg-cyan-600/20 border-cyan-500 text-white font-bold shadow-md'
                          : 'bg-black/30 border-white/5 text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate font-semibold uppercase">{m.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {m.category || m.type || 'Média'} • {diffsCount} campagne{diffsCount > 1 ? 's' : ''}
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                    </button>
                  );
                })
              )
            )}
          </div>
        </div>

        {/* Center: Main Comparison Chart (Monthly OR Media Histogram OR Event Histogram for Media) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/80 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <BarChart3 className={`w-4 h-4 ${leftFilterType === 'medias' ? 'text-cyan-400' : isMonthlyView ? 'text-blue-400' : 'text-cyan-400'}`} />
              <span>
                {leftFilterType === 'medias'
                  ? `Paiements par Événement : ${activeMediaDetail ? activeMediaDetail.name : 'Tous les Médias'}`
                  : isMonthlyView
                  ? 'Suivi Mensuel : Budget Engagé vs Payé'
                  : `Histogramme Médias : ${activeEventDetail ? activeEventDetail.name : 'Événements du Mois'}`}
              </span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Devise: USD $</span>
          </div>
          <ReactECharts
            option={mainChartOption}
            style={{ height: '320px' }}
            onEvents={{
              click: handleChartClick
            }}
          />
        </div>

        {/* Right: Selected Item Info Card (Event or Media) */}
        <div className="lg:col-span-3 p-6 rounded-3xl bg-slate-900/90 border border-white/20 shadow-2xl flex flex-col justify-between">
          {leftFilterType === 'events' ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest">
                    Fiche Campagne Événement
                  </span>
                  {activeEventDetail && (
                    <button
                      onClick={() => setIsEditEventModalOpen(true)}
                      className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/20 transition-all flex items-center gap-1 text-[10px] font-bold"
                      title="Modifier cet événement"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Modifier</span>
                    </button>
                  )}
                </div>
                <h3 className="text-base font-extrabold text-white uppercase tracking-tight mb-2">
                  {activeEventDetail?.name || 'Aucun Événement'}
                </h3>
                <div className="text-xs text-slate-300 font-medium mb-4 pb-3 border-b border-white/10">
                  Client : <span className="text-white font-bold">{activeEventDetail?.clientName || 'Inconnu'}</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Médias Engagés</span>
                    <span className="font-mono font-bold text-white">{activeEventMetrics.mediaCount}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Payé Médias</span>
                    <span className="font-mono font-bold text-emerald-400">
                      ${activeEventMetrics.paid.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Pending Médias</span>
                    <span className="font-mono font-bold text-amber-400">
                      ${activeEventMetrics.pending.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-sm font-black">
                    <span className="text-slate-200">Total Engagé</span>
                    <span className="font-mono text-white">
                      ${activeEventMetrics.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Statut : {activeEventDetail?.status || 'En cours'}</span>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest">
                    Fiche Média Sélectionné
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-white uppercase tracking-tight mb-2">
                  {activeMediaDetail?.name || 'Aucun Média'}
                </h3>
                <div className="text-xs text-slate-300 font-medium mb-4 pb-3 border-b border-white/10">
                  Catégorie : <span className="text-white font-bold">{activeMediaDetail?.category || activeMediaDetail?.type || 'BTL'}</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Campagnes Engagées</span>
                    <span className="font-mono font-bold text-white">{activeMediaMetrics.eventCount}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Payé Média</span>
                    <span className="font-mono font-bold text-emerald-400">
                      ${activeMediaMetrics.paid.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Reste à Payer</span>
                    <span className="font-mono font-bold text-amber-400">
                      ${activeMediaMetrics.pending.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-sm font-black">
                    <span className="text-slate-200">Budget Total</span>
                    <span className="font-mono text-white">
                      ${activeMediaMetrics.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300 flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Contact : {activeMediaDetail?.focalPointName || 'Point Focal Média'}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* LOWER ANALYTICS ROW: Client Breakdown Donut & Top Media Partners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/15 backdrop-blur-2xl shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-400" />
              <span>Répartition des Budgets par Client</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Parts de Marché</span>
          </div>
          <ReactECharts option={clientChartOption} style={{ height: '280px' }} />
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Tv className="w-4 h-4 text-purple-400" />
              <span>Top Médias Partenaires BTL</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">{medias.length} Médias Référencés</span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[250px] pr-1">
            {medias.slice(0, 8).map((m) => {
              const totalForMedia = mediaByEvents
                .filter((me) => me.mediaId === m.id)
                .reduce((s, curr) => s + curr.amount, 0);

              return (
                <div
                  key={m.id}
                  className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white">{m.name}</div>
                    <div className="text-[10px] text-slate-400">{m.type} • {m.location}</div>
                  </div>
                  <div className="text-right font-mono font-bold text-blue-400">
                    ${totalForMedia.toLocaleString('fr-FR')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <PurchaseOrderModal
        isOpen={isPoModalOpen}
        onClose={() => setIsPoModalOpen(false)}
      />

      <AddPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />

      <EditEventModal
        isOpen={isEditEventModalOpen}
        onClose={() => setIsEditEventModalOpen(false)}
        event={activeEventDetail}
      />
    </div>
  );
};
