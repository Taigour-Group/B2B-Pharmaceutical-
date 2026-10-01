import React from 'react';
import { DISTRIBUTOR_INFO } from '../../data/seedData';
import { ShieldCheck, Phone, MapPin, Mail, Clock, CheckCircle2 } from 'lucide-react';
export const Footer = () => {
    return (<footer className="border-t border-slate-700 bg-[#091d30] text-slate-300 text-sm">
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Column 1: Distributor Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-cyan-400 text-[#092137] font-bold text-sm">
                JP
              </div>
              <span className="font-bold tracking-tight text-white text-sm">
                {DISTRIBUTOR_INFO.shortName}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Authorized wholesale distributor of certified pharmaceuticals, surgical supplies, and hospital diagnostic items serving registered healthcare businesses in Madhesh Province.
            </p>
            <div className="space-y-1 pt-1 text-[10px] text-slate-400">
              <div>DDA Wholesale License: <span className="font-semibold text-slate-200">{DISTRIBUTOR_INFO.ddaLicense}</span></div>
              <div>PAN/VAT No: <span className="font-semibold text-slate-200">{DISTRIBUTOR_INFO.panVat}</span></div>
            </div>
          </div>

          {/* Column 2: Logistics & Coverage */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white">
              <MapPin className="h-3.5 w-3.5 text-cyan-300"/>
              Distribution Network
            </h4>
            <ul className="space-y-1.5 text-[10px] leading-relaxed text-slate-400">
              <li>Janakpurdham Sub-Metropolitan</li>
              <li>Dhanusha District (Sakhuwa, Dhanushadham)</li>
              <li>Mahottari District (Jaleshwar, Bardibas)</li>
              <li>Siraha District (Lahan, Mirchaiya)</li>
              <li>Sarlahi & Sindhuli Valley Links</li>
              <li>Daily Scheduled Temperature-Monitored Vans</li>
            </ul>
          </div>

          {/* Column 3: Compliance & Regulatory */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-300"/>
              Compliance Standard
            </h4>
            <div className="space-y-2 text-[10px] leading-relaxed text-slate-400">
              <p>
                Strict adherence to Department of Drug Administration (DDA) Good Distribution Practices (GDP) and FEFO (First Expiry, First Out) inventory management.
              </p>
              <div className="flex items-center gap-1.5 text-emerald-300 font-semibold text-[10px]">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0"/>
                <span>Verified B2B-Only Ordering</span>
              </div>
            </div>
          </div>

          {/* Column 4: Contact & Emergency Dispatch */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white">
              <Phone className="h-3.5 w-3.5 text-cyan-300"/>
              Warehouse & Orders
            </h4>
            <div className="space-y-2 text-[10px] leading-relaxed text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-cyan-300 shrink-0 mt-0.5"/>
                <span>{DISTRIBUTOR_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-cyan-300 shrink-0"/>
                <span>{DISTRIBUTOR_INFO.phone} / {DISTRIBUTOR_INFO.mobile}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-cyan-300 shrink-0"/>
                <span>{DISTRIBUTOR_INFO.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-cyan-300 shrink-0"/>
                <span>{DISTRIBUTOR_INFO.operatingHours}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-slate-700 pt-4 text-[9px] text-slate-500 sm:flex-row sm:items-center">
          <div>
            © {new Date().getFullYear()} {DISTRIBUTOR_INFO.name}. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Regulated by DDA Nepal</span><span>WHO-GMP Compliant Sourcing</span><span>Cold-Chain Validated</span>
          </div>
        </div>
      </div>
    </footer>);
};
