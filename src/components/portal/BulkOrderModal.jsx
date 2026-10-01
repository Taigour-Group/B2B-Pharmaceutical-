import React, { useState, useRef } from 'react';
import { useCart } from '../../context/CartContext';
import { formatNPR, sortBatchesFEFO } from '../../utils/formatters';
import { UploadCloud, AlertTriangle, X, ShoppingCart, Download, Sparkles, Trash2, ClipboardList } from 'lucide-react';
export const BulkOrderModal = ({ onClose }) => {
    const { products, addToCart, setIsCartOpen } = useCart();
    const [activeInputTab, setActiveInputTab] = useState('paste');
    const [pastedText, setPastedText] = useState(`Amoxicillin 500mg, 20
Metformin 500mg, 30
Pantoprazole 40mg, 15
Telmisartan 40mg, 10
Paracetamol Suspension, 25
Insulin Regular, 5`);
    const [parsedItems, setParsedItems] = useState([]);
    const [hasProcessed, setHasProcessed] = useState(false);
    const [notification, setNotification] = useState(null);
    const fileInputRef = useRef(null);
    // Sample CSV template generator
    const handleDownloadTemplate = () => {
        const csvContent = 'data:text/csv;charset=utf-8,' +
            'Medicine Name / Brand / Generic,Requested Quantity\n' +
            'Amoxicillin 500mg Capsules,20\n' +
            'Pantoprazole 40mg,15\n' +
            'Metformin SR 500mg,30\n' +
            'Telmisartan 40mg,10\n' +
            'Paracetamol Suspension 120mg,25\n' +
            'Human Insulin 100 IU,5\n' +
            'Azithromycin 500mg,15\n';
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'JanakpurPharma_Bulk_Order_Template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    // Matcher algorithm
    const matchMedicineString = (query) => {
        const cleanQuery = query.toLowerCase().trim();
        if (!cleanQuery)
            return { product: null, confidence: 'NOT_FOUND' };
        // 1. Direct name or brand match
        for (const p of products) {
            if (p.name.toLowerCase().includes(cleanQuery) ||
                p.brandName.toLowerCase().includes(cleanQuery) ||
                cleanQuery.includes(p.name.toLowerCase()) ||
                cleanQuery.includes(p.brandName.toLowerCase())) {
                return { product: p, confidence: 'EXACT' };
            }
        }
        // 2. Generic Name Match
        for (const p of products) {
            if (p.genericName.toLowerCase().includes(cleanQuery) ||
                cleanQuery.includes(p.genericName.toLowerCase())) {
                return { product: p, confidence: 'EXACT' };
            }
        }
        // 3. Keyword / Strength Fuzzy Match
        const tokens = cleanQuery.split(/[\s,/-]+/).filter(t => t.length > 2);
        let bestProduct = null;
        let maxMatchCount = 0;
        for (const p of products) {
            const searchTarget = `${p.name} ${p.genericName} ${p.brandName} ${p.strength}`.toLowerCase();
            const matchCount = tokens.filter(tok => searchTarget.includes(tok)).length;
            if (matchCount > maxMatchCount && matchCount >= 1) {
                maxMatchCount = matchCount;
                bestProduct = p;
            }
        }
        if (bestProduct && maxMatchCount >= 1) {
            return { product: bestProduct, confidence: 'PARTIAL' };
        }
        return { product: null, confidence: 'NOT_FOUND' };
    };
    // Process text into parsed items
    const processRawLines = (linesText) => {
        const rawLines = linesText.split('\n').filter(line => line.trim().length > 0);
        const results = [];
        rawLines.forEach(line => {
            // Ignore header rows
            if (line.toLowerCase().includes('medicine name') || line.toLowerCase().includes('requested quantity')) {
                return;
            }
            // Format could be: "Medicine Name, Quantity" or "Medicine Name \t Quantity" or "Medicine Name - Quantity"
            let namePart = line;
            let qtyPart = 1;
            if (line.includes(',')) {
                const parts = line.split(',');
                namePart = parts[0];
                qtyPart = parseInt(parts[1]?.trim(), 10) || 1;
            }
            else if (line.includes('\t')) {
                const parts = line.split('\t');
                namePart = parts[0];
                qtyPart = parseInt(parts[1]?.trim(), 10) || 1;
            }
            else if (line.includes('-')) {
                const parts = line.split('-');
                namePart = parts[0];
                qtyPart = parseInt(parts[1]?.trim(), 10) || 1;
            }
            else {
                // Try regex match for trailing numbers: "Amoxicillin 500mg 20"
                const trailingNumMatch = line.match(/(.+?)\s+(\d+)$/);
                if (trailingNumMatch) {
                    namePart = trailingNumMatch[1];
                    qtyPart = parseInt(trailingNumMatch[2], 10) || 1;
                }
            }
            const { product, confidence } = matchMedicineString(namePart);
            let selectedBatch = null;
            let finalQty = qtyPart;
            let moqAdjusted = false;
            if (product) {
                selectedBatch = sortBatchesFEFO(product.batches)[0] || null;
                if (finalQty < product.moq) {
                    finalQty = product.moq;
                    moqAdjusted = true;
                }
            }
            results.push({
                rawQuery: namePart.trim(),
                requestedQty: qtyPart,
                matchedProduct: product,
                matchConfidence: confidence,
                selectedBatch,
                finalQty,
                moqAdjusted,
            });
        });
        setParsedItems(results);
        setHasProcessed(true);
    };
    // Handle File Upload (CSV, TXT)
    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result;
            if (content) {
                setPastedText(content);
                processRawLines(content);
            }
        };
        reader.readAsText(file);
    };
    // Handle Drag & Drop
    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result;
            if (content) {
                setPastedText(content);
                processRawLines(content);
            }
        };
        reader.readAsText(file);
    };
    const handleQtyChange = (index, newQty) => {
        setParsedItems(prev => {
            const next = [...prev];
            const item = next[index];
            const minVal = item.matchedProduct?.moq || 1;
            next[index] = {
                ...item,
                finalQty: Math.max(minVal, newQty),
            };
            return next;
        });
    };
    const handleRemoveItem = (index) => {
        setParsedItems(prev => prev.filter((_, idx) => idx !== index));
    };
    const handleProductChange = (index, newProductId) => {
        const prod = products.find(p => p.id === newProductId) || null;
        setParsedItems(prev => {
            const next = [...prev];
            const item = next[index];
            let finalQty = item.requestedQty;
            if (prod && finalQty < prod.moq) {
                finalQty = prod.moq;
            }
            next[index] = {
                ...item,
                matchedProduct: prod,
                matchConfidence: prod ? 'EXACT' : 'NOT_FOUND',
                selectedBatch: prod ? sortBatchesFEFO(prod.batches)[0] : null,
                finalQty,
                moqAdjusted: prod ? finalQty > item.requestedQty : false,
            };
            return next;
        });
    };
    // Totals
    const matchedItems = parsedItems.filter(i => i.matchedProduct !== null);
    const unmatchedItems = parsedItems.filter(i => i.matchedProduct === null);
    const totalBasketValue = matchedItems.reduce((sum, item) => {
        return sum + (item.matchedProduct.wholesalePrice * item.finalQty);
    }, 0);
    // Add all matched to cart
    const handleAddAllToCart = (e) => {
        let count = 0;
        const btn = e.currentTarget;
        matchedItems.forEach(item => {
            if (item.matchedProduct && item.selectedBatch) {
                addToCart(item.matchedProduct, item.finalQty, item.selectedBatch, btn);
                count++;
            }
        });
        onClose();
        setIsCartOpen(true);
    };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl my-6 rounded-2xl bg-white shadow-2xl border border-slate-200 text-xs flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-md">
              <ClipboardList className="h-5 w-5"/>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">
                  Bulk Medicine Requisition & Order Matcher
                </h3>
                <span className="rounded bg-cyan-100 text-cyan-800 text-[10px] font-bold px-2 py-0.5">
                  Fuzzy Match Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Upload or paste your pharmacy reorder sheet to automatically match catalogue items, allocate FEFO batches, and populate your wholesale cart.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleDownloadTemplate} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors">
              <Download className="h-3.5 w-3.5 text-slate-500"/>
              <span>Sample CSV</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <X className="h-5 w-5"/>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Step 1: Input Area (If not yet processed or editing) */}
          {!hasProcessed ? (<div className="space-y-4">
              {/* Input Method Toggle */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button type="button" onClick={() => setActiveInputTab('paste')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeInputTab === 'paste'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'}`}>
                  Quick Paste Medicine List
                </button>
                <button type="button" onClick={() => setActiveInputTab('upload')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeInputTab === 'upload'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'}`}>
                  Upload CSV / Excel File
                </button>
              </div>

              {activeInputTab === 'paste' ? (<div className="space-y-2">
                  <div className="flex items-center justify-between text-slate-600 text-xs">
                    <span className="font-semibold">Enter one medicine per line with quantity:</span>
                    <span className="text-[11px] text-slate-400">Format: "Medicine Name, Quantity"</span>
                  </div>
                  <textarea rows={8} value={pastedText} onChange={e => setPastedText(e.target.value)} placeholder="e.g.&#10;Amoxicillin 500mg, 20&#10;Pantoprazole 40mg, 15&#10;Metformin 500mg, 30" className="w-full rounded-xl border border-slate-200 p-3 font-mono text-xs text-slate-800 focus:outline-none focus:border-cyan-500 bg-slate-50/50"/>
                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                    <span>Matches brand names, generics, dosage strengths, and pack sizes automatically.</span>
                    <button type="button" onClick={() => setPastedText(`Amoxicillin 500mg, 20
Metformin 500mg, 30
Pantoprazole 40mg, 15
Telmisartan 40mg, 10
Paracetamol Suspension, 25
Insulin Regular, 5
Azithromycin 500mg, 15`)} className="text-cyan-700 hover:text-cyan-900 font-bold underline">
                      Fill Sample Reorder List
                    </button>
                  </div>
                </div>) : (<div onDragOver={e => e.preventDefault()} onDrop={handleDrop} className="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center bg-slate-50/60 hover:border-cyan-500 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <UploadCloud className="h-10 w-10 text-cyan-600"/>
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">Drag & drop your pharmacy order CSV</span>
                    <span className="text-slate-500 text-xs mt-0.5 block">or click to browse from your device (.csv, .txt)</span>
                  </div>
                  <input type="file" ref={fileInputRef} accept=".csv, .txt" onChange={handleFileUpload} className="hidden"/>
                  <button type="button" className="mt-1 rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800">
                    Select File
                  </button>
                </div>)}

              <div className="pt-2 flex justify-end">
                <button type="button" onClick={() => processRawLines(pastedText)} className="flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2 text-xs font-bold text-white hover:bg-cyan-500 shadow-md transition-colors">
                  <Sparkles className="h-4 w-4"/>
                  <span>Parse & Auto-Match Against Catalogue</span>
                </button>
              </div>
            </div>) : (
        /* Step 2: Matched Repertoire Reconciliation Grid */
        <div className="space-y-4">
              
              {/* Summary Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Total Items Requested</div>
                  <div className="text-xl font-black text-slate-900 font-mono mt-1">{parsedItems.length}</div>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
                  <div className="text-[10px] font-bold uppercase text-emerald-700">Successfully Matched</div>
                  <div className="text-xl font-black text-emerald-800 font-mono mt-1">{matchedItems.length}</div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3">
                  <div className="text-[10px] font-bold uppercase text-amber-700">Unmatched / Unavailable</div>
                  <div className="text-xl font-black text-amber-800 font-mono mt-1">{unmatchedItems.length}</div>
                </div>

                <div className="rounded-xl border border-cyan-200 bg-cyan-50/40 p-3">
                  <div className="text-[10px] font-bold uppercase text-cyan-800">Total Matched Subtotal</div>
                  <div className="text-xl font-black text-cyan-950 font-mono mt-1">{formatNPR(totalBasketValue)}</div>
                </div>
              </div>

              {/* Matched Items Table */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Requested Input</th>
                        <th className="py-2.5 px-3">Matched Catalogue Product</th>
                        <th className="py-2.5 px-3 font-mono">FEFO Lot & Expiry</th>
                        <th className="py-2.5 px-3 text-center">Qty / MOQ</th>
                        <th className="py-2.5 px-3 text-right">Wholesale Rate</th>
                        <th className="py-2.5 px-3 text-right">Line Total</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedItems.map((item, idx) => {
                const isMatched = item.matchedProduct !== null;
                const lineTotal = isMatched ? item.matchedProduct.wholesalePrice * item.finalQty : 0;
                return (<tr key={idx} className={`hover:bg-slate-50/60 transition-colors ${!isMatched ? 'bg-amber-50/30' : ''}`}>
                            {/* Raw Query */}
                            <td className="py-3 px-3">
                              <div className="font-semibold text-slate-900">{item.rawQuery}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                Req Qty: {item.requestedQty}
                              </div>
                            </td>

                            {/* Matched Product Selector */}
                            <td className="py-3 px-3 max-w-xs">
                              {isMatched ? (<div>
                                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                    <span>{item.matchedProduct.name}</span>
                                    {item.matchConfidence === 'EXACT' ? (<span className="rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2">
                                        Exact
                                      </span>) : (<span className="rounded bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.2">
                                        Fuzzy Match
                                      </span>)}
                                  </div>
                                  <div className="text-[10px] text-slate-500 italic mt-0.5">
                                    {item.matchedProduct.genericName} · {item.matchedProduct.packSize}
                                  </div>
                                </div>) : (<div className="space-y-1">
                                  <div className="flex items-center gap-1 text-amber-700 font-bold text-[11px]">
                                    <AlertTriangle className="h-3.5 w-3.5 shrink-0"/>
                                    <span>No direct match found</span>
                                  </div>
                                  {/* Allow manual assignment */}
                                  <select onChange={e => handleProductChange(idx, e.target.value)} className="w-full rounded border border-slate-200 bg-white p-1 text-[11px] text-slate-800" defaultValue="">
                                    <option value="" disabled>Manually select product...</option>
                                    {products.map(p => (<option key={p.id} value={p.id}>
                                        {p.name} ({formatNPR(p.wholesalePrice)})
                                      </option>))}
                                  </select>
                                </div>)}
                            </td>

                            {/* FEFO Lot */}
                            <td className="py-3 px-3 font-mono text-[11px]">
                              {item.selectedBatch ? (<div>
                                  <div className="font-bold text-cyan-900">Lot: {item.selectedBatch.batchNumber}</div>
                                  <div className="text-[10px] text-slate-400">Exp: {item.selectedBatch.expiryDate}</div>
                                </div>) : (<span className="text-slate-400">—</span>)}
                            </td>

                            {/* Qty & MOQ Check */}
                            <td className="py-3 px-3 text-center">
                              {isMatched ? (<div>
                                  <input type="number" min={item.matchedProduct.moq} value={item.finalQty} onChange={e => handleQtyChange(idx, parseInt(e.target.value, 10) || 1)} className="w-16 rounded border border-slate-200 text-center font-mono font-bold text-xs p-1 focus:outline-none focus:border-cyan-500"/>
                                  {item.moqAdjusted && (<div className="text-[9px] text-cyan-800 font-semibold mt-0.5">
                                      Rounded to MOQ ({item.matchedProduct.moq})
                                    </div>)}
                                </div>) : (<span className="text-slate-400 font-mono">{item.requestedQty}</span>)}
                            </td>

                            {/* Wholesale Rate */}
                            <td className="py-3 px-3 text-right font-mono text-xs text-slate-700">
                              {isMatched ? formatNPR(item.matchedProduct.wholesalePrice) : '—'}
                            </td>

                            {/* Line Total */}
                            <td className="py-3 px-3 text-right font-mono font-bold text-xs text-slate-900">
                              {isMatched ? formatNPR(lineTotal) : '—'}
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-3 text-center">
                              <button type="button" onClick={() => handleRemoveItem(idx)} className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Remove line">
                                <Trash2 className="h-3.5 w-3.5"/>
                              </button>
                            </td>
                          </tr>);
            })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button type="button" onClick={() => setHasProcessed(false)} className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors self-start sm:self-auto">
                  ← Edit Input List
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] text-slate-400">Total Matched Order:</div>
                    <div className="font-mono font-bold text-base text-cyan-900">
                      {formatNPR(totalBasketValue)}
                    </div>
                  </div>

                  <button type="button" onClick={handleAddAllToCart} disabled={matchedItems.length === 0} className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-40 transition-colors shadow-md">
                    <ShoppingCart className="h-4 w-4 text-cyan-400"/>
                    <span>Populate Cart with {matchedItems.length} Matched Items</span>
                  </button>
                </div>
              </div>

            </div>)}

        </div>

      </div>
    </div>);
};
