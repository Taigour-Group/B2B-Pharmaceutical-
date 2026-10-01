import React, { useState, useMemo } from 'react';
import { useCart } from '../../context/CartContext';
import { formatNPR } from '../../utils/formatters';
import { Truck, CheckCircle2, Sparkles, Printer, Thermometer, TrendingDown, Phone, ChevronRight } from 'lucide-react';
export const JanakpurRouteOptimizer = () => {
    const { orders, updateOrderStatus } = useCart();
    // Active delivery route van filter
    const [selectedVan, setSelectedVan] = useState('VAN-01');
    const [isOptimized, setIsOptimized] = useState(true);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [hoveredStopId, setHoveredStopId] = useState(null);
    const [selectedStopId, setSelectedStopId] = useState(null);
    const [dispatchNotice, setDispatchNotice] = useState(null);
    // Central Depot Definition
    const centralDepot = {
        name: 'Janakpur Central Logistics Hub',
        location: 'Station Road, Janakpurdham',
        coordinates: { x: 400, y: 260 },
    };
    // Raw delivery stops in Janakpur based on active orders & healthcare centers
    const baseStops = useMemo(() => {
        return [
            {
                id: 'STOP-RAMANAND',
                orderId: orders[0]?.id || 'ORD-1048',
                orderNumber: orders[0]?.orderNumber || 'JPD-ORD-2026-1048',
                pharmacyName: 'ABC Medical Hall & Polyclinic',
                locationName: 'Ramanand Chowk, Janakpur-4',
                coordinates: { x: 270, y: 160 },
                itemsCount: 3,
                totalAmount: 22800,
                isColdChain: true,
                phone: '+977 9844012345',
                status: orders[0]?.status || 'DISPATCHED',
                sequence: 1,
                estimatedArrival: '09:15 AM',
                distanceFromPrevKm: 2.4,
            },
            {
                id: 'STOP-HOSPITAL',
                orderId: orders[1]?.id || 'ORD-1047',
                orderNumber: orders[1]?.orderNumber || 'JPD-ORD-2026-1047',
                pharmacyName: 'Janki Hospital Dispensary & Pharmacy',
                locationName: 'Hospital Road, Janakpur-8',
                coordinates: { x: 330, y: 350 },
                itemsCount: 4,
                totalAmount: 48900,
                isColdChain: true,
                phone: '+977 9854023456',
                status: orders[1]?.status || 'PACKED',
                sequence: 2,
                estimatedArrival: '09:45 AM',
                distanceFromPrevKm: 1.8,
            },
            {
                id: 'STOP-BHANU',
                orderId: orders[2]?.id || 'ORD-1045',
                orderNumber: orders[2]?.orderNumber || 'JPD-ORD-2026-1045',
                pharmacyName: 'Mithila Care Medicos',
                locationName: 'Bhanu Chowk, Janakpur-2',
                coordinates: { x: 490, y: 210 },
                itemsCount: 2,
                totalAmount: 18450,
                isColdChain: false,
                phone: '+977 9801234567',
                status: orders[2]?.status || 'CONFIRMED',
                sequence: 3,
                estimatedArrival: '10:15 AM',
                distanceFromPrevKm: 2.1,
            },
            {
                id: 'STOP-PIDARI',
                orderId: 'ORD-PIDARI',
                orderNumber: 'JPD-ORD-2026-1042',
                pharmacyName: 'Janakpur Seva Medical Store',
                locationName: 'Pidari Chowk, Janakpur-9',
                coordinates: { x: 170, y: 260 },
                itemsCount: 5,
                totalAmount: 34200,
                isColdChain: true,
                phone: '+977 9804567890',
                status: 'CONFIRMED',
                sequence: 4,
                estimatedArrival: '10:45 AM',
                distanceFromPrevKm: 3.2,
            },
            {
                id: 'STOP-MUJELIYA',
                orderId: 'ORD-MUJELIYA',
                orderNumber: 'JPD-ORD-2026-1039',
                pharmacyName: 'Mujeliya Healthcare Center',
                locationName: 'Mujeliya Bypass Link',
                coordinates: { x: 420, y: 430 },
                itemsCount: 2,
                totalAmount: 14600,
                isColdChain: false,
                phone: '+977 9812903456',
                status: 'PACKED',
                sequence: 5,
                estimatedArrival: '11:15 AM',
                distanceFromPrevKm: 2.8,
            },
        ];
    }, [orders]);
    // Optimized stops sequence: Depots -> Ramanand -> Pidari -> Hospital Road -> Mujeliya -> Bhanu Chowk -> Return
    const orderedStops = useMemo(() => {
        if (!isOptimized) {
            return baseStops;
        }
        // Optimal TSP sequence to minimize zig-zagging across Janakpur
        const optimizedSequence = ['STOP-RAMANAND', 'STOP-PIDARI', 'STOP-HOSPITAL', 'STOP-MUJELIYA', 'STOP-BHANU'];
        return optimizedSequence.map((id, index) => {
            const stop = baseStops.find(s => s.id === id);
            return {
                ...stop,
                sequence: index + 1,
                estimatedArrival: ['09:15 AM', '09:35 AM', '10:05 AM', '10:30 AM', '10:55 AM'][index],
            };
        });
    }, [baseStops, isOptimized]);
    // Statistics comparing unoptimized vs optimized
    const stats = useMemo(() => {
        const totalOrders = orderedStops.length;
        const totalVolume = orderedStops.reduce((sum, s) => sum + s.totalAmount, 0);
        const coldChainStops = orderedStops.filter(s => s.isColdChain).length;
        const unoptimizedDistance = 21.4;
        const optimizedDistance = 13.8;
        const distanceSaved = isOptimized ? (unoptimizedDistance - optimizedDistance).toFixed(1) : 0;
        const timeSavedMins = isOptimized ? 38 : 0;
        return {
            totalOrders,
            totalVolume,
            coldChainStops,
            currentDistance: isOptimized ? optimizedDistance : unoptimizedDistance,
            distanceSaved,
            timeSavedMins,
            estimatedTime: isOptimized ? '1 hr 18 min' : '1 hr 56 min',
        };
    }, [orderedStops, isOptimized]);
    const handleRunOptimization = () => {
        setIsOptimizing(true);
        setTimeout(() => {
            setIsOptimized(true);
            setIsOptimizing(false);
            setDispatchNotice('TSP path optimization complete. Reduced route distance by 36% and secured cold-chain limits.');
            setTimeout(() => setDispatchNotice(null), 5000);
        }, 600);
    };
    const handleDispatchAllRoute = () => {
        orderedStops.forEach(stop => {
            if (stop.orderId) {
                updateOrderStatus(stop.orderId, 'DISPATCHED', 'Dispatched on Janakpur Route Van #1 (Morning Run)');
            }
        });
        setDispatchNotice('Successfully dispatched all route stops. Route Van #1 marked active with real-time tracking.');
        setTimeout(() => setDispatchNotice(null), 5000);
    };
    // Generate SVG path connecting Depot -> Stops -> Depot
    const routePathD = useMemo(() => {
        let d = `M ${centralDepot.coordinates.x} ${centralDepot.coordinates.y}`;
        orderedStops.forEach(stop => {
            d += ` L ${stop.coordinates.x} ${stop.coordinates.y}`;
        });
        // Return to depot
        d += ` Z`;
        return d;
    }, [orderedStops]);
    return (<div className="space-y-6">
      
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Janakpur Logistics Route Optimizer
            </h2>
            <span className="rounded bg-cyan-100 text-cyan-800 text-[10px] font-bold px-2 py-0.5">
              Local Last-Mile AI
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cartographic delivery path optimization across Janakpurdham's chowks to reduce mileage and preserve cold-chain integrity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs">
            <Printer className="h-3.5 w-3.5"/>
            <span>Print Van Manifest</span>
          </button>

          <button onClick={handleRunOptimization} disabled={isOptimizing} className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-cyan-500 transition-colors shadow-2xs">
            <Sparkles className="h-3.5 w-3.5"/>
            <span>{isOptimizing ? 'Optimizing Waypoints...' : 'Re-Run AI Route Optimization'}</span>
          </button>

          <button onClick={handleDispatchAllRoute} className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-2xs">
            <Truck className="h-3.5 w-3.5 text-cyan-400"/>
            <span>Dispatch Morning Route Van</span>
          </button>
        </div>
      </div>

      {dispatchNotice && (<div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0"/>
            <span>{dispatchNotice}</span>
          </div>
          <button onClick={() => setDispatchNotice(null)} className="text-emerald-800 hover:text-emerald-950 font-bold">
            ×
          </button>
        </div>)}

      {/* 4 Key Optimization Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Total Route Distance */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            Optimized Mileage
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {stats.currentDistance} km
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingDown className="h-3.5 w-3.5"/>
            <span>-{stats.distanceSaved} km saved ({stats.timeSavedMins} mins)</span>
          </div>
        </div>

        {/* Card 2: Estimated Transit Duration */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            Roundtrip Transit Time
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {stats.estimatedTime}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            5 stops across Janakpur core
          </div>
        </div>

        {/* Card 3: Cold-Chain Integrity */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-blue-800 tracking-wider">
            Cold Chain Compliance
          </div>
          <div className="mt-2 text-2xl font-black text-blue-900 font-mono">
            100% Verified
          </div>
          <div className="mt-1 text-[11px] text-blue-700 font-medium">
            3 insulin/vaccine stops prioritzed
          </div>
        </div>

        {/* Card 4: Daily Route Cargo Value */}
        <div className="rounded-xl border border-cyan-200 bg-cyan-50/40 p-4 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-cyan-800 tracking-wider">
            Route Invoiced Value
          </div>
          <div className="mt-2 text-2xl font-black text-cyan-950 font-mono">
            {formatNPR(stats.totalVolume)}
          </div>
          <div className="mt-1 text-[11px] text-cyan-700 font-medium">
            Van #1 Capacity: 68% utilized
          </div>
        </div>

      </div>

      {/* Main Grid: Interactive Map Visualization (Left) & Turn-by-Turn Manifest (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Cartographic SVG Map Visualization */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white shadow-md relative overflow-hidden">
          
          {/* Map Header Overlay */}
          <div className="flex items-center justify-between mb-3 z-10 relative">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"/>
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Janakpurdham Last-Mile Geo-Mesh
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-slate-400">Route:</span>
              <span className="font-mono text-cyan-300 font-bold">Van #1 (Central Core)</span>
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative aspect-16/10 w-full bg-slate-900/90 rounded-xl overflow-hidden border border-slate-800">
            
            {/* Ambient Grid Lines representing street grid */}
            <svg className="absolute inset-0 h-full w-full pointer-events-none opacity-20">
              <defs>
                <pattern id="janakpur-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#38bdf8" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#janakpur-grid)"/>
            </svg>

            {/* Main Interactive Cartography SVG */}
            <svg viewBox="0 0 700 480" className="h-full w-full select-none">
              
              {/* Arterial Roads in Janakpur */}
              <g stroke="#334155" strokeWidth="6" strokeLinecap="round" opacity="0.6">
                {/* Station Road to Ramanand Chowk */}
                <line x1="400" y1="260" x2="270" y2="160"/>
                {/* Ramanand Chowk to Pidari Chowk */}
                <line x1="270" y1="160" x2="170" y2="260"/>
                {/* Pidari Chowk to Hospital Road */}
                <line x1="170" y1="260" x2="330" y2="350"/>
                {/* Hospital Road to Mujeliya */}
                <line x1="330" y1="350" x2="420" y2="430"/>
                {/* Station Road to Bhanu Chowk */}
                <line x1="400" y1="260" x2="490" y2="210"/>
                {/* Bhanu Chowk to Mujeliya */}
                <line x1="490" y1="210" x2="420" y2="430"/>
              </g>

              {/* Highway labels */}
              <text x="610" y="80" fill="#64748b" fontSize="10" fontFamily="sans-serif">To Dhalkebar / Highway →</text>
              <text x="140" y="380" fill="#64748b" fontSize="10" fontFamily="sans-serif">To Jaleshwar / Mahottari ↓</text>

              {/* Dynamic Optimized Route Line */}
              <path d={routePathD} fill="none" stroke="#06b6d4" strokeWidth="3.5" strokeDasharray="6 4" className="animate-pulse"/>

              {/* Central Logistics Hub Depot Marker */}
              <g transform={`translate(${centralDepot.coordinates.x}, ${centralDepot.coordinates.y})`}>
                <circle r="14" fill="#0891b2" className="animate-ping opacity-30"/>
                <circle r="9" fill="#0891b2" stroke="#ffffff" strokeWidth="2.5"/>
                <text x="12" y="4" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                  Central Depot (Station Road)
                </text>
              </g>

              {/* Waypoint Stops Markers */}
              {orderedStops.map(stop => {
            const isHovered = hoveredStopId === stop.id;
            const isSelected = selectedStopId === stop.id;
            return (<g key={stop.id} transform={`translate(${stop.coordinates.x}, ${stop.coordinates.y})`} className="cursor-pointer transition-transform hover:scale-110" onMouseEnter={() => setHoveredStopId(stop.id)} onMouseLeave={() => setHoveredStopId(null)} onClick={() => setSelectedStopId(stop.id)}>
                    {/* Ring highlight on active/hover */}
                    {(isHovered || isSelected) && (<circle r="18" fill="#38bdf8" opacity="0.3" className="animate-ping"/>)}

                    {/* Outer Circle */}
                    <circle r="12" fill={stop.isColdChain ? '#2563eb' : '#0f172a'} stroke={stop.isColdChain ? '#60a5fa' : '#38bdf8'} strokeWidth="2.5"/>

                    {/* Sequence Number */}
                    <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      {stop.sequence}
                    </text>

                    {/* Label */}
                    <text x="16" y="4" fill={isHovered ? '#ffffff' : '#cbd5e1'} fontSize="10" fontWeight="600" fontFamily="sans-serif">
                      {stop.locationName.split(',')[0]}
                    </text>
                  </g>);
        })}

            </svg>

            {/* Floating Quick Legend */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-lg text-[10px] text-slate-300 space-y-1 backdrop-blur-xs">
              <div className="flex items-center gap-1.5 font-bold text-white mb-1">
                <span>Route Van #1 Path</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-500"/>
                <span>Station Road Origin Depot</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500"/>
                <span>Cold-Chain Priority Stop (2°C-8°C)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-600"/>
                <span>Standard Wholesale Delivery Stop</span>
              </div>
            </div>

          </div>

          {/* Map Footer Bar */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Thermometer className="h-3.5 w-3.5 text-blue-400"/>
              <span>Route Van Refrigeration: <strong>4.2°C Continuous Sensor Logging</strong></span>
            </div>
            <div className="font-mono text-cyan-300">
              TSP Algorithm: Active
            </div>
          </div>

        </div>

        {/* Right: Turn-by-Turn Delivery Manifest & Stop Sequencing */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Delivery Route Manifest</h3>
              <p className="text-[11px] text-slate-500">Scheduled sequence for Driver Shyam Thakur</p>
            </div>
            <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
              5 Stops Optimized
            </span>
          </div>

          {/* Sequential Stops Timeline */}
          <div className="space-y-3 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 pl-8">
            
            {/* Origin Stop */}
            <div className="relative text-xs">
              <span className="absolute -left-8 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-cyan-400 text-[10px] font-bold">
                0
              </span>
              <div>
                <div className="font-bold text-slate-900">Depart Central Depot</div>
                <div className="text-slate-500 text-[11px]">Station Road, Janakpur · 08:30 AM</div>
              </div>
            </div>

            {/* Stops */}
            {orderedStops.map(stop => {
            const isSelected = selectedStopId === stop.id;
            const isHovered = hoveredStopId === stop.id;
            return (<div key={stop.id} onClick={() => setSelectedStopId(stop.id)} onMouseEnter={() => setHoveredStopId(stop.id)} onMouseLeave={() => setHoveredStopId(null)} className={`relative p-3 rounded-xl border text-xs cursor-pointer transition-all ${isSelected || isHovered
                    ? 'border-cyan-500 bg-cyan-50/60 shadow-2xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50'}`}>
                  {/* Sequence Node Number */}
                  <span className={`absolute -left-8 top-3 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-2xs ${stop.isColdChain ? 'bg-blue-600' : 'bg-slate-800'}`}>
                    {stop.sequence}
                  </span>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{stop.pharmacyName}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{stop.locationName}</div>
                      
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap font-mono text-[10px]">
                        <span className="text-cyan-800 font-semibold">{stop.orderNumber}</span>
                        <span>·</span>
                        <span>{stop.itemsCount} Products</span>
                        <span>·</span>
                        <span className="text-slate-700 font-bold">{formatNPR(stop.totalAmount)}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold font-mono text-cyan-900 text-xs">{stop.estimatedArrival}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">+{stop.distanceFromPrevKm} km</div>
                      {stop.isColdChain && (<span className="mt-1 inline-flex items-center gap-0.5 rounded bg-blue-100 text-blue-800 px-1.5 py-0.2 text-[9px] font-bold">
                          Cold Pouch
                        </span>)}
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="h-3 w-3 text-slate-400"/>
                      <span>{stop.phone}</span>
                    </span>
                    <span className="font-semibold text-slate-700 capitalize">
                      Status: {stop.status}
                    </span>
                  </div>
                </div>);
        })}

            {/* Return Stop */}
            <div className="relative text-xs pt-1">
              <span className="absolute -left-8 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-cyan-400 text-[10px] font-bold">
                ✓
              </span>
              <div>
                <div className="font-bold text-slate-900">Return to Central Depot</div>
                <div className="text-slate-500 text-[11px]">Station Road Staging Bay · approx. 11:45 AM</div>
              </div>
            </div>

          </div>

          {/* Quick Action Button */}
          <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
            <span className="text-[11px] text-slate-500">Driver: Shyam Thakur (+977 9801239811)</span>
            <button onClick={() => window.print()} className="text-xs font-bold text-cyan-700 hover:text-cyan-900 flex items-center gap-1">
              <span>Export PDF Route Sheet</span>
              <ChevronRight className="h-3.5 w-3.5"/>
            </button>
          </div>

        </div>

      </div>

    </div>);
};
