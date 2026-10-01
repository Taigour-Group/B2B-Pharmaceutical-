import React from 'react';
import { DISTRIBUTOR_INFO } from '../../data/seedData';
import { formatNPR, formatDate } from '../../utils/formatters';
import { X, Printer } from 'lucide-react';
export const InvoiceViewModal = ({ invoice, onClose }) => {
    const handlePrint = () => {
        window.print();
    };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 rounded-2xl bg-white shadow-2xl border border-slate-200">
        
        {/* Modal Controls Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-800">
              Tax Invoice Preview: <span className="font-mono text-cyan-800">{invoice.invoiceNumber}</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${invoice.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {invoice.paymentStatus}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs">
              <Printer className="h-3.5 w-3.5"/>
              <span>Print Tax Invoice</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <X className="h-5 w-5"/>
            </button>
          </div>
        </div>

        {/* Printable Nepalese Tax Invoice */}
        <div id="printable-invoice" className="p-8 text-slate-900 bg-white text-xs">
          
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] uppercase font-bold text-cyan-700 tracking-wider">
                  Inland Revenue Department (IRD) Nepal Compliant
                </div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {DISTRIBUTOR_INFO.name}
                </h1>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  {DISTRIBUTOR_INFO.address}
                </p>
                <div className="text-[11px] text-slate-700 space-x-3 mt-1 font-mono">
                  <span>PAN/VAT: <strong>{DISTRIBUTOR_INFO.panVat}</strong></span>
                  <span>·</span>
                  <span>DDA License: <strong>{DISTRIBUTOR_INFO.ddaLicense}</strong></span>
                  <span>·</span>
                  <span>Phone: <strong>{DISTRIBUTOR_INFO.phone}</strong></span>
                </div>
              </div>

              <div className="text-right">
                <div className="rounded border border-slate-900 px-3 py-1 text-center font-bold text-slate-900 text-sm tracking-wider uppercase">
                  TAX INVOICE
                </div>
                <div className="text-[11px] font-mono mt-1 text-slate-500">
                  Original for Buyer
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Meta and Buyer Details */}
          <div className="grid grid-cols-2 gap-4 pb-4 mb-4 border-b border-slate-200">
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">Buyer Information</div>
              <div className="font-bold text-sm text-slate-900 mt-0.5">{invoice.customerName}</div>
              <div className="text-slate-600 mt-0.5">{invoice.customerAddress}</div>
              <div className="font-mono text-slate-700 mt-1">
                Buyer PAN/VAT: <strong>{invoice.customerPan}</strong>
              </div>
              <div className="font-mono text-slate-600 text-[11px]">
                DDA Retail License: {invoice.customerDda}
              </div>
            </div>

            <div className="text-right space-y-1 font-mono text-[11px]">
              <div>Invoice No: <strong className="text-slate-900">{invoice.invoiceNumber}</strong></div>
              <div>Order Ref: <strong>{invoice.orderNumber}</strong></div>
              <div>Invoice Date: <strong>{formatDate(invoice.date)}</strong></div>
              <div>Due Date: <strong>{formatDate(invoice.dueDate)}</strong></div>
              <div>Terms: <strong>{invoice.paymentMethod}</strong></div>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-left border-collapse mb-4">
            <thead>
              <tr className="border-b border-slate-900 text-[10px] uppercase font-bold text-slate-600">
                <th className="py-2 w-8">S.N.</th>
                <th className="py-2">Description of Goods (Brand & Generic)</th>
                <th className="py-2 font-mono">Batch No.</th>
                <th className="py-2 font-mono">Exp Date</th>
                <th className="py-2">Pack</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Rate (Rs.)</th>
                <th className="py-2 text-right">Total (Rs.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {invoice.items.map((item, idx) => (<tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2.5 font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-2.5">
                    <div className="font-semibold text-slate-900">{item.productName}</div>
                    <div className="text-[10px] text-slate-500 italic">{item.genericName}</div>
                  </td>
                  <td className="py-2.5 font-mono text-slate-700">{item.batchNumber}</td>
                  <td className="py-2.5 font-mono text-slate-600">{item.expiryDate}</td>
                  <td className="py-2.5 text-slate-600">{item.packSize}</td>
                  <td className="py-2.5 text-right font-mono font-medium">{item.quantityFulfilled}</td>
                  <td className="py-2.5 text-right font-mono">{formatNPR(item.unitPrice).replace('Rs. ', '')}</td>
                  <td className="py-2.5 text-right font-mono font-semibold">{formatNPR(item.totalPrice).replace('Rs. ', '')}</td>
                </tr>))}
            </tbody>
          </table>

          {/* Totals & Tax Calculation */}
          <div className="border-t border-slate-900 pt-3 mb-6">
            <div className="flex justify-between items-start">
              <div className="max-w-xs text-[11px] text-slate-500 space-y-1">
                <div>* Essential Medicines are VAT exempt per Nepal Finance Act Schedule 1.</div>
                <div>Goods once sold can only be returned per DDA batch recall protocol.</div>
              </div>

              <div className="w-64 space-y-1.5 text-right font-mono text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Subtotal:</span>
                  <span>{formatNPR(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>VAT Amount (0%):</span>
                  <span>Rs. 0.00</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-slate-200 pt-1.5">
                  <span>Grand Total:</span>
                  <span className="text-cyan-900">{formatNPR(invoice.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="h-10"/>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">
                Customer Signature & Pharmacy Seal
              </div>
            </div>
            <div>
              <div className="h-10 flex items-center justify-center">
                <span className="font-serif italic text-cyan-800 text-sm font-bold opacity-70">
                  Janakpur PharmaDistro (Auth Sign)
                </span>
              </div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">
                For Janakpur PharmaDistro Pvt. Ltd.
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>);
};
