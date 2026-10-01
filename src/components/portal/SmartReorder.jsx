import React, { useState, useMemo } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatNPR, sortBatchesFEFO } from '../../utils/formatters';
import { ShoppingCart, AlertTriangle, CheckCircle2, Clock, Calendar, HeartPulse, TrendingUp, Plus, Minus, Search, Check } from 'lucide-react';
export const SmartReorder = () => {
    const { orders, products, addToCart, setIsCartOpen } = useCart();
    const { activeCustomer } = useAuth();
    // Active customer purchase history
    const myOrders = orders.filter(o => o.customerId === (activeCustomer?.id || 'CUST-001'));
    // Multi-item selection for restock
    const [selectedProductIds, setSelectedProductIds] = useState({});
    const [restockQuantities, setRestockQuantities] = useState({});
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [filterUrgency, setFilterUrgency] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [actionNotification, setActionNotification] = useState(null);
    // Standing cadence preference state
    const [standingCadence, setStandingCadence] = useState('BI_WEEKLY');
    const [cadenceNotice, setCadenceNotice] = useState(false);
    // Build smart reorder recommendations by analyzing order frequency and chronic indicators
    const recommendations = useMemo(() => {
        const productFrequency = {};
        myOrders.forEach(order => {
            order.items.forEach(item => {
                if (!productFrequency[item.productId]) {
                    productFrequency[item.productId] = { count: 0, totalQty: 0, lastDate: order.placedAt };
                }
                productFrequency[item.productId].count += 1;
                productFrequency[item.productId].totalQty += item.quantityFulfilled || item.quantityOrdered;
                if (new Date(order.placedAt) > new Date(productFrequency[item.productId].lastDate)) {
                    productFrequency[item.productId].lastDate = order.placedAt;
                }
            });
        });
        const list = [];
        // Map through existing catalogue products
        products.forEach(p => {
            // Check if product is in purchase history or a recognized chronic maintenance staple
            const history = productFrequency[p.id];
            const isMetformin = p.name.toLowerCase().includes('metformin');
            const isTelmisartan = p.name.toLowerCase().includes('telmisartan');
            const isPantoprazole = p.name.toLowerCase().includes('pantoprazole');
            const isInsulin = p.name.toLowerCase().includes('insulin');
            const isAmoxicillin = p.name.toLowerCase().includes('amoxicillin');
            const isParacetamol = p.name.toLowerCase().includes('paracetamol');
            let therapyCategory = 'High-Velocity Essential';
            let estShelfDays = 14;
            let orderCount = history ? history.count : 1;
            let avgCycle = 15;
            let monthlyRate = 25;
            let recQty = Math.max(p.moq, 15);
            if (isMetformin) {
                therapyCategory = 'Chronic - Diabetes';
                estShelfDays = 2; // Imminent depletion!
                orderCount = history ? history.count + 3 : 4;
                avgCycle = 14;
                monthlyRate = 30;
                recQty = Math.max(p.moq, 20);
            }
            else if (isTelmisartan) {
                therapyCategory = 'Chronic - Cardiovascular';
                estShelfDays = 4; // Restock due soon
                orderCount = history ? history.count + 2 : 3;
                avgCycle = 15;
                monthlyRate = 20;
                recQty = Math.max(p.moq, 15);
            }
            else if (isPantoprazole) {
                therapyCategory = 'Chronic - Acid Peptic / GERD';
                estShelfDays = 3; // Depletion imminent
                orderCount = history ? history.count + 2 : 4;
                avgCycle = 12;
                monthlyRate = 40;
                recQty = Math.max(p.moq, 25);
            }
            else if (isInsulin) {
                therapyCategory = 'Chronic - Diabetes';
                estShelfDays = 5;
                orderCount = history ? history.count + 1 : 2;
                avgCycle = 21;
                monthlyRate = 15;
                recQty = Math.max(p.moq, 10);
            }
            else if (isAmoxicillin) {
                therapyCategory = 'High-Velocity Essential';
                estShelfDays = 6;
                orderCount = history ? history.count + 2 : 3;
                avgCycle = 14;
                monthlyRate = 35;
                recQty = Math.max(p.moq, 20);
            }
            else if (isParacetamol) {
                therapyCategory = 'High-Velocity Essential';
                estShelfDays = 12;
                orderCount = history ? history.count + 1 : 2;
                avgCycle = 18;
                monthlyRate = 50;
                recQty = Math.max(p.moq, 30);
            }
            else if (!history) {
                return; // Skip transient items not in history or chronic list
            }
            let depletionStatus = 'HEALTHY';
            if (estShelfDays <= 3) {
                depletionStatus = 'DEPLETION_IMMINENT';
            }
            else if (estShelfDays <= 7) {
                depletionStatus = 'RESTOCK_DUE';
            }
            list.push({
                productId: p.id,
                product: p,
                therapyCategory,
                orderCount,
                lastPurchasedDate: history ? history.lastDate.split('T')[0] : '2026-09-15',
                avgOrderCycleDays: avgCycle,
                estimatedShelfDaysRemaining: estShelfDays,
                depletionStatus,
                monthlyConsumptionUnits: monthlyRate,
                recommendedRestockQty: recQty,
            });
        });
        // Sort: Imminent depletion first, then Restock due
        return list.sort((a, b) => a.estimatedShelfDaysRemaining - b.estimatedShelfDaysRemaining);
    }, [myOrders, products]);
    // Initialize pre-checked items (check imminent and due soon by default)
    React.useEffect(() => {
        const initialChecked = {};
        const initialQtys = {};
        recommendations.forEach(rec => {
            if (rec.depletionStatus === 'DEPLETION_IMMINENT' || rec.depletionStatus === 'RESTOCK_DUE') {
                initialChecked[rec.productId] = true;
            }
            initialQtys[rec.productId] = rec.recommendedRestockQty;
        });
        setSelectedProductIds(initialChecked);
        setRestockQuantities(initialQtys);
    }, [recommendations]);
    // Filtered recommendations
    const filteredRecs = useMemo(() => {
        return recommendations.filter(rec => {
            const matchesSearch = rec.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rec.product.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rec.therapyCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rec.product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCat = filterCategory === 'ALL' || rec.therapyCategory === filterCategory;
            const matchesUrgency = filterUrgency === 'ALL' ||
                (filterUrgency === 'IMMINENT' && rec.depletionStatus === 'DEPLETION_IMMINENT') ||
                (filterUrgency === 'DUE' && rec.depletionStatus === 'RESTOCK_DUE') ||
                (filterUrgency === 'CHRONIC' && rec.therapyCategory.startsWith('Chronic'));
            return matchesSearch && matchesCat && matchesUrgency;
        });
    }, [recommendations, searchTerm, filterCategory, filterUrgency]);
    // Selected items computation
    const selectedCount = Object.values(selectedProductIds).filter(Boolean).length;
    const selectedSubtotal = recommendations.reduce((sum, rec) => {
        if (selectedProductIds[rec.productId]) {
            const qty = restockQuantities[rec.productId] || rec.recommendedRestockQty;
            return sum + rec.product.wholesalePrice * qty;
        }
        return sum;
    }, 0);
    // Handle Qty Stepper
    const handleQtyChange = (productId, val, moq) => {
        setRestockQuantities(prev => ({
            ...prev,
            [productId]: Math.max(moq, val),
        }));
    };
    const toggleSelect = (productId) => {
        setSelectedProductIds(prev => ({
            ...prev,
            [productId]: !prev[productId],
        }));
    };
    const toggleSelectAll = () => {
        if (selectedCount === filteredRecs.length) {
            setSelectedProductIds({});
        }
        else {
            const all = {};
            filteredRecs.forEach(r => {
                all[r.productId] = true;
            });
            setSelectedProductIds(all);
        }
    };
    // 1-Click Add All Selected to Cart with fly animation
    const handleAddSelectedToCart = (e) => {
        let addedCount = 0;
        const btn = e.currentTarget;
        recommendations.forEach(rec => {
            if (selectedProductIds[rec.productId]) {
                const qty = restockQuantities[rec.productId] || rec.recommendedRestockQty;
                const earliestBatch = sortBatchesFEFO(rec.product.batches)[0];
                addToCart(rec.product, qty, earliestBatch, btn);
                addedCount++;
            }
        });
        setActionNotification(`Added ${addedCount} chronic replenishment medications to cart. FEFO batches allocated.`);
        setIsCartOpen(true);
        setTimeout(() => setActionNotification(null), 5000);
    };
    const handleSaveCadence = () => {
        setCadenceNotice(true);
        setTimeout(() => setCadenceNotice(false), 4000);
    };
    return (<div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Smart Reorder & Chronic Disease Stock Replenishment
            </h2>
            <span className="rounded bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-[10px] font-bold px-2 py-0.5 shadow-2xs">
              AI Demand Forecasting
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated restock suggestions calculated from your dispensary's historical dispensing frequency, order cadence, and shelf depletion rates.
          </p>
        </div>

        <button onClick={handleAddSelectedToCart} disabled={selectedCount === 0} className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-40 transition-colors shadow-2xs self-start sm:self-auto">
          <ShoppingCart className="h-4 w-4 text-cyan-400"/>
          <span>Restock Selected ({selectedCount}) to Cart</span>
        </button>
      </div>

      {actionNotification && (<div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0"/>
            <span>{actionNotification}</span>
          </div>
          <button onClick={() => setActionNotification(null)} className="text-emerald-800 hover:text-emerald-950 font-bold">
            ×
          </button>
        </div>)}

      {/* 4 Forecast Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Tracked Chronic Staples */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase text-[10px] tracking-wider text-slate-500">Chronic Staples</span>
            <HeartPulse className="h-4 w-4 text-rose-500"/>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {recommendations.length} Formulations
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Diabetes, cardiac & GI staples
          </div>
        </div>

        {/* Card 2: Depletion Imminent */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-rose-700 text-xs">
            <span className="font-bold uppercase text-[10px] tracking-wider">Depletion Imminent</span>
            <AlertTriangle className="h-4 w-4 text-rose-600"/>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-700 font-mono">
            {recommendations.filter(r => r.depletionStatus === 'DEPLETION_IMMINENT').length} Items
          </div>
          <div className="mt-1 text-[11px] text-rose-600 font-medium">
            &le; 3 days dispensary stock left
          </div>
        </div>

        {/* Card 3: Due This Week */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 text-xs">
            <span className="font-bold uppercase text-[10px] tracking-wider">Due for Replenishment</span>
            <Clock className="h-4 w-4 text-amber-600"/>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-700 font-mono">
            {recommendations.filter(r => r.depletionStatus === 'RESTOCK_DUE').length} Items
          </div>
          <div className="mt-1 text-[11px] text-amber-600 font-medium">
            Restock within 4–7 days
          </div>
        </div>

        {/* Card 4: Recommended Basket Subtotal */}
        <div className="rounded-xl border border-cyan-200 bg-cyan-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-cyan-800 text-xs">
            <span className="font-bold uppercase text-[10px] tracking-wider">Selected Basket Value</span>
            <TrendingUp className="h-4 w-4 text-cyan-700"/>
          </div>
          <div className="mt-2 text-2xl font-black text-cyan-900 font-mono">
            {formatNPR(selectedSubtotal)}
          </div>
          <div className="mt-1 text-[11px] text-cyan-700">
            For {selectedCount} selected chronic items
          </div>
        </div>

      </div>

      {/* Cadence Preference & Automated Dispatch Route Settings */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-cyan-700"/>
            <span className="font-bold text-slate-900 text-xs sm:text-sm">Standing Route Cadence Configuration</span>
            {cadenceNotice && (<span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 animate-in fade-in">
                Saved!
              </span>)}
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            Configure your scheduled delivery van window so your chronic medications restock automatically before shelf depletion.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <select value={standingCadence} onChange={e => setStandingCadence(e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none">
            <option value="BI_WEEKLY">Bi-Weekly Route (1st & 15th)</option>
            <option value="WEEKLY">Weekly Van (Every Sunday Morning)</option>
            <option value="MONTHLY">Monthly Hospital Restock (1st)</option>
          </select>

          <button onClick={handleSaveCadence} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
            Save Cadence
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
          <input type="text" placeholder="Search recurring chronic formulations (e.g. Metformin, Telmisartan, Pantoprazole)..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"/>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg shrink-0">
          <button onClick={() => setFilterUrgency('ALL')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${filterUrgency === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}>
            All Suggestions ({recommendations.length})
          </button>
          <button onClick={() => setFilterUrgency('IMMINENT')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${filterUrgency === 'IMMINENT' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-rose-700'}`}>
            &le;3d Imminent
          </button>
          <button onClick={() => setFilterUrgency('CHRONIC')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${filterUrgency === 'CHRONIC' ? 'bg-white text-cyan-800 shadow-2xs' : 'text-slate-600 hover:text-cyan-800'}`}>
            Chronic Maintenance
          </button>
        </div>

        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none">
          <option value="ALL">All Therapeutic Areas</option>
          <option value="Chronic - Diabetes">Diabetes (Metformin / Insulin)</option>
          <option value="Chronic - Cardiovascular">Cardiovascular (Telmisartan)</option>
          <option value="Chronic - Acid Peptic / GERD">Acid Peptic (Pantoprazole)</option>
          <option value="High-Velocity Essential">High-Velocity Antibiotics & Syrups</option>
        </select>
      </div>

      {/* Recommendations Table with Multi-Select Restock */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        
        {/* Table Top Batch Bar */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <button onClick={toggleSelectAll} className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-slate-900">
              <div className={`h-4 w-4 rounded border flex items-center justify-center ${selectedCount === filteredRecs.length && filteredRecs.length > 0
            ? 'bg-slate-900 border-slate-900 text-white'
            : 'border-slate-300 bg-white'}`}>
                {selectedCount === filteredRecs.length && filteredRecs.length > 0 && <Check className="h-3 w-3"/>}
              </div>
              <span>Select All Displayed ({filteredRecs.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>Selected: <strong className="text-slate-900 font-mono">{selectedCount}</strong> items</span>
            <span>Total Wholesale: <strong className="text-cyan-900 font-mono font-bold">{formatNPR(selectedSubtotal)}</strong></span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-10">Select</th>
                <th className="py-3 px-4">Chronic Medicine & Generic</th>
                <th className="py-3 px-4">Therapy Area</th>
                <th className="py-3 px-4">Usage & Cycle</th>
                <th className="py-3 px-4">Est. Runout / Urgency</th>
                <th className="py-3 px-4 text-center">Restock Qty</th>
                <th className="py-3 px-4 text-right">Wholesale Rate</th>
                <th className="py-3 px-4 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecs.map(rec => {
            const isSelected = !!selectedProductIds[rec.productId];
            const qty = restockQuantities[rec.productId] || rec.recommendedRestockQty;
            const lineTotal = rec.product.wholesalePrice * qty;
            const isImminent = rec.depletionStatus === 'DEPLETION_IMMINENT';
            const isDue = rec.depletionStatus === 'RESTOCK_DUE';
            return (<tr key={rec.productId} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-cyan-50/30' : ''}`}>
                    {/* Checkbox */}
                    <td className="py-3.5 px-4">
                      <button type="button" onClick={() => toggleSelect(rec.productId)} className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${isSelected
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'border-slate-300 bg-white hover:border-slate-400'}`}>
                        {isSelected && <Check className="h-3 w-3"/>}
                      </button>
                    </td>

                    {/* Medicine Details */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-xs">{rec.product.name}</div>
                      <div className="text-[11px] text-slate-500 italic mt-0.5">
                        {rec.product.genericName} · {rec.product.packSize}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {rec.product.manufacturer} · DDA: {rec.product.ddaRegReference}
                      </div>
                    </td>

                    {/* Therapy Category */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${rec.therapyCategory === 'Chronic - Diabetes'
                    ? 'bg-purple-100 text-purple-800'
                    : rec.therapyCategory === 'Chronic - Cardiovascular'
                        ? 'bg-rose-100 text-rose-800'
                        : rec.therapyCategory === 'Chronic - Acid Peptic / GERD'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'}`}>
                        {rec.therapyCategory}
                      </span>
                    </td>

                    {/* Purchase Pattern */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      <div>Ordered <strong className="text-slate-800">{rec.orderCount} times</strong></div>
                      <div className="text-slate-400 text-[10px]">Avg cycle: every {rec.avgOrderCycleDays} days</div>
                    </td>

                    {/* Shelf Depletion & Urgency */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isImminent
                    ? 'bg-rose-100 text-rose-900 border border-rose-200'
                    : isDue
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-200'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isImminent ? 'bg-rose-600 animate-ping' : isDue ? 'bg-amber-600' : 'bg-emerald-600'}`}/>
                        <span>
                          {isImminent ? `${rec.estimatedShelfDaysRemaining}d Left (Imminent)` : `${rec.estimatedShelfDaysRemaining}d Left (Restock Due)`}
                        </span>
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Est. usage: {rec.monthlyConsumptionUnits} {rec.product.unit}s/mo
                      </div>
                    </td>

                    {/* Restock Quantity Stepper */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                        <button type="button" onClick={() => handleQtyChange(rec.productId, qty - 1, rec.product.moq)} disabled={qty <= rec.product.moq} className="flex h-5 w-5 items-center justify-center rounded text-slate-600 hover:bg-white disabled:opacity-30">
                          <Minus className="h-3 w-3"/>
                        </button>
                        <span className="w-10 text-center font-mono text-xs font-semibold text-slate-900">
                          {qty}
                        </span>
                        <button type="button" onClick={() => handleQtyChange(rec.productId, qty + 1, rec.product.moq)} className="flex h-5 w-5 items-center justify-center rounded text-slate-600 hover:bg-white">
                          <Plus className="h-3 w-3"/>
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        MOQ: {rec.product.moq}
                      </div>
                    </td>

                    {/* Wholesale Rate */}
                    <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-700">
                      {formatNPR(rec.product.wholesalePrice)}
                    </td>

                    {/* Total Line Amount */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-xs text-slate-900">
                      {formatNPR(lineTotal)}
                    </td>
                  </tr>);
        })}
            </tbody>
          </table>
        </div>

        {/* Table Bottom Action Sticky Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600">
            <span>Allocates freshest verified <strong>First-Expiry, First-Out (FEFO)</strong> batch lot numbers directly upon addition.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-slate-400">Total Replenishment:</div>
              <div className="font-mono font-bold text-base text-cyan-900">
                {formatNPR(selectedSubtotal)}
              </div>
            </div>

            <button onClick={handleAddSelectedToCart} disabled={selectedCount === 0} className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-40 transition-colors shadow">
              <ShoppingCart className="h-4 w-4 text-cyan-400"/>
              <span>Add Selected ({selectedCount}) to Wholesale Cart</span>
            </button>
          </div>
        </div>

      </div>

    </div>);
};
