import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatNPR, formatDate } from '../../utils/formatters';
import { CheckCircle2, FileText } from 'lucide-react';
import { MonthlySummaryModal } from './MonthlySummaryModal';
export const CreditLedger = () => {
    const { activeCustomer } = useAuth();
    const { invoices } = useCart();
    const [paymentNotice, setPaymentNotice] = useState(null);
    const [isMonthlySummaryOpen, setIsMonthlySummaryOpen] = useState(false);
    const creditLimit = activeCustomer?.creditLimit || 250000;
    const usedCredit = activeCustomer?.usedCredit || 64500;
    const availableCredit = Math.max(0, creditLimit - usedCredit);
    const utilizationPct = Math.min(100, Math.round((usedCredit / creditLimit) * 100));
    // Customer invoices
    const customerInvoices = invoices.filter(inv => inv.customerId === (activeCustomer?.id || 'CUST-001'));
    const handleSimulatePayment = () => {
        setPaymentNotice('Payment reference submitted to Janakpur PharmaDistro accounts department for clearance.');
        setTimeout(() => setPaymentNotice(null), 5000);
    };
    return (<div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Wholesale Credit Ledger & Payment History</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Authorized credit limit, outstanding balances, and settlement receipts for {activeCustomer?.businessName}.
          </p>
        </div>

        <button onClick={() => setIsMonthlySummaryOpen(true)} className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-2xs self-start sm:self-auto">
          <FileText className="h-4 w-4 text-cyan-400"/>
          <span>Export Monthly Summary (PDF)</span>
        </button>
      </div>

      {paymentNotice && (<div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0"/>
          <span>{paymentNotice}</span>
        </div>)}

      {/* Credit Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Credit Limit */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Approved Credit Limit
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {formatNPR(creditLimit)}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Terms: <strong className="text-slate-700">{activeCustomer?.paymentTerms || 'Net 15 Days'}</strong>
          </div>
        </div>

        {/* Card 2: Used Credit */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Outstanding Balance (Used)
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 font-mono">
            {formatNPR(usedCredit)}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Utilization: <strong className="text-slate-700">{utilizationPct}% of limit</strong>
          </div>
        </div>

        {/* Card 3: Available Credit */}
        <div className="rounded-xl border border-cyan-200 bg-cyan-50/50 p-5 shadow-2xs">
          <div className="text-[11px] font-bold text-cyan-800 uppercase tracking-wider">
            Available Credit for Orders
          </div>
          <div className="mt-2 text-2xl font-black text-cyan-900 font-mono">
            {formatNPR(availableCredit)}
          </div>
          <div className="mt-2 text-xs text-cyan-700">
            Available for immediate wholesale dispatch
          </div>
        </div>

      </div>

      {/* Utilization Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-2">
        <div className="flex justify-between text-xs text-slate-600 font-medium">
          <span>Credit Utilization</span>
          <span className="font-mono">{formatNPR(usedCredit)} / {formatNPR(creditLimit)} ({utilizationPct}%)</span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${utilizationPct > 80 ? 'bg-amber-500' : 'bg-cyan-600'}`} style={{ width: `${utilizationPct}%` }}/>
        </div>
      </div>

      {/* Invoices & Settlement Records */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Invoiced Accounts & Settlement History
          </h3>
          <button onClick={handleSimulatePayment} className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs">
            + Notify Fonepay / Bank Payment
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice Number</th>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Amount (NPR)</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customerInvoices.map((inv, idx) => (<tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{inv.orderNumber}</td>
                  <td className="py-3 px-4 text-slate-600">{formatDate(inv.date)}</td>
                  <td className="py-3 px-4 text-slate-600">{formatDate(inv.dueDate)}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {formatNPR(inv.grandTotal)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${inv.paymentStatus === 'PAID'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'}`}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Summary Export Modal */}
      {isMonthlySummaryOpen && (<MonthlySummaryModal onClose={() => setIsMonthlySummaryOpen(false)}/>)}

    </div>);
};
