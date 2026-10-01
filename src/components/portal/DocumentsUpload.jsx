import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatDate, getExpiryStatus } from '../../utils/formatters';
import { FileText, Upload, CheckCircle2 } from 'lucide-react';
export const DocumentsUpload = () => {
    const { activeCustomer, uploadCustomerDocument } = useAuth();
    const [uploadSuccess, setUploadSuccess] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedDocType, setSelectedDocType] = useState('pharmacy_license');
    const documents = activeCustomer?.documents || [];
    const handleSimulateUpload = (e) => {
        e.preventDefault();
        if (!activeCustomer)
            return;
        setIsUploading(true);
        setTimeout(() => {
            const docTitles = {
                pharmacy_license: 'Renewed DDA Pharmacy Retail License',
                pan_vat_certificate: 'Updated IRD PAN/VAT Registration Certificate',
                pharmacist_council_cert: 'Nepal Pharmacy Council Pharmacist Certificate',
                other_supporting: 'Authorized Entity Power of Attorney',
            };
            uploadCustomerDocument(activeCustomer.id, {
                type: selectedDocType,
                title: docTitles[selectedDocType] || 'Supporting Compliance Document',
                fileName: `${selectedDocType}_renewal_2026.pdf`,
                expiryDate: '2028-12-31',
            });
            setIsUploading(false);
            setUploadSuccess('Document successfully uploaded and queued for verification by Janakpur compliance officer.');
            setTimeout(() => setUploadSuccess(null), 5000);
        }, 600);
    };
    return (<div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">
          Regulatory Compliance & License Vault
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Maintain active Department of Drug Administration licenses and Nepal Pharmacy Council certifications to preserve uninterrupted wholesale ordering privileges.
        </p>
      </div>

      {uploadSuccess && (<div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0"/>
          <span>{uploadSuccess}</span>
        </div>)}

      {/* Expiry Warning Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {documents.map(doc => {
            const expiryInfo = doc.expiryDate ? getExpiryStatus(doc.expiryDate) : null;
            return (<div key={doc.id} className={`rounded-xl border p-4 flex flex-col justify-between bg-white shadow-2xs ${expiryInfo?.status === 'EXPIRED'
                    ? 'border-rose-300 bg-rose-50/30'
                    : expiryInfo?.status === 'CRITICAL'
                        ? 'border-amber-300 bg-amber-50/30'
                        : 'border-slate-200'}`}>
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-slate-500 shrink-0"/>
                    <span className="font-bold text-xs text-slate-900 line-clamp-1">{doc.title}</span>
                  </div>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${doc.status === 'VERIFIED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : doc.status === 'EXPIRED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'}`}>
                    {doc.status}
                  </span>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <div>File: <span className="font-mono text-slate-700">{doc.fileName}</span> ({doc.fileSize})</div>
                  <div>Uploaded: <span className="font-mono text-slate-700">{formatDate(doc.uploadDate)}</span></div>
                  {doc.expiryDate && (<div className="flex items-center gap-1 font-medium">
                      <span>Valid until:</span>
                      <span className="font-mono text-slate-900">{formatDate(doc.expiryDate)}</span>
                      {expiryInfo && (<span className={`ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded ${expiryInfo.status === 'EXPIRED'
                            ? 'bg-rose-600 text-white'
                            : expiryInfo.status === 'CRITICAL'
                                ? 'bg-amber-500 text-white'
                                : 'text-slate-400'}`}>
                          {expiryInfo.label}
                        </span>)}
                    </div>)}
                </div>
              </div>

              {doc.rejectionReason && (<div className="mt-3 rounded bg-rose-50 p-2 text-[11px] text-rose-700 border border-rose-200">
                  <strong>Officer Remark:</strong> {doc.rejectionReason}
                </div>)}
            </div>);
        })}
      </div>

      {/* Upload Renewal / Document Replacement Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Upload className="h-4 w-4 text-cyan-600"/>
          <span>Upload License Renewal or Supporting Document</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Upload official PDF or high-resolution scan (max 10MB) for compliance officer verification.
        </p>

        <form onSubmit={handleSimulateUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Document Category
              </label>
              <select value={selectedDocType} onChange={e => setSelectedDocType(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none">
                <option value="pharmacy_license">DDA Pharmacy Registration / Renewal</option>
                <option value="pan_vat_certificate">Inland Revenue Department PAN/VAT</option>
                <option value="pharmacist_council_cert">Nepal Pharmacy Council Certificate</option>
                <option value="other_supporting">Other Hospital / Clinical License</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                New Expiry Date
              </label>
              <input type="date" defaultValue="2028-12-31" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none"/>
            </div>
          </div>

          <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center hover:border-slate-300 transition-colors">
            <Upload className="mx-auto h-8 w-8 text-slate-400 stroke-[1.5]"/>
            <div className="mt-2 text-xs font-semibold text-slate-800">
              Select PDF, JPG, or PNG file
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Secure, private encrypted storage · Only authorized compliance officers have audit access
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={isUploading} className="rounded-lg bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow">
              {isUploading ? 'Submitting to Queue...' : 'Upload & Submit for Audit'}
            </button>
          </div>
        </form>
      </div>

    </div>);
};
