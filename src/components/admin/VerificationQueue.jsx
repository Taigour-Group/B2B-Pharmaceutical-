import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';
import { CheckCircle2, FileText, ExternalLink, ChevronRight } from 'lucide-react';
export const VerificationQueue = () => {
    const { customers, updateCustomerStatus } = useAuth();
    const [selectedCustomerId, setSelectedCustomerId] = useState(customers[3]?.id || customers[0]?.id);
    const [internalNote, setInternalNote] = useState('');
    const [feedbackNotice, setFeedbackNotice] = useState(null);
    const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];
    const handleDecision = (status) => {
        if (!selectedCustomer)
            return;
        updateCustomerStatus(selectedCustomer.id, status, internalNote);
        setFeedbackNotice(`Customer ${selectedCustomer.businessName} updated to ${status}.`);
        setInternalNote('');
        setTimeout(() => setFeedbackNotice(null), 4000);
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED':
                return <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">APPROVED</span>;
            case 'UNDER_REVIEW':
                return <span className="rounded bg-cyan-100 text-cyan-800 px-2 py-0.5 text-[10px] font-bold">UNDER REVIEW</span>;
            case 'PENDING':
                return <span className="rounded bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">PENDING AUDIT</span>;
            case 'RESUBMISSION_REQUIRED':
                return <span className="rounded bg-rose-100 text-rose-800 px-2 py-0.5 text-[10px] font-bold">RESUBMIT REQUIRED</span>;
            case 'SUSPENDED':
                return <span className="rounded bg-slate-900 text-white px-2 py-0.5 text-[10px] font-bold">SUSPENDED</span>;
            default:
                return <span className="rounded bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-bold">{status}</span>;
        }
    };
    return (<div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">
          Pharmacy & Healthcare Business Verification Queue
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Mandatory compliance screening: verify DDA retail permits, IRD PAN/VAT numbers, and supervising Nepal Pharmacy Council registrations.
        </p>
      </div>

      {feedbackNotice && (<div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0"/>
          <span>{feedbackNotice}</span>
        </div>)}

      {/* Main Split Layout: Customer List (Left) & Verification File (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Queue List */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
            Applicant Pharmacies ({customers.length})
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {customers.map(c => {
            const isSelected = c.id === selectedCustomerId;
            return (<button key={c.id} onClick={() => setSelectedCustomerId(c.id)} className={`w-full p-3.5 text-left transition-colors flex items-center justify-between ${isSelected ? 'bg-cyan-50/70 border-l-4 border-l-cyan-600' : 'hover:bg-slate-50'}`}>
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 truncate">{c.businessName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {c.address.district} · {c.businessType}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      {getStatusBadge(c.accountStatus)}
                      <span className="text-[10px] text-slate-400 font-mono">DDA: {c.ddaLicenseNumber}</span>
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 shrink-0 ${isSelected ? 'text-cyan-600' : 'text-slate-300'}`}/>
                </button>);
        })}
          </div>
        </div>

        {/* Right: Full Verification Inspector */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
          {selectedCustomer ? (<>
              {/* Header Box */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-900">{selectedCustomer.businessName}</h3>
                    {getStatusBadge(selectedCustomer.accountStatus)}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Customer ID: <span className="font-mono">{selectedCustomer.id}</span> · Proprietor: <strong>{selectedCustomer.proprietorName}</strong>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <div className="text-slate-400 text-[10px]">Assigned Wholesale Limit</div>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    Rs. {selectedCustomer.creditLimit.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Verified Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold">DDA Retail License</span>
                  <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                    {selectedCustomer.ddaLicenseNumber}
                  </div>
                  <div className="text-slate-500 text-[11px]">Valid until: {formatDate(selectedCustomer.licenseExpiryDate)}</div>
                </div>

                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold">IRD PAN / VAT Number</span>
                  <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                    {selectedCustomer.panVatNumber}
                  </div>
                  <div className="text-slate-500 text-[11px]">Registration No: {selectedCustomer.businessRegNumber}</div>
                </div>

                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Supervising Pharmacist</span>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {selectedCustomer.pharmacistName}
                  </div>
                  <div className="font-mono text-slate-500 text-[11px]">
                    Nepal Pharmacy Council (NPC): {selectedCustomer.npcRegistrationNumber}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold">Delivery Coordinates</span>
                  <div className="font-medium text-slate-800 mt-0.5">
                    {selectedCustomer.address.street}, {selectedCustomer.address.ward}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    {selectedCustomer.address.municipality}, {selectedCustomer.address.district}
                  </div>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-cyan-600"/>
                  <span>Submitted Compliance Documents ({selectedCustomer.documents.length})</span>
                </h4>

                <div className="space-y-2">
                  {selectedCustomer.documents.map(doc => (<div key={doc.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <FileText className="h-4 w-4 text-slate-500"/>
                        <div>
                          <div className="font-semibold text-slate-800">{doc.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {doc.fileName} · {doc.fileSize} · Uploaded: {formatDate(doc.uploadDate)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${doc.status === 'VERIFIED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'}`}>
                          {doc.status}
                        </span>

                        <button onClick={() => alert(`Simulated secure preview of: ${doc.title} (${doc.fileName})`)} className="flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50">
                          <ExternalLink className="h-3 w-3"/>
                          <span>View Doc</span>
                        </button>
                      </div>
                    </div>))}
                </div>
              </div>

              {/* Verification Audit Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Compliance Officer Notes / Resubmission Requirement
                </label>
                <textarea rows={2} placeholder="Enter audit notes (e.g. verified with DDA online registry, or state specific correction required)..." value={internalNote} onChange={e => setInternalNote(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-cyan-500 focus:outline-none"/>
              </div>

              {/* Decision Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDecision('SUSPENDED')} className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-1.5 text-xs font-bold hover:bg-rose-100 transition-colors">
                    Suspend Customer
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => handleDecision('RESUBMISSION_REQUIRED')} className="rounded-lg border border-amber-300 bg-amber-50 text-amber-800 px-3.5 py-2 text-xs font-bold hover:bg-amber-100 transition-colors">
                    Request Resubmission
                  </button>

                  <button onClick={() => handleDecision('REJECTED')} className="rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                    Reject Application
                  </button>

                  <button onClick={() => handleDecision('APPROVED')} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow">
                    <CheckCircle2 className="h-4 w-4"/>
                    <span>Approve B2B Wholesale Access</span>
                  </button>
                </div>
              </div>

            </>) : (<div className="text-center py-16 text-slate-400 text-xs">
              Select an applicant pharmacy from the queue to review verification documents.
            </div>)}
        </div>

      </div>

    </div>);
};
