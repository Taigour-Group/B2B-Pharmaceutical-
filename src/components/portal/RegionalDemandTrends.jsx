import React, { useState, useMemo } from 'react';
import { useCart } from '../../context/CartContext';
import { sortBatchesFEFO } from '../../utils/formatters';
import { AlertTriangle, ShieldCheck, Activity, ThermometerSnowflake, Droplets, Wind, ShoppingCart, CheckCircle2, ArrowUpRight, ArrowDownRight, Info, MapPin } from 'lucide-react';
export const RegionalDemandTrends = () => {
    const { products, addToCart, setIsCartOpen } = useCart();
    const [selectedSeason, setSelectedSeason] = useState('ALL');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [activeTrendId, setActiveTrendId] = useState('TREND-01');
    const [notification, setNotification] = useState(null);
    // 12 months labels
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = 8; // September 2026 (index 8)
    // Aggregated anonymized trends across 84 pharmacies in Janakpur & Dhanusha region
    const trends = useMemo(() => [
        {
            id: 'TREND-01',
            category: 'Febrile & Paediatric Care',
            medicineName: 'Paracetamol Paediatric Oral Suspension 120mg/5ml',
            genericName: 'Paracetamol',
            productId: 'PROD-002',
            primarySeason: 'MONSOON_POST_MONSOON',
            peakMonths: 'August – October (Dengue & Viral Fevers)',
            monthlyVelocityUnits: 14200,
            momSurgePct: 48,
            riskLevel: 'HIGH_SURGE',
            stockAdvisory: 'Dengue & post-monsoon viral fever spike in Dhanusha. Buffer stock recommended for next 45 days.',
            recommendedBufferUnits: 50,
            depotStockStatus: 'IN_STOCK',
            monthlyData: [4200, 3900, 4800, 5600, 7200, 9400, 12800, 14200, 15100, 11400, 6800, 5100],
        },
        {
            id: 'TREND-02',
            category: 'Systemic Antibiotics',
            medicineName: 'Azithromycin Tablets IP 500mg',
            genericName: 'Azithromycin',
            productId: 'PROD-004',
            primarySeason: 'WINTER_COLD_WAVE',
            peakMonths: 'October – January (Cold Wave & Bronchial Infections)',
            monthlyVelocityUnits: 8900,
            momSurgePct: 34,
            riskLevel: 'HIGH_SURGE',
            stockAdvisory: 'Terai cold wave (Sheetlahar) respiratory surge begins mid-October. Pre-order recommended to prevent depot stockouts.',
            recommendedBufferUnits: 30,
            depotStockStatus: 'PRE_ORDER_ADVISED',
            monthlyData: [7200, 6800, 4500, 3900, 3400, 3800, 5200, 6400, 8900, 11200, 13800, 14500],
        },
        {
            id: 'TREND-03',
            category: 'Gastroenterology',
            medicineName: 'Pantoprazole Gastro-Resistant Tablets 40mg',
            genericName: 'Pantoprazole Sodium',
            productId: 'PROD-005',
            primarySeason: 'MONSOON_POST_MONSOON',
            peakMonths: 'July – October (Water-borne Enteric Disorders)',
            monthlyVelocityUnits: 18400,
            momSurgePct: 22,
            riskLevel: 'MODERATE',
            stockAdvisory: 'Elevated demand correlated with seasonal water-borne gastroenteritis and NSAID co-prescriptions.',
            recommendedBufferUnits: 40,
            depotStockStatus: 'IN_STOCK',
            monthlyData: [11200, 11800, 12400, 13500, 14800, 16900, 18400, 18900, 18200, 16100, 13400, 12100],
        },
        {
            id: 'TREND-04',
            category: 'Respiratory & Cold Wave',
            medicineName: 'Amoxicillin Trihydrate 500mg Capsules',
            genericName: 'Amoxicillin Trihydrate',
            productId: 'PROD-001',
            primarySeason: 'WINTER_COLD_WAVE',
            peakMonths: 'November – February (Pediatric & Geriatric Pneumonia)',
            monthlyVelocityUnits: 12100,
            momSurgePct: 28,
            riskLevel: 'HIGH_SURGE',
            stockAdvisory: 'Anticipated winter peak during upcoming December-January cold front in Dhanusha/Mahottari rural belts.',
            recommendedBufferUnits: 35,
            depotStockStatus: 'IN_STOCK',
            monthlyData: [13400, 12800, 9200, 7800, 6900, 7200, 8400, 9800, 12100, 14500, 16200, 17800],
        },
        {
            id: 'TREND-05',
            category: 'Hospital Emergency & Injections',
            medicineName: 'Ceftriaxone 1g Injection with Sterile Water',
            genericName: 'Ceftriaxone Sodium',
            productId: 'PROD-006',
            primarySeason: 'MONSOON_POST_MONSOON',
            peakMonths: 'August – November (Enteric Fever & Severe Infections)',
            monthlyVelocityUnits: 6400,
            momSurgePct: 38,
            riskLevel: 'HIGH_SURGE',
            stockAdvisory: 'Hospital inpatient admissions for typhoid and secondary bacterial complications at local health posts.',
            recommendedBufferUnits: 25,
            depotStockStatus: 'IN_STOCK',
            monthlyData: [3200, 3100, 3400, 3900, 4800, 5900, 6400, 7100, 6800, 5900, 4200, 3500],
        },
        {
            id: 'TREND-06',
            category: 'Endocrinology & Cold Chain',
            medicineName: 'Human Insulin Regular 100 IU/ml',
            genericName: 'Human Regular Insulin',
            productId: 'PROD-007',
            primarySeason: 'YEAR_ROUND_CHRONIC',
            peakMonths: 'Year-Round Stable Baseline',
            monthlyVelocityUnits: 3800,
            momSurgePct: 5,
            riskLevel: 'STABLE',
            stockAdvisory: 'Consistent diabetic maintenance consumption. Stable refrigerated depot supply maintained.',
            recommendedBufferUnits: 10,
            depotStockStatus: 'SUFFICIENT',
            monthlyData: [3600, 3700, 3650, 3720, 3800, 3850, 3780, 3800, 3820, 3840, 3810, 3790],
        },
        {
            id: 'TREND-07',
            category: 'Chronic Maintenance',
            medicineName: 'Metformin Hydrochloride SR Tablets 500mg',
            genericName: 'Metformin Hydrochloride (SR)',
            productId: 'PROD-009',
            primarySeason: 'YEAR_ROUND_CHRONIC',
            peakMonths: 'Year-Round Stable Baseline',
            monthlyVelocityUnits: 16500,
            momSurgePct: 4,
            riskLevel: 'STABLE',
            stockAdvisory: 'High recurring baseline consumption across urban and polyclinic dispensaries in Janakpur.',
            recommendedBufferUnits: 30,
            depotStockStatus: 'SUFFICIENT',
            monthlyData: [15800, 16000, 16200, 16100, 16400, 16500, 16300, 16500, 16600, 16700, 16500, 16400],
        },
    ], []);
    // Filtered trends
    const filteredTrends = useMemo(() => {
        return trends.filter(t => {
            const matchSeason = selectedSeason === 'ALL' || t.primarySeason === selectedSeason;
            const matchCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
            return matchSeason && matchCategory;
        });
    }, [trends, selectedSeason, selectedCategory]);
    const activeTrend = trends.find(t => t.id === activeTrendId) || trends[0];
    // Add buffer to cart action
    const handleAddBufferToCart = (trend, e) => {
        const product = products.find(p => p.id === trend.productId);
        if (!product)
            return;
        const earliestBatch = sortBatchesFEFO(product.batches)[0];
        addToCart(product, trend.recommendedBufferUnits, earliestBatch, e.currentTarget);
        setNotification(`Added ${trend.recommendedBufferUnits} units of ${product.name} to cart based on regional surge forecast.`);
        setIsCartOpen(true);
        setTimeout(() => setNotification(null), 5000);
    };
    return (<div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Regional Epidemiological Trends & Seasonal Demand Forecast
            </h2>
            <span className="rounded bg-cyan-700 text-white text-[10px] font-bold px-2 py-0.5">
              Janakpur & Dhanusha Health Mesh
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Anonymized monthly dispensing velocity aggregated from 84 verified pharmacies across Dhanusha & Siraha districts to anticipate seasonal illness surges.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono self-start sm:self-auto">
          <MapPin className="h-3.5 w-3.5 text-cyan-600"/>
          <span>Zone: Madhesh Province (Janakpur Core + Highway Corridor)</span>
        </div>
      </div>

      {notification && (<div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0"/>
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-800 hover:text-emerald-950 font-bold">
            ×
          </button>
        </div>)}

      {/* 4 Epidemiological & Seasonal Alert Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Active Regional Surge */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Regional Surge</span>
            <AlertTriangle className="h-4 w-4 text-rose-600"/>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-800 font-mono">
            +48% Dengue & Febrile
          </div>
          <div className="mt-1 text-[11px] text-rose-600 font-medium">
            Post-Monsoon surge in Ramanand & Hospital Road
          </div>
        </div>

        {/* Card 2: Upcoming Seasonal Transition */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-blue-800">
            <span className="text-[10px] font-bold uppercase tracking-wider">Upcoming Winter Transition</span>
            <ThermometerSnowflake className="h-4 w-4 text-blue-600"/>
          </div>
          <div className="mt-2 text-2xl font-black text-blue-900 font-mono">
            Sheetlahar Cold Wave
          </div>
          <div className="mt-1 text-[11px] text-blue-700 font-medium">
            Respiratory antibiotics & expectorants surge in 6 weeks
          </div>
        </div>

        {/* Card 3: Monthly Regional Dispensing */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Mesh Dispensing</span>
            <Activity className="h-4 w-4 text-cyan-600"/>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            148,200 Units
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Aggregated across 84 regional pharmacies
          </div>
        </div>

        {/* Card 4: Depot Buffer Readiness */}
        <div className="rounded-xl border border-cyan-200 bg-cyan-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-cyan-800">
            <span className="text-[10px] font-bold uppercase tracking-wider">Janakpur Depot Supply</span>
            <ShieldCheck className="h-4 w-4 text-cyan-600"/>
          </div>
          <div className="mt-2 text-2xl font-black text-cyan-900 font-mono">
            96.4% Fill Rate
          </div>
          <div className="mt-1 text-[11px] text-cyan-700 font-medium">
            Depot buffer reserved for local registered stores
          </div>
        </div>

      </div>

      {/* Seasonal Illness Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto text-xs font-semibold shrink-0">
          <button onClick={() => setSelectedSeason('ALL')} className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${selectedSeason === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}>
            All Seasons ({trends.length})
          </button>

          <button onClick={() => setSelectedSeason('MONSOON_POST_MONSOON')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${selectedSeason === 'MONSOON_POST_MONSOON' ? 'bg-white text-cyan-800 shadow-2xs' : 'text-slate-600 hover:text-cyan-800'}`}>
            <Droplets className="h-3.5 w-3.5 text-cyan-600"/>
            <span>Post-Monsoon / Febrile Surge</span>
          </button>

          <button onClick={() => setSelectedSeason('WINTER_COLD_WAVE')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${selectedSeason === 'WINTER_COLD_WAVE' ? 'bg-white text-blue-800 shadow-2xs' : 'text-slate-600 hover:text-blue-800'}`}>
            <Wind className="h-3.5 w-3.5 text-blue-600"/>
            <span>Winter Cold Wave (Sheetlahar)</span>
          </button>

          <button onClick={() => setSelectedSeason('YEAR_ROUND_CHRONIC')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${selectedSeason === 'YEAR_ROUND_CHRONIC' ? 'bg-white text-purple-800 shadow-2xs' : 'text-slate-600 hover:text-purple-800'}`}>
            <Activity className="h-3.5 w-3.5 text-purple-600"/>
            <span>Chronic Non-Communicable</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Current Month Indicator: <strong className="text-cyan-900 font-bold">September (Month 9)</strong>
        </div>
      </div>

      {/* Selected Medicine Deep Dive & Interactive SVG Monthly Curve */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Regional Velocity Curve</span>
              <span className="rounded bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5">
                {activeTrend.category}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              {activeTrend.medicineName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Seasonal Peak Window: <strong className="text-slate-700">{activeTrend.peakMonths}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="text-right">
              <div className="text-[10px] text-slate-400">Current Velocity:</div>
              <div className="font-mono font-bold text-base text-slate-900">
                {activeTrend.monthlyVelocityUnits.toLocaleString()} units/mo
              </div>
            </div>

            <button onClick={(e) => handleAddBufferToCart(activeTrend, e)} className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-2xs">
              <ShoppingCart className="h-4 w-4 text-cyan-400"/>
              <span>Stock Buffer (+{activeTrend.recommendedBufferUnits} Units)</span>
            </button>
          </div>
        </div>

        {/* 12-Month SVG Curve Chart */}
        <div className="space-y-2">
          <div className="relative h-44 w-full bg-slate-50/70 rounded-xl p-4 border border-slate-200 flex flex-col justify-end">
            
            {/* SVG Line / Bar Representation */}
            <div className="h-28 w-full flex items-end justify-between gap-1.5 sm:gap-3 px-2">
              {activeTrend.monthlyData.map((val, idx) => {
            const maxVal = Math.max(...activeTrend.monthlyData);
            const heightPct = Math.round((val / maxVal) * 100);
            const isCurrentMonth = idx === currentMonthIndex;
            return (<div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                    
                    {/* Tooltip on hover */}
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
                      {val.toLocaleString()} units
                    </div>

                    {/* Bar */}
                    <div style={{ height: `${heightPct}%` }} className={`w-full rounded-t-md transition-all ${isCurrentMonth
                    ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-md ring-2 ring-cyan-500'
                    : idx > currentMonthIndex && idx <= currentMonthIndex + 3
                        ? 'bg-blue-300 hover:bg-blue-400'
                        : 'bg-slate-300 hover:bg-slate-400'}`}/>

                    {/* Month Label */}
                    <span className={`text-[10px] font-mono ${isCurrentMonth ? 'font-bold text-cyan-900 underline' : 'text-slate-500'}`}>
                      {monthLabels[idx]}
                    </span>
                  </div>);
        })}
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 px-1 border-t border-slate-200">
              <span>← Spring / Pre-Monsoon</span>
              <span className="font-bold text-cyan-800">▲ Current Month: September 2026 (Peak)</span>
              <span>Winter Cold Wave (Sheetlahar) →</span>
            </div>

          </div>
        </div>

        {/* Clinical Stock Advisory Note */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
          <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5"/>
          <div className="space-y-0.5">
            <span className="font-bold">Regional Dispensary Advisory:</span>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              {activeTrend.stockAdvisory}
            </p>
          </div>
        </div>

      </div>

      {/* Regional Demand Trends Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <h3 className="font-bold text-slate-900">
            Regional High-Demand Formulations Matrix ({filteredTrends.length} Active Records)
          </h3>
          <span className="text-[11px] text-slate-500">
            Click any row to display its 12-month epidemiological curve above
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Medicine & Formulation</th>
                <th className="py-3 px-4">Therapeutic Area</th>
                <th className="py-3 px-4">Peak Seasonal Window</th>
                <th className="py-3 px-4 text-right">Mesh Velocity</th>
                <th className="py-3 px-4 text-center">MoM Trend</th>
                <th className="py-3 px-4 text-center">Depot Availability</th>
                <th className="py-3 px-4 text-right">Buffer Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTrends.map(t => {
            const isSelected = activeTrendId === t.id;
            return (<tr key={t.id} onClick={() => setActiveTrendId(t.id)} className={`cursor-pointer transition-colors ${isSelected ? 'bg-cyan-50/40 font-medium' : 'hover:bg-slate-50/60'}`}>
                    {/* Medicine Name */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <span>{t.medicineName}</span>
                        {isSelected && (<span className="flex h-1.5 w-1.5 rounded-full bg-cyan-600"/>)}
                      </div>
                      <div className="text-[11px] text-slate-500 italic mt-0.5">
                        {t.genericName}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {t.category}
                    </td>

                    {/* Peak Window */}
                    <td className="py-3 px-4">
                      <div className="text-slate-800 text-[11px] font-semibold">{t.peakMonths}</div>
                    </td>

                    {/* Velocity */}
                    <td className="py-3 px-4 text-right font-mono text-xs text-slate-900 font-bold">
                      {t.monthlyVelocityUnits.toLocaleString()} units
                    </td>

                    {/* MoM Surge */}
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${t.momSurgePct >= 30
                    ? 'bg-rose-100 text-rose-800'
                    : t.momSurgePct > 10
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'}`}>
                        {t.momSurgePct > 0 ? <ArrowUpRight className="h-3 w-3"/> : <ArrowDownRight className="h-3 w-3"/>}
                        <span>+{t.momSurgePct}%</span>
                      </span>
                    </td>

                    {/* Depot Status */}
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${t.depotStockStatus === 'IN_STOCK'
                    ? 'bg-emerald-100 text-emerald-800'
                    : t.depotStockStatus === 'PRE_ORDER_ADVISED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'}`}>
                        {t.depotStockStatus === 'IN_STOCK' ? 'Depot Ready' : t.depotStockStatus === 'PRE_ORDER_ADVISED' ? 'Pre-Order Advised' : 'Sufficient'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button onClick={(e) => {
                    e.stopPropagation();
                    handleAddBufferToCart(t, e);
                }} className="rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-slate-800 transition-colors shadow-2xs whitespace-nowrap">
                        + Buffer ({t.recommendedBufferUnits})
                      </button>
                    </td>
                  </tr>);
        })}
            </tbody>
          </table>
        </div>

      </div>

    </div>);
};
