import React from 'react';
import { FileText, UserCheck, ShoppingBag, Truck, ShieldCheck } from 'lucide-react';
export const HowItWorks = ({ onOpenRegister, onGoToPortal }) => {
    const steps = [
        {
            number: '01',
            title: 'Business Registration & Compliance Upload',
            description: 'Submit your pharmacy or hospital details including DDA Registration License, PAN/VAT certificate, and supervising Pharmacist NPC registration.',
            icon: FileText,
            badge: 'Standard Step',
        },
        {
            number: '02',
            title: 'Regulatory Document Verification',
            description: 'Our Janakpur compliance verification officers review license validity, address coordinates, and wholesale trade eligibility within 2 to 4 business hours.',
            icon: UserCheck,
            badge: 'Mandatory Audit',
        },
        {
            number: '03',
            title: 'B2B Wholesale Ordering & FEFO Allocation',
            description: 'Access protected wholesale prices, view real-time batch numbers and expiry dates, add to cart with signature high-speed validation, and place wholesale orders.',
            icon: ShoppingBag,
            badge: 'Guaranteed Fresh Stock',
        },
        {
            number: '04',
            title: 'Invoice, Tamper-Evident Packing & Van Delivery',
            description: 'Generated VAT Tax Invoice with batch breakdown, packed into temperature-controlled crates, and dispatched on scheduled daily routes across Janakpur & Madhesh Province.',
            icon: Truck,
            badge: 'Cold-Chain Certified',
        },
    ];
    return (<section className="bg-slate-50 py-16 border-y border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-700 mb-1">
            B2B Distribution Lifecycle
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Distributor → Verified Pharmacy → Wholesale Order → Dispatch
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            A standardized, fully compliant pharmaceutical distribution workflow designed to eliminate chaotic phone orders, illegible handwriting, and inaccurate stock communication.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(step => (<div key={step.number} className="relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-2xs hover:shadow-sm transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xl font-bold text-cyan-600">
                    {step.number}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    <step.icon className="h-5 w-5"/>
                  </div>
                </div>

                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  {step.badge}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-medium text-cyan-700">
                <ShieldCheck className="h-4 w-4"/>
                <span>GDP Compliant</span>
              </div>
            </div>))}
        </div>

        {/* Call to action card */}
        <div className="mt-14 rounded-2xl bg-slate-900 p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
          <div>
            <h3 className="text-xl font-bold">Ready to streamline your pharmacy stock supply?</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Join over 450 verified healthcare establishments receiving dependable medicine deliveries in Janakpur.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={onOpenRegister} className="rounded-lg bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors">
              Register Pharmacy
            </button>
            <button onClick={onGoToPortal} className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors">
              Test Portal Demo
            </button>
          </div>
        </div>

      </div>
    </section>);
};
