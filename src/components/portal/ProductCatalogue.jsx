import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatNPR, sortBatchesFEFO } from '../../utils/formatters';
import { Search, ShoppingCart, Plus, Minus, Info, AlertTriangle, ThermometerSnowflake, Sparkles, ArrowRight, UploadCloud, BadgeCheck, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { ProductDetailModal } from './ProductDetailModal';
import { BulkOrderModal } from './BulkOrderModal';
export const ProductCatalogue = ({ onNavigateToReorder }) => {
    const { products, addToCart } = useCart();
    const { activeCustomer } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [quantities, setQuantities] = useState({});
    const [selectedProductForDetail, setSelectedProductForDetail] = useState(null);
    const [isBulkOrderOpen, setIsBulkOrderOpen] = useState(false);
    const [moqWarning, setMoqWarning] = useState(null);
    // Categories list
    const categories = [
        'ALL',
        'Medicines - Antibiotics',
        'Medicines - Analgesics & Antipyretics',
        'Medicines - Gastroenterology',
        'Medicines - Injections & Infusions',
        'Medicines - Endocrinology & Diabetes',
        'Healthcare Products - Diagnostic & Devices',
        'Healthcare Products - Surgical Supplies',
    ];
    const getQuantity = (product) => quantities[product.id] || product.moq;
    const handleQtyChange = (productId, val, moq) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: Math.max(moq, val),
        }));
    };
    const handleAdd = (product, event) => {
      if (!accountApproved) {
        setMoqWarning('Wholesale ordering is locked until your pharmacy account is verified.');
        return;
      }
        const qty = getQuantity(product);
        if (qty < product.moq) {
            setMoqWarning(`Minimum Order Quantity (MOQ) for ${product.name} is ${product.moq} ${product.unit}s.`);
            setTimeout(() => setMoqWarning(null), 4000);
            return;
        }
        const buttonElement = event.currentTarget;
        const earliestBatch = sortBatchesFEFO(product.batches)[0];
        addToCart(product, qty, earliestBatch, buttonElement);
    };
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    const accountApproved = activeCustomer?.accountStatus === 'APPROVED';
    return (<div className="space-y-4">
      <section className="flex flex-col justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 sm:text-base">{activeCustomer?.businessName || 'Pharmacy wholesale account'}</h1>
            <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[9px] font-bold ${accountApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
              {accountApproved ? <BadgeCheck className="h-3 w-3"/> : <ShieldCheck className="h-3 w-3"/>}
              {activeCustomer?.accountStatus?.replaceAll('_', ' ') || 'ACCOUNT PENDING'}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-slate-500">DDA {activeCustomer?.ddaLicenseNumber || 'License pending'} · PAN {activeCustomer?.panVatNumber || 'Registration pending'} · Pharmacist {activeCustomer?.pharmacistName || 'Not provided'}</p>
        </div>
        <div className="flex items-center gap-5 border-t border-slate-100 pt-2 text-right sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
          <div><div className="text-[9px] uppercase text-slate-500">Available credit</div><div className="font-mono text-xs font-bold text-slate-900">{formatNPR(Math.max(0, (activeCustomer?.creditLimit || 0) - (activeCustomer?.usedCredit || 0)))}</div></div>
          <div className="h-8 w-px bg-slate-200"/><div><div className="text-[9px] uppercase text-slate-500">Wholesale tier</div><div className="text-[10px] font-bold text-teal-800">{activeCustomer?.tier || 'Standard'}</div></div>
        </div>
      </section>

      <section className="flex flex-col justify-between gap-3 rounded-lg border border-cyan-200 bg-cyan-50/80 px-4 py-3 text-xs sm:flex-row sm:items-center">
        <div className="flex items-start gap-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white"><Sparkles className="h-4 w-4"/></span><div><div className="font-bold text-slate-900">Predictive chronic replenishment</div><p className="mt-0.5 text-[10px] text-slate-600">Metformin and Pantoprazole are approaching their usual reorder point.</p></div></div>
        {onNavigateToReorder && <button onClick={onNavigateToReorder} className="inline-flex items-center gap-1.5 self-start rounded bg-[#0b2337] px-3 py-2 text-[10px] font-bold text-white hover:bg-teal-800 sm:self-auto">Review smart reorders <ArrowRight className="h-3 w-3"/></button>}
      </section>

      {moqWarning && <div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"><span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 shrink-0"/>{moqWarning}</span><button onClick={() => setMoqWarning(null)} aria-label="Dismiss warning" className="px-2 font-bold">×</button></div>}

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input type="search" aria-label="Search products" placeholder="Search brand, generic name, or manufacturer..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full rounded-md border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none"/></div>
        <select aria-label="Filter products by category" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-teal-600 focus:outline-none sm:max-w-64"><option value="ALL">All pharmaceutical categories</option>{categories.slice(1).map(category => <option key={category} value={category}>{category.replace('Medicines - ', '').replace('Healthcare Products - ', '')}</option>)}</select>
        <button onClick={() => setIsBulkOrderOpen(true)} className="flex items-center justify-center gap-1.5 rounded-md bg-[#0b2337] px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-teal-800"><UploadCloud className="h-4 w-4 text-cyan-300"/>Bulk order CSV / paste</button>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[205px_minmax(0,1fr)]">
        <aside className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2 text-xs font-bold text-slate-800"><span>Categories</span><SlidersHorizontal className="h-3.5 w-3.5 text-slate-400"/></div>
          <div className="space-y-1">{categories.map(category => {
              const count = category === 'ALL' ? products.length : products.filter(product => product.category === category).length;
              const label = category === 'ALL' ? 'All categories' : category.replace('Medicines - ', '').replace('Healthcare Products - ', '');
              return <button key={category} onClick={() => setSelectedCategory(category)} className={`flex w-full items-center justify-between gap-2 rounded px-2.5 py-2 text-left text-[10px] transition-colors ${selectedCategory === category ? 'bg-cyan-50 font-semibold text-teal-900' : 'text-slate-600 hover:bg-slate-50'}`}><span className="truncate">{label}</span><span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500">{count}</span></button>;
          })}</div>
          <div className="mt-4 border-t border-slate-100 pt-3"><div className="mb-2 text-[10px] font-bold text-slate-800">Stock availability</div><div className="space-y-2 text-[9px] text-slate-600"><div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/>In stock now</div><div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan-600"/>FEFO batch allocation</div><div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-blue-500"/>Cold-chain products</div></div></div>
          {!accountApproved && <div className="mt-4 rounded-md bg-amber-50 p-2.5 text-[9px] leading-relaxed text-amber-900">Preview mode: ordering unlocks after account verification.</div>}
        </aside>

        <div className="min-w-0">
          <div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-bold text-slate-800">Wholesale catalogue <span className="ml-1 font-normal text-slate-500">{filteredProducts.length} products</span></h2><span className="hidden text-[10px] text-slate-500 sm:inline">Sorted by availability</span></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map(product => {
                const earliestBatch = sortBatchesFEFO(product.batches)[0];
                const qty = getQuantity(product);
                const savingsPct = Math.round(((product.mrp - product.wholesalePrice) / product.mrp) * 100);
                return <article key={product.id} className="flex min-w-0 flex-col rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="relative mb-2 aspect-[4/3] overflow-hidden rounded-md bg-slate-100"><img src={product.imageUrl} alt={product.name} referrerPolicy="no-referrer" className="h-full w-full object-cover"/><div className="absolute left-1.5 top-1.5 flex flex-col items-start gap-1"><span className="rounded bg-[#10283c]/90 px-1.5 py-0.5 text-[9px] font-semibold text-white">{product.dosageForm}</span>{product.requiresPrescription && <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[8px] font-bold text-white">Rx</span>}</div>{product.isColdChain && <span className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded bg-blue-600 px-1.5 py-0.5 text-[8px] font-semibold text-white"><ThermometerSnowflake className="h-3 w-3"/>2°-8°C</span>}</div>
                  <div className="text-[9px] font-semibold text-teal-700">{product.manufacturer}</div><h3 className="mt-0.5 min-h-8 text-[11px] font-bold leading-snug text-slate-900">{product.name}</h3><p className="mt-0.5 truncate text-[9px] italic text-slate-500">Generic: {product.genericName}</p>
                  {earliestBatch && <div className="mt-2 flex items-center justify-between gap-1 rounded bg-slate-50 px-2 py-1.5 text-[9px] text-slate-600"><span className="truncate">FEFO batch: <strong className="font-mono text-slate-800">{earliestBatch.batchNumber}</strong></span><span className="shrink-0 font-mono text-slate-500">Exp {earliestBatch.expiryDate}</span></div>}
                  <div className="mt-2 space-y-1 border-t border-slate-100 pt-2 text-[9px] text-slate-500"><div className="flex justify-between gap-2"><span>Pack size</span><span className="text-right font-medium text-slate-700">{product.packSize}</span></div><div className="flex justify-between gap-2"><span>Stock available</span><span className={`font-mono font-medium ${product.totalStock < 50 ? 'text-amber-700' : 'text-slate-700'}`}>{product.totalStock} {product.unit}s</span></div><div className="flex justify-between gap-2"><span>Retail MRP</span><span className="font-medium text-slate-600">{formatNPR(product.mrp)}</span></div></div>
                  <div className="mt-2 flex items-center justify-between rounded border border-cyan-100 bg-cyan-50/70 px-2 py-1.5"><div><div className="text-[8px] font-bold uppercase text-teal-800">Wholesale price</div><div className="font-mono text-sm font-bold text-slate-900">{formatNPR(product.wholesalePrice)}</div></div><span className="rounded bg-emerald-100 px-1.5 py-1 text-[8px] font-bold text-emerald-800">Save {savingsPct}%</span></div>
                  <div className="mt-auto pt-2"><div className="mb-2 flex items-center justify-between text-[9px]"><span className="text-slate-500">MOQ <strong className="text-slate-700">{product.moq} {product.unit}s</strong></span><div className="flex items-center rounded border border-slate-200 bg-slate-50"><button type="button" aria-label={`Decrease ${product.name} quantity`} onClick={() => handleQtyChange(product.id, qty - 1, product.moq)} disabled={qty <= product.moq} className="flex h-7 w-7 items-center justify-center text-slate-600 disabled:opacity-30"><Minus className="h-3 w-3"/></button><input type="number" min={product.moq} aria-label={`${product.name} quantity`} value={qty} onChange={e => handleQtyChange(product.id, parseInt(e.target.value, 10) || product.moq, product.moq)} className="w-9 bg-transparent text-center font-mono text-[10px] font-semibold text-slate-900 focus:outline-none"/><button type="button" aria-label={`Increase ${product.name} quantity`} onClick={() => handleQtyChange(product.id, qty + 1, product.moq)} className="flex h-7 w-7 items-center justify-center text-slate-600"><Plus className="h-3 w-3"/></button></div></div>
                    <div className="flex gap-1.5"><button type="button" onClick={e => handleAdd(product, e)} disabled={!accountApproved} className="group flex min-h-8 flex-1 items-center justify-center gap-1.5 rounded bg-[#0b2337] px-2 text-[10px] font-bold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"><ShoppingCart className="h-3.5 w-3.5 text-cyan-300"/><span>{accountApproved ? 'Add to order' : 'Verification required'}</span></button><button type="button" onClick={() => setSelectedProductForDetail(product)} title="View full pharmaceutical specifications" className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50"><Info className="h-4 w-4"/></button></div>
                  </div>
                </article>;
            })}
          </div>
          {filteredProducts.length === 0 && <div className="rounded-lg border border-dashed border-slate-300 bg-white py-12 text-center text-xs text-slate-500">No products match your search.</div>}
        </div>
      </div>

      {selectedProductForDetail && <ProductDetailModal product={selectedProductForDetail} onClose={() => setSelectedProductForDetail(null)} onAddToCart={(product, qty, batch, el) => accountApproved && addToCart(product, qty, batch, el)}/>}
      {isBulkOrderOpen && <BulkOrderModal onClose={() => setIsBulkOrderOpen(false)}/>}
    </div>);
};
