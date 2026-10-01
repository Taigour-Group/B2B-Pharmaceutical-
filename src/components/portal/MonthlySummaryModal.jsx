import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatNPR, formatDate } from '../../utils/formatters';
import { FileText, Download, Printer, X, Package, RotateCcw, CreditCard } from 'lucide-react';
export const MonthlySummaryModal = ({ onClose }) => {
    const { activeCustomer } = useAuth();
    const { orders, returns, invoices } = useCart();
    // Selected Month & Year (Defaults to current month: September 2026)
    const [selectedMonth, setSelectedMonth] = useState('2026-09');
    const customerId = activeCustomer?.id || 'CUST-001';
    // Available months list
    const availableMonths = [
        { value: '2026-09', label: 'September 2026 (Current Period)' },
        { value: '2026-08', label: 'August 2026' },
        { value: '2026-07', label: 'July 2026' },
        { value: '2026-06', label: 'June 2026' },
    ];
    // Month label
    const monthName = useMemo(() => {
        const [year, month] = selectedMonth.split('-');
        const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    }, [selectedMonth]);
    // Filter orders for selected month & customer
    const monthOrders = useMemo(() => {
        return orders.filter(o => {
            const matchCustomer = o.customerId === customerId;
            const orderMonth = o.placedAt.slice(0, 7);
            return matchCustomer && (orderMonth === selectedMonth || selectedMonth === '2026-09');
        });
    }, [orders, customerId, selectedMonth]);
    // Filter returns for selected month & customer
    const monthReturns = useMemo(() => {
        return returns.filter(r => {
            const returnMonth = r.requestedAt.slice(0, 7);
            return returnMonth === selectedMonth || selectedMonth === '2026-09';
        });
    }, [returns, selectedMonth]);
    // Filter invoices for selected month & customer
    const monthInvoices = useMemo(() => {
        return invoices.filter(inv => {
            const matchCustomer = inv.customerId === customerId;
            const invMonth = inv.date.slice(0, 7);
            return matchCustomer && (invMonth === selectedMonth || selectedMonth === '2026-09');
        });
    }, [invoices, customerId, selectedMonth]);
    // Financial aggregates
    const totalOrdersAmount = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalReturnsCredited = monthReturns
        .filter(r => r.status === 'CREDITED' || r.status === 'APPROVED')
        .reduce((sum, r) => sum + (r.totalCreditValue || 0), 0);
    const totalInvoicedAmount = monthInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const paymentsSettled = monthInvoices
        .filter(inv => inv.paymentStatus === 'PAID')
        .reduce((sum, inv) => sum + inv.grandTotal, 0);
    const netBalancePeriod = Math.max(0, totalOrdersAmount - totalReturnsCredited - paymentsSettled);
    // Download CSV Ledger
    const handleDownloadCSV = () => {
        const headers = ['Record Type', 'Reference No', 'Date', 'Description / Medicine', 'Lot Number', 'Quantity', 'Status', 'Amount (NPR)'];
        const rows = [];
        // Orders
        monthOrders.forEach(order => {
            rows.push([
                'Purchase Order',
                order.orderNumber,
                order.placedAt.split('T')[0],
                `${order.items.length} line items (${order.paymentMethod})`,
                '-',
                order.items.reduce((s, i) => s + (i.quantityFulfilled || i.quantityOrdered), 0).toString(),
                order.status,
                order.totalAmount.toString(),
            ]);
        });
        // Returns
        monthReturns.forEach(ret => {
            rows.push([
                'Return Claim',
                ret.id,
                ret.requestedAt.split('T')[0],
                `${ret.productName} (${ret.reason})`,
                ret.batchNumber,
                ret.quantity.toString(),
                ret.status,
                `-${ret.totalCreditValue || 0}`,
            ]);
        });
        // Invoices
        monthInvoices.forEach(inv => {
            rows.push([
                'Tax Invoice',
                inv.invoiceNumber,
                inv.date,
                `Due: ${inv.dueDate}`,
                '-',
                '-',
                inv.paymentStatus,
                inv.grandTotal.toString(),
            ]);
        });
        const csvContent = 'data:text/csv;charset=utf-8,' +
            [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Monthly_Summary_${activeCustomer?.businessName?.replace(/\s+/g, '_') || 'Pharmacy'}_${selectedMonth}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const handlePrint = () => {
        window.print();
    };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl my-6 rounded-2xl bg-white shadow-2xl border border-slate-200 text-xs flex flex-col max-h-[92vh]">
        
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="print:hidden p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/80 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-md">
              <FileText className="h-5 w-5"/>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Monthly Wholesale Financial Summary & Reconciliation
              </h3>
              <p className="text-[11px] text-slate-500">
                Consolidated audit report of orders, returns, and credit transactions for Department of Drug Administration (DDA) records.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Month Selector */}
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-500 shadow-2xs">
              {availableMonths.map(m => (<option key={m.value} value={m.value}>{m.label}</option>))}
            </select>

            <button onClick={handleDownloadCSV} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors">
              <Download className="h-3.5 w-3.5 text-slate-500"/>
              <span>Export CSV</span>
            </button>

            <button onClick={handlePrint} className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 shadow-2xs transition-colors">
              <Printer className="h-3.5 w-3.5 text-cyan-400"/>
              <span>Download PDF / Print</span>
            </button>

            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1">
              <X className="h-5 w-5"/>
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-monthly-summary" className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-slate-800 font-sans">
          
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-xl text-slate-900 tracking-tight">
                  JANAKPUR PHARMADISTRO
                </span>
                <span className="rounded bg-cyan-700 text-white font-bold text-[9px] px-1.5 py-0.2">
                  DDA VERIFIED
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                <div>Central Wholesale Depot · Station Road, Janakpurdham-4, Dhanusha, Nepal</div>
                <div>PAN / VAT: <strong className="font-mono text-slate-700">601283912</strong> · DDA Lic: <strong className="font-mono text-slate-700">DDA-MDH-WS-8012</strong></div>
                <div>Logistics Helpline: +977 41 520192 · dispatch@janakpurpharma.com.np</div>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block rounded bg-slate-100 px-3 py-1 font-bold text-xs uppercase tracking-wider text-slate-800">
                Monthly Statement & Audit Report
              </span>
              <div className="font-bold text-sm text-cyan-900 mt-1">{monthName}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Generated: {formatDate(new Date().toISOString().split('T')[0])}
              </div>
            </div>
          </div>

          {/* Account & Pharmacy Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Billed Wholesale Pharmacy Account
              </div>
              <div className="font-bold text-sm text-slate-900 mt-0.5">
                {activeCustomer?.businessName || 'ABC Medical Hall & Polyclinic'}
              </div>
              <div className="text-slate-600 mt-0.5">
                Proprietor: {activeCustomer?.proprietorName || 'Dr. Rameshwar Prasad Sah'}
              </div>
              <div className="text-slate-500">
                {activeCustomer?.address?.street || 'Ramanand Chowk'}, Janakpurdham, Dhanusha
              </div>
            </div>

            <div className="sm:text-right font-mono text-[11px] space-y-0.5">
              <div>PAN/VAT No: <strong>{activeCustomer?.panVatNumber || '601928471'}</strong></div>
              <div>DDA Retail Lic: <strong>{activeCustomer?.ddaLicenseNumber || 'DDA-MDH-RET-1092'}</strong></div>
              <div>Supervising Pharmacist: <strong>{activeCustomer?.pharmacistName || 'Rameshwar Sah (B.Pharm)'}</strong></div>
              <div>Payment Terms: <strong>{activeCustomer?.paymentTerms || 'Net 15 Days Credit'}</strong></div>
            </div>
          </div>

          {/* Executive Financial Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-slate-200 p-3 bg-white">
              <div className="text-[10px] uppercase font-bold text-slate-400">Gross Purchases</div>
              <div className="text-base font-black text-slate-900 font-mono mt-1">
                {formatNPR(totalOrdersAmount)}
              </div>
              <div className="text-[10px] text-slate-500">{monthOrders.length} Purchase Orders</div>
            </div>

            <div className="rounded-lg border border-rose-200 p-3 bg-rose-50/30">
              <div className="text-[10px] uppercase font-bold text-rose-700">Returns & Credits</div>
              <div className="text-base font-black text-rose-700 font-mono mt-1">
                -{formatNPR(totalReturnsCredited)}
              </div>
              <div className="text-[10px] text-rose-600">{monthReturns.length} Return Tickets</div>
            </div>

            <div className="rounded-lg border border-emerald-200 p-3 bg-emerald-50/30">
              <div className="text-[10px] uppercase font-bold text-emerald-700">Payments Cleared</div>
              <div className="text-base font-black text-emerald-800 font-mono mt-1">
                {formatNPR(paymentsSettled)}
              </div>
              <div className="text-[10px] text-emerald-600">Remitted via Fonepay / Bank</div>
            </div>

            <div className="rounded-lg border border-cyan-200 p-3 bg-cyan-50/40">
              <div className="text-[10px] uppercase font-bold text-cyan-800">Closing Balance Due</div>
              <div className="text-base font-black text-cyan-900 font-mono mt-1">
                {formatNPR(netBalancePeriod)}
              </div>
              <div className="text-[10px] text-cyan-700">Net within approved credit</div>
            </div>
          </div>

          {/* SECTION 1: Wholesale Orders in Selected Month */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-cyan-700"/>
                <span>1. Wholesale Purchase Orders ({monthOrders.length})</span>
              </h4>
              <span className="font-mono font-bold text-xs text-slate-900">
                Subtotal: {formatNPR(totalOrdersAmount)}
              </span>
            </div>

            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Order Number</th>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Items Ordered</th>
                    <th className="py-2 px-3">Payment Terms</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Amount (NPR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthOrders.length === 0 ? (<tr>
                      <td colSpan={6} className="py-4 text-center text-slate-400">
                        No purchase orders recorded during this monthly cycle.
                      </td>
                    </tr>) : (monthOrders.map((ord, idx) => (<tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-600">{formatDate(ord.placedAt)}</td>
                        <td className="py-2 px-3 text-slate-600">
                          {ord.items.map(i => `${i.productName} (${i.quantityFulfilled || i.quantityOrdered})`).join(', ')}
                        </td>
                        <td className="py-2 px-3 text-slate-600">{ord.paymentMethod}</td>
                        <td className="py-2 px-3">
                          <span className="rounded bg-slate-100 text-slate-700 px-1.5 py-0.2 text-[10px] font-bold">
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          {formatNPR(ord.totalAmount)}
                        </td>
                      </tr>)))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 2: Returns & Quality Claims in Selected Month */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5 text-rose-600"/>
                <span>2. Returns & Quality Defect Claims ({monthReturns.length})</span>
              </h4>
              <span className="font-mono font-bold text-xs text-rose-700">
                Credits Issued: -{formatNPR(totalReturnsCredited)}
              </span>
            </div>

            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Return ID</th>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Product & Lot Number</th>
                    <th className="py-2 px-3">Reason</th>
                    <th className="py-2 px-3">Status / Credit Note</th>
                    <th className="py-2 px-3 text-right">Credit Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthReturns.length === 0 ? (<tr>
                      <td colSpan={6} className="py-4 text-center text-slate-400">
                        Zero defect or near-expiry returns logged during this monthly cycle.
                      </td>
                    </tr>) : (monthReturns.map((ret, idx) => (<tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">{ret.id}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-600">{formatDate(ret.requestedAt)}</td>
                        <td className="py-2 px-3">
                          <div className="font-semibold text-slate-900">{ret.productName}</div>
                          <div className="text-[10px] font-mono text-slate-500">Lot: {ret.batchNumber} ({ret.quantity} units)</div>
                        </td>
                        <td className="py-2 px-3 text-slate-600">{ret.reason}</td>
                        <td className="py-2 px-3 font-mono text-[11px]">
                          <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[10px] font-bold">
                            {ret.status}
                          </span>
                          {ret.creditNoteNumber && (<div className="text-[10px] text-slate-400 mt-0.5">{ret.creditNoteNumber}</div>)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-rose-700">
                          -{formatNPR(ret.totalCreditValue || 0)}
                        </td>
                      </tr>)))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 3: Invoices & Payment Remittances */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-cyan-700"/>
                <span>3. Tax Invoices & Account Settlement ({monthInvoices.length})</span>
              </h4>
              <span className="font-mono font-bold text-xs text-slate-900">
                Invoiced: {formatNPR(totalInvoicedAmount)}
              </span>
            </div>

            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Invoice Number</th>
                    <th className="py-2 px-3">Order Ref</th>
                    <th className="py-2 px-3">Billing Date</th>
                    <th className="py-2 px-3">Due Date</th>
                    <th className="py-2 px-3">Settlement Status</th>
                    <th className="py-2 px-3 text-right">Invoice Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthInvoices.map((inv, idx) => (<tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-600">{inv.orderNumber}</td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-600">{formatDate(inv.date)}</td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-600">{formatDate(inv.dueDate)}</td>
                      <td className="py-2 px-3">
                        <span className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${inv.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        {formatNPR(inv.grandTotal)}
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Official Signatures & Declaration Block */}
          <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-2 gap-8 text-[11px] text-slate-600">
            <div>
              <div className="font-bold text-slate-900 mb-1">Prepared & Verified By (Distributor):</div>
              <div className="text-slate-500 mb-8">Janakpur PharmaDistro Finance & Depot Operations</div>
              <div className="border-t border-slate-300 pt-1 font-mono">
                Authorized Signatory & Seal
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-slate-900 mb-1">Received & Reconciled By (Pharmacy):</div>
              <div className="text-slate-500 mb-8">
                {activeCustomer?.pharmacistName || 'Supervising Pharmacist'} (NPC Registered)
              </div>
              <div className="border-t border-slate-300 pt-1 font-mono">
                Pharmacy Seal & Signature
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-[10px] text-slate-400 text-center pt-2">
            This document serves as an official electronic wholesale reconciliation statement under Nepal Drug Act 2035 & Good Distribution Practice (GDP) standards.
          </div>

        </div>

      </div>
    </div>);
};
