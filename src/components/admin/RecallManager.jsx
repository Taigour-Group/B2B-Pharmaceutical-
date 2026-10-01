import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { formatDate } from '../../utils/formatters';
import { AlertOctagon, CheckCircle2 } from 'lucide-react';
export const RecallManager = () => {
    const { recalls } = useCart();
    const [selectedRecall, setSelectedRecall] = useState(recalls[0]);
    const [notice, setNotice] = useState(null);
    const recoveryPct = Math.round((selectedRecall.unitsRecovered / selectedRecall.unitsSold) * 100);
    const handleSimulateRecallNotice = () => {
        setNotice(`Dispatched high-priority recall alerts to all ${selectedRecall.affectedCustomersCount} pharmacies that received batch ${selectedRecall.batchNumber}.`);
        setTimeout(() => setNotice(null), 5000);
    };
    return (<div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">
          Pharmaceutical Batch Recall Management & Pharmacovigilance
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Track manufacturer or Department of Drug Administration lot recalls, trace dispensing pharmacies, and monitor quarantined stock recovery.
        </p>
      </div>

      {notice && (<div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0"/>
          <span>{notice}</span>
        </div>)}

      {/* Main Recall Card */}
      <div className="rounded-xl border border-rose-200 bg-white shadow-2xs overflow-hidden">
        
        {/* Banner */}
        <div className="bg-rose-50 border-b border-rose-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-600 text-white">
              <AlertOctagon className="h-5 w-5"/>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-slate-900">{selectedRecall.recallCode}</span>
                <span className="rounded bg-rose-600 px-2 py-0.2 text-[10px] font-bold text-white uppercase">
                  {selectedRecall.severity.replace('_', ' ')}
                </span>
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                Initiated: {formatDate(selectedRecall.initiatedAt)} · Status: <strong>{selectedRecall.status}</strong>
              </div>
            </div>
          </div>

          <button onClick={handleSimulateRecallNotice} className="rounded-lg bg-rose-700 px-4 py-2 text-xs font-bold text-white hover:bg-rose-800 transition-colors shadow-2xs whitespace-nowrap">
            Broadcast Recall Alert to Pharmacies
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Target Product</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedRecall.productName}</div>
              <div className="font-mono text-cyan-800 font-bold mt-1">Lot: {selectedRecall.batchNumber}</div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Pharmacies Dispensed</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedRecall.affectedCustomersCount} Medical Establishments</div>
              <div className="text-slate-500 text-[11px] mt-1">Janakpur & Dhanusha area</div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Quarantine Recovery</span>
              <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                {selectedRecall.unitsRecovered} / {selectedRecall.unitsSold} Units ({recoveryPct}%)
              </div>
              <div className="text-emerald-700 font-semibold text-[11px] mt-1">Safe containment in progress</div>
            </div>
          </div>

          {/* Recovery Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>Lot Physical Retrieval Progress</span>
              <span className="font-mono">{recoveryPct}% Recovered</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${recoveryPct}%` }}/>
            </div>
          </div>

          {/* Cause and Protocol Note */}
          <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 text-xs text-slate-700 space-y-1">
            <div className="font-bold text-slate-900">Regulatory Advisory & Reason:</div>
            <p className="leading-relaxed">{selectedRecall.reason}</p>
          </div>

          {/* Affected Pharmacies Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Affected Pharmacy Distribution Log
            </h4>
            <div className="rounded-lg border border-slate-200 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Pharmacy Business</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3 text-right">Units Supplied</th>
                    <th className="py-2.5 px-3 text-right">Units Quarantined / Returned</th>
                    <th className="py-2.5 px-3 text-right">Recall Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">ABC Medical Hall & Polyclinic</td>
                    <td className="py-2.5 px-3 text-slate-600">Ramanand Chowk, Janakpur</td>
                    <td className="py-2.5 px-3 text-right font-mono">50</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">50</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">100% Retrieved</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Janki Hospital Pharmacy Store</td>
                    <td className="py-2.5 px-3 text-slate-600">Hospital Road, Janakpur</td>
                    <td className="py-2.5 px-3 text-right font-mono">120</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">110</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">92% Retrieved</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Mithila Care Medicos</td>
                    <td className="py-2.5 px-3 text-slate-600">Bhanu Chowk, Janakpur</td>
                    <td className="py-2.5 px-3 text-right font-mono">60</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">45</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="rounded bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">75% (Route Van En Route)</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>);
};
