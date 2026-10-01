import React from 'react';
import { ArrowRight, BadgeCheck, MapPin, ShieldCheck } from 'lucide-react';
export const HeroSection = ({ onOpenRegister, onGoToPortal }) => {
    return (<section className="mx-auto w-full max-w-[1440px] px-4 pt-5 sm:px-6 lg:px-8">
      <div className="relative isolate overflow-hidden rounded-lg border border-slate-300 bg-slate-950 text-white">
        <img src="/src/assets/images/pharma_warehouse_hero_1790830663162.jpg" alt="Janakpur PharmaDistro wholesale warehouse" referrerPolicy="no-referrer" className="absolute inset-0 -z-20 h-full w-full object-cover object-center"/>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#071c2d] via-[#071c2d]/90 to-[#071c2d]/25"/>
        <div className="flex min-h-36 flex-col justify-between gap-5 p-5 sm:min-h-40 sm:flex-row sm:items-center sm:px-7 sm:py-6">
          <div className="max-w-2xl">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-cyan-200">
              <MapPin className="h-3.5 w-3.5"/> Janakpur · Madhesh Province
            </div>
            <h1 className="text-2xl font-bold leading-tight sm:text-3xl">Wholesale medicines, delivered reliably.</h1>
            <p className="mt-1.5 text-xs text-slate-200 sm:text-sm">Genuine products, trusted brands, and dependable supply for registered healthcare businesses.</p>
          </div>
          <div className="flex max-w-xs items-center gap-3 rounded-md border border-white/20 bg-white/90 px-3.5 py-3 text-slate-900 shadow-lg backdrop-blur-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-700"><BadgeCheck className="h-5 w-5"/></span>
            <div className="min-w-0">
              <div className="text-xs font-bold">Verified wholesale supply</div>
              <div className="mt-0.5 text-[10px] text-slate-600">DDA licensed · FEFO managed · Cold-chain ready</div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-white/15 bg-[#071c2d]/75 px-5 py-2 text-[10px] text-slate-200 sm:px-7">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-cyan-300"/>DDA Licensed Distributor</span>
          <span>WHO-GMP compliant sourcing</span>
          <button onClick={onGoToPortal} className="ml-auto inline-flex items-center gap-1 font-semibold text-cyan-200 hover:text-white">
            Pharmacy portal <ArrowRight className="h-3 w-3"/>
          </button>
        </div>
      </div>
    </section>);
};
