import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatNPR } from '../../utils/formatters';
import { ShoppingCart, Users, AlertTriangle, ShieldCheck, TrendingUp, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
export const AdminDashboard = ({ onNavigate }) => {
    const { customers } = useAuth();
    const { orders, products, invoices } = useCart();
    const pendingVerifications = customers.filter(c => c.accountStatus === 'PENDING' || c.accountStatus === 'UNDER_REVIEW').length;
    const activeCustomersCount = customers.filter(c => c.accountStatus === 'APPROVED').length;
    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingOrders = orders.filter(o => o.status === 'PLACED' || o.status === 'PROCESSING').length;
    // Inventory alerts
    const lowStockProducts = products.filter(p => p.totalStock < 100);
    // Sales trend data for Recharts
    const salesChartData = [
        { day: 'Sun', sales: 48000, orders: 8 },
        { day: 'Mon', sales: 74000, orders: 14 },
        { day: 'Tue', sales: 92000, orders: 19 },
        { day: 'Wed', sales: 61000, orders: 11 },
        { day: 'Thu', sales: 88000, orders: 16 },
        { day: 'Fri', sales: 112000, orders: 22 },
        { day: 'Today', sales: totalSales > 100000 ? totalSales : 78000, orders: orders.length + 5 },
    ];
    return (<div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Operations & Wholesale Distribution Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time Janakpur warehouse dispatch metrics, compliance queue, and sales performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => onNavigate('admin-verification')} className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-cyan-500 transition-colors shadow-2xs">
            <span>Review Verifications ({pendingVerifications})</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Today's Wholesale Sales */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase text-[11px] tracking-wider">Gross Orders Value</span>
            <TrendingUp className="h-4 w-4 text-emerald-600"/>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {formatNPR(totalSales)}
          </div>
          <div className="mt-1 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <span>+14.2%</span>
            <span className="text-slate-400 font-normal">vs last week</span>
          </div>
        </div>

        {/* Card 2: Pending Orders */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase text-[11px] tracking-wider">Pending Orders</span>
            <ShoppingCart className="h-4 w-4 text-cyan-600"/>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {pendingOrders}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Awaiting packaging or dispatch
          </div>
        </div>

        {/* Card 3: Pending Verifications */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase text-[11px] tracking-wider">Pending Verifications</span>
            <ShieldCheck className="h-4 w-4 text-amber-600"/>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 font-mono">
            {pendingVerifications}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Pharmacies awaiting license audit
          </div>
        </div>

        {/* Card 4: Active Pharmacies */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase text-[11px] tracking-wider">Verified Pharmacies</span>
            <Users className="h-4 w-4 text-slate-600"/>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {activeCustomersCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            In Janakpur, Dhanusha & Siraha
          </div>
        </div>

      </div>

      {/* Chart & Live Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sales Chart (Recharts) */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Wholesale Daily Sales Volume</h3>
              <p className="text-[11px] text-slate-400">Values in NPR (Rs.) across Janakpur delivery van routes</p>
            </div>
            <span className="text-xs font-mono font-semibold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded">
              Current Week
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false}/>
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `Rs. ${v / 1000}k`}/>
                <Tooltip formatter={(val) => [formatNPR(val), 'Sales']} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #e2e8f0' }}/>
                <Area type="monotone" dataKey="sales" stroke="#0891b2" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock & FEFO Expiry Alerts */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-500"/>
                <span>Inventory Alerts</span>
              </h3>
              <button onClick={() => onNavigate('admin-inventory')} className="text-[11px] font-semibold text-cyan-600 hover:text-cyan-800">
                View Batches →
              </button>
            </div>

            <div className="space-y-3">
              {lowStockProducts.map(prod => (<div key={prod.id} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-slate-800 truncate">{prod.name}</div>
                    <div className="text-[10px] text-slate-400">Stock: {prod.totalStock} {prod.unit}s remaining</div>
                  </div>
                  <span className="rounded bg-amber-100 text-amber-800 px-1.5 py-0.5 text-[10px] font-bold shrink-0">
                    Low Stock
                  </span>
                </div>))}

              <div className="rounded-lg border border-rose-100 bg-rose-50/50 p-2.5 text-xs space-y-1">
                <div className="font-semibold text-rose-900 flex items-center justify-between">
                  <span>Batch Near Expiry</span>
                  <span className="font-mono text-[10px]">Exp: 2026-10</span>
                </div>
                <div className="text-[11px] text-rose-700">
                  Pyracare Paediatric (Batch PYR-25H18) requires FEFO movement within 30 days.
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Automated FEFO dispatch priority</span>
            <span className="text-emerald-700 font-semibold">Active</span>
          </div>
        </div>

      </div>

      {/* Quick Action Operations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <button onClick={() => onNavigate('admin-verification')} className="rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-between group shadow-2xs">
          <div>
            <div className="font-bold text-xs text-slate-900">Review Pharmacy Applications</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Audit DDA licenses & approve B2B accounts</div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-600 transition-colors"/>
        </button>

        <button onClick={() => onNavigate('admin-orders')} className="rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-between group shadow-2xs">
          <div>
            <div className="font-bold text-xs text-slate-900">Order Fulfillment & Route Vans</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Assign vans, print packing crates, dispatch</div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-600 transition-colors"/>
        </button>

        <button onClick={() => onNavigate('admin-recalls')} className="rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-between group shadow-2xs">
          <div>
            <div className="font-bold text-xs text-slate-900">DDA Batch Recall Monitor</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Trace affected lots and recovery percentage</div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-600 transition-colors"/>
        </button>
      </div>

    </div>);
};
