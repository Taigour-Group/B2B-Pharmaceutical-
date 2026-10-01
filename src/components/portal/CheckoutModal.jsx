import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatNPR } from '../../utils/formatters';
import { X, CreditCard, Banknote, Building2, Truck, AlertCircle } from 'lucide-react';
export const CheckoutModal = ({ isOpen, onClose, onOrderSuccess }) => {
    const { items, grandTotal, placeOrder } = useCart();
    const { activeCustomer } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState('Credit Account');
    const [deliveryNotes, setDeliveryNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    if (!isOpen)
        return null;
    const availableCredit = (activeCustomer?.creditLimit || 250000) - (activeCustomer?.usedCredit || 64500);
    const creditExceeded = paymentMethod === 'Credit Account' && grandTotal > availableCredit;
    const handleConfirmOrder = async (e) => {
        e.preventDefault();
        if (items.length === 0) {
            setError('Cannot checkout with an empty cart.');
            return;
        }
        if (creditExceeded) {
            setError(`Order amount (${formatNPR(grandTotal)}) exceeds your available credit line of ${formatNPR(availableCredit)}.`);
            return;
        }
        setIsSubmitting(true);
        try {
            const order = await placeOrder(paymentMethod, deliveryNotes);
            setIsSubmitting(false);
            onOrderSuccess(order);
        }
        catch (err) {
            setError(err?.message || 'Failed to place order.');
            setIsSubmitting(false);
        }
    };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
          <X className="h-5 w-5"/>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-cyan-400">
            <Truck className="h-5 w-5"/>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Wholesale Order Confirmation & Dispatch
            </h2>
            <p className="text-xs text-slate-500">
              Generated VAT Tax Invoice and FEFO stock deduction will be processed upon confirmation.
            </p>
          </div>
        </div>

        {error && (<div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0"/>
            <span>{error}</span>
          </div>)}

        <form onSubmit={handleConfirmOrder} className="space-y-5">
          
          {/* Pharmacy Recipient Card */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">
                {activeCustomer?.businessName}
              </span>
              <span className="font-mono text-slate-500 font-medium">
                PAN: {activeCustomer?.panVatNumber}
              </span>
            </div>
            <div className="text-slate-600">
              Delivery Address: <strong className="text-slate-800">{activeCustomer?.address.street}, {activeCustomer?.address.ward}, {activeCustomer?.address.municipality}</strong>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-200/60">
              <span>Supervising Pharmacist: {activeCustomer?.pharmacistName} (NPC: {activeCustomer?.npcRegistrationNumber})</span>
              <span>DDA Reg: {activeCustomer?.ddaLicenseNumber}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Payment Terms & Settlement Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Option 1: Credit Account */}
              <label className={`flex flex-col justify-between rounded-xl border p-3 cursor-pointer text-xs transition-colors ${paymentMethod === 'Credit Account'
            ? 'border-cyan-500 bg-cyan-50/50 ring-1 ring-cyan-500'
            : 'border-slate-200 hover:bg-slate-50'}`}>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <CreditCard className="h-4 w-4 text-cyan-700"/>
                    <input type="radio" name="payment" checked={paymentMethod === 'Credit Account'} onChange={() => setPaymentMethod('Credit Account')} className="text-cyan-600"/>
                  </div>
                  <div className="font-bold text-slate-900">Credit Account</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Net 15 Days Term</div>
                </div>
                <div className="mt-3 text-[10px] text-slate-600 font-mono border-t border-slate-100 pt-1">
                  Avail: {formatNPR(availableCredit)}
                </div>
              </label>

              {/* Option 2: Bank Transfer / Fonepay */}
              <label className={`flex flex-col justify-between rounded-xl border p-3 cursor-pointer text-xs transition-colors ${paymentMethod === 'Bank Transfer / Fonepay'
            ? 'border-cyan-500 bg-cyan-50/50 ring-1 ring-cyan-500'
            : 'border-slate-200 hover:bg-slate-50'}`}>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Building2 className="h-4 w-4 text-cyan-700"/>
                    <input type="radio" name="payment" checked={paymentMethod === 'Bank Transfer / Fonepay'} onChange={() => setPaymentMethod('Bank Transfer / Fonepay')} className="text-cyan-600"/>
                  </div>
                  <div className="font-bold text-slate-900">Bank / Fonepay QR</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Nepal Bank / ConnectIPS</div>
                </div>
                <div className="mt-3 text-[10px] text-slate-600 border-t border-slate-100 pt-1">
                  Immediate Confirmation
                </div>
              </label>

              {/* Option 3: Cash on Delivery */}
              <label className={`flex flex-col justify-between rounded-xl border p-3 cursor-pointer text-xs transition-colors ${paymentMethod === 'Cash on Delivery'
            ? 'border-cyan-500 bg-cyan-50/50 ring-1 ring-cyan-500'
            : 'border-slate-200 hover:bg-slate-50'}`}>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Banknote className="h-4 w-4 text-cyan-700"/>
                    <input type="radio" name="payment" checked={paymentMethod === 'Cash on Delivery'} onChange={() => setPaymentMethod('Cash on Delivery')} className="text-cyan-600"/>
                  </div>
                  <div className="font-bold text-slate-900">Cash on Delivery</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Pay van driver on delivery</div>
                </div>
                <div className="mt-3 text-[10px] text-slate-600 border-t border-slate-100 pt-1">
                  Cash or bearer cheque
                </div>
              </label>

            </div>
          </div>

          {/* Delivery Special Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Dispatch Instructions / Urgent Cold Chain Handling
            </label>
            <input type="text" placeholder="e.g. Urgent ICU emergency delivery, or deliver before 11 AM van route..." value={deliveryNotes} onChange={e => setDeliveryNotes(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-cyan-500 focus:outline-none"/>
          </div>

          {/* Order Summary & Pricing */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
            <div className="flex justify-between font-medium text-slate-600">
              <span>Total Line Items:</span>
              <span>{items.length} Products</span>
            </div>
            <div className="flex justify-between font-medium text-slate-600">
              <span>Wholesale Subtotal:</span>
              <span className="font-mono">{formatNPR(grandTotal)}</span>
            </div>
            <div className="flex justify-between font-medium text-slate-600">
              <span>Essential Meds VAT (0%):</span>
              <span className="font-mono">Rs. 0</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 text-sm border-t border-slate-200 pt-2">
              <span>Grand Total to Pay:</span>
              <span className="font-mono text-cyan-800 text-base">{formatNPR(grandTotal)}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              Back to Cart
            </button>

            <button type="submit" disabled={isSubmitting || creditExceeded} className="flex-1 rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow">
              {isSubmitting ? 'Processing Dispatch & Invoice...' : 'Confirm Order & Issue Invoice'}
            </button>
          </div>

        </form>

      </div>
    </div>);
};
