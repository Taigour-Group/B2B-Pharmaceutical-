import React, { useState } from 'react';
import { DISTRIBUTOR_INFO } from '../../data/seedData';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
export const ContactSection = () => {
    const [submitted, setSubmitted] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
    };
    return (<div className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Direct Info */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-700 mb-1">
                Direct Distributor Contact
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Janakpur Central Depot & Orders Desk
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                Connect with our pharmaceutical supply coordinators for urgent ICU requisitions, hospital tenders, or contract pricing.
              </p>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-3.5">
                <MapPin className="h-5 w-5 text-cyan-600 shrink-0 mt-0.5"/>
                <div>
                  <div className="font-bold text-slate-900">Main Warehouse & Dispatch Office</div>
                  <div className="text-slate-500 mt-0.5">{DISTRIBUTOR_INFO.address}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-3.5">
                <Phone className="h-5 w-5 text-cyan-600 shrink-0 mt-0.5"/>
                <div>
                  <div className="font-bold text-slate-900">Orders Desk & Urgent Cold Chain Support</div>
                  <div className="text-slate-500 mt-0.5 font-mono">{DISTRIBUTOR_INFO.phone} · {DISTRIBUTOR_INFO.mobile}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-3.5">
                <Mail className="h-5 w-5 text-cyan-600 shrink-0 mt-0.5"/>
                <div>
                  <div className="font-bold text-slate-900">Official Correspondence</div>
                  <div className="text-slate-500 mt-0.5 font-mono">{DISTRIBUTOR_INFO.email}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-3.5">
                <Clock className="h-5 w-5 text-cyan-600 shrink-0 mt-0.5"/>
                <div>
                  <div className="font-bold text-slate-900">Operating Schedule</div>
                  <div className="text-slate-500 mt-0.5">{DISTRIBUTOR_INFO.operatingHours}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Send Wholesale Inquiry or Quotation Request
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Our sales manager will respond within 2 hours during active business hours.
            </p>

            {submitted ? (<div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center text-xs text-emerald-800 space-y-2 animate-in fade-in">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600"/>
                <div className="font-bold text-sm">Inquiry Received</div>
                <p>Our Janakpur wholesale coordinator will contact your pharmacy shortly.</p>
              </div>) : (<form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Pharmacy / Business Name *</label>
                    <input type="text" required placeholder="e.g. Mithila Medical Hall" className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-800 focus:outline-none focus:border-cyan-500"/>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Phone Number *</label>
                    <input type="text" required placeholder="+977 98..." className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-800 focus:outline-none focus:border-cyan-500"/>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">DDA License No. (if registered)</label>
                    <input type="text" placeholder="e.g. DDA-MDH-RET-..." className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-800 font-mono focus:outline-none focus:border-cyan-500"/>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Location / Chowk in Janakpur</label>
                    <input type="text" placeholder="e.g. Ramanand Chowk, Janakpur" className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-800 focus:outline-none focus:border-cyan-500"/>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Product Inquiries or Order Requirements</label>
                  <textarea rows={3} placeholder="List specific medications, antibiotic lines, or bulk cold chain requirement..." className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-800 focus:outline-none focus:border-cyan-500"/>
                </div>

                <div className="pt-2 flex justify-end">
                  <button type="submit" className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow">
                    <Send className="h-3.5 w-3.5"/>
                    <span>Submit Inquiry</span>
                  </button>
                </div>
              </form>)}
          </div>

        </div>

      </div>
    </div>);
};
