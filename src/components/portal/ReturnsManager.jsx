import React, { useState, useRef } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatNPR, formatDate } from '../../utils/formatters';
import { RotateCcw, Camera, Upload, Trash2, CheckCircle2, AlertTriangle, Image as ImageIcon, ShieldCheck, X, Search, ArrowRight } from 'lucide-react';
export const ReturnsManager = () => {
    const { orders, returns, createReturnRequest } = useCart();
    const { activeCustomer } = useAuth();
    // Active pharmacy purchase orders
    const myOrders = orders.filter(o => o.customerId === (activeCustomer?.id || 'CUST-001'));
    // Multi-step wizard state
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [step, setStep] = useState(1);
    // Selected Order & Item
    const [selectedOrderId, setSelectedOrderId] = useState(myOrders[0]?.id || '');
    const [selectedItemIndex, setSelectedItemIndex] = useState(0);
    // Return Details
    const [reason, setReason] = useState('Damaged Product');
    const [returnQty, setReturnQty] = useState(1);
    const [packagingCondition, setPackagingCondition] = useState('Damaged Outer Carton');
    const [pharmacistRemarks, setPharmacistRemarks] = useState('');
    // Photos evidence
    const [photos, setPhotos] = useState([]);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const videoRef = useRef(null);
    const [cameraError, setCameraError] = useState(null);
    const [previewPhoto, setPreviewPhoto] = useState(null);
    // Filters for Returns Ledger
    const [filterReason, setFilterReason] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [inspectReturn, setInspectReturn] = useState(null);
    const [notification, setNotification] = useState(null);
    const selectedOrder = myOrders.find(o => o.id === selectedOrderId) || myOrders[0];
    const selectedItem = selectedOrder?.items[selectedItemIndex];
    // Calculated credit value
    const estimatedCredit = selectedItem ? selectedItem.unitPrice * returnQty : 0;
    // Handle Photo File Upload
    const handleFileUpload = (e) => {
        const files = e.target.files;
        if (!files || files.length === 0)
            return;
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setPhotos(prev => [...prev, event.target.result]);
                }
            };
            reader.readAsDataURL(file);
        });
    };
    // Add sample photos for demonstration
    const handleAddSampleDamagedPhoto = () => {
        setPhotos(prev => [
            ...prev,
            '/src/assets/images/amoxicillin_pack_1790830676089.jpg',
        ]);
    };
    const handleAddSampleSyrupPhoto = () => {
        setPhotos(prev => [
            ...prev,
            '/src/assets/images/paracetamol_syrup_1790830686687.jpg',
        ]);
    };
    // Live Camera stream
    const startCamera = async () => {
        setIsCameraActive(true);
        setCameraError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        }
        catch (err) {
            setCameraError('Camera access unavailable or blocked. Please upload photo file directly.');
            setIsCameraActive(false);
        }
    };
    const captureCameraSnapshot = () => {
        if (!videoRef.current)
            return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setPhotos(prev => [...prev, dataUrl]);
        }
        stopCamera();
    };
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraActive(false);
    };
    const handleRemovePhoto = (index) => {
        setPhotos(prev => prev.filter((_, idx) => idx !== index));
    };
    const handleOpenWizard = (preselectedOrder, itemIdx) => {
        if (preselectedOrder) {
            setSelectedOrderId(preselectedOrder.id);
            setSelectedItemIndex(itemIdx || 0);
        }
        setStep(1);
        setPhotos([]);
        setPharmacistRemarks('');
        setReturnQty(1);
        setIsWizardOpen(true);
    };
    const handleSubmitReturn = () => {
        if (!selectedOrder || !selectedItem)
            return;
        createReturnRequest({
            orderNumber: selectedOrder.orderNumber,
            customerName: activeCustomer?.businessName || 'ABC Medical Hall',
            productId: selectedItem.productId,
            productName: selectedItem.productName,
            genericName: selectedItem.genericName,
            batchNumber: selectedItem.batchNumber,
            expiryDate: selectedItem.expiryDate,
            quantity: returnQty,
            unitPrice: selectedItem.unitPrice,
            totalCreditValue: estimatedCredit,
            reason,
            packagingCondition,
            evidencePhotos: photos,
            resolutionNote: pharmacistRemarks || `Return initiated for ${returnQty} units of Lot ${selectedItem.batchNumber}. Awaiting depot verification.`,
        });
        setIsWizardOpen(false);
        stopCamera();
        setNotification(`Return Request for ${selectedItem.productName} (Lot: ${selectedItem.batchNumber}) submitted to Janakpur warehouse. Quarantined stock scheduled for van pickup.`);
        setTimeout(() => setNotification(null), 6000);
    };
    // Filtered returns ledger
    const filteredReturns = returns.filter(r => {
        const matchesSearch = r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesReason = filterReason === 'ALL' || r.reason === filterReason;
        const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
        return matchesSearch && matchesReason && matchesStatus;
    });
    // Ledger metrics
    const totalReturnsCount = returns.length;
    const pendingCount = returns.filter(r => r.status === 'PENDING_REVIEW').length;
    const approvedCount = returns.filter(r => r.status === 'APPROVED' || r.status === 'PICKED_UP').length;
    const creditedAmount = returns
        .filter(r => r.status === 'CREDITED')
        .reduce((sum, r) => sum + (r.totalCreditValue || 0), 0);
    const getStatusBadge = (status) => {
        switch (status) {
            case 'CREDITED':
                return <span className="rounded bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-bold">CREDITED</span>;
            case 'PICKED_UP':
                return <span className="rounded bg-indigo-100 text-indigo-800 px-2.5 py-0.5 text-xs font-bold">PICKED UP BY VAN</span>;
            case 'APPROVED':
                return <span className="rounded bg-blue-100 text-blue-800 px-2.5 py-0.5 text-xs font-bold">APPROVED FOR PICKUP</span>;
            case 'PENDING_REVIEW':
                return <span className="rounded bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-bold">UNDER REVIEW</span>;
            case 'REJECTED':
                return <span className="rounded bg-rose-100 text-rose-800 px-2.5 py-0.5 text-xs font-bold">REJECTED</span>;
            default:
                return <span className="rounded bg-slate-100 text-slate-700 px-2.5 py-0.5 text-xs font-bold">{status}</span>;
        }
    };
    return (<div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Goods Return & Damage Exchange Portal
            </h2>
            <span className="rounded bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5">
              DDA Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Initiate return requests for damaged packaging, near-expiry lots, or manufacturer recalls with photographic documentation.
          </p>
        </div>

        <button onClick={() => handleOpenWizard()} className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-2xs self-start sm:self-auto">
          <RotateCcw className="h-4 w-4 text-cyan-400"/>
          <span>New Return Request</span>
        </button>
      </div>

      {notification && (<div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0"/>
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-800 hover:text-emerald-950 font-bold">
            ×
          </button>
        </div>)}

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Total Returns */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            Total Requests
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {totalReturnsCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Recorded in DDA audit log
          </div>
        </div>

        {/* Card 2: Under Review */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">
            Under Depot Review
          </div>
          <div className="mt-2 text-2xl font-black text-amber-700 font-mono">
            {pendingCount}
          </div>
          <div className="mt-1 text-[11px] text-amber-600 font-medium">
            Awaiting inspection decision
          </div>
        </div>

        {/* Card 3: Approved / Pickup */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-blue-700 tracking-wider">
            Approved for Pickup
          </div>
          <div className="mt-2 text-2xl font-black text-blue-700 font-mono">
            {approvedCount}
          </div>
          <div className="mt-1 text-[11px] text-blue-600 font-medium">
            Assigned to delivery route van
          </div>
        </div>

        {/* Card 4: Total Credited */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-2xs">
          <div className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">
            Credited to Account
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-800 font-mono">
            {formatNPR(creditedAmount)}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">
            Credit notes applied to ledger
          </div>
        </div>

      </div>

      {/* Return Policy Notice */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex items-start gap-3 text-xs text-slate-600">
        <ShieldCheck className="h-5 w-5 text-cyan-700 shrink-0 mt-0.5"/>
        <div className="space-y-1">
          <div className="font-bold text-slate-900 text-xs">
            Janakpur Wholesale Return & Credit Policy
          </div>
          <p className="leading-relaxed">
            Damaged goods or seal breaches must be reported within <strong>48 hours of van delivery</strong> with photographic evidence. Near-expiry items must be logged <strong>at least 30 days prior to shelf cutoff</strong>. All items must be segregated in your dispensary quarantine area until physical collection by Janakpur route drivers.
          </p>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
          <input type="text" placeholder="Search returns by medicine name, lot number, or order number..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"/>
        </div>

        <select value={filterReason} onChange={e => setFilterReason(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none">
          <option value="ALL">All Return Reasons</option>
          <option value="Damaged Product">Damaged Packaging</option>
          <option value="Near Expiry">Near Expiry</option>
          <option value="Wrong Product">Wrong Product</option>
          <option value="Recall">Manufacturer Recall</option>
        </select>

        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none">
          <option value="ALL">All Return States</option>
          <option value="PENDING_REVIEW">Under Review</option>
          <option value="APPROVED">Approved for Pickup</option>
          <option value="PICKED_UP">Picked Up</option>
          <option value="CREDITED">Credited</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Returns Ledger Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Return ID & Date</th>
                <th className="py-3 px-4">Medicine & Formulation</th>
                <th className="py-3 px-4 font-mono">Lot & Order</th>
                <th className="py-3 px-4">Reason & Evidence</th>
                <th className="py-3 px-4 text-right">Units / Credit</th>
                <th className="py-3 px-4">Status & Route Van</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReturns.length === 0 ? (<tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No return requests found matching the selected filter criteria.
                  </td>
                </tr>) : (filteredReturns.map(ret => (<tr key={ret.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{ret.id}</div>
                      <div className="text-[10px] text-slate-400">{formatDate(ret.requestedAt)}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-xs">{ret.productName}</div>
                      <div className="text-[10px] text-slate-500 italic mt-0.5">{ret.genericName}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="font-semibold text-slate-800">Lot: {ret.batchNumber}</div>
                      <div className="text-slate-400 text-[10px]">{ret.orderNumber}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <span>{ret.reason}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {ret.packagingCondition || 'Visual evidence submitted'}
                      </div>
                      {ret.evidencePhotos && ret.evidencePhotos.length > 0 && (<div className="flex items-center gap-1 text-[10px] text-cyan-700 font-semibold mt-1">
                          <ImageIcon className="h-3 w-3"/>
                          <span>{ret.evidencePhotos.length} Photo{ret.evidencePhotos.length > 1 ? 's' : ''} Attached</span>
                        </div>)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono">
                      <div className="font-bold text-slate-900 text-xs">{ret.quantity} Units</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {ret.totalCreditValue ? formatNPR(ret.totalCreditValue) : '—'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {getStatusBadge(ret.status)}
                        {ret.pickupVan && (<div className="text-[10px] text-slate-500 font-mono">
                            Van: {ret.pickupVan}
                          </div>)}
                        {ret.creditNoteNumber && (<div className="text-[10px] text-emerald-700 font-mono font-bold">
                            Credit: {ret.creditNoteNumber}
                          </div>)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button onClick={() => setInspectReturn(ret)} className="rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs">
                        Inspect
                      </button>
                    </td>
                  </tr>)))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Step New Return Request Wizard Modal */}
      {isWizardOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200">
            
            <button onClick={() => {
                setIsWizardOpen(false);
                stopCamera();
            }} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <X className="h-5 w-5"/>
            </button>

            {/* Stepper Header */}
            <div className="mb-6 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <RotateCcw className="h-5 w-5 text-cyan-600"/>
                <h3 className="font-bold text-lg text-slate-900">Initiate Pharmaceutical Return Request</h3>
              </div>
              <p className="text-xs text-slate-500">
                Step {step} of 4: {step === 1 ? 'Select Purchase Order & Item' :
                step === 2 ? 'Return Reason & Quantity' :
                    step === 3 ? 'Photo Capture Evidence' : 'Review & Submit'}
              </p>

              {/* Progress Indicator */}
              <div className="mt-3 flex items-center gap-2">
                {[1, 2, 3, 4].map(s => (<div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? 'bg-cyan-600' : 'bg-slate-200'}`}/>))}
              </div>
            </div>

            {/* STEP 1: Select Order & Item */}
            {step === 1 && (<div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-1.5">
                    1. Select Purchase Order from History
                  </label>
                  <select value={selectedOrderId} onChange={e => {
                    setSelectedOrderId(e.target.value);
                    setSelectedItemIndex(0);
                }} className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 font-mono">
                    {myOrders.map(order => (<option key={order.id} value={order.id}>
                        {order.orderNumber} · {formatDate(order.placedAt)} ({order.items.length} items) - {order.status}
                      </option>))}
                  </select>
                </div>

                {selectedOrder && (<div>
                    <label className="block font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-1.5">
                      2. Select Medicine to Return
                    </label>
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {selectedOrder.items.map((item, idx) => (<label key={idx} className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${selectedItemIndex === idx
                            ? 'border-cyan-500 bg-cyan-50/50 ring-1 ring-cyan-500'
                            : 'border-slate-200 hover:bg-slate-50'}`}>
                          <div className="flex items-center gap-3">
                            <input type="radio" name="order-item-radio" checked={selectedItemIndex === idx} onChange={() => setSelectedItemIndex(idx)} className="text-cyan-600"/>
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{item.productName}</div>
                              <div className="text-[11px] text-slate-500 italic">{item.genericName} · {item.packSize}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                Lot: {item.batchNumber} · Exp: {item.expiryDate}
                              </div>
                            </div>
                          </div>

                          <div className="text-right font-mono">
                            <div className="font-bold text-slate-800">{item.quantityFulfilled} units received</div>
                            <div className="text-slate-500 text-[10px]">Rate: {formatNPR(item.unitPrice)}</div>
                          </div>
                        </label>))}
                    </div>
                  </div>)}

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button type="button" onClick={() => {
                    if (selectedItem) {
                        setReturnQty(Math.min(selectedItem.quantityFulfilled, 1));
                        setStep(2);
                    }
                }} className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow">
                    <span>Continue to Reason & Quantity</span>
                    <ArrowRight className="h-3.5 w-3.5"/>
                  </button>
                </div>
              </div>)}

            {/* STEP 2: Reason & Quantity */}
            {step === 2 && selectedItem && (<div className="space-y-4 text-xs">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <div className="font-bold text-slate-900 text-xs">{selectedItem.productName}</div>
                  <div className="text-slate-500 text-[11px] font-mono mt-0.5">
                    Lot No: <strong>{selectedItem.batchNumber}</strong> · Expiry: {selectedItem.expiryDate} · Order: {selectedOrder?.orderNumber}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Return Classification *
                    </label>
                    <select value={reason} onChange={e => setReason(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500">
                      <option value="Damaged Product">Damaged Packaging / Broken Glass / Leaking</option>
                      <option value="Near Expiry">Near Expiry (&lt;60 Days remaining)</option>
                      <option value="Wrong Product">Wrong Medicine / Strength Discrepancy</option>
                      <option value="Recall">Official Manufacturer Batch Recall</option>
                      <option value="Other">Defective Seal / Quality Query</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Units to Return (Max {selectedItem.quantityFulfilled}) *
                    </label>
                    <input type="number" min={1} max={selectedItem.quantityFulfilled} value={returnQty} onChange={e => setReturnQty(Math.min(selectedItem.quantityFulfilled, Math.max(1, parseInt(e.target.value, 10) || 1)))} className="w-full rounded-lg border border-slate-200 p-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-cyan-500"/>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Estimated credit value: <strong>{formatNPR(estimatedCredit)}</strong>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Packaging Physical Condition
                  </label>
                  <select value={packagingCondition} onChange={e => setPackagingCondition(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none">
                    <option value="Damaged Outer Carton">Damaged Outer Carton / Crushed Box</option>
                    <option value="Seal Breached">Tamper Seal Breached / Broken Cap</option>
                    <option value="Blister Strip Intact">Individual Blister Strips Intact</option>
                    <option value="Unopened Original Crate">Unopened Original Shipper Crate</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Pharmacist Detailed Findings & Description *
                  </label>
                  <textarea rows={3} placeholder="Describe specific damage, broken ampoules, expiry printed on box, or discrepancy observed on inspection..." value={pharmacistRemarks} onChange={e => setPharmacistRemarks(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"/>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                  <button type="button" onClick={() => setStep(1)} className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                    Back
                  </button>
                  <button type="button" onClick={() => setStep(3)} className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow">
                    <span>Continue to Photo Evidence</span>
                    <ArrowRight className="h-3.5 w-3.5"/>
                  </button>
                </div>
              </div>)}

            {/* STEP 3: Photo Capture & Evidence */}
            {step === 3 && (<div className="space-y-4 text-xs">
                <div>
                  <div className="font-bold text-slate-800 text-xs mb-1">
                    Photographic Documentation of Defect
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Capture or upload clear photos showing the damaged product, broken ampoule/seal, or printed lot and expiry date stamp.
                  </p>
                </div>

                {cameraError && (<div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-[11px] text-rose-700 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0"/>
                    <span>{cameraError}</span>
                  </div>)}

                {/* Camera Stream View if Active */}
                {isCameraActive ? (<div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-center space-y-3">
                    <video ref={videoRef} autoPlay playsInline className="w-full max-h-56 rounded-lg object-contain bg-black mx-auto"/>
                    <div className="flex justify-center gap-3">
                      <button type="button" onClick={captureCameraSnapshot} className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400">
                        <Camera className="h-4 w-4"/>
                        <span>Snap Photo</span>
                      </button>
                      <button type="button" onClick={stopCamera} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800">
                        Cancel Camera
                      </button>
                    </div>
                  </div>) : (<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Live Camera Button */}
                    <button type="button" onClick={startCamera} className="rounded-xl border-2 border-dashed border-slate-200 p-5 text-center hover:border-slate-300 transition-colors flex flex-col items-center justify-center gap-2 bg-slate-50/50">
                      <Camera className="h-6 w-6 text-cyan-600"/>
                      <span className="font-bold text-slate-800 text-xs">Launch Camera</span>
                      <span className="text-[10px] text-slate-400">Take snapshot directly from device</span>
                    </button>

                    {/* File Upload Button */}
                    <label className="rounded-xl border-2 border-dashed border-slate-200 p-5 text-center hover:border-slate-300 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/50">
                      <Upload className="h-6 w-6 text-slate-600"/>
                      <span className="font-bold text-slate-800 text-xs">Upload Photo File</span>
                      <span className="text-[10px] text-slate-400">PNG, JPG up to 10MB</span>
                      <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden"/>
                    </label>
                  </div>)}

                {/* Quick Sample Image Loaders for Demonstration */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                  <span className="text-slate-500">Testing shortcut:</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={handleAddSampleDamagedPhoto} className="text-cyan-700 hover:text-cyan-900 font-semibold underline">
                      + Insert Sample Blister Photo
                    </button>
                    <span>·</span>
                    <button type="button" onClick={handleAddSampleSyrupPhoto} className="text-cyan-700 hover:text-cyan-900 font-semibold underline">
                      + Insert Bottle Photo
                    </button>
                  </div>
                </div>

                {/* Captured Photos Grid */}
                {photos.length > 0 && (<div className="space-y-2 pt-2">
                    <div className="text-[11px] font-bold text-slate-700">
                      Attached Documentation ({photos.length} Photo{photos.length > 1 ? 's' : ''})
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                      {photos.map((src, idx) => (<div key={idx} className="relative group aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-100">
                          <img src={src} alt={`Evidence ${idx + 1}`} className="h-full w-full object-cover"/>
                          <button type="button" onClick={() => handleRemovePhoto(idx)} className="absolute top-1 right-1 p-1 rounded-md bg-slate-900/80 text-white hover:bg-rose-600 transition-colors" title="Remove photo">
                            <Trash2 className="h-3 w-3"/>
                          </button>
                        </div>))}
                    </div>
                  </div>)}

                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                  <button type="button" onClick={() => {
                    stopCamera();
                    setStep(2);
                }} className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                    Back
                  </button>
                  <button type="button" onClick={() => {
                    stopCamera();
                    setStep(4);
                }} className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow">
                    <span>Continue to Review</span>
                    <ArrowRight className="h-3.5 w-3.5"/>
                  </button>
                </div>
              </div>)}

            {/* STEP 4: Review & Submit */}
            {step === 4 && selectedItem && (<div className="space-y-4 text-xs">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                  <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                    <div>
                      <div className="font-bold text-sm text-slate-900">{selectedItem.productName}</div>
                      <div className="text-[11px] text-slate-500 italic">{selectedItem.genericName}</div>
                    </div>
                    <span className="rounded bg-rose-100 text-rose-800 font-bold px-2 py-0.5 text-[10px]">
                      {reason}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div>Order Ref: <strong className="font-mono text-slate-800">{selectedOrder?.orderNumber}</strong></div>
                    <div>Lot / Batch: <strong className="font-mono text-slate-800">{selectedItem.batchNumber}</strong></div>
                    <div>Expiry Date: <strong className="font-mono text-slate-800">{selectedItem.expiryDate}</strong></div>
                    <div>Quantity to Return: <strong className="font-mono text-slate-800">{returnQty} units</strong></div>
                    <div>Condition: <strong className="text-slate-800">{packagingCondition}</strong></div>
                    <div>Photos Attached: <strong className="text-slate-800">{photos.length} images</strong></div>
                  </div>

                  {pharmacistRemarks && (<div className="border-t border-slate-200 pt-2 text-[11px] text-slate-700">
                      <strong>Pharmacist Remarks:</strong> {pharmacistRemarks}
                    </div>)}

                  <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-xs text-slate-900">
                    <span>Estimated Credit Amount:</span>
                    <span className="font-mono text-cyan-900 text-sm">{formatNPR(estimatedCredit)}</span>
                  </div>
                </div>

                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-[11px] text-emerald-900 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5"/>
                  <span>
                    Upon submission, your return ticket will be queued for logistics van collection in Janakpur. Please maintain the items in your dispensary quarantine area.
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                  <button type="button" onClick={() => setStep(3)} className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                    Back
                  </button>
                  <button type="button" onClick={handleSubmitReturn} className="flex items-center gap-1.5 rounded-lg bg-rose-700 px-5 py-2 text-xs font-bold text-white hover:bg-rose-800 shadow">
                    <CheckCircle2 className="h-4 w-4"/>
                    <span>Submit Return Ticket</span>
                  </button>
                </div>
              </div>)}

          </div>
        </div>)}

      {/* Inspection Modal for Existing Return */}
      {inspectReturn && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg my-8 rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <button onClick={() => setInspectReturn(null)} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <X className="h-5 w-5"/>
            </button>

            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="font-mono text-slate-400 text-[10px]">TICKET ID: {inspectReturn.id}</span>
                <h3 className="font-bold text-base text-slate-900">{inspectReturn.productName}</h3>
              </div>
              {getStatusBadge(inspectReturn.status)}
            </div>

            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span>Lot / Batch Number:</span>
                <strong className="font-mono text-slate-900">{inspectReturn.batchNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span>Purchase Order Ref:</span>
                <strong className="font-mono text-slate-900">{inspectReturn.orderNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span>Units Returned:</span>
                <strong className="font-mono text-slate-900">{inspectReturn.quantity} Units</strong>
              </div>
              <div className="flex justify-between">
                <span>Credit Value:</span>
                <strong className="font-mono text-cyan-900">{formatNPR(inspectReturn.totalCreditValue || 0)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Reason:</span>
                <strong className="text-slate-900">{inspectReturn.reason}</strong>
              </div>
              {inspectReturn.pickupVan && (<div className="flex justify-between">
                  <span>Assigned Route Van:</span>
                  <strong className="text-slate-900">{inspectReturn.pickupVan}</strong>
                </div>)}
              {inspectReturn.creditNoteNumber && (<div className="flex justify-between">
                  <span>Credit Note Voucher:</span>
                  <strong className="text-emerald-700 font-mono font-bold">{inspectReturn.creditNoteNumber}</strong>
                </div>)}
            </div>

            {inspectReturn.resolutionNote && (<div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-[11px] text-slate-700">
                <strong>Warehouse Note:</strong> {inspectReturn.resolutionNote}
              </div>)}

            {/* Attached Photos Lightbox */}
            {inspectReturn.evidencePhotos && inspectReturn.evidencePhotos.length > 0 && (<div>
                <div className="font-bold text-slate-700 mb-2">Photographic Evidence</div>
                <div className="grid grid-cols-2 gap-2">
                  {inspectReturn.evidencePhotos.map((photo, idx) => (<img key={idx} src={photo} alt={`Evidence ${idx + 1}`} className="rounded-lg border border-slate-200 h-28 w-full object-cover"/>))}
                </div>
              </div>)}

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button type="button" onClick={() => setInspectReturn(null)} className="rounded-lg bg-slate-900 px-4 py-2 font-bold text-white text-xs hover:bg-slate-800">
                Close Inspector
              </button>
            </div>
          </div>
        </div>)}

    </div>);
};
