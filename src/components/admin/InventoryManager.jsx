import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { formatNPR, sortBatchesFEFO, getExpiryStatus } from '../../utils/formatters';
import { Plus, Search, Edit3, CheckCircle2 } from 'lucide-react';
export const InventoryManager = () => {
    const { products, updateProductStock, createProduct } = useCart();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
    const [editingBatch, setEditingBatch] = useState(null);
    const [newQty, setNewQty] = useState(0);
    const [notice, setNotice] = useState(null);
    // New product modal state
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [newProdName, setNewProdName] = useState('');
    const [newProdGeneric, setNewProdGeneric] = useState('');
    const [newProdManufacturer, setNewProdManufacturer] = useState('');
    const [newProdWholesale, setNewProdWholesale] = useState(250);
    const [newProdMrp, setNewProdMrp] = useState(350);
    const [newProdMoq, setNewProdMoq] = useState(5);
    const [newBatchNo, setNewBatchNo] = useState('LOT-2026-01');
    const [newBatchQty, setNewBatchQty] = useState(100);
    const [newBatchExp, setNewBatchExp] = useState('2028-06');
    const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()));
    const handleSaveStockAdjustment = () => {
        if (!editingBatch)
            return;
        updateProductStock(editingBatch.productId, editingBatch.batch.id, newQty);
        setNotice(`Updated Batch ${editingBatch.batch.batchNumber} to ${newQty} units. Logged in audit trail.`);
        setEditingBatch(null);
        setTimeout(() => setNotice(null), 4000);
    };
    const handleCreateProduct = (e) => {
        e.preventDefault();
        if (!newProdName || !newProdGeneric)
            return;
        createProduct({
            name: newProdName,
            genericName: newProdGeneric,
            brandName: newProdName.split(' ')[0],
            manufacturer: newProdManufacturer || 'Deurali-Janta Pharmaceuticals',
            category: 'Medicines - General',
            wholesalePrice: newProdWholesale,
            mrp: newProdMrp,
            moq: newProdMoq,
            totalStock: newBatchQty,
            packSize: 'Box of 100',
            dosageForm: 'Tablet',
            batches: [
                {
                    id: `BATCH-NEW-${Date.now().toString().slice(-4)}`,
                    batchNumber: newBatchNo,
                    mfgDate: '2026-01',
                    expiryDate: newBatchExp,
                    quantity: newBatchQty,
                    purchasePrice: Math.round(newProdWholesale * 0.8),
                    wholesalePrice: newProdWholesale,
                    status: 'ACTIVE',
                },
            ],
        });
        setIsAddProductOpen(false);
        setNotice(`Successfully registered product ${newProdName} with initial batch ${newBatchNo}.`);
        setTimeout(() => setNotice(null), 5000);
    };
    return (<div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Inventory & FEFO Batch Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time warehouse lot numbers, shelf expiry tracking, and First-Expiry First-Out dispatch prioritization.
          </p>
        </div>

        <button onClick={() => setIsAddProductOpen(true)} className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-2xs">
          <Plus className="h-4 w-4"/>
          <span>Add New Product / Batch</span>
        </button>
      </div>

      {notice && (<div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0"/>
          <span>{notice}</span>
        </div>)}

      {/* Main Grid: Products Table + Selected Batch Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Product Catalogue List */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-slate-400"/>
            <input type="text" placeholder="Search warehouse stock..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-transparent text-xs text-slate-800 focus:outline-none"/>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filteredProducts.map(p => {
            const isSelected = p.id === selectedProductId;
            return (<button key={p.id} onClick={() => setSelectedProductId(p.id)} className={`w-full p-3.5 text-left transition-colors flex items-center justify-between ${isSelected ? 'bg-cyan-50/70 border-l-4 border-l-cyan-600' : 'hover:bg-slate-50'}`}>
                  <div className="min-w-0 pr-3">
                    <div className="font-bold text-xs text-slate-900 truncate">{p.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{p.manufacturer}</div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span>SKU: {p.sku}</span>
                      <span>·</span>
                      <span>{p.batches.length} Batches</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-xs text-slate-900">
                      {p.totalStock} {p.unit}s
                    </div>
                    <div className="text-[10px] text-slate-400">{formatNPR(p.wholesalePrice)}</div>
                  </div>
                </button>);
        })}
          </div>
        </div>

        {/* Right: Selected Product's Batches & FEFO Order */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-5">
          {selectedProduct ? (<>
              <div className="border-b border-slate-200 pb-3 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-cyan-700">{selectedProduct.category}</span>
                  <h3 className="font-bold text-base text-slate-900">{selectedProduct.name}</h3>
                  <div className="text-xs text-slate-500 italic mt-0.5">
                    Generic: {selectedProduct.genericName} · {selectedProduct.packSize}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase">Total Warehouse Stock</div>
                  <div className="font-mono font-bold text-base text-slate-900">
                    {selectedProduct.totalStock} {selectedProduct.unit}s
                  </div>
                </div>
              </div>

              {/* Batches Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  FEFO Managed Lot / Batches
                </h4>

                <div className="space-y-2.5">
                  {sortBatchesFEFO(selectedProduct.batches).map((b, idx) => {
                const expStatus = getExpiryStatus(b.expiryDate);
                return (<div key={b.id} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-xs flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">{b.batchNumber}</span>
                            {idx === 0 && (<span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[10px] font-bold">
                                FEFO First Dispatch
                              </span>)}
                            <span className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${expStatus.status === 'EXPIRED' ? 'bg-rose-600 text-white' : expStatus.status === 'CRITICAL' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
                              {expStatus.label}
                            </span>
                          </div>

                          <div className="mt-1 text-[11px] text-slate-500 font-mono">
                            Mfg: {b.mfgDate} · Expiry: <strong className="text-slate-700">{b.expiryDate}</strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right font-mono">
                            <div className="font-bold text-slate-900">{b.quantity} {selectedProduct.unit}s</div>
                            <div className="text-[10px] text-slate-400">Rate: {formatNPR(b.wholesalePrice)}</div>
                          </div>

                          <button onClick={() => {
                        setEditingBatch({ productId: selectedProduct.id, batch: b });
                        setNewQty(b.quantity);
                    }} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50" title="Adjust batch stock">
                            <Edit3 className="h-3.5 w-3.5"/>
                          </button>
                        </div>
                      </div>);
            })}
                </div>
              </div>

              {/* Edit Batch Quantity Inline Modal */}
              {editingBatch && (<div className="rounded-xl border border-cyan-300 bg-cyan-50/50 p-4 space-y-3 animate-in fade-in">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">
                      Adjust Stock for Batch: <strong className="font-mono">{editingBatch.batch.batchNumber}</strong>
                    </span>
                    <button onClick={() => setEditingBatch(null)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">
                      Cancel
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <label className="font-medium text-slate-700">New Physical Count Qty:</label>
                    <input type="number" value={newQty} onChange={e => setNewQty(parseInt(e.target.value, 10) || 0)} className="w-24 rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs font-bold text-slate-900"/>
                    <button onClick={handleSaveStockAdjustment} className="rounded bg-slate-900 px-3 py-1 font-bold text-white text-xs hover:bg-slate-800">
                      Save Adjustment
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    * Adjustments are timestamped and recorded in the audit log for regulatory compliance.
                  </p>
                </div>)}
            </>) : (<div className="text-center py-16 text-slate-400 text-xs">
              Select a pharmaceutical product to view its FEFO batches.
            </div>)}
        </div>

      </div>

      {/* Add Product Modal */}
      {isAddProductOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg my-8 rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              Register New Pharmaceutical Item & Batch
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Product Brand Name *</label>
                <input type="text" required placeholder="e.g. Cefixime 200mg Tablets" value={newProdName} onChange={e => setNewProdName(e.target.value)} className="w-full rounded border border-slate-200 p-2 text-slate-800 focus:outline-none"/>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Generic Formulation *</label>
                <input type="text" required placeholder="e.g. Cefixime Trihydrate" value={newProdGeneric} onChange={e => setNewProdGeneric(e.target.value)} className="w-full rounded border border-slate-200 p-2 text-slate-800 focus:outline-none"/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Manufacturer</label>
                  <input type="text" value={newProdManufacturer} onChange={e => setNewProdManufacturer(e.target.value)} placeholder="e.g. Asian Pharmaceuticals" className="w-full rounded border border-slate-200 p-2"/>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Wholesale Price (NPR)</label>
                  <input type="number" value={newProdWholesale} onChange={e => setNewProdWholesale(parseInt(e.target.value, 10) || 0)} className="w-full rounded border border-slate-200 p-2 font-mono"/>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Initial Batch No</label>
                  <input type="text" value={newBatchNo} onChange={e => setNewBatchNo(e.target.value)} className="w-full rounded border border-slate-200 p-2 font-mono"/>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Initial Qty</label>
                  <input type="number" value={newBatchQty} onChange={e => setNewBatchQty(parseInt(e.target.value, 10) || 0)} className="w-full rounded border border-slate-200 p-2 font-mono"/>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Expiry (YYYY-MM)</label>
                  <input type="text" value={newBatchExp} onChange={e => setNewBatchExp(e.target.value)} className="w-full rounded border border-slate-200 p-2 font-mono"/>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddProductOpen(false)} className="rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="rounded bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800">
                  Create Product & Lot
                </button>
              </div>
            </form>
          </div>
        </div>)}

    </div>);
};
