import React, { useState, useMemo } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatNPR, formatDate, getExpiryStatus } from '../../utils/formatters';
import { AlertTriangle, ShieldAlert, Clock, Search, CheckCircle2, Thermometer, Copy, TrendingDown, Layers, Sparkles, Download, X } from 'lucide-react';
export const ExpiryBatchTracker = () => {
    const { orders, products, addToCart, setIsCartOpen, createReturnRequest } = useCart();
    const { activeCustomer } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterUrgency, setFilterUrgency] = useState('ALL');
    const [filterStorage, setFilterStorage] = useState('ALL');
    const [copiedBatch, setCopiedBatch] = useState(null);
    // Return modal state
    const [returnTarget, setReturnTarget] = useState(null);
    const [returnQty, setReturnQty] = useState(1);
    const [returnReason, setReturnReason] = useState('Near Expiry');
    const [returnNote, setReturnNote] = useState('');
    const [actionNotice, setActionNotice] = useState(null);
    // Extract all lot records from active customer orders, supplemented with realistic pharmacy shelf stock
    const purchasedLots = useMemo(() => {
        const customerOrders = orders.filter(o => o.customerId === (activeCustomer?.id || 'CUST-001'));
        const lots = [];
        // From actual completed and placed orders
        customerOrders.forEach(order => {
            order.items.forEach(item => {
                const prod = products.find(p => p.id === item.productId);
                lots.push({
                    id: `${order.id}-${item.productId}-${item.batchNumber}`,
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                    purchaseDate: order.placedAt.split('T')[0],
                    productId: item.productId,
                    productName: item.productName,
                    genericName: item.genericName,
                    manufacturer: prod?.manufacturer || 'Authorized Manufacturer',
                    dosageForm: prod?.dosageForm || 'Tablet',
                    packSize: item.packSize,
                    storageCondition: prod?.storageCondition || 'Store below 25°C',
                    isColdChain: !!prod?.isColdChain,
                    batchNumber: item.batchNumber,
                    expiryDate: item.expiryDate,
                    quantityPurchased: item.quantityFulfilled || item.quantityOrdered,
                    unitPrice: item.unitPrice,
                    totalValue: item.totalPrice,
                    ddaRegReference: prod?.ddaRegReference || 'DDA-REG-2022-771',
                });
            });
        });
        // Add 2 critical/near-expiry monitored batches commonly held in hospital/pharmacy dispensary
        lots.push({
            id: 'LOT-DISP-001',
            orderId: 'ORD-1032',
            orderNumber: 'JPD-ORD-2026-1032',
            purchaseDate: '2025-11-14',
            productId: 'PROD-004',
            productName: 'Azithromycin Tablets 500mg',
            genericName: 'Azithromycin Dihydrate',
            manufacturer: 'Square Pharmaceuticals Ltd.',
            dosageForm: 'Film Coated Tablet',
            packSize: '3 x 10 Tablets (30 Tabs/Box)',
            storageCondition: 'Store below 25°C in a dry place',
            isColdChain: false,
            batchNumber: 'AZI-25L02',
            expiryDate: '2026-10-25', // ~25 days remaining! CRITICAL
            quantityPurchased: 12,
            unitPrice: 510,
            totalValue: 6120,
            ddaRegReference: 'DDA-REG-2020-SQ-192',
        });
        lots.push({
            id: 'LOT-DISP-002',
            orderId: 'ORD-1038',
            orderNumber: 'JPD-ORD-2026-1038',
            purchaseDate: '2025-12-05',
            productId: 'PROD-002',
            productName: 'Paracetamol Paediatric Oral Suspension 120mg/5ml',
            genericName: 'Paracetamol (Acetaminophen)',
            manufacturer: 'Asian Pharmaceuticals Pvt. Ltd.',
            dosageForm: 'Oral Suspension',
            packSize: '60ml Amber Pet Bottle with Dose Cup',
            storageCondition: 'Store below 30°C. Protect from direct sunlight.',
            isColdChain: false,
            batchNumber: 'PYR-25H18',
            expiryDate: '2026-11-20', // ~51 days remaining! WARNING
            quantityPurchased: 30,
            unitPrice: 58,
            totalValue: 1740,
            ddaRegReference: 'DDA-REG-2021-AS-812',
        });
        return lots;
    }, [orders, products, activeCustomer]);
    // Compute metrics
    const metrics = useMemo(() => {
        let criticalCount = 0;
        let warningCount = 0;
        let healthyCount = 0;
        let totalRiskValue = 0;
        let totalStockValue = 0;
        purchasedLots.forEach(lot => {
            const exp = getExpiryStatus(lot.expiryDate);
            totalStockValue += lot.totalValue;
            if (exp.status === 'EXPIRED' || exp.status === 'CRITICAL') {
                criticalCount++;
                totalRiskValue += lot.totalValue;
            }
            else if (exp.status === 'WARNING') {
                warningCount++;
                totalRiskValue += lot.totalValue * 0.5; // partial risk
            }
            else {
                healthyCount++;
            }
        });
        return {
            totalBatches: purchasedLots.length,
            criticalCount,
            warningCount,
            healthyCount,
            totalRiskValue,
            totalStockValue,
        };
    }, [purchasedLots]);
    // Filtered lots
    const filteredLots = useMemo(() => {
        return purchasedLots.filter(lot => {
            const exp = getExpiryStatus(lot.expiryDate);
            const matchesSearch = lot.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lot.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lot.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lot.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lot.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesUrgency = filterUrgency === 'ALL' ||
                (filterUrgency === 'CRITICAL' && (exp.status === 'CRITICAL' || exp.status === 'EXPIRED')) ||
                (filterUrgency === 'WARNING' && exp.status === 'WARNING') ||
                (filterUrgency === 'HEALTHY' && exp.status === 'HEALTHY');
            const matchesStorage = filterStorage === 'ALL' ||
                (filterStorage === 'COLD_CHAIN' && lot.isColdChain) ||
                (filterStorage === 'STANDARD' && !lot.isColdChain);
            return matchesSearch && matchesUrgency && matchesStorage;
        });
    }, [purchasedLots, searchTerm, filterUrgency, filterStorage]);
    const handleCopyBatch = (batchNo) => {
        navigator.clipboard.writeText(batchNo);
        setCopiedBatch(batchNo);
        setTimeout(() => setCopiedBatch(null), 2500);
    };
    const handleReorderFresh = (lot, e) => {
        const liveProduct = products.find(p => p.id === lot.productId);
        if (liveProduct) {
            addToCart(liveProduct, Math.max(liveProduct.moq, lot.quantityPurchased), undefined, e.currentTarget);
            setActionNotice(`Added fresh FEFO batch of ${lot.productName} to wholesale cart.`);
            setIsCartOpen(true);
            setTimeout(() => setActionNotice(null), 5000);
        }
    };
    const handleOpenReturnModal = (lot) => {
        setReturnTarget(lot);
        setReturnQty(lot.quantityPurchased);
        setReturnReason('Near Expiry');
        setReturnNote(`Lot ${lot.batchNumber} expiring on ${lot.expiryDate}. Requesting distributor exchange before cutoff.`);
    };
    const handleSubmitReturn = (e) => {
        e.preventDefault();
        if (!returnTarget)
            return;
        createReturnRequest({
            orderNumber: returnTarget.orderNumber,
            customerName: activeCustomer?.businessName || 'ABC Medical Hall',
            productId: returnTarget.productId,
            productName: returnTarget.productName,
            batchNumber: returnTarget.batchNumber,
            quantity: returnQty,
            reason: returnReason,
            resolutionNote: returnNote,
        });
        setActionNotice(`Return/Exchange request for Lot ${returnTarget.batchNumber} submitted to Janakpur warehouse.`);
        setReturnTarget(null);
        setTimeout(() => setActionNotice(null), 5000);
    };
    return (<div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Expiry & Batch Tracker
            </h2>
            <span className="rounded bg-cyan-100 text-cyan-800 text-[10px] font-bold px-2 py-0.5">
              Dispensary QA
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor lot shelf life, automate First-Expiry First-Out (FEFO) dispensing, and flag batches requiring distributor return or exchange.
          </p>
        </div>

        <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-auto">
          <Download className="h-3.5 w-3.5 text-slate-500"/>
          <span>Export Lot Audit (Print)</span>
        </button>
      </div>

      {actionNotice && (<div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0"/>
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-800 hover:text-emerald-950 font-bold">
            ×
          </button>
        </div>)}

      {/* Critical Expiry Alert Banner (if any batches < 30 days) */}
      {metrics.criticalCount > 0 && (<div className="rounded-xl border border-rose-300 bg-gradient-to-r from-rose-50 via-white to-amber-50 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/20">
              <ShieldAlert className="h-5 w-5"/>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-rose-950">
                  Critical Expiry Alert: {metrics.criticalCount} Lot{metrics.criticalCount > 1 ? 's' : ''} Expiring Within 30 Days
                </span>
                <span className="rounded bg-rose-200 text-rose-900 font-mono text-[10px] font-bold px-2 py-0.2">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Per Department of Drug Administration (DDA) guidelines, medicines approaching terminal expiry must either be dispensed immediately via strict FEFO or submitted for distributor return credit before the 15-day non-returnable threshold.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <button onClick={() => setFilterUrgency('CRITICAL')} className="rounded-lg bg-rose-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-800 transition-colors shadow-2xs whitespace-nowrap">
              Filter Critical Lots
            </button>
          </div>
        </div>)}

      {/* 4 Metric Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Total Lots Monitored */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase text-[10px] tracking-wider text-slate-500">Lots Monitored</span>
            <Layers className="h-4 w-4 text-slate-400"/>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {metrics.totalBatches}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Across {orders.length} purchase orders
          </div>
        </div>

        {/* Card 2: Critical Expiry (<30 Days) */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-rose-700 text-xs">
            <span className="font-bold uppercase text-[10px] tracking-wider">Critical (&lt;30 Days)</span>
            <AlertTriangle className="h-4 w-4 text-rose-600"/>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-700 font-mono">
            {metrics.criticalCount}
          </div>
          <div className="mt-1 text-[11px] text-rose-600 font-medium">
            Requires return or fast-dispense
          </div>
        </div>

        {/* Card 3: Approaching Expiry (30-90 Days) */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 text-xs">
            <span className="font-bold uppercase text-[10px] tracking-wider">Near Expiry (30-90d)</span>
            <Clock className="h-4 w-4 text-amber-600"/>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-700 font-mono">
            {metrics.warningCount}
          </div>
          <div className="mt-1 text-[11px] text-amber-600 font-medium">
            Prioritize for FEFO sales
          </div>
        </div>

        {/* Card 4: Inventory Value at Risk */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase text-[10px] tracking-wider text-slate-500">Stock Value at Risk</span>
            <TrendingDown className="h-4 w-4 text-amber-500"/>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {formatNPR(metrics.totalRiskValue)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Total shelf: {formatNPR(metrics.totalStockValue)}
          </div>
        </div>

      </div>

      {/* FEFO Dispensing Recommendation Box */}
      <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-4 flex items-start gap-3 text-xs text-cyan-950">
        <Sparkles className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5"/>
        <div className="space-y-0.5">
          <div className="font-bold">FEFO (First Expiry, First Out) Intelligent Dispensing Guidance</div>
          <p className="text-slate-600 leading-relaxed">
            Ensure your counter staff dispenses <strong>Lot AZI-25L02 (Azithromycin 500mg)</strong> and <strong>Lot PYR-25H18 (Pyracare Syrup)</strong> to patients before newer shipments arriving with 2027/2028 expiries.
          </p>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
          <input type="text" placeholder="Search lot by medicine, generic name, batch number (e.g. AMX-26A04), or order ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"/>
        </div>

        {/* Urgency Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg shrink-0">
          <button onClick={() => setFilterUrgency('ALL')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${filterUrgency === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}>
            All Lots ({purchasedLots.length})
          </button>
          <button onClick={() => setFilterUrgency('CRITICAL')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${filterUrgency === 'CRITICAL' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-rose-700'}`}>
            &lt;30d Critical ({metrics.criticalCount})
          </button>
          <button onClick={() => setFilterUrgency('WARNING')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${filterUrgency === 'WARNING' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600 hover:text-amber-700'}`}>
            30-90d Warning ({metrics.warningCount})
          </button>
          <button onClick={() => setFilterUrgency('HEALTHY')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${filterUrgency === 'HEALTHY' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-emerald-800'}`}>
            Healthy ({metrics.healthyCount})
          </button>
        </div>

        {/* Storage Filter */}
        <select value={filterStorage} onChange={e => setFilterStorage(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none">
          <option value="ALL">All Storage Types</option>
          <option value="COLD_CHAIN">Cold Chain (2°C - 8°C)</option>
          <option value="STANDARD">Room Temp (&lt; 25°C)</option>
        </select>
      </div>

      {/* Lot-Specific Pharmaceutical Inventory Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Medicine & Formulation</th>
                <th className="py-3 px-4 font-mono">Lot / Batch No.</th>
                <th className="py-3 px-4">Purchase Ref</th>
                <th className="py-3 px-4 font-mono">Expiry Date</th>
                <th className="py-3 px-4">Days Left & Urgency</th>
                <th className="py-3 px-4 text-right">Units / Value</th>
                <th className="py-3 px-4 text-right">Dispensary Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLots.length === 0 ? (<tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No medicine batches found matching the selected filter criteria.
                  </td>
                </tr>) : (filteredLots.map(lot => {
            const exp = getExpiryStatus(lot.expiryDate);
            const isCritical = exp.status === 'CRITICAL' || exp.status === 'EXPIRED';
            const isWarning = exp.status === 'WARNING';
            return (<tr key={lot.id} className={`hover:bg-slate-50/70 transition-colors ${isCritical ? 'bg-rose-50/30' : isWarning ? 'bg-amber-50/20' : ''}`}>
                      {/* Medicine Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-xs">{lot.productName}</div>
                        <div className="text-[11px] text-slate-500 italic mt-0.5">
                          {lot.genericName} · {lot.packSize}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                          <span className="text-cyan-800 font-medium">{lot.manufacturer}</span>
                          {lot.isColdChain && (<span className="flex items-center gap-0.5 text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-semibold">
                              <Thermometer className="h-2.5 w-2.5"/>
                              <span>Cold Chain 2°-8°</span>
                            </span>)}
                        </div>
                      </td>

                      {/* Lot / Batch Number */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {lot.batchNumber}
                          </span>
                          <button onClick={() => handleCopyBatch(lot.batchNumber)} className="text-slate-400 hover:text-slate-700 transition-colors p-1" title="Copy Lot Number">
                            <Copy className="h-3 w-3"/>
                          </button>
                        </div>
                        {copiedBatch === lot.batchNumber && (<div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Copied!</div>)}
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {lot.ddaRegReference}
                        </div>
                      </td>

                      {/* Purchase Ref */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="font-semibold text-slate-800">{lot.orderNumber}</div>
                        <div className="text-slate-400 text-[10px]">Date: {formatDate(lot.purchaseDate)}</div>
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-900 text-xs">{lot.expiryDate}</div>
                        <div className="text-[10px] text-slate-400">Shelf-life cutoff</div>
                      </td>

                      {/* Urgency Badge & Days Remaining */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isCritical
                    ? 'bg-rose-100 text-rose-900 border border-rose-200'
                    : isWarning
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-200'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${isCritical ? 'bg-rose-600 animate-ping' : isWarning ? 'bg-amber-600' : 'bg-emerald-600'}`}/>
                            <span>{exp.daysLeft < 0 ? 'Expired' : `${exp.daysLeft} Days Remaining`}</span>
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {isCritical
                    ? 'Flagged for return/exchange'
                    : isWarning
                        ? 'Dispense with priority'
                        : 'Stable shelf life'}
                        </div>
                      </td>

                      {/* Quantity & Value */}
                      <td className="py-3.5 px-4 text-right font-mono">
                        <div className="font-bold text-slate-900 text-xs">
                          {lot.quantityPurchased} Units
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {formatNPR(lot.totalValue)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Return / Exchange Button if < 90 days */}
                          {(isCritical || isWarning) && (<button onClick={() => handleOpenReturnModal(lot)} className="rounded bg-rose-50 border border-rose-200 px-2.5 py-1 text-[11px] font-bold text-rose-800 hover:bg-rose-100 transition-colors shadow-2xs whitespace-nowrap" title="Initiate Return or Exchange Request with Distributor">
                              Return / Exchange
                            </button>)}

                          {/* Reorder Fresh Batch */}
                          <button onClick={e => handleReorderFresh(lot, e)} className="rounded bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-slate-800 transition-colors shadow-2xs whitespace-nowrap" title="Reorder fresh FEFO inventory">
                            Reorder Fresh
                          </button>
                        </div>
                      </td>
                    </tr>);
        }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return / Exchange Request Modal */}
      {returnTarget && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg my-8 rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-xs">
            <button onClick={() => setReturnTarget(null)} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <X className="h-5 w-5"/>
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
              <ShieldAlert className="h-5 w-5 text-rose-600"/>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Initiate Near-Expiry Lot Return / Exchange
                </h3>
                <p className="text-slate-500 text-[11px]">
                  Submit batch return request to Janakpur PharmaDistro logistics warehouse.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitReturn} className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 text-sm">{returnTarget.productName}</div>
                <div className="text-slate-500 text-[11px]">Generic: {returnTarget.genericName}</div>
                <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-slate-700">
                  <span>Lot: <strong>{returnTarget.batchNumber}</strong></span>
                  <span>·</span>
                  <span>Exp: <strong>{returnTarget.expiryDate}</strong></span>
                  <span>·</span>
                  <span>Order: <strong>{returnTarget.orderNumber}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Return Reason
                  </label>
                  <select value={returnReason} onChange={e => setReturnReason(e.target.value)} className="w-full rounded border border-slate-200 bg-white p-2 text-slate-800 focus:outline-none">
                    <option value="Near Expiry">Near Expiry (&lt;60d)</option>
                    <option value="Damaged Product">Damaged Packaging / Seal</option>
                    <option value="Recall">Manufacturer Batch Recall</option>
                    <option value="Wrong Product">Wrong Lot Received</option>
                    <option value="Other">Overstock Exchange</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Units to Return (Max {returnTarget.quantityPurchased})
                  </label>
                  <input type="number" min={1} max={returnTarget.quantityPurchased} value={returnQty} onChange={e => setReturnQty(Math.min(returnTarget.quantityPurchased, Math.max(1, parseInt(e.target.value, 10) || 1)))} className="w-full rounded border border-slate-200 bg-white p-2 font-mono text-slate-800"/>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Pharmacist Notes & Request Type
                </label>
                <textarea rows={3} value={returnNote} onChange={e => setReturnNote(e.target.value)} placeholder="Specify replacement lot preference, credit note application, or van pickup instructions..." className="w-full rounded border border-slate-200 p-2 text-slate-800 focus:outline-none"/>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setReturnTarget(null)} className="rounded border border-slate-200 px-3.5 py-1.5 font-semibold text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="rounded bg-rose-700 px-4 py-1.5 font-bold text-white hover:bg-rose-800 shadow">
                  Submit Return Request
                </button>
              </div>
            </form>
          </div>
        </div>)}

    </div>);
};
