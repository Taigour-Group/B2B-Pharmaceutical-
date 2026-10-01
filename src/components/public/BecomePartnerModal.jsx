import React, { useState } from 'react';
import { X, AlertCircle, Building2, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
export const BecomePartnerModal = ({ isOpen, onClose, onSuccess }) => {
    const { registerCustomer } = useAuth();
    const [businessName, setBusinessName] = useState('');
    const [proprietorName, setProprietorName] = useState('');
    const [businessType, setBusinessType] = useState('Retail Pharmacy');
    const [phone, setPhone] = useState('+977 98');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [panVatNumber, setPanVatNumber] = useState('');
    const [businessRegNumber, setBusinessRegNumber] = useState('');
    const [ddaLicenseNumber, setDdaLicenseNumber] = useState('DDA-MDH-RET-');
    const [pharmacistName, setPharmacistName] = useState('');
    const [npcRegistrationNumber, setNpcRegistrationNumber] = useState('NPC-');
    const [licenseExpiryDate, setLicenseExpiryDate] = useState('2027-12-31');
    // Address
    const [district, setDistrict] = useState('Dhanusha');
    const [municipality, setMunicipality] = useState('Janakpurdham Sub-Metropolitan');
    const [ward, setWard] = useState('Ward No. 4');
    const [street, setStreet] = useState('Ramanand Chowk');
    const [landmark, setLandmark] = useState('Near Hospital Gate');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    if (!isOpen)
        return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!businessName || !proprietorName || !phone || !email || !password || !panVatNumber || !businessRegNumber || !ddaLicenseNumber || !pharmacistName || !npcRegistrationNumber) {
            setError('Please complete all required pharmacy, contact, and account fields.');
            return;
        }
        setIsSubmitting(true);
        try {
            await registerCustomer({
                businessName,
                proprietorName,
                businessType,
                phone,
                email,
                password,
                panVatNumber,
                businessRegNumber,
                ddaLicenseNumber,
                pharmacistName,
                npcRegistrationNumber,
                licenseExpiryDate,
                address: {
                    province: 'Madhesh Province',
                    district,
                    municipality,
                    ward,
                    street: landmark ? `${street}, ${landmark}` : street,
                },
            });
            onSuccess();
        }
        catch (requestError) {
            setError(requestError.message);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
          <X className="h-5 w-5"/>
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-cyan-400">
            <Building2 className="h-5 w-5"/>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Healthcare Business & Pharmacy Registration
            </h2>
            <p className="text-xs text-slate-500">
              Apply for authorized B2B wholesale medicines purchasing in Janakpur & Madhesh Province.
            </p>
          </div>
        </div>

        {error && (<div className="mb-6 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0"/>
            <span>{error}</span>
          </div>)}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Business Information */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-600"/>
              1. Commercial & Entity Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Pharmacy / Business Trade Name *
                </label>
                <input type="text" required placeholder="e.g. Mithila Medical Hall & Clinic" value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"/>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Proprietor / Managing Director *
                </label>
                <input type="text" required placeholder="e.g. Rajesh Kumar Sah" value={proprietorName} onChange={e => setProprietorName(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"/>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Business Entity Type *
                </label>
                <select value={businessType} onChange={e => setBusinessType(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none">
                  <option value="Retail Pharmacy">Retail Pharmacy</option>
                  <option value="Hospital Pharmacy">Hospital Pharmacy</option>
                  <option value="Polyclinic & Medical Hall">Polyclinic & Medical Hall</option>
                  <option value="Diagnostic & Healthcare Center">Diagnostic & Healthcare Center</option>
                  <option value="Wholesale / Sub-distributor">Wholesale / Sub-distributor</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Official Email Address *
                </label>
                <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none"/>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Official Phone / Mobile *
                </label>
                <input type="tel" required autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none"/>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Create Password *
                </label>
                <input type="password" required minLength={12} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none"/>
                <p className="mt-1 text-[10px] text-slate-500">Use at least 12 characters.</p>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  PAN / VAT Number *
                </label>
                <input type="text" required placeholder="9-digit IRD PAN (e.g. 604918231)" value={panVatNumber} onChange={e => setPanVatNumber(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-slate-800 focus:border-cyan-500 focus:outline-none"/>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Business Reg No. (Company Registrar / Cottage)
                </label>
                <input type="text" required placeholder="e.g. 19284/081/082" value={businessRegNumber} onChange={e => setBusinessRegNumber(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none"/>
              </div>
            </div>
          </div>

          {/* Section 2: Pharmaceutical & Regulatory Information */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-600"/>
              2. Pharmacy Compliance & Pharmacist Supervision
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  DDA Pharmacy License Number *
                </label>
                <input type="text" required placeholder="e.g. DDA-MDH-RET-4981" value={ddaLicenseNumber} onChange={e => setDdaLicenseNumber(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-slate-800 focus:border-cyan-500 focus:outline-none"/>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  License Expiry / Renewal Date *
                </label>
                <input type="date" required value={licenseExpiryDate} onChange={e => setLicenseExpiryDate(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none"/>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Authorized Pharmacist / Person Name *
                </label>
                <input type="text" required placeholder="Pharmacist full name" value={pharmacistName} onChange={e => setPharmacistName(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none"/>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nepal Pharmacy Council (NPC) Reg No. *
                </label>
                <input type="text" required placeholder="e.g. NPC-5819-G" value={npcRegistrationNumber} onChange={e => setNpcRegistrationNumber(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-slate-800 focus:border-cyan-500 focus:outline-none"/>
              </div>
            </div>
          </div>

          {/* Section 3: Physical Address Coordinates */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-600"/>
              3. Delivery & Dispatch Address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">District</label>
                <select value={district} onChange={e => setDistrict(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none">
                  <option value="Dhanusha">Dhanusha</option>
                  <option value="Mahottari">Mahottari</option>
                  <option value="Siraha">Siraha</option>
                  <option value="Sarlahi">Sarlahi</option>
                  <option value="Sindhuli">Sindhuli</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Municipality</label>
                <input type="text" value={municipality} onChange={e => setMunicipality(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none"/>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Ward & Street / Chowk</label>
                <input type="text" placeholder="e.g. Ward 4, Ramanand Chowk" value={street} onChange={e => setStreet(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none"/>
              </div>
            </div>
          </div>

          {/* Section 4: Verification documents */}
          <div className="pt-2 border-t border-slate-100">
            <div className="mb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-600"/>
                4. Verification Documents
              </h3>
            </div>
            <p className="rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-3 text-xs leading-relaxed text-slate-700">
              Have your DDA pharmacy license, PAN/VAT certificate, and Nepal Pharmacy Council registration ready. A compliance officer will contact you about document submission after your application is received.
            </p>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-cyan-600"/>
              <span>Keep your DDA, PAN/VAT, and NPC documents ready for compliance review.</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button type="button" onClick={onClose} className="flex-1 sm:flex-none rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none rounded-lg bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow">
                {isSubmitting ? 'Submitting Application...' : 'Submit Pharmacy Application'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>);
};
