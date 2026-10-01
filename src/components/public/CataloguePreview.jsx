import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { formatNPR } from '../../utils/formatters';
import { BadgeCheck, ArrowRight, ClipboardList, Lock, PackageSearch, RotateCcw, Search, ShieldAlert, ShieldCheck, SlidersHorizontal } from 'lucide-react';
export const CataloguePreview = ({ onGoToPortal, onOpenRegister }) => {
    const { products } = useCart();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const categories = ['ALL', 'Medicines - Antibiotics', 'Medicines - Analgesics & Antipyretics', 'Medicines - Gastroenterology', 'Medicines - Injections & Infusions', 'Healthcare Products - Diagnostic & Devices', 'Healthcare Products - Surgical Supplies'];
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
        return matchesSearch && matchesCat;
    });
    return (<section className="mx-auto w-full max-w-[1440px] px-4 pb-10 pt-5 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-col gap-2 rounded-lg border border-cyan-200 bg-cyan-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white"><BadgeCheck className="h-4 w-4"/></span>
          <div><div className="text-xs font-bold text-teal-900">Predictive stock and verified supply</div><p className="text-[11px] text-slate-600">Browse our catalogue. Wholesale rates are available to approved pharmacy accounts.</p></div>
        </div>
        <button onClick={onGoToPortal} className="inline-flex items-center gap-1.5 self-start rounded-md bg-[#0b2337] px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-teal-800 sm:self-auto">Enter wholesale portal <ArrowRight className="h-3 w-3"/></button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {[
            { label: 'Browse & order', detail: 'Live wholesale catalogue', tab: 'portal-catalogue', icon: PackageSearch },
            { label: 'Reorder staples', detail: 'Build a repeat order', tab: 'portal-reorder', icon: RotateCcw },
            { label: 'Track orders', detail: 'Dispatch and delivery status', tab: 'portal-orders', icon: ClipboardList },
        ].map(action => <button key={action.tab} onClick={onGoToPortal} className="flex min-w-0 items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-teal-300 hover:bg-teal-50/50">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-100 text-teal-800"><action.icon className="h-4 w-4"/></span>
          <span className="min-w-0"><span className="block text-[11px] font-bold text-slate-800">{action.label}</span><span className="block truncate text-[10px] text-slate-500">{action.detail}</span></span>
          <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-400"/>
        </button>)}
      </div>

      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/>
          <input type="text" aria-label="Search catalogue" placeholder="Search by brand, generic name, or manufacturer..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full rounded-md border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none"/>
        </div>
        <select aria-label="Filter by category" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-teal-600 focus:outline-none">
          {categories.map(c => <option key={c} value={c}>{c === 'ALL' ? 'All Pharmaceutical Categories' : c}</option>)}
        </select>
        <button onClick={onOpenRegister} className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#0b2337] px-3.5 py-2 text-xs font-bold text-white hover:bg-teal-800"><ShieldCheck className="h-3.5 w-3.5 text-cyan-300"/> Verify account</button>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2 text-xs font-bold text-slate-800"><span>Categories</span><SlidersHorizontal className="h-3.5 w-3.5 text-slate-400"/></div>
          <div className="space-y-1">
            {categories.map(category => {
                const count = category === 'ALL' ? products.length : products.filter(product => product.category === category).length;
                const label = category === 'ALL' ? 'All Categories' : category.replace('Medicines - ', '').replace('Healthcare Products - ', '');
                return <button key={category} onClick={() => setSelectedCategory(category)} className={`flex w-full items-center justify-between gap-2 rounded px-2.5 py-2 text-left text-[11px] transition-colors ${selectedCategory === category ? 'bg-cyan-50 font-semibold text-teal-900' : 'text-slate-600 hover:bg-slate-50'}`}><span className="truncate">{label}</span><span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500">{count}</span></button>;
            })}
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3">
            <div className="mb-2 text-[11px] font-bold text-slate-800">Supply assurance</div>
            <div className="space-y-2 text-[10px] text-slate-600"><div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/>Verified batches</div><div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan-600"/>FEFO stock rotation</div><div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-blue-500"/>Cold-chain handling</div></div>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-bold text-slate-800">Catalogue preview <span className="ml-1 font-normal text-slate-500">{filteredProducts.length} products</span></h2><span className="text-[10px] text-slate-500">Wholesale pricing requires verification</span></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map(product => (<article key={product.id} className="group flex min-w-0 flex-col rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm transition-shadow hover:shadow-md">
              <div className="relative mb-2 aspect-[4/3] overflow-hidden rounded-md bg-slate-100"><img src={product.imageUrl} alt={product.name} referrerPolicy="no-referrer" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"/><span className="absolute left-1.5 top-1.5 rounded bg-[#10283c]/90 px-1.5 py-0.5 text-[9px] font-semibold text-white">{product.dosageForm}</span>{product.requiresPrescription && <span className="absolute left-1.5 top-7 rounded bg-rose-600 px-1.5 py-0.5 text-[8px] font-bold text-white">Rx</span>}</div>
              <div className="text-[9px] font-semibold text-teal-700">{product.manufacturer}</div>
              <h3 className="mt-0.5 min-h-8 text-[11px] font-bold leading-snug text-slate-900">{product.name}</h3>
              <p className="mt-0.5 truncate text-[9px] italic text-slate-500">Generic: {product.genericName}</p>
              <div className="mt-2 space-y-1 border-t border-slate-100 pt-2 text-[9px] text-slate-500"><div className="flex justify-between gap-1"><span>Pack size</span><span className="text-right font-medium text-slate-700">{product.packSize}</span></div><div className="flex justify-between gap-1"><span>Availability</span><span className="font-medium text-emerald-700">In stock</span></div><div className="flex justify-between gap-1"><span>Retail MRP</span><span className="font-semibold text-slate-700">{formatNPR(product.mrp)}</span></div></div>
              <div className="mt-2 flex items-center justify-between rounded bg-cyan-50 px-2 py-1.5 text-[9px]"><span className="flex items-center gap-1 text-slate-600"><Lock className="h-3 w-3"/>Wholesale rate</span><span className="font-bold text-teal-800">Sign in to view</span></div>
              <button onClick={onGoToPortal} className="mt-2 w-full rounded bg-[#0b2337] py-1.5 text-[10px] font-bold text-white transition-colors hover:bg-teal-800">Open product catalogue</button>
            </article>))}
          </div>
          {filteredProducts.length === 0 && <div className="rounded-lg border border-dashed border-slate-300 bg-white py-12 text-center text-xs text-slate-500">No products match this search.</div>}
        </div>
      </div>

      <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center"><div className="flex items-start gap-2.5"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-teal-700"/><p className="max-w-3xl text-[10px] leading-relaxed text-slate-600"><strong className="text-slate-800">Wholesale ordering is for verified healthcare businesses.</strong> Pharmacy license, PAN/VAT registration, and supervising pharmacist credentials are required.</p></div><button onClick={onOpenRegister} className="shrink-0 rounded bg-teal-700 px-3 py-2 text-[10px] font-bold text-white hover:bg-teal-800">Apply for verification</button></div>
    </section>);
};
