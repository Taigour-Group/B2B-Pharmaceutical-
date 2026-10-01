import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { formatNPR, formatDateTime } from '../../utils/formatters';
import { CheckCircle2, Package, Map } from 'lucide-react';
import { InvoiceViewModal } from '../portal/InvoiceViewModal';
import { JanakpurRouteOptimizer } from './JanakpurRouteOptimizer';
export const OrderProcessing = () => {
    const { orders, invoices, updateOrderStatus } = useCart();
    const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
    const [statusNote, setStatusNote] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [activeSubTab, setActiveSubTab] = useState('optimizer');
    const selectedInvoice = invoices.find(inv => inv.id === selectedInvoiceId);
    const handleUpdateStatus = (orderId, status) => {
        updateOrderStatus(orderId, status, statusNote);
        setFeedback(`Order status advanced to ${status}.`);
        setStatusNote('');
        setTimeout(() => setFeedback(null), 4000);
    };
    return (<div className="space-y-6">
      
      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button onClick={() => setActiveSubTab('optimizer')} className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeSubTab === 'optimizer'
            ? 'bg-slate-900 text-white shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
          <Map className="h-4 w-4 text-cyan-400"/>
          <span>Delivery Route Optimizer & Map</span>
          <span className="rounded bg-cyan-600 text-white text-[9px] font-bold px-1.5 py-0.2">
            AI TSP
          </span>
        </button>

        <button onClick={() => setActiveSubTab('queue')} className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeSubTab === 'queue'
            ? 'bg-slate-900 text-white shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
          <Package className="h-4 w-4"/>
          <span>Wholesale Orders Queue ({orders.length})</span>
        </button>
      </div>

      {feedback && (<div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0"/>
          <span>{feedback}</span>
        </div>)}

      {/* VIEW 1: Route Van Optimizer & Janakpur Map */}
      {activeSubTab === 'optimizer' && <JanakpurRouteOptimizer />}

      {/* VIEW 2: Orders Queue Table */}
      {activeSubTab === 'queue' && (<div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Orders Awaiting Processing & Dispatch ({orders.length})
            </h3>
            <span className="text-xs text-slate-500">
              Advance order statuses through FEFO locking, packing, and route van hand-off
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Order Ref</th>
                    <th className="py-3 px-4">Customer Pharmacy</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4 text-right">Total (NPR)</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4 text-right">Actions & Stage Advancement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map(order => (<tr key={order.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">{order.orderNumber}</div>
                        <div className="text-[10px] text-slate-400">{formatDateTime(order.placedAt)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{order.customerName}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-xs">{order.deliveryAddress}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono">{order.items.length} Products</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {formatNPR(order.totalAmount)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${order.status === 'DELIVERED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.status === 'DISPATCHED'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'PACKED'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {order.status === 'PLACED' && (<button onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')} className="rounded bg-cyan-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-cyan-500">
                              Confirm & Lock
                            </button>)}
                          {order.status === 'CONFIRMED' && (<button onClick={() => handleUpdateStatus(order.id, 'PACKED')} className="rounded bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-indigo-500">
                              Mark Packed
                            </button>)}
                          {order.status === 'PACKED' && (<button onClick={() => handleUpdateStatus(order.id, 'DISPATCHED')} className="rounded bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-500">
                              Dispatch Van
                            </button>)}
                          {order.status === 'DISPATCHED' && (<button onClick={() => handleUpdateStatus(order.id, 'DELIVERED')} className="rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-500">
                              Confirm Delivery
                            </button>)}

                          {order.invoiceId && (<button onClick={() => setSelectedInvoiceId(order.invoiceId)} className="rounded border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">
                              Invoice
                            </button>)}
                        </div>
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          </div>
        </div>)}

      {/* Invoice Modal */}
      {selectedInvoice && (<InvoiceViewModal invoice={selectedInvoice} onClose={() => setSelectedInvoiceId(null)}/>)}

    </div>);
};
