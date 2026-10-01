import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatNPR, formatDateTime } from '../../utils/formatters';
import { FileText, RotateCcw, Truck, CheckCircle2, ChevronDown, ChevronUp, Package, Navigation } from 'lucide-react';
import { InvoiceViewModal } from './InvoiceViewModal';
import { OrderTrackingTimeline } from './OrderTrackingTimeline';
import { MonthlySummaryModal } from './MonthlySummaryModal';
export const OrdersList = () => {
    const { orders, invoices, products, addToCart, setIsCartOpen, updateOrderStatus } = useCart();
    const { activeCustomer } = useAuth();
    // Filter orders for active pharmacy
    const myOrders = orders.filter(o => o.customerId === (activeCustomer?.id || 'CUST-001'));
    // Active tracked order defaults to the most recent active order or first order
    const [trackedOrderId, setTrackedOrderId] = useState(() => {
        const active = myOrders.find(o => o.status !== 'DELIVERED');
        return active ? active.id : (myOrders[0]?.id || orders[0]?.id || '');
    });
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
    const [isMonthlySummaryOpen, setIsMonthlySummaryOpen] = useState(false);
    const [reorderNotice, setReorderNotice] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const trackedOrder = orders.find(o => o.id === trackedOrderId) || myOrders[0] || orders[0];
    const filteredOrders = myOrders.filter(o => {
        if (filterStatus === 'ALL')
            return true;
        return o.status === filterStatus;
    });
    const selectedInvoice = invoices.find(inv => inv.id === selectedInvoiceId);
    const handleReorderAll = (order, e) => {
        let addedCount = 0;
        const btn = e.currentTarget;
        order.items.forEach(item => {
            const liveProduct = products.find(p => p.id === item.productId);
            if (liveProduct && liveProduct.totalStock > 0) {
                addToCart(liveProduct, Math.max(liveProduct.moq, item.quantityOrdered), undefined, btn);
                addedCount++;
            }
        });
        setReorderNotice(`Reordered ${addedCount} products from Order #${order.orderNumber}. Opened wholesale cart.`);
        setIsCartOpen(true);
        setTimeout(() => setReorderNotice(null), 5000);
    };
    const handleSimulateAdvance = (orderId, nextStatus) => {
        updateOrderStatus(orderId, nextStatus, `Live route stage advanced to ${nextStatus}`);
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case 'DELIVERED':
                return <span className="rounded bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-bold">DELIVERED</span>;
            case 'DISPATCHED':
                return <span className="rounded bg-blue-100 text-blue-800 px-2.5 py-0.5 text-xs font-bold">IN TRANSIT</span>;
            case 'PACKED':
                return <span className="rounded bg-indigo-100 text-indigo-800 px-2.5 py-0.5 text-xs font-bold">PACKED & SEALED</span>;
            case 'CONFIRMED':
                return <span className="rounded bg-cyan-100 text-cyan-800 px-2.5 py-0.5 text-xs font-bold">FEFO CONFIRMED</span>;
            case 'PLACED':
                return <span className="rounded bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-bold">ORDER PLACED</span>;
            default:
                return <span className="rounded bg-slate-100 text-slate-700 px-2.5 py-0.5 text-xs font-bold">{status}</span>;
        }
    };
    return (<div className="space-y-8">
      
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Live Delivery Tracking & Orders</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time visual delivery progression, route van tracking across Janakpur, official tax invoices, and 1-click reorders.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setIsMonthlySummaryOpen(true)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs">
            <FileText className="h-3.5 w-3.5 text-cyan-600"/>
            <span>Monthly Statement (PDF)</span>
          </button>

          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-cyan-500 focus:outline-none">
            <option value="ALL">All Order States</option>
            <option value="PLACED">Placed</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PACKED">Packed</option>
            <option value="DISPATCHED">In Transit (Dispatched)</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>
      </div>

      {reorderNotice && (<div className="rounded-lg bg-cyan-50 border border-cyan-200 p-3 text-xs text-cyan-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-cyan-600 shrink-0"/>
          <span>{reorderNotice}</span>
        </div>)}

      {/* Featured Real-Time Delivery Timeline Tracker */}
      {trackedOrder && (<section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Navigation className="h-4 w-4 text-cyan-600"/>
              <span>Real-Time Delivery Status Tracker</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Active Van Route: Janakpur Core & District Links
            </span>
          </div>

          <OrderTrackingTimeline order={trackedOrder} onViewInvoice={invId => setSelectedInvoiceId(invId)} onReorder={(o, e) => handleReorderAll(o, e)} onSimulateAdvance={handleSimulateAdvance}/>
        </section>)}

      {/* Purchase Orders Archive List */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          All Pharmacy Purchase Orders ({filteredOrders.length})
        </h3>

        <div className="space-y-4">
          {filteredOrders.length === 0 ? (<div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <Package className="mx-auto h-12 w-12 text-slate-300 stroke-[1.5]"/>
              <h3 className="mt-3 text-sm font-semibold text-slate-700">No orders found</h3>
              <p className="text-xs text-slate-400 mt-1">Orders placed by this pharmacy account will appear here.</p>
            </div>) : (filteredOrders.map(order => {
            const isExpanded = expandedOrderId === order.id;
            const isBeingTracked = trackedOrderId === order.id;
            return (<div key={order.id} className={`rounded-xl border bg-white shadow-2xs overflow-hidden transition-all ${isBeingTracked ? 'border-cyan-500 ring-2 ring-cyan-100' : 'border-slate-200'}`}>
                  {/* Order Summary Row */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-start sm:items-center gap-4">
                      <button onClick={() => setExpandedOrderId(isExpanded ? null : order.id)} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 mt-1 sm:mt-0" title={isExpanded ? 'Collapse order' : 'Expand order'}>
                        {isExpanded ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}
                      </button>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900 font-mono">
                            {order.orderNumber}
                          </span>
                          {getStatusBadge(order.status)}
                          {isBeingTracked && (<span className="rounded bg-cyan-700 text-white px-2 py-0.2 text-[10px] font-bold">
                              Tracked in Timeline
                            </span>)}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Placed: <span className="font-mono">{formatDateTime(order.placedAt)}</span> · Payment: <strong className="text-slate-700">{order.paymentMethod}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="text-right sm:mr-2">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Amount</div>
                        <div className="font-mono font-bold text-sm text-cyan-900">
                          {formatNPR(order.totalAmount)}
                        </div>
                      </div>

                      {/* Select as Tracked Order Button */}
                      {!isBeingTracked && (<button onClick={() => {
                        setTrackedOrderId(order.id);
                        window.scrollTo({ top: 160, behavior: 'smooth' });
                    }} className="flex items-center gap-1 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-800 hover:bg-cyan-100 transition-colors">
                          <Truck className="h-3.5 w-3.5 text-cyan-600"/>
                          <span>Track Live</span>
                        </button>)}

                      {/* 1-Click Reorder Button */}
                      <button onClick={e => handleReorderAll(order, e)} className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs" title="Reorder all items in this purchase order">
                        <RotateCcw className="h-3.5 w-3.5 text-cyan-600"/>
                        <span>Reorder</span>
                      </button>

                      {/* View Invoice Button */}
                      {order.invoiceId && (<button onClick={() => setSelectedInvoiceId(order.invoiceId)} className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs">
                          <FileText className="h-3.5 w-3.5 text-cyan-400"/>
                          <span>Tax Invoice</span>
                        </button>)}
                    </div>
                  </div>

                  {/* Expanded Details: Line items & Status Timeline */}
                  {isExpanded && (<div className="p-4 sm:p-6 space-y-6">
                      
                      {/* Mini inline timeline inside card */}
                      <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                        <div className="text-[11px] font-bold uppercase text-slate-500 mb-3">
                          Stage Progress Overview
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className={`p-2 rounded border ${['PLACED', 'UNDER_REVIEW', 'CONFIRMED', 'PACKED', 'DISPATCHED', 'DELIVERED'].includes(order.status)
                        ? 'bg-white border-emerald-300 text-slate-900'
                        : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                            <div className="font-bold text-[11px]">1. Placed</div>
                            <div className="text-[10px] text-slate-500">Order confirmed</div>
                          </div>

                          <div className={`p-2 rounded border ${['CONFIRMED', 'PACKED', 'DISPATCHED', 'DELIVERED'].includes(order.status)
                        ? 'bg-white border-emerald-300 text-slate-900'
                        : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                            <div className="font-bold text-[11px]">2. Processing</div>
                            <div className="text-[10px] text-slate-500">FEFO pack & seal</div>
                          </div>

                          <div className={`p-2 rounded border ${['DISPATCHED', 'DELIVERED'].includes(order.status)
                        ? 'bg-white border-emerald-300 text-slate-900'
                        : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                            <div className="font-bold text-[11px]">3. In Transit</div>
                            <div className="text-[10px] text-slate-500">Route van active</div>
                          </div>

                          <div className={`p-2 rounded border ${order.status === 'DELIVERED'
                        ? 'bg-white border-emerald-300 text-emerald-900'
                        : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                            <div className="font-bold text-[11px]">4. Delivered</div>
                            <div className="text-[10px] text-slate-500">Verified & received</div>
                          </div>
                        </div>
                      </div>

                      {/* Line Items Table */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                          Pharmaceutical Line Items
                        </h4>
                        <div className="rounded-lg border border-slate-200 overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                              <tr>
                                <th className="py-2 px-3">Product & Generic</th>
                                <th className="py-2 px-3">Batch & Expiry</th>
                                <th className="py-2 px-3 text-right">Quantity</th>
                                <th className="py-2 px-3 text-right">Wholesale Rate</th>
                                <th className="py-2 px-3 text-right">Line Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {order.items.map((item, idx) => (<tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="py-2.5 px-3">
                                    <div className="font-semibold text-slate-900">{item.productName}</div>
                                    <div className="text-[10px] text-slate-400 italic">{item.genericName} · {item.packSize}</div>
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                                    <span>{item.batchNumber}</span>
                                    <span className="text-slate-400 ml-1.5">(Exp: {item.expiryDate})</span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono font-medium">{item.quantityFulfilled}</td>
                                  <td className="py-2.5 px-3 text-right font-mono">{formatNPR(item.unitPrice)}</td>
                                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                                    {formatNPR(item.totalPrice)}
                                  </td>
                                </tr>))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Status History Timeline */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                          Detailed Historical Audit Log
                        </h4>
                        <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 pl-8">
                          {order.statusHistory.map((step, idx) => (<div key={idx} className="relative">
                              <span className="absolute -left-8 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-600 ring-4 ring-white text-[9px] text-white">
                                ✓
                              </span>
                              <div className="text-xs">
                                <span className="font-bold text-slate-900">{step.status}</span>
                                <span className="text-slate-400 ml-2 font-mono text-[11px]">
                                  {formatDateTime(step.timestamp)}
                                </span>
                                <div className="text-slate-600 mt-0.5">{step.note}</div>
                                <div className="text-[10px] text-slate-400 font-mono">By: {step.updatedBy}</div>
                              </div>
                            </div>))}
                        </div>
                      </div>

                    </div>)}
                </div>);
        }))}
        </div>
      </section>

      {/* Invoice Modal Preview */}
      {selectedInvoice && (<InvoiceViewModal invoice={selectedInvoice} onClose={() => setSelectedInvoiceId(null)}/>)}

      {/* Monthly Summary Export Modal */}
      {isMonthlySummaryOpen && (<MonthlySummaryModal onClose={() => setIsMonthlySummaryOpen(false)}/>)}

    </div>);
};
