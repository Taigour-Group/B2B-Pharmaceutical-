import React, { useState } from 'react';
import { formatNPR, sortBatchesFEFO } from '../../utils/formatters';
import { X, Thermometer, Layers, ShoppingCart, Plus, Minus } from 'lucide-react';
export const ProductDetailModal = ({ product, onClose, onAddToCart, }) => {
    const sortedBatches = sortBatchesFEFO(product.batches);
    const [selectedBatchId, setSelectedBatchId] = useState(sortedBatches[0]?.id || '');
    const [qty, setQty] = useState(product.moq);
    const selectedBatch = product.batches.find(b => b.id === selectedBatchId) || sortedBatches[0];
    const handleAdd = (e) => {
        onAddToCart(product, qty, selectedBatch, e.currentTarget);
        onClose();
    };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
          <X className="h-5 w-5"/>
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-6 pb-4 border-b border-slate-200">
          <img src={product.imageUrl} alt={product.name} referrerPolicy="no-referrer" className="h-20 w-20 rounded-xl object-cover border border-slate-200"/>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-cyan-700">{product.manufacturer}</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-700">
                SKU: {product.sku}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">{product.name}</h2>
            <div className="text-xs text-slate-500 italic mt-0.5">
              Generic: {product.genericName} · {product.strength}
            </div>
          </div>
        </div>

        {/* Pharmaceutical Spec Table */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Dosage Form</span>
            <span className="font-semibold text-slate-800">{product.dosageForm}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Packaging Unit</span>
            <span className="font-semibold text-slate-800">{product.packSize}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">DDA Reference</span>
            <span className="font-mono text-slate-800">{product.ddaRegReference}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Classification</span>
            <span className="font-semibold text-slate-800">{product.classification.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Retail MRP</span>
            <span className="font-mono font-semibold text-slate-800">{formatNPR(product.mrp)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Wholesale Rate</span>
            <span className="font-mono font-bold text-cyan-800">{formatNPR(product.wholesalePrice)}</span>
          </div>
        </div>

        {/* Description & Storage Conditions */}
        <div className="space-y-3 mb-6 text-xs text-slate-600">
          <p className="leading-relaxed">{product.description}</p>
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 p-2 text-blue-900">
            <Thermometer className="h-4 w-4 shrink-0 text-blue-600"/>
            <span>
              <strong>Storage Guideline:</strong> {product.storageCondition}
            </span>
          </div>
        </div>

        {/* FEFO Batches Available */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-cyan-600"/>
              <span>Available Inventory Batches (FEFO Prioritized)</span>
            </h3>
            <span className="text-[11px] text-slate-400">First Expiry, First Out</span>
          </div>

          <div className="space-y-2">
            {sortedBatches.map((batch, idx) => (<label key={batch.id} className={`flex items-center justify-between rounded-lg border p-2.5 text-xs cursor-pointer transition-colors ${selectedBatchId === batch.id
                ? 'border-cyan-500 bg-cyan-50/50'
                : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="batch-select" checked={selectedBatchId === batch.id} onChange={() => setSelectedBatchId(batch.id)} className="text-cyan-600 focus:ring-cyan-500"/>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{batch.batchNumber}</span>
                      {idx === 0 && (<span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2">
                          FEFO Primary
                        </span>)}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Mfg: {batch.mfgDate} · Expiry: <strong className="text-slate-700">{batch.expiryDate}</strong>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-semibold text-slate-800">{batch.quantity} {product.unit}s</span>
                  <div className="text-[10px] text-slate-400">in warehouse</div>
                </div>
              </label>))}
          </div>
        </div>

        {/* Order Action Footer */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              Quantity (Min {product.moq}):
            </span>
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button type="button" onClick={() => setQty(Math.max(product.moq, qty - 1))} disabled={qty <= product.moq} className="flex h-6 w-6 items-center justify-center rounded text-slate-600 hover:bg-white disabled:opacity-30">
                <Minus className="h-3 w-3"/>
              </button>
              <input type="number" min={product.moq} value={qty} onChange={e => setQty(Math.max(product.moq, parseInt(e.target.value, 10) || product.moq))} className="w-12 text-center font-mono text-xs font-semibold text-slate-900 bg-transparent focus:outline-none"/>
              <button type="button" onClick={() => setQty(qty + 1)} className="flex h-6 w-6 items-center justify-center rounded text-slate-600 hover:bg-white">
                <Plus className="h-3 w-3"/>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-slate-400">Total Wholesale:</div>
              <div className="font-mono font-bold text-slate-900 text-sm">
                {formatNPR(product.wholesalePrice * qty)}
              </div>
            </div>

            <button onClick={handleAdd} className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow">
              <ShoppingCart className="h-4 w-4 text-cyan-400"/>
              <span>Add to Cart</span>
            </button>
          </div>
        </div>

      </div>
    </div>);
};
