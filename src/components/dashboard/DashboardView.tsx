import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
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
  Flame,
  Grid
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { mediaByEvents, events, clients, medias, regions, theme } = useApp();

  // Color palette depending on theme
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const subTextColor = isDark ? '#94a3b8' : '#64748b';

  // 1. KPI Calculations
  const kpis = useMemo(() => {
    const totalAmount = mediaByEvents.reduce((acc, curr) => acc + curr.amount, 0);
    const totalPaid = mediaByEvents.reduce((acc, curr) => acc + curr.paid, 0);
    const totalPending = mediaByEvents.reduce((acc, curr) => acc + curr.pending, 0);
    const activeEvents = events.filter((e) => e.status === 'En cours' || e.status === 'Planifié').length;
    const paidRatio = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

    return { totalAmount, totalPaid, totalPending, activeEvents, paidRatio };
  }, [mediaByEvents, events]);

  // 2. Client Breakdown (Donut Chart)
  const clientData = useMemo(() => {
    const map: Record<string, number> = {};
    mediaByEvents.forEach((m) => {
      const name = m.clientName || 'Inconnu';
      map[name] = (map[name] || 0) + m.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [mediaByEvents]);

  const clientChartOption = {
    tooltip: { trigger: 'item', formatter: '{b}: ${c} ({d}%)' },
    legend: { bottom: '0', textStyle: { color: textColor, fontSize: 11 } },
    series: [
      {
        name: 'Répartition Client',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 8, borderColor: isDark ? '#0f172a' : '#ffffff', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 12, fontWeight: 'bold' } },
        data: clientData,
      },
    ],
  };

  // 3. Media Breakdown (Bar Chart)
  const mediaData = useMemo(() => {
    const map: Record<string, number> = {};
    mediaByEvents.forEach((m) => {
      const name = m.mediaName || 'Inconnu';
      map[name] = (map[name] || 0) + m.amount;
    });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return {
      categories: sorted.map((s) => s[0]),
      values: sorted.map((s) => s[1]),
    };
  }, [mediaByEvents]);

  const mediaChartOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: mediaData.categories,
      axisLabel: { color: textColor, rotate: 25, fontSize: 10 },
      axisLine: { lineStyle: { color: subTextColor } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: textColor, formatter: '${value}' },
      splitLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' } },
    },
    series: [
      {
        data: mediaData.values,
        type: 'bar',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#06b6d4' },
              { offset: 1, color: '#3b82f6' },
            ],
          },
          borderRadius: [6, 6, 0, 0],
        },
      },
    ],
  };

  // 4. Region Breakdown (Pie/Rose Chart)
  const regionData = useMemo(() => {
    const map: Record<string, number> = {};
    mediaByEvents.forEach((m) => {
      const evt = events.find((e) => e.id === m.eventId);
      const regName = evt?.regionName || 'Région Inconnue';
      map[regName] = (map[regName] || 0) + m.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [mediaByEvents, events]);

  const regionChartOption = {
    tooltip: { trigger: 'item', formatter: '{b}: ${c} ({d}%)' },
    series: [
      {
        type: 'pie',
        roseType: 'area',
        radius: [15, 80],
        itemStyle: { borderRadius: 6 },
        data: regionData,
      },
    ],
  };

  // 5. Sunburst Chart (Hierarchical Budget: Client -> Event -> Media)
  const sunburstData = useMemo(() => {
    const tree: any[] = [];
    clients.forEach((c) => {
      const clientEvents = events.filter((e) => e.clientId === c.id);
      if (clientEvents.length === 0) return;

      const eventChildren: any[] = [];
      clientEvents.forEach((e) => {
        const diffusions = mediaByEvents.filter((m) => m.eventId === e.id);
        if (diffusions.length === 0) return;

        const mediaChildren = diffusions.map((m) => ({
          name: m.mediaName,
          value: m.amount,
        }));

        eventChildren.push({
          name: e.name,
          children: mediaChildren,
        });
      });

      if (eventChildren.length > 0) {
        tree.push({
          name: c.name,
          children: eventChildren,
        });
      }
    });
    return tree;
  }, [clients, events, mediaByEvents]);

  const sunburstOption = {
    tooltip: { trigger: 'item', formatter: '{b}: ${c}' },
    series: {
      type: 'sunburst',
      data: sunburstData,
      radius: [0, '90%'],
      label: { rotate: 'radial', fontSize: 10, color: '#ffffff' },
      itemStyle: { borderRadius: 4, borderWidth: 2 },
    },
  };

  // 6. Treemap Chart (Hierarchical Spending Overview)
  const treemapData = useMemo(() => {
    return regions.map((r) => {
      const regEvents = events.filter((e) => e.regionId === r.id);
      const children = regEvents.map((e) => {
        const diffs = mediaByEvents.filter((m) => m.eventId === e.id);
        const sum = diffs.reduce((acc, curr) => acc + curr.amount, 0);
        return {
          name: e.name,
          value: sum,
        };
      }).filter((c) => c.value > 0);

      return {
        name: r.name,
        value: children.reduce((s, c) => s + c.value, 0),
        children,
      };
    }).filter((r) => r.value > 0);
  }, [regions, events, mediaByEvents]);

  const treemapOption = {
    tooltip: { trigger: 'item', formatter: '{b}: ${c}' },
    series: [
      {
        type: 'treemap',
        data: treemapData,
        leafDepth: 1,
        levels: [
          { itemStyle: { borderColor: '#555', borderWidth: 2, gapWidth: 2 } },
          { colorSaturation: [0.3, 0.6], itemStyle: { borderColorSaturation: 0.7, gapWidth: 1 } },
        ],
      },
    ],
  };

  // 7. Radar Chart (Media Type Performance / Coverage: TV, Radio, Presse, Digital, OOH)
  const radarData = useMemo(() => {
    const typesMap: Record<string, number> = {
      TV: 0,
      Radio: 0,
      'Presse Écrite': 0,
      Digital: 0,
      'Affichage (OOH)': 0,
    };

    mediaByEvents.forEach((m) => {
      const targetMedia = medias.find((med) => med.id === m.mediaId);
      if (targetMedia && typesMap[targetMedia.type] !== undefined) {
        typesMap[targetMedia.type] += m.amount;
      }
    });

    const maxValue = Math.max(...Object.values(typesMap), 1000);

    return {
      indicator: [
        { name: 'TV', max: maxValue },
        { name: 'Radio', max: maxValue },
        { name: 'Presse', max: maxValue },
        { name: 'Digital', max: maxValue },
        { name: 'Affichage', max: maxValue },
      ],
      values: [
        typesMap['TV'],
        typesMap['Radio'],
        typesMap['Presse Écrite'],
        typesMap['Digital'],
        typesMap['Affichage (OOH)'],
      ],
    };
  }, [mediaByEvents, medias]);

  const radarOption = {
    tooltip: {},
    radar: {
      indicator: radarData.indicator,
      axisName: { color: textColor, fontSize: 11 },
      splitArea: {
        areaStyle: {
          color: isDark ? ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.06)'] : ['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.05)'],
        },
      },
    },
    series: [
      {
        name: 'Budget par Type de Média',
        type: 'radar',
        data: [
          {
            value: radarData.values,
            name: 'Budget Engage ($)',
            areaStyle: { color: 'rgba(6, 182, 212, 0.35)' },
            lineStyle: { color: '#06b6d4', width: 2 },
            itemStyle: { color: '#38bdf8' },
          },
        ],
      },
    ],
  };

  // 8. Heatmap (Media vs Months Spending Matrix)
  const heatmapData = useMemo(() => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    const mediaList = medias.slice(0, 6).map((m) => m.name);

    const matrix: any[] = [];
    mediaList.forEach((mName, mIdx) => {
      months.forEach((mNameStr, monthIdx) => {
        // Calculate total for this media in this month
        const sum = mediaByEvents
          .filter((m) => {
            if (m.mediaName !== mName) return false;
            const dateObj = new Date(m.eventDate);
            return dateObj.getMonth() === monthIdx;
          })
          .reduce((acc, curr) => acc + curr.amount, 0);

        matrix.push([monthIdx, mIdx, sum]);
      });
    });

    return { months, mediaList, matrix };
  }, [medias, mediaByEvents]);

  const heatmapOption = {
    tooltip: { position: 'top', formatter: (p: any) => `${heatmapData.mediaList[p.data[1]]} (${heatmapData.months[p.data[0]]}): $${p.data[2]}` },
    grid: { height: '65%', top: '10%' },
    xAxis: { type: 'category', data: heatmapData.months, axisLabel: { color: textColor } },
    yAxis: { type: 'category', data: heatmapData.mediaList, axisLabel: { color: textColor } },
    visualMap: {
      min: 0,
      max: 3000,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: { color: ['#0f172a', '#0284c7', '#38bdf8', '#34d399'] },
      textStyle: { color: textColor },
    },
    series: [
      {
        type: 'heatmap',
        data: heatmapData.matrix,
        label: { show: false },
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' },
        },
      },
    ],
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-widest mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Vue d'ensemble analytique</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Tableau de Bord des Campagnes Média</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Agrégation en temps réel des budgets engagés, règlements aux médias et restes à payer par client et région.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-right">
            <div className="text-[10px] text-slate-400 font-medium">Taux de Règlement</div>
            <div className="text-xl font-bold font-mono text-emerald-400">{kpis.paidRatio}%</div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-right">
            <div className="text-[10px] text-slate-400 font-medium">Événements Actifs</div>
            <div className="text-xl font-bold font-mono text-blue-400">{kpis.activeEvents}</div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl flex items-center justify-between group hover:bg-white/10 hover:border-white/20 transition-all">
          <div>
            <span className="text-xs text-slate-400 font-medium block mb-1">Budget Total Engagé</span>
            <span className="text-2xl font-extrabold font-mono text-white tracking-tight">
              ${kpis.totalAmount.toLocaleString('fr-FR')}
            </span>
            <div className="text-[10px] text-blue-400 mt-1 font-medium flex items-center gap-1">
              <span>{mediaByEvents.length} lignes de diffusion</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/30 group-hover:scale-110 transition-transform">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl flex items-center justify-between group hover:bg-white/10 hover:border-white/20 transition-all">
          <div>
            <span className="text-xs text-slate-400 font-medium block mb-1">Total Montants Payés</span>
            <span className="text-2xl font-extrabold font-mono text-emerald-400 tracking-tight">
              ${kpis.totalPaid.toLocaleString('fr-FR')}
            </span>
            <div className="text-[10px] text-emerald-400 mt-1 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Réglé aux points focaux</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl flex items-center justify-between group hover:bg-white/10 hover:border-white/20 transition-all">
          <div>
            <span className="text-xs text-slate-400 font-medium block mb-1">Restes à Payer (Solde)</span>
            <span className="text-2xl font-extrabold font-mono text-amber-400 tracking-tight">
              ${kpis.totalPending.toLocaleString('fr-FR')}
            </span>
            <div className="text-[10px] text-amber-400 mt-1 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>En attente de paiement</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl flex items-center justify-between group hover:bg-white/10 hover:border-white/20 transition-all">
          <div>
            <span className="text-xs text-slate-400 font-medium block mb-1">Nombre de Médias Moby</span>
            <span className="text-2xl font-extrabold font-mono text-purple-300 tracking-tight">
              {medias.length}
            </span>
            <div className="text-[10px] text-purple-400 mt-1 font-medium flex items-center gap-1">
              <Tv className="w-3 h-3" />
              <span>{clients.length} Clients majeurs</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 group-hover:scale-110 transition-transform">
            <Tv className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Primary Analytics Section (ECharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Distribution */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-400" />
              <span>Répartition par Client</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Pourcentage</span>
          </div>
          <ReactECharts option={clientChartOption} style={{ height: '260px' }} />
        </div>

        {/* Media Distribution */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>Budget par Média</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">USD</span>
          </div>
          <ReactECharts option={mediaChartOption} style={{ height: '260px' }} />
        </div>

        {/* Region Breakdown */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Répartition par Région</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Zones RDC</span>
          </div>
          <ReactECharts option={regionChartOption} style={{ height: '260px' }} />
        </div>
      </div>

      {/* Advanced ECharts Visualizations: Sunburst, Radar, Heatmap, Treemap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sunburst Hierarchy */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Arborescence Sunburst (Client → Événement → Média)</span>
              </h3>
              <p className="text-[11px] text-slate-400">Drilldown interactif de la structure budgétaire</p>
            </div>
          </div>
          <ReactECharts option={sunburstOption} style={{ height: '320px' }} />
        </div>

        {/* Radar Chart */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Grid className="w-4 h-4 text-emerald-400" />
                <span>Radar des Types de Média</span>
              </h3>
              <p className="text-[11px] text-slate-400">Mix Média: TV, Radio, Presse, Digital & OOH</p>
            </div>
          </div>
          <ReactECharts option={radarOption} style={{ height: '320px' }} />
        </div>

        {/* Heatmap */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Heatmap des Dépenses Média / Mois</span>
              </h3>
              <p className="text-[11px] text-slate-400">Matrice d'intensité d'investissement</p>
            </div>
          </div>
          <ReactECharts option={heatmapOption} style={{ height: '320px' }} />
        </div>

        {/* Treemap */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span>Treemap Régions & Événements</span>
              </h3>
              <p className="text-[11px] text-slate-400">Proportions de volumes budgétaires</p>
            </div>
          </div>
          <ReactECharts option={treemapOption} style={{ height: '320px' }} />
        </div>
      </div>
    </div>
  );
};
