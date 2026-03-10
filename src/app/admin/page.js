'use client';
import { useState, useEffect, useMemo } from 'react';
import { Users, FileDown, Globe, ChevronDown, Activity, ShoppingBag, Banknote, Package } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { exportToPDF, exportToExcel } from '@/lib/exportUtils';

const getMonthOptions = () => {
  const options = [];
  for (let i = 0; i < 3; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    const start = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    options.push({ label: monthName, start, end });
  }
  return options;
};

const COLORS = ['#D4AF37', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(0);
  
  const [analyticsData, setAnalyticsData] = useState({ users: 0, views: 0, regionData: [] });
  const [gumroadData, setGumroadData] = useState({ revenue: '$0.00', sales: '0', topProducts: [] });

  const months = useMemo(() => getMonthOptions(), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function fetchAllData() {
      setLoading(true);
      try {
        const { start, end } = months[selectedMonth];
        
        const [gaRes, gumroadRes] = await Promise.all([
          fetch(`/api/analytics?startDate=${start}&endDate=${end}`),
          fetch(`/api/gumroad?startDate=${start}&endDate=${end}`)
        ]);

        const gaJson = await gaRes.json();
        const gumroadJson = await gumroadRes.json();

        if (gaJson.success) {
          const formattedRegions = gaJson.data.regionData?.map(item => ({
            name: item.name || 'Unknown',
            value: Number(item.value) || 0
          })) || [];

          setAnalyticsData({
            users: Number(gaJson.data.totalUsers) || 0,
            views: Number(gaJson.data.totalViews) || 0,
            regionData: formattedRegions
          });
        }

        if (gumroadJson.success) {
          setGumroadData({
            revenue: gumroadJson.data.totalRevenue,
            sales: gumroadJson.data.totalSales,
            topProducts: gumroadJson.data.topProducts || []
          });
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAllData();
  }, [selectedMonth, mounted, months]);

  const handleExport = (type) => {
    const reportData = [
      { name: '[ OVERVIEW ]', value: '' },
      { name: 'Total Visitors', value: analyticsData.users.toString() },
      { name: 'Total Page Views', value: analyticsData.views.toString() },
      { name: 'Gross Revenue', value: gumroadData.revenue },
      { name: 'Products Sold', value: gumroadData.sales.toString() },
      { name: '', value: '' },
      { name: '[ TRAFFIC BY REGION ]', value: '' }
    ];

    if (analyticsData.regionData.length > 0) {
      analyticsData.regionData.forEach(region => {
        reportData.push({ name: region.name, value: region.value.toString() });
      });
    } else {
      reportData.push({ name: 'No region data available', value: '-' });
    }

    reportData.push({ name: '', value: '' });
    reportData.push({ name: '[ TOP PRODUCTS SOLD ]', value: '' });
    
    if (gumroadData.topProducts.length > 0) {
      gumroadData.topProducts.forEach(product => {
        reportData.push({ name: product.name, value: `${product.sales} sold ($${product.revenue.toFixed(2)})` });
      });
    } else {
      reportData.push({ name: 'No products sold this month', value: '-' });
    }

    const title = `Studio_Report_${months[selectedMonth].label.replace(/\s+/g, '_')}`;
    if (type === 'pdf') exportToPDF(reportData, title);
    else exportToExcel(reportData, title);
  };

  if (!mounted) return <div className="min-h-screen bg-[#0a1120]" />;

  return (
    <main className="min-h-screen bg-[#0a1120] text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-widest">
              Analytics <span className="text-gold">Intelligence</span>
            </h1>
            <p className="text-slate text-xs tracking-widest mt-2 uppercase">Reporting Engine v2.0</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest appearance-none pr-10 outline-none focus:border-gold"
              >
                {months.map((m, i) => (
                  <option key={i} value={i} className="bg-[#162033] text-white">{m.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate" />
            </div>

            <button onClick={() => handleExport('excel')} className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-emerald-500/50 px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all">
              <FileDown size={14} /> XLSX
            </button>
            <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-red-500/50 px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all">
              <FileDown size={14} /> PDF
            </button>
          </div>
        </header>

        {/* TOP STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#162033]/50 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-colors">
            <Users size={128} strokeWidth={1} className="text-white group-hover:opacity-10 transition-opacity" style={{ position: 'absolute', right: '-24px', top: '-24px', opacity: 0.03, zIndex: 0, pointerEvents: 'none' }} />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg"><Users size={20} /></div>
              <span className="flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full uppercase tracking-widest">Analytics</span>
            </div>
            <p className="text-slate text-xs font-bold uppercase tracking-widest mb-1 relative z-10">Monthly Visitors</p>
            <h3 className="text-3xl font-bold text-white relative z-10">{loading ? '...' : analyticsData.users}</h3>
          </div>
          
          <div className="bg-[#162033]/50 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-colors">
            <Activity size={128} strokeWidth={1} className="text-white group-hover:opacity-10 transition-opacity" style={{ position: 'absolute', right: '-24px', top: '-24px', opacity: 0.03, zIndex: 0, pointerEvents: 'none' }} />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg"><Activity size={20} /></div>
              <span className="flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full uppercase tracking-widest">Analytics</span>
            </div>
            <p className="text-slate text-xs font-bold uppercase tracking-widest mb-1 relative z-10">Page Views</p>
            <h3 className="text-3xl font-bold text-white relative z-10">{loading ? '...' : analyticsData.views}</h3>
          </div>

          <div className="bg-[#162033]/50 border border-gold/10 p-6 rounded-2xl relative overflow-hidden group hover:border-gold/30 transition-colors">
            <Banknote size={128} strokeWidth={1} className="text-gold group-hover:opacity-10 transition-opacity" style={{ position: 'absolute', right: '-24px', top: '-24px', opacity: 0.03, zIndex: 0, pointerEvents: 'none' }} />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-gold/10 text-gold rounded-lg"><Banknote size={20} /></div>
              <span className="flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full uppercase tracking-widest">Gumroad</span>
            </div>
            <p className="text-slate text-xs font-bold uppercase tracking-widest mb-1 relative z-10">Gross Revenue</p>
            <h3 className="text-3xl font-bold text-gold relative z-10">{loading ? '...' : gumroadData.revenue}</h3>
          </div>

          <div className="bg-[#162033]/50 border border-gold/10 p-6 rounded-2xl relative overflow-hidden group hover:border-gold/30 transition-colors">
            <ShoppingBag size={128} strokeWidth={1} className="text-gold group-hover:opacity-10 transition-opacity" style={{ position: 'absolute', right: '-24px', top: '-24px', opacity: 0.03, zIndex: 0, pointerEvents: 'none' }} />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-gold/10 text-gold rounded-lg"><ShoppingBag size={20} /></div>
              <span className="flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full uppercase tracking-widest">Gumroad</span>
            </div>
            <p className="text-slate text-xs font-bold uppercase tracking-widest mb-1 relative z-10">Products Sold</p>
            <h3 className="text-3xl font-bold text-white relative z-10">{loading ? '...' : gumroadData.sales}</h3>
          </div>
        </div>

        {/* --- GOOGLE ANALYTICS GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 bg-[#162033]/30 border border-white/5 rounded-3xl p-8 flex flex-col shadow-2xl" style={{ minHeight: '500px' }}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Globe size={16} className="text-gold" /> Global Traffic Distribution
              </h2>
              <span className="text-[10px] text-slate bg-white/5 px-2 py-1 rounded">Live Map</span>
            </div>

            <div className="w-full relative flex-1" style={{ height: '400px', minHeight: '400px' }}>
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center text-slate text-[10px] uppercase tracking-widest animate-pulse">Loading Chart Data...</div>
              ) : analyticsData.regionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analyticsData.regionData} cx="50%" cy="50%" innerRadius={80} outerRadius={140} paddingAngle={8} dataKey="value" stroke="none">
                      {analyticsData.regionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0a1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '12px' }} />
                    <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px', textTransform: 'uppercase' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-30">
                  <Globe size={48} className="mb-4 text-slate" />
                  <p className="text-slate text-xs uppercase tracking-widest">No geographic data found</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#162033]/30 border border-white/5 rounded-3xl p-8 flex flex-col shadow-2xl" style={{ minHeight: '500px' }}>
            <h2 className="text-sm font-bold uppercase tracking-widest mb-8 text-slate">Top Regions</h2>
            <div className="space-y-8 flex-1">
              {analyticsData.regionData.length > 0 ? (
                analyticsData.regionData.map((region, index) => (
                  <div key={index} className="group">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest mb-3">
                      <span className="group-hover:text-gold transition-colors">{region.name}</span>
                      <span className="text-gold">{region.value}</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full transition-all duration-1000 ease-out" style={{ width: `${(region.value / (analyticsData.users || 1)) * 100}%`, backgroundColor: COLORS[index % COLORS.length] }} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate italic">Waiting for regional hits...</p>
              )}
            </div>
            <div className="mt-auto pt-6 border-t border-white/5">
              <p className="text-[10px] text-slate uppercase tracking-tighter">Only top 5 regions shown</p>
            </div>
          </div>
        </div>

        {/* --- GUMROAD PRODUCT BREAKDOWN --- */}
        <div className="bg-[#162033]/30 border border-white/5 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Package size={16} className="text-gold" /> Software & Asset Revenue
            </h2>
            <span className="text-[10px] text-slate bg-gold/10 text-gold px-2 py-1 rounded border border-gold/20">Gumroad API</span>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="text-slate text-[10px] uppercase tracking-widest animate-pulse">Syncing Sales Ledger...</div>
            ) : gumroadData.topProducts.length === 0 ? (
              <div className="text-slate text-[10px] uppercase tracking-widest opacity-50">No recent sales recorded.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {gumroadData.topProducts.map((product) => {
                  const percentage = product.maxRevenue > 0 ? (product.revenue / product.maxRevenue) * 100 : 0;
                  return (
                    <div key={product.id}>
                      <div className="flex justify-between items-end mb-3">
                        <div>
                          <p className="font-bold text-sm text-white">{product.name}</p>
                          <p className="text-[10px] text-slate uppercase tracking-widest mt-1">{product.sales} copies sold</p>
                        </div>
                        <p className="font-bold text-gold text-lg">${product.revenue.toFixed(2)}</p>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-gold h-1.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}